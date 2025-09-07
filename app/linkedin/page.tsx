"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Send, User, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Layout from '../../components/Layout'

interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  name: string
  profilePicture?: string
}

interface Post {
  id: string
  text: string
  url: string
}

export default function LinkedInPage() {
  const { data: session, status } = useSession()
  const [linkedinProfile, setLinkedinProfile] = useState<LinkedInProfile | null>(null)
  const [postContent, setPostContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  const maxChars = 3000
  const remainingChars = maxChars - postContent.length

  useEffect(() => {
    if (session?.accessToken) {
      fetchLinkedInProfile()
    }
  }, [session])

  const fetchLinkedInProfile = async () => {
    try {
      const response = await fetch('/api/linkedin/profile')
      const data = await response.json()
      
      if (data.success) {
        console.log('LinkedIn profile data received:', data.profile)
        console.log('Profile picture URL:', data.profile.profilePicture)
        
        // Test if the image URL is accessible
        if (data.profile.profilePicture) {
          const testImg = new Image()
          testImg.onload = () => console.log('✅ Profile image URL is accessible')
          testImg.onerror = (e) => console.log('❌ Profile image URL failed to load:', e)
          testImg.src = data.profile.profilePicture
        }
        
        setLinkedinProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error)
    }
  }

  const handlePost = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content for your LinkedIn post')
      return
    }

    if (postContent.length > maxChars) {
      toast.error(`Post content exceeds ${maxChars} characters`)
      return
    }

    setIsPosting(true)

    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postContent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('LinkedIn post published successfully!')
        setPostContent("")
        const newPost = { ...data.post }
        setRecentPosts(prev => [newPost, ...prev.slice(0, 4)])
      } else {
        toast.error(data.error || 'Failed to post to LinkedIn')
      }
    } catch (error) {
      toast.error('An error occurred while posting to LinkedIn')
      console.error('Error posting to LinkedIn:', error)
    } finally {
      setIsPosting(false)
    }
  }

  if (status === "loading") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="w-full max-w-md mx-auto relative z-10">
            <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center animate-bounce shadow-lg">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Loading...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="w-full max-w-md mx-auto relative z-10">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8 text-center space-y-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Linkedin className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    LinkedIn
                  </h1>
                  <p className="text-gray-500 text-sm">Professional Networking</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Connect Your LinkedIn
                  </h2>
                  <p className="text-gray-600">
                    Share your marketing insights and connect with your professional network.
                  </p>
                </div>

                <button
                  onClick={() => signIn("linkedin")}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <Linkedin className="w-5 h-5" />
                  Connect LinkedIn Account
                </button>

                <p className="text-sm text-gray-500 text-center">
                  We'll only access what you authorize and never post without your permission
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen p-4 relative overflow-hidden bg-gray-50">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="w-full max-w-4xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Linkedin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    LinkedIn Publisher
                  </h1>
                  <p className="text-gray-500 text-sm">Share with your professional network</p>
                </div>
              </div>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300"
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Post Composer */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Create Post</h3>
                    <p className="text-gray-500 text-sm">Share your thoughts with your professional network</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500 ml-auto" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to share?
                    </label>
                    <textarea
                      id="post-content"
                      placeholder="Share your thoughts, insights, or updates with your professional network..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      rows={6}
                      maxLength={maxChars + 50}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        LinkedIn • Max {maxChars.toLocaleString()} characters
                      </span>
                      <span 
                        className={`text-sm ${
                          remainingChars < 100 
                            ? remainingChars < 0 ? 'text-red-500' : 'text-yellow-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {remainingChars.toLocaleString()} remaining
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handlePost}
                    disabled={!postContent.trim() || remainingChars < 0 || isPosting}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                  >
                    {isPosting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Linkedin className="w-4 h-4" />
                        Publish to LinkedIn
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8 mt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Recent Posts</h3>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-500">LinkedIn</span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{post.text}</p>
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          View on LinkedIn →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* LinkedIn Profile Card */}
              {linkedinProfile && (
                <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Your Profile</h4>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      {linkedinProfile.profilePicture ? (
                        <img 
                          src={`/api/linkedin/profile-image?url=${encodeURIComponent(linkedinProfile.profilePicture)}`}
                          alt={linkedinProfile.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            console.log('Profile image proxy failed, using fallback')
                            // Hide the image and show fallback
                            e.currentTarget.style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log('Profile image loaded successfully via proxy')
                          }}
                        />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {linkedinProfile.firstName?.charAt(0) || linkedinProfile.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{linkedinProfile.name}</p>
                      <p className="text-sm text-gray-500">LinkedIn Profile</p>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Tips */}
              <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">LinkedIn Tips</h4>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Share professional insights and industry knowledge</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use relevant hashtags to increase visibility</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Engage with your network through comments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Post consistently to build your professional brand</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}