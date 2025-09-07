import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { RestliClient } from "linkedin-api-client"

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

    // Initialize the LinkedIn API client
    const client = new RestliClient()
    
    console.log('[LinkedIn Profile] Making API request to LinkedIn using official client...')
    
    // Use the official LinkedIn API client to get profile data
    // Using the modern /me endpoint as per LinkedIn documentation
    const response = await client.get({
      resourcePath: '/me',
      queryParams: {
        projection: '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))'
      },
      accessToken: session.accessToken
    })

    console.log('[LinkedIn Profile] LinkedIn API response:', {
      status: response.status,
      data: response.data
    })

    if (!response.data) {
      console.error("[LinkedIn Profile] No data returned from API")
      return NextResponse.json(
        { error: "Failed to fetch LinkedIn profile" },
        { status: 500 }
      )
    }

    const profile = response.data
    console.log('[LinkedIn Profile] Raw profile data:', JSON.stringify(profile, null, 2))

    // Format the profile data
    let profilePictureUrl = null
    
    // Extract profile picture if available
    if (profile.profilePicture && profile.profilePicture['displayImage~']) {
      const elements = profile.profilePicture['displayImage~'].elements
      if (elements && elements.length > 0) {
        // Look for the 400x400 image for good quality, or fall back to largest available
        let selectedImage = elements.find((element: any) => 
          element.artifact && element.artifact.includes('shrink_400_400')
        ) || elements[elements.length - 1] // fallback to largest
        
        if (selectedImage && selectedImage.identifiers && selectedImage.identifiers.length > 0) {
          profilePictureUrl = selectedImage.identifiers[0].identifier
        }
      }
    }
    
    const formattedProfile = {
      id: profile.id,
      firstName: profile.localizedFirstName || "",
      lastName: profile.localizedLastName || "",
      name: `${profile.localizedFirstName || ""} ${profile.localizedLastName || ""}`.trim(),
      profilePicture: profilePictureUrl
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