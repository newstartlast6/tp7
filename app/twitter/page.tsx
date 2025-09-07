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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Twitter, Send, User, Calendar, Hash, Linkedin } from "lucide-react"
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
  platform: 'twitter' | 'linkedin'
}

export default function SocialMediaScheduler() {
  const { data: session, status } = useSession()
  const [twitterProfile, setTwitterProfile] = useState<TwitterProfile | null>(null)
  const [linkedinProfile, setLinkedinProfile] = useState<LinkedInProfile | null>(null)
  const [postContent, setPostContent] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'linkedin'>('twitter')
  const [isPosting, setIsPosting] = useState(false)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])

  const maxChars = selectedPlatform === 'twitter' ? 280 : 3000
  const remainingChars = maxChars - postContent.length

  useEffect(() => {
    if (session?.accessToken) {
      fetchProfiles()
    }
  }, [session])

  const fetchProfiles = async () => {
    // Fetch Twitter profile
    try {
      const twitterResponse = await fetch('/api/twitter/profile')
      const twitterData = await twitterResponse.json()
      
      if (twitterData.success) {
        setTwitterProfile(twitterData.profile)
      }
    } catch (error) {
      console.error('Error fetching Twitter profile:', error)
    }

    // Fetch LinkedIn profile
    try {
      const linkedinResponse = await fetch('/api/linkedin/profile')
      const linkedinData = await linkedinResponse.json()
      
      if (linkedinData.success) {
        setLinkedinProfile(linkedinData.profile)
      }
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error)
    }
  }

  const handlePost = async () => {
    if (!postContent.trim()) {
      toast.error(`Please enter some content for your ${selectedPlatform} post`)
      return
    }

    if (postContent.length > maxChars) {
      toast.error(`Post content exceeds ${maxChars} characters`)
      return
    }

    setIsPosting(true)

    try {
      const endpoint = selectedPlatform === 'twitter' ? '/api/twitter/tweet' : '/api/linkedin/post'
      
      const response = await fetch(endpoint, {
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
        toast.success(`${selectedPlatform === 'twitter' ? 'Tweet' : 'LinkedIn post'} posted successfully!`)
        setPostContent("")
        const newPost = { ...data.tweet || data.post, platform: selectedPlatform }
        setRecentPosts(prev => [newPost, ...prev.slice(0, 4)])
      } else {
        toast.error(data.error || `Failed to post to ${selectedPlatform}`)
      }
    } catch (error) {
      toast.error(`An error occurred while posting to ${selectedPlatform}`)
      console.error(`Error posting to ${selectedPlatform}:`, error)
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Social Media Scheduler</h1>
            <p className="text-muted-foreground">
              Connect your social media accounts to start posting
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Twitter className="h-12 w-12 text-blue-500" />
                </div>
                <CardTitle className="text-xl">Twitter / X</CardTitle>
                <CardDescription>
                  Connect your Twitter account to post tweets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => signIn("twitter")} 
                  className="w-full"
                  size="lg"
                >
                  <Twitter className="h-5 w-5 mr-2" />
                  Connect Twitter
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Linkedin className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-xl">LinkedIn</CardTitle>
                <CardDescription>
                  Connect your LinkedIn account to share posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => signIn("linkedin")} 
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  Connect LinkedIn
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8 text-center">
            We'll only access what you authorize and never post without your permission
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Media Scheduler</h1>
            <p className="text-muted-foreground">
              Post and schedule content across your connected social media accounts
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="text-red-600 hover:text-red-700"
          >
            Disconnect All
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Post Composer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Compose Post
                </CardTitle>
                <CardDescription>
                  Create content for your social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform-select">Choose Platform</Label>
                  <Select value={selectedPlatform} onValueChange={(value: 'twitter' | 'linkedin') => setSelectedPlatform(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-blue-500" />
                          Twitter / X
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="post-content">
                    {selectedPlatform === 'twitter' ? "What's happening?" : "What would you like to share?"}
                  </Label>
                  <Textarea
                    id="post-content"
                    placeholder={selectedPlatform === 'twitter' ? "What's on your mind?" : "Share your thoughts, insights, or updates with your professional network..."}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="min-h-32 resize-none"
                    maxLength={maxChars + 50}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {selectedPlatform === 'twitter' ? 'Twitter' : 'LinkedIn'} • Max {maxChars} characters
                    </span>
                    <span 
                      className={`text-sm ${
                        remainingChars < 50 
                          ? remainingChars < 0 ? 'text-red-500' : 'text-yellow-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {remainingChars} remaining
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePost}
                  disabled={!postContent.trim() || remainingChars < 0 || isPosting}
                  className="w-full"
                >
                  {isPosting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      {selectedPlatform === 'twitter' ? (
                        <Twitter className="h-4 w-4 mr-2" />
                      ) : (
                        <Linkedin className="h-4 w-4 mr-2" />
                      )}
                      Post to {selectedPlatform === 'twitter' ? 'Twitter' : 'LinkedIn'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {post.platform === 'twitter' ? (
                            <Twitter className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Linkedin className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-xs text-muted-foreground capitalize">
                            {post.platform}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{post.text}</p>
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View on {post.platform === 'twitter' ? 'Twitter' : 'LinkedIn'} →
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Twitter Profile Card */}
            {twitterProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-500" />
                    Twitter Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={twitterProfile.profile_image_url} alt={twitterProfile.name} />
                      <AvatarFallback>{twitterProfile.name?.charAt(0) || twitterProfile.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium truncate">{twitterProfile.name}</p>
                        {twitterProfile.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{twitterProfile.username}</p>
                    </div>
                  </div>

                  {twitterProfile.description && (
                    <p className="text-sm text-muted-foreground">
                      {twitterProfile.description}
                    </p>
                  )}

                  <Separator />

                  {twitterProfile.public_metrics && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold">{twitterProfile.public_metrics.tweet_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Tweets</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{twitterProfile.public_metrics.following_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{twitterProfile.public_metrics.followers_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* LinkedIn Profile Card */}
            {linkedinProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    LinkedIn Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={linkedinProfile.profilePicture} alt={linkedinProfile.name} />
                      <AvatarFallback>{linkedinProfile.firstName?.charAt(0) || linkedinProfile.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{linkedinProfile.name}</p>
                      <p className="text-sm text-muted-foreground">LinkedIn Profile</p>
                    </div>
                  </div>
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