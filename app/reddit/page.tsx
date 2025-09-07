"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, User, Sparkles, Hash, Search, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Layout from '../../components/Layout'

interface RedditProfile {
  id: string
  name: string
  username?: string
  icon_img?: string
}

interface Post {
  id: string
  title: string
  url: string
  subreddit: string
  type: string
  created: string
}

interface SearchResult {
  id: string
  title: string
  selftext: string
  url: string
  permalink: string
  subreddit: string
  author: string
  score: number
  num_comments: number
  created: string
}

export default function RedditPage() {
  const { data: session, status } = useSession()
  const [redditProfile, setRedditProfile] = useState<RedditProfile | null>(null)
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [subreddit, setSubreddit] = useState("")
  const [postType, setPostType] = useState<"text" | "link">("text")
  const [linkUrl, setLinkUrl] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const maxTitleChars = 300
  const maxContentChars = 40000
  const remainingTitleChars = maxTitleChars - postTitle.length
  const remainingContentChars = maxContentChars - postContent.length

  useEffect(() => {
    if (session?.accessToken) {
      // Note: Reddit profile fetching would be implemented here
      setRedditProfile({
        id: session.userId || "user",
        name: "Reddit User", // This would come from Reddit API
        username: "user"
      })
    }
  }, [session])

  const handlePost = async () => {
    if (!postTitle.trim()) {
      toast.error('Please enter a title for your post')
      return
    }

    if (!subreddit.trim()) {
      toast.error('Please enter a subreddit name')
      return
    }

    if (postType === 'text' && !postContent.trim()) {
      toast.error('Please enter content for your text post')
      return
    }

    if (postType === 'link' && !linkUrl.trim()) {
      toast.error('Please enter a URL for your link post')
      return
    }

    if (postTitle.length > maxTitleChars) {
      toast.error(`Title exceeds ${maxTitleChars} characters`)
      return
    }

    if (postType === 'text' && postContent.length > maxContentChars) {
      toast.error(`Content exceeds ${maxContentChars} characters`)
      return
    }

    setIsPosting(true)

    try {
      const response = await fetch('/api/reddit/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          subreddit: subreddit.replace(/^r\//, ''), // Remove r/ prefix if present
          type: postType,
          url: linkUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Post submitted to Reddit successfully!')
        setPostTitle("")
        setPostContent("")
        setLinkUrl("")
        setSubreddit("")
        const newPost = { ...data.post }
        setRecentPosts(prev => [newPost, ...prev.slice(0, 4)])
      } else {
        toast.error(data.error || 'Failed to post to Reddit')
      }
    } catch (error) {
      toast.error('An error occurred while posting to Reddit')
      console.error('Error posting to Reddit:', error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(`/api/reddit/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setSearchResults(data.results)
        toast.success(`Found ${data.results.length} results`)
      } else {
        toast.error(data.error || 'Failed to search Reddit')
      }
    } catch (error) {
      toast.error('An error occurred while searching Reddit')
      console.error('Error searching Reddit:', error)
    } finally {
      setIsSearching(false)
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
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-bounce shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="w-full max-w-md mx-auto relative z-10">
            <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 text-center space-y-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Reddit
                  </h1>
                  <p className="text-gray-500 text-sm">Community Platform</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Connect Your Reddit
                  </h2>
                  <p className="text-gray-600">
                    Share content and engage with communities on Reddit.
                  </p>
                </div>

                <button
                  onClick={() => signIn("reddit")}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <MessageSquare className="w-5 h-5" />
                  Connect Reddit Account
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Reddit Publisher
                  </h1>
                  <p className="text-gray-500 text-sm">Share with communities</p>
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
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Create Post</h3>
                    <p className="text-gray-500 text-sm">Share content with Reddit communities</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-orange-500 ml-auto" />
                </div>

                <div className="space-y-4">
                  {/* Post Type Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPostType("text")}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        postType === "text"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Text Post
                    </button>
                    <button
                      onClick={() => setPostType("link")}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        postType === "link"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Link Post
                    </button>
                  </div>

                  {/* Subreddit */}
                  <div>
                    <label htmlFor="subreddit" className="block text-sm font-medium text-gray-700 mb-2">
                      Subreddit
                    </label>
                    <input
                      id="subreddit"
                      type="text"
                      placeholder="e.g. programming (without r/)"
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      id="post-title"
                      type="text"
                      placeholder="Enter your post title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      maxLength={maxTitleChars + 20}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        Reddit • Max {maxTitleChars} characters
                      </span>
                      <span 
                        className={`text-sm ${
                          remainingTitleChars < 50 
                            ? remainingTitleChars < 0 ? 'text-red-500' : 'text-yellow-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {remainingTitleChars} remaining
                      </span>
                    </div>
                  </div>

                  {/* Content or URL based on post type */}
                  {postType === 'text' ? (
                    <div>
                      <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
                        Content (optional)
                      </label>
                      <textarea
                        id="post-content"
                        placeholder="Write your post content here..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                        rows={6}
                        maxLength={maxContentChars + 20}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          Reddit • Max {maxContentChars.toLocaleString()} characters
                        </span>
                        <span 
                          className={`text-sm ${
                            remainingContentChars < 1000 
                              ? remainingContentChars < 0 ? 'text-red-500' : 'text-yellow-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {remainingContentChars.toLocaleString()} remaining
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 mb-2">
                        URL
                      </label>
                      <input
                        id="link-url"
                        type="url"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  )}

                  <button
                    onClick={handlePost}
                    disabled={!postTitle.trim() || !subreddit.trim() || remainingTitleChars < 0 || isPosting || (postType === 'text' && remainingContentChars < 0) || (postType === 'link' && !linkUrl.trim())}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                  >
                    {isPosting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Post to Reddit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Section */}
              <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Search Reddit</h3>
                    <p className="text-gray-500 text-sm">Find relevant content and communities</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search Reddit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Search Results</h4>
                    {searchResults.slice(0, 5).map((result) => (
                      <div key={result.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            r/{result.subreddit}
                          </span>
                          <span className="text-xs text-gray-500">
                            {result.score} upvotes • {result.num_comments} comments
                          </span>
                        </div>
                        <h5 className="font-medium text-gray-900 mb-2 leading-tight">{result.title}</h5>
                        {result.selftext && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.selftext.substring(0, 150)}...</p>
                        )}
                        <a 
                          href={`https://reddit.com${result.permalink}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors flex items-center gap-1"
                        >
                          View on Reddit <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Recent Posts</h3>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-gray-500">r/{post.subreddit}</span>
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                            {post.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-3 leading-tight">{post.title}</h4>
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
                        >
                          View on Reddit →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reddit Tips */}
              <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                    <Hash className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Reddit Tips</h4>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Read subreddit rules before posting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use clear, descriptive titles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Engage authentically with communities</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Follow the 9:1 rule for self-promotion</span>
                  </div>
                </div>
              </div>

              {/* Profile Card (when available) */}
              {redditProfile && (
                <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <User className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Connected</h4>
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={redditProfile.icon_img} alt={redditProfile.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {redditProfile.name?.charAt(0) || 'R'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{redditProfile.name}</p>
                      <p className="text-sm text-gray-500">Reddit Account</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}