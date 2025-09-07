import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { TwitterApi } from "twitter-api-v2"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Twitter" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, scheduledTime } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Tweet content is required" },
        { status: 400 }
      )
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: "Tweet content exceeds 280 characters" },
        { status: 400 }
      )
    }

    // Initialize Twitter API client with user's access token
    const twitterClient = new TwitterApi(session.accessToken as string)

    // If scheduled time is provided (future feature)
    if (scheduledTime) {
      // For now, just validate the time format
      const scheduleDate = new Date(scheduledTime)
      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        )
      }
      
      // TODO: Implement scheduling logic with a queue system
      return NextResponse.json(
        { 
          message: "Tweet scheduling not yet implemented",
          content,
          scheduledTime 
        }
      )
    }

    // Post tweet immediately
    const tweet = await twitterClient.v2.tweet(content)

    return NextResponse.json({
      success: true,
      tweet: {
        id: tweet.data.id,
        text: tweet.data.text,
        url: `https://twitter.com/${session.username}/status/${tweet.data.id}`
      }
    })

  } catch (error: any) {
    console.error("Error posting tweet:", error)
    
    if (error.code === 403) {
      return NextResponse.json(
        { error: "Insufficient permissions to post tweets" },
        { status: 403 }
      )
    }

    if (error.code === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to post tweet. Please try again." },
      { status: 500 }
    )
  }
}