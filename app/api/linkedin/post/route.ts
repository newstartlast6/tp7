import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { RestliClient } from "linkedin-api-client"

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

    // Use the person ID from the session (already available from authentication)
    const personId = session.userId
    
    console.log('[LinkedIn Post] Using person ID from session:', {
      personId: personId
    })

    if (!personId) {
      console.error('[LinkedIn Post] No person ID found in session')
      return NextResponse.json(
        { error: "No LinkedIn user ID found in session" },
        { status: 500 }
      )
    }

    // Initialize the LinkedIn API client for posting
    const client = new RestliClient()

    // Post to LinkedIn using the official client and Posts API (newer approach)
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
    console.log('[LinkedIn Post] Making post request to LinkedIn using official client...')

    const postResponse = await client.create({
      resourcePath: '/ugcPosts',
      entity: postData,
      accessToken: session.accessToken
    })

    console.log('[LinkedIn Post] Post response:', {
      status: postResponse.status,
      data: postResponse.data
    })

    if (!postResponse.data) {
      console.error("[LinkedIn Post] Post error: No data returned")
      return NextResponse.json(
        { error: "Failed to post to LinkedIn. Please try again." },
        { status: 500 }
      )
    }

    const result = postResponse.data
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