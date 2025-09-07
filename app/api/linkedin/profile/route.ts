import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with LinkedIn" },
        { status: 401 }
      )
    }

    // Get user profile information using lite profile scope
    const response = await fetch('https://api.linkedin.com/v2/people/~:(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("LinkedIn profile error:", error)
      return NextResponse.json(
        { error: "Failed to fetch LinkedIn profile" },
        { status: 500 }
      )
    }

    const profile = await response.json()

    // Format the profile data
    const formattedProfile = {
      id: profile.id,
      firstName: profile.localizedFirstName || "",
      lastName: profile.localizedLastName || "",
      name: `${profile.localizedFirstName || ""} ${profile.localizedLastName || ""}`.trim(),
      profilePicture: profile.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0]?.identifier || null
    }

    return NextResponse.json({
      success: true,
      profile: formattedProfile
    })

  } catch (error: any) {
    console.error("Error fetching LinkedIn profile:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch LinkedIn profile" },
      { status: 500 }
    )
  }
}