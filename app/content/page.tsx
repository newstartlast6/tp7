"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  TrendingUp,
  Sun,
  Moon,
  Sunset,
  Coffee,
  Star
} from "lucide-react";

interface ContentPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  time: string;
  content: string;
  hashtags?: string;
  subreddit?: string;
  bullets?: string[];
}

interface DayContent {
  day: number;
  posts: ContentPost[];
}

const mockContentData: DayContent[] = [
  {
    day: 1,
    posts: [
      {
        id: "1",
        platform: "twitter",
        time: "8:00 AM",
        content: "🚀 Starting the week strong! Here's my framework for crushing project deadlines:",
        bullets: [
          "Break large tasks into 2-day sprints",
          "Daily 15-min check-ins",
          "Visual progress tracking"
        ],
        hashtags: "#ProjectManagement #Productivity"
      },
      {
        id: "2",
        platform: "linkedin",
        time: "9:00 AM",
        content: "After managing 50+ projects over the past 3 years, I've learned that the most successful teams share one crucial trait: psychological safety.",
        bullets: [
          "Ask questions without judgment",
          "Admit mistakes early",
          "Challenge ideas constructively",
          "Share creative solutions"
        ],
        hashtags: "#ProjectManagement #TeamLeadership #WorkplaceCulture"
      },
      {
        id: "3",
        platform: "reddit",
        time: "10:00 AM",
        content: "Why most project management tools fail (and what actually works)",
        subreddit: "r/ProjectManagement",
        hashtags: "Discussion • Tools & Software"
      },
      {
        id: "4",
        platform: "twitter",
        time: "2:00 PM",
        content: "Quick tip: If your daily standup is taking more than 15 minutes, you're doing it wrong.",
        bullets: [
          "What did you finish yesterday?",
          "What's your one priority today?",
          "Any blockers?"
        ],
        hashtags: "#Agile #Scrum #TeamProductivity"
      },
      {
        id: "5",
        platform: "linkedin",
        time: "3:00 PM",
        content: "The hidden cost of context switching: It's not just the time lost, it's the mental energy drain.",
        bullets: [
          "Group similar tasks together",
          "Set specific times for email/Slack",
          "Use focus blocks of 90+ minutes",
          "Turn off non-critical notifications"
        ],
        hashtags: "#Productivity #Focus #DeepWork"
      },
      {
        id: "6",
        platform: "reddit",
        time: "4:00 PM",
        content: "What's the biggest project management mistake you've made? I'll start...",
        subreddit: "r/ProjectManagement",
        hashtags: "Discussion • Lessons Learned"
      },
      {
        id: "7",
        platform: "twitter",
        time: "6:00 PM",
        content: "End of day reflection: What went well today? What could be improved tomorrow?",
        hashtags: "#Reflection #ContinuousImprovement"
      },
      {
        id: "8",
        platform: "linkedin",
        time: "7:00 PM",
        content: "Remote team tip: Start every meeting with 2 minutes of personal check-ins. It transforms team dynamics.",
        hashtags: "#RemoteWork #TeamBuilding #Leadership"
      },
      {
        id: "9",
        platform: "reddit",
        time: "8:00 PM",
        content: "Free project management templates that actually work (Google Sheets)",
        subreddit: "r/ProjectManagement",
        hashtags: "Resource • Templates"
      }
    ]
  }
];

export default function ContentPlannerPage() {
  const [selectedDay, setSelectedDay] = useState(1);
  const currentDayData = mockContentData.find(d => d.day === selectedDay) || mockContentData[0];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <i className="fab fa-twitter text-blue-400"></i>;
      case 'linkedin':
        return <i className="fab fa-linkedin text-blue-600"></i>;
      case 'reddit':
        return <i className="fab fa-reddit text-red-500"></i>;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-400';
      case 'linkedin':
        return 'bg-blue-600';
      case 'reddit':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return <Sun className="w-5 h-5 text-orange-500" />;
    if (hour >= 12 && hour < 17) return <Coffee className="w-5 h-5 text-orange-600" />;
    if (hour >= 17 && hour < 20) return <Sunset className="w-5 h-5 text-orange-700" />;
    return <Moon className="w-5 h-5 text-blue-600" />;
  };

  const getTimeLabel = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 20) return "Evening";
    return "Night";
  };

  const groupPostsByTimeOfDay = (posts: ContentPost[]) => {
    const groups: { [key: string]: ContentPost[] } = {
      "Morning": [],
      "Afternoon": [],
      "Evening": [],
      "Night": []
    };

    posts.forEach(post => {
      const timeLabel = getTimeLabel(post.time);
      groups[timeLabel].push(post);
    });

    return groups;
  };

  const groupedPosts = groupPostsByTimeOfDay(currentDayData.posts);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Effects - matching the orange theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/60 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-400/30 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Content Planner
                </h1>
              </div>
              <p className="text-gray-600">Your personalized social media strategy across all channels</p>
            </div>
            
            {/* Platform Statistics */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <i className="fab fa-linkedin text-blue-600"></i>
                <span className="text-sm font-medium text-gray-900">LinkedIn:</span>
                <span className="text-sm font-bold text-gray-900">3x/day</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <i className="fab fa-twitter text-blue-400"></i>
                <span className="text-sm font-medium text-gray-900">Twitter:</span>
                <span className="text-sm font-bold text-gray-900">3x/day</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <i className="fab fa-reddit text-red-500"></i>
                <span className="text-sm font-medium text-gray-900">Reddit:</span>
                <span className="text-sm font-bold text-gray-900">3x/day</span>
              </div>
            </div>
          </div>
          
          {/* Day Navigation */}
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-orange-100'
                }`}
              >
                Day {day} {day === 1 ? '- Today' : ''}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              {selectedDay}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Day {selectedDay} {selectedDay === 1 ? '- Today' : ''}
            </h2>
          </div>
          <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-orange-100">
            {currentDayData.posts.length} posts scheduled
          </div>
        </div>

        {/* Time Period Sections */}
        <div className="space-y-8">
          {Object.entries(groupedPosts).map(([timeOfDay, posts]) => (
            posts.length > 0 && (
              <section key={timeOfDay}>
                <div className="flex items-center space-x-3 mb-4">
                  {timeOfDay === "Morning" && <Sun className="w-6 h-6 text-orange-500" />}
                  {timeOfDay === "Afternoon" && <Coffee className="w-6 h-6 text-orange-600" />}
                  {timeOfDay === "Evening" && <Sunset className="w-6 h-6 text-orange-700" />}
                  {timeOfDay === "Night" && <Moon className="w-6 h-6 text-blue-600" />}
                  <h3 className="text-lg font-semibold text-gray-900">{timeOfDay}</h3>
                  <span className="text-sm text-gray-500">
                    ({posts.length} post{posts.length !== 1 ? 's' : ''})
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-white border border-orange-100 rounded-2xl p-4 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getPlatformIcon(post.platform)}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {post.platform} Post
                          </span>
                          <div className={`w-2 h-2 ${getPlatformColor(post.platform)} rounded-full`}></div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTimeIcon(post.time)}
                          <span className="text-xs text-gray-500 font-medium">{post.time}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {post.subreddit && (
                          <p className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                            {post.subreddit}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {post.content}
                        </p>
                        
                        {post.bullets && (
                          <div className="space-y-1">
                            {post.bullets.map((bullet, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-700">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                                {bullet}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {post.hashtags && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">{post.hashtags}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>0</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>0</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-3 h-3" />
                              <span>0</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>Scheduled</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 max-w-md mx-auto">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Schedule?</h3>
            <p className="text-gray-600 mb-4">Connect your social media accounts to automatically publish your content.</p>
            <button className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0">
              Connect Accounts →
            </button>
          </div>
        </div>
      </main>

      {/* Font Awesome for social icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}