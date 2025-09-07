import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log('[LinkedIn Profile] Starting profile fetch...')
    const session = await getServerSession(authOptions) as any
    
    console.log('[LinkedIn Profile] Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0,
      userId: session?.userId || 'none'
    })

    if (!session?.accessToken) {
      console.log('[LinkedIn Profile] No access token found')
      return NextResponse.json(
        { error: "Not authenticated with LinkedIn" },
        { status: 401 }
      )
    }

    // Get user profile information using lite profile scope
    console.log('[LinkedIn Profile] Making API request to LinkedIn...')
    const response = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    console.log('[LinkedIn Profile] LinkedIn API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[LinkedIn Profile] API error:", {
        status: response.status,
        statusText: response.statusText,
        error: error
      })
      return NextResponse.json(
        { error: "Failed to fetch LinkedIn profile" },
        { status: 500 }
      )
    }

    const profile = await response.json()
    console.log('[LinkedIn Profile] Raw profile data:', JSON.stringify(profile, null, 2))

    // Format the profile data
    const formattedProfile = {
      id: profile.id,
      firstName: profile.localizedFirstName || "",
      lastName: profile.localizedLastName || "",
      name: `${profile.localizedFirstName || ""} ${profile.localizedLastName || ""}`.trim(),
      profilePicture: profile.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0]?.identifier || null
    }

    console.log('[LinkedIn Profile] Formatted profile:', JSON.stringify(formattedProfile, null, 2))

    return NextResponse.json({
      success: true,
      profile: formattedProfile
    })

  } catch (error: any) {
    console.error("[LinkedIn Profile] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { error: "Failed to fetch LinkedIn profile" },
      { status: 500 }
    )
  }
}