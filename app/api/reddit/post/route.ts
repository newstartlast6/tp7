import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import snoowrap from "snoowrap"

export async function POST(request: NextRequest) {
  try {
    console.log('[Reddit Post] Starting post creation...')
    const session = await getServerSession(authOptions) as any
    
    console.log('[Reddit Post] Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      userId: session?.userId || 'none'
    })

    // For Reddit, we'll use a different authentication approach since Reddit uses client credentials
    // We'll check if the user has a Reddit session or use app-only authentication
    const body = await request.json()
    const { content, subreddit, title, type, url, scheduledTime } = body
    
    console.log('[Reddit Post] Request body:', {
      hasContent: !!content,
      contentLength: content?.length || 0,
      subreddit: subreddit,
      title: title,
      type: type,
      hasUrl: !!url,
      hasScheduledTime: !!scheduledTime
    })

    // Validation
    if (!title || title.trim().length === 0) {
      console.log('[Reddit Post] No title provided')
      return NextResponse.json(
        { error: "Post title is required" },
        { status: 400 }
      )
    }

    if (!subreddit || subreddit.trim().length === 0) {
      console.log('[Reddit Post] No subreddit provided')
      return NextResponse.json(
        { error: "Subreddit is required" },
        { status: 400 }
      )
    }

    if (type === 'text' && (!content || content.trim().length === 0)) {
      console.log('[Reddit Post] No content provided for text post')
      return NextResponse.json(
        { error: "Post content is required for text posts" },
        { status: 400 }
      )
    }

    if (type === 'link' && (!url || url.trim().length === 0)) {
      console.log('[Reddit Post] No URL provided for link post')
      return NextResponse.json(
        { error: "URL is required for link posts" },
        { status: 400 }
      )
    }

    if (title.length > 300) {
      console.log('[Reddit Post] Title too long:', title.length)
      return NextResponse.json(
        { error: "Post title exceeds 300 characters" },
        { status: 400 }
      )
    }

    if (content && content.length > 40000) {
      console.log('[Reddit Post] Content too long:', content.length)
      return NextResponse.json(
        { error: "Post content exceeds 40000 characters" },
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
          message: "Reddit post scheduling not yet implemented",
          title,
          content,
          subreddit,
          scheduledTime 
        }
      )
    }

    // Initialize Reddit API client
    const reddit = new snoowrap({
      userAgent: 'SocialMediaApp/1.0.0 by YourUsername',
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      refreshToken: process.env.REDDIT_REFRESH_TOKEN || '',
    })

    let postResult
    const targetSubreddit = reddit.getSubreddit(subreddit)

    if (type === 'link') {
      // Submit link post
      postResult = await targetSubreddit.submitLink({
        title: title,
        url: url
      })
    } else {
      // Submit text post (default)
      postResult = await targetSubreddit.submitSelfpost({
        title: title,
        text: content || ''
      })
    }

    console.log('[Reddit Post] Post created successfully:', {
      postId: postResult.id,
      postTitle: postResult.title,
      subreddit: postResult.subreddit.display_name
    })

    return NextResponse.json({
      success: true,
      post: {
        id: postResult.id,
        title: postResult.title,
        url: `https://reddit.com${postResult.permalink}`,
        subreddit: postResult.subreddit.display_name,
        type: type || 'text',
        created: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error("[Reddit Post] Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Handle specific Reddit API errors
    if (error.statusCode === 403) {
      return NextResponse.json(
        { error: "Insufficient permissions to post to this subreddit" },
        { status: 403 }
      )
    }

    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (error.statusCode === 400) {
      return NextResponse.json(
        { error: "Invalid request. Please check your post details." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to post to Reddit. Please try again." },
      { status: 500 }
    )
  }
}