import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log('[LinkedIn Post] Starting post creation...')
    const session = await getServerSession(authOptions) as any
    
    console.log('[LinkedIn Post] Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
      userId: session?.userId || 'none'
    })

    if (!session?.accessToken) {
      console.log('[LinkedIn Post] No access token found')
      return NextResponse.json(
        { error: "Not authenticated with LinkedIn" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, scheduledTime } = body
    
    console.log('[LinkedIn Post] Request body:', {
      hasContent: !!content,
      contentLength: content?.length || 0,
      hasScheduledTime: !!scheduledTime
    })

    if (!content || content.trim().length === 0) {
      console.log('[LinkedIn Post] No content provided')
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      )
    }

    if (content.length > 3000) {
      console.log('[LinkedIn Post] Content too long:', content.length)
      return NextResponse.json(
        { error: "Post content exceeds 3000 characters" },
        { status: 400 }
      )
    }

    // If scheduled time is provided (future feature)
    if (scheduledTime) {
      const scheduleDate = new Date(scheduledTime)
      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          message: "LinkedIn post scheduling not yet implemented",
          content,
          scheduledTime 
        }
      )
    }

    // Get user ID first using lite profile
    console.log('[LinkedIn Post] Fetching user profile for person ID...')
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id)', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    console.log('[LinkedIn Post] Profile response:', {
      status: profileResponse.status,
      statusText: profileResponse.statusText
    })

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text()
      console.error('[LinkedIn Post] Profile fetch error:', profileError)
      return NextResponse.json(
        { error: "Failed to get LinkedIn profile" },
        { status: 500 }
      )
    }

    const profile = await profileResponse.json()
    const personId = profile.id
    
    console.log('[LinkedIn Post] Profile data:', {
      personId: personId,
      profile: JSON.stringify(profile, null, 2)
    })

    // Post to LinkedIn using the Posts API (newer approach)
    const postData = {
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    }

    console.log('[LinkedIn Post] Post data:', JSON.stringify(postData, null, 2))
    console.log('[LinkedIn Post] Making post request to LinkedIn...')

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    })

    console.log('[LinkedIn Post] Post response:', {
      status: postResponse.status,
      statusText: postResponse.statusText,
      headers: Object.fromEntries(postResponse.headers.entries())
    })

    if (!postResponse.ok) {
      const error = await postResponse.text()
      console.error("[LinkedIn Post] Post error:", {
        status: postResponse.status,
        statusText: postResponse.statusText,
        error: error
      })
      
      if (postResponse.status === 403) {
        console.log('[LinkedIn Post] Permission denied - insufficient scopes')
        return NextResponse.json(
          { error: "Insufficient permissions to post on LinkedIn. Make sure 'Share on LinkedIn' product is enabled." },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: "Failed to post to LinkedIn. Please try again." },
        { status: 500 }
      )
    }

    const result = await postResponse.json()
    console.log('[LinkedIn Post] Post result:', JSON.stringify(result, null, 2))

    return NextResponse.json({
      success: true,
      post: {
        id: result.id,
        text: content,
        url: `https://linkedin.com/feed/update/${result.id?.split(':').pop()}`
      }
    })

  } catch (error: any) {
    console.error("[LinkedIn Post] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: "Failed to post to LinkedIn. Please try again." },
      { status: 500 }
    )
  }
}