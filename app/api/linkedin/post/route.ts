import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with LinkedIn" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, scheduledTime } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      )
    }

    if (content.length > 3000) {
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

    // Get user ID first
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get LinkedIn profile" },
        { status: 500 }
      )
    }

    const profile = await profileResponse.json()
    const personId = profile.id

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

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    })

    if (!postResponse.ok) {
      const error = await postResponse.text()
      console.error("LinkedIn post error:", error)
      
      if (postResponse.status === 403) {
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

    return NextResponse.json({
      success: true,
      post: {
        id: result.id,
        text: content,
        url: `https://linkedin.com/feed/update/${result.id?.split(':').pop()}`
      }
    })

  } catch (error: any) {
    console.error("Error posting to LinkedIn:", error)
    
    return NextResponse.json(
      { error: "Failed to post to LinkedIn. Please try again." },
      { status: 500 }
    )
  }
}