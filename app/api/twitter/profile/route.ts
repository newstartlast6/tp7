import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { TwitterApi } from "twitter-api-v2"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Twitter" },
        { status: 401 }
      )
    }

    // Initialize Twitter API client with user's access token
    const twitterClient = new TwitterApi(session.accessToken as string)

    // Get user profile information
    const user = await twitterClient.v2.me({
      "user.fields": [
        "created_at",
        "description",
        "entities",
        "id",
        "location",
        "name",
        "profile_image_url",
        "protected",
        "public_metrics",
        "url",
        "username",
        "verified"
      ]
    })

    return NextResponse.json({
      success: true,
      profile: user.data
    })

  } catch (error: any) {
    console.error("Error fetching Twitter profile:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch Twitter profile" },
      { status: 500 }
    )
  }
}