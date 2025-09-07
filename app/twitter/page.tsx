"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Twitter, Send, User, Calendar, Hash } from "lucide-react"
import { toast } from "sonner"

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

interface Tweet {
  id: string
  text: string
  url: string
}

export default function TwitterScheduler() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<TwitterProfile | null>(null)
  const [tweetContent, setTweetContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [recentTweets, setRecentTweets] = useState<Tweet[]>([])

  const remainingChars = 280 - tweetContent.length

  useEffect(() => {
    if (session?.accessToken) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/twitter/profile')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
      } else {
        console.error('Failed to fetch profile:', data.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handlePostTweet = async () => {
    if (!tweetContent.trim()) {
      toast.error("Please enter some content for your tweet")
      return
    }

    if (tweetContent.length > 280) {
      toast.error("Tweet content exceeds 280 characters")
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
          content: tweetContent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Tweet posted successfully!")
        setTweetContent("")
        setRecentTweets(prev => [data.tweet, ...prev.slice(0, 4)])
      } else {
        toast.error(data.error || "Failed to post tweet")
      }
    } catch (error) {
      toast.error("An error occurred while posting the tweet")
      console.error('Error posting tweet:', error)
    } finally {
      setIsPosting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                <Twitter className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Connect Your Twitter Account</CardTitle>
              <CardDescription>
                Sign in with Twitter to start posting tweets directly from TractionPilot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => signIn("twitter")} 
                className="w-full"
                size="lg"
              >
                <Twitter className="h-5 w-5 mr-2" />
                Connect Twitter Account
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                We'll only access what you authorize and never post without your permission
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Twitter Scheduler</h1>
            <p className="text-muted-foreground">
              Post and schedule tweets for your connected account
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="text-red-600 hover:text-red-700"
          >
            Disconnect
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Tweet Composer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Compose Tweet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tweet-content">What's happening?</Label>
                  <Textarea
                    id="tweet-content"
                    placeholder="What's on your mind?"
                    value={tweetContent}
                    onChange={(e) => setTweetContent(e.target.value)}
                    className="min-h-32 resize-none"
                    maxLength={300}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span 
                      className={`text-sm ${
                        remainingChars < 20 
                          ? remainingChars < 0 ? 'text-red-500' : 'text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {remainingChars} characters remaining
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={handlePostTweet}
                  disabled={!tweetContent.trim() || remainingChars < 0 || isPosting}
                  className="w-full"
                >
                  {isPosting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Twitter className="h-4 w-4 mr-2" />
                      Post Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Tweets */}
            {recentTweets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTweets.map((tweet) => (
                      <div key={tweet.id} className="p-3 border rounded-lg">
                        <p className="text-sm mb-2">{tweet.text}</p>
                        <a 
                          href={tweet.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View on Twitter →
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Profile Card */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Connected Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profile_image_url} alt={profile.name} />
                      <AvatarFallback>{profile.name?.charAt(0) || profile.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium truncate">{profile.name}</p>
                        {profile.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>
                  </div>

                  {profile.description && (
                    <p className="text-sm text-muted-foreground">
                      {profile.description}
                    </p>
                  )}

                  <Separator />

                  {profile.public_metrics && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold">{profile.public_metrics.tweet_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Tweets</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{profile.public_metrics.following_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{profile.public_metrics.followers_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Keep tweets under 280 characters</p>
                  <p>• Use hashtags to increase reach</p>
                  <p>• Engage with your audience</p>
                  <p>• Post consistently for better engagement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}