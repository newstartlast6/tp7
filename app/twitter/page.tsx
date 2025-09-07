"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Twitter, Send, User, Sparkles, Hash } from "lucide-react"
import { toast } from "sonner"
import Layout from '../../components/Layout'

interface TwitterProfile {
  id: string
  name: string
  username: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
  description?: string
  verified?: boolean
}

interface Post {
  id: string
  text: string
  url: string
}

export default function TwitterPage() {
  const { data: session, status } = useSession()
  const [twitterProfile, setTwitterProfile] = useState<TwitterProfile | null>(null)
  const [postContent, setPostContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [recentTweets, setRecentTweets] = useState<Post[]>([])

  const maxChars = 280
  const remainingChars = maxChars - postContent.length

  useEffect(() => {
    if (session?.accessToken) {
      fetchTwitterProfile()
    }
  }, [session])

  const fetchTwitterProfile = async () => {
    try {
      const response = await fetch('/api/twitter/profile')
      const data = await response.json()
      
      if (data.success) {
        setTwitterProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching Twitter profile:', error)
    }
  }

  const handleTweet = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content for your tweet')
      return
    }

    if (postContent.length > maxChars) {
      toast.error(`Tweet exceeds ${maxChars} characters`)
      return
    }

    setIsPosting(true)

    try {
      const response = await fetch('/api/twitter/tweet', {
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
        toast.success('Tweet posted successfully!')
        setPostContent("")
        const newTweet = { ...data.tweet }
        setRecentTweets(prev => [newTweet, ...prev.slice(0, 4)])
      } else {
        toast.error(data.error || 'Failed to post tweet')
      }
    } catch (error) {
      toast.error('An error occurred while posting your tweet')
      console.error('Error posting tweet:', error)
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="w-full max-w-md mx-auto relative z-10">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8 text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-bounce shadow-lg">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    Twitter
                  </h1>
                  <p className="text-gray-500 text-sm">Social Networking</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Connect Your Twitter
                  </h2>
                  <p className="text-gray-600">
                    Share your insights and connect with your audience on Twitter.
                  </p>
                </div>

                <button
                  onClick={() => signIn("twitter")}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <Twitter className="w-5 h-5" />
                  Connect Twitter Account
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    Twitter Publisher
                  </h1>
                  <p className="text-gray-500 text-sm">Share with your audience</p>
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
            {/* Tweet Composer */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">What's happening?</h3>
                    <p className="text-gray-500 text-sm">Share your thoughts with the world</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500 ml-auto" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="tweet-content" className="block text-sm font-medium text-gray-700 mb-2">
                      What's on your mind?
                    </label>
                    <textarea
                      id="tweet-content"
                      placeholder="What's happening?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      rows={4}
                      maxLength={maxChars + 20}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        Twitter • Max {maxChars} characters
                      </span>
                      <span 
                        className={`text-sm ${
                          remainingChars < 50 
                            ? remainingChars < 0 ? 'text-red-500' : 'text-yellow-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {remainingChars} remaining
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleTweet}
                    disabled={!postContent.trim() || remainingChars < 0 || isPosting}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                  >
                    {isPosting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Twitter className="w-4 h-4" />
                        Post Tweet
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Recent Tweets */}
              {recentTweets.length > 0 && (
                <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-8 mt-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Recent Tweets</h3>
                  </div>
                  <div className="space-y-4">
                    {recentTweets.map((tweet) => (
                      <div key={tweet.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Twitter className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-500">Twitter</span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{tweet.text}</p>
                        <a 
                          href={tweet.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                        >
                          View on Twitter →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Twitter Profile Card */}
              {twitterProfile && (
                <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Your Profile</h4>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={twitterProfile.profile_image_url} alt={twitterProfile.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {twitterProfile.name?.charAt(0) || twitterProfile.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-gray-900 truncate">{twitterProfile.name}</p>
                        {twitterProfile.verified && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-600">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{twitterProfile.username}</p>
                    </div>
                  </div>

                  {twitterProfile.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {twitterProfile.description}
                    </p>
                  )}

                  {twitterProfile.public_metrics && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{twitterProfile.public_metrics.tweet_count.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Tweets</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{twitterProfile.public_metrics.following_count.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Following</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{twitterProfile.public_metrics.followers_count.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Followers</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Twitter Tips */}
              <div className="bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <Hash className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Twitter Tips</h4>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Keep tweets under 280 characters for maximum impact</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use relevant hashtags to increase discoverability</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Engage with your audience through replies and retweets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Post consistently to build your following</span>
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