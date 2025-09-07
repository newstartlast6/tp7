import { NextRequest, NextResponse } from "next/server"
import snoowrap from "snoowrap"

export async function GET(request: NextRequest) {
  try {
    console.log('[Reddit Search] Starting search...')
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const subreddit = searchParams.get('subreddit')
    const sort = searchParams.get('sort') || 'relevance'
    const time = searchParams.get('time') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)

    console.log('[Reddit Search] Parameters:', {
      query,
      subreddit,
      sort,
      time,
      limit
    })

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    // Initialize Reddit API client for read-only access
    const reddit = new snoowrap({
      userAgent: 'SocialMediaApp/1.0.0 by YourUsername',
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      // For search, we can use client credentials (no user token needed for public content)
      refreshToken: '',
    })

    let searchResults

    if (subreddit) {
      // Search within specific subreddit
      const targetSubreddit = reddit.getSubreddit(subreddit)
      const results = await targetSubreddit.search({
        query: query,
        sort: sort as any,
        time: time as any
      })
      searchResults = results.slice(0, limit)
    } else {
      // Search across all of Reddit
      const results = await reddit.search({
        query: query,
        sort: sort as any,
        time: time as any
      })
      searchResults = results.slice(0, limit)
    }

    // Format the results
    const formattedResults = await Promise.all(
      searchResults.map(async (post: any) => {
        try {
          return {
            id: post.id,
            title: post.title,
            selftext: post.selftext || '',
            url: post.url,
            permalink: `https://reddit.com${post.permalink}`,
            subreddit: post.subreddit.display_name,
            author: post.author.name,
            score: post.score,
            upvote_ratio: post.upvote_ratio,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
            created: new Date(post.created_utc * 1000).toISOString(),
            is_self: post.is_self,
            is_video: post.is_video,
            over_18: post.over_18,
            spoiler: post.spoiler,
            locked: post.locked,
            pinned: post.pinned,
            archived: post.archived,
            thumbnail: post.thumbnail !== 'self' && post.thumbnail !== 'default' ? post.thumbnail : null,
            preview: post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&') || null
          }
        } catch (err) {
          console.warn('[Reddit Search] Error formatting post:', post.id, err)
          return {
            id: post.id,
            title: post.title || 'Unable to load title',
            error: 'Error loading post details'
          }
        }
      })
    )

    console.log('[Reddit Search] Search completed:', {
      resultsCount: formattedResults.length,
      query,
      subreddit: subreddit || 'all'
    })

    return NextResponse.json({
      success: true,
      query,
      subreddit: subreddit || 'all',
      sort,
      time,
      limit,
      results: formattedResults,
      count: formattedResults.length
    })

  } catch (error: any) {
    console.error("[Reddit Search] Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Handle specific Reddit API errors
    if (error.statusCode === 403) {
      return NextResponse.json(
        { error: "Access denied. Please check your Reddit API credentials." },
        { status: 403 }
      )
    }

    if (error.statusCode === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: "Subreddit not found." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to search Reddit. Please try again." },
      { status: 500 }
    )
  }
}