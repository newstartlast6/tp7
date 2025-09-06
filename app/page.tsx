"use client";

import { useState, useEffect } from "react";
import { 
  Lightbulb, 
  Target, 
  Users, 
  Smartphone, 
  Brain, 
  Zap, 
  PenTool, 
  Palette, 
  Video, 
  Calendar, 
  Hash, 
  TrendingUp, 
  BarChart3, 
  Rocket,
  Eye,
  Heart,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface ScrapedData {
  url: string;
  title: string;
  description: string;
  content: string;
}

interface MarketingReport {
  productName: string;
  category: string;
  userPersona: {
    demographics: string;
    whereTheyHangOut: string;
    mindset: string;
  };
  painPoints: string[];
  valueProposition: string;
  contentPillars: Array<{
    pillar: string;
    description: string;
  }>;
  postTypes: string[];
  weeklyCalendar: {
    monday: string;
    wednesday: string;
    friday: string;
    sunday: string;
  };
  hashtagStyle: {
    tone: string;
    exampleHashtags: string[];
  };
  engagementStrategy: string[];
  metricsToTrack: string[];
  keyTakeaway: string;
}

export default function Onboarding() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [marketingReport, setMarketingReport] = useState<MarketingReport | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [thinkingText, setThinkingText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);

  const thinkingMessages = [
    "Analyzing your website...",
    "Extracting content structure...",
    "Processing page metadata...",
    "Understanding your design...",
    "Identifying target audience...",
    "Generating marketing strategy...",
    "Creating social media plan...",
    "Finalizing AI report..."
  ];

  // Typing animation for messages
  useEffect(() => {
    if (!loading) return;
    
    let timeoutId: NodeJS.Timeout;
    setDisplayText("");
    setIsTyping(true);
    
    const typeMessage = (message: string, index: number = 0) => {
      if (index <= message.length) {
        setDisplayText(message.slice(0, index));
        timeoutId = setTimeout(() => typeMessage(message, index + 1), 50);
      } else {
        setIsTyping(false);
      }
    };
    
    typeMessage(thinkingText);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [thinkingText, loading]);
  
  // Progress and message management
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setThinkingStep(0);
      return;
    }
    
    setThinkingStep(0);
    setThinkingText(thinkingMessages[0]);
    setProgress(0);
    
    const messageInterval = setInterval(() => {
      setThinkingStep((prev) => {
        const next = prev < thinkingMessages.length - 1 ? prev + 1 : prev;
        if (next < thinkingMessages.length) {
          setThinkingText(thinkingMessages[next]);
        }
        return next;
      });
    }, 3000);
    
    // Smooth progress increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 3 + 1; // Random increment between 1-4%
        return Math.min(prev + increment, 95); // Cap at 95% until completion
      });
    }, 200);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setScrapedData(null);
    setMarketingReport(null);
    setProgress(0);

    try {
      // Step 1: Scrape the website
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.text();
        
        if (scrapeResponse.status === 403) {
          setShowManualForm(true);
          setError("This website requires manual information. Please fill out the form below:");
          setLoading(false);
          setProgress(100);
          return;
        }
        
        throw new Error(errorData || "Failed to analyze website");
      }

      const scraped = await scrapeResponse.json();
      setScrapedData(scraped);
      setProgress(60);

      // Step 2: Generate marketing report
      const reportResponse = await fetch("/api/marketing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedData: scraped,
          productName: scraped.title,
          productDescription: scraped.description
        }),
      });

      if (!reportResponse.ok) {
        throw new Error("Failed to generate marketing report");
      }

      const response = await reportResponse.json();
      setMarketingReport(response.report || response);
      setProgress(100);

    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productDescription.trim()) return;

    setLoading(true);
    setError("");
    setProgress(0);

    try {
      // Create mock scraped data from manual input
      const mockScrapedData = {
        url: url,
        title: productName,
        description: productDescription,
        content: `${productName}: ${productDescription}`
      };

      setScrapedData(mockScrapedData);
      setProgress(50);

      // Generate marketing report
      const reportResponse = await fetch("/api/marketing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedData: mockScrapedData,
          productName,
          productDescription
        }),
      });

      if (!reportResponse.ok) {
        throw new Error("Failed to generate marketing report");
      }

      const response = await reportResponse.json();
      setMarketingReport(response.report || response);
      setProgress(100);
      setShowManualForm(false);

    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-100/60 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-50/80 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-bounce shadow-lg">
                <span className="text-xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                TractionPilot
              </h1>
            </div>

            <div className="space-y-4">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="min-h-[60px] flex items-center justify-center">
                <div className="text-lg text-gray-700 font-medium">
                  {displayText}
                  {isTyping && <span className="animate-pulse text-orange-500">|</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form - Only show when not loading and no report */}
        {!loading && !marketingReport && !showManualForm && (
          <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-2xl font-bold">🚀</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  TractionPilot
                </h1>
                <p className="text-gray-500 text-sm">AI Marketing Intelligence</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Get Your Marketing Strategy
                </h2>
                <p className="text-gray-600">
                  Enter your website URL and get a comprehensive AI-powered marketing report in seconds.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Analyze Website →
                </button>
              </form>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Form - Show when automatic scraping fails */}
        {showManualForm && !loading && !marketingReport && (
          <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/10 p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-xl">✏️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Manual Entry Required</h2>
            </div>

            <p className="text-gray-600 mb-6">
              We couldn't automatically analyze this website. Please provide some basic information:
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product/Company Name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>

              <div>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Brief description of what your product/service does..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!productName.trim() || !productDescription.trim()}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Continue with Manual Entry →
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowManualForm(false);
                  setError("");
                  setUrl("");
                  setProductName("");
                  setProductDescription("");
                }}
                className="w-full py-2 px-4 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Try Another URL
              </button>
            </form>
          </div>
        )}

        {error && !showManualForm && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Marketing Report Display */}
      {marketingReport && scrapedData && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-50"
        >
          {/* Subtle Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="fixed w-96 h-96 bg-orange-100/40 rounded-full blur-3xl"
              style={{
                top: '5%',
                left: '10%'
              }}
            ></div>
            <div 
              className="fixed w-80 h-80 bg-orange-50/60 rounded-full blur-3xl"
              style={{
                bottom: '10%',
                right: '15%'
              }}
            ></div>
          </div>

          <div className="min-h-screen py-12 px-4 relative z-10 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/5 p-8"
            >
              {/* Clean Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      Marketing Report
                    </h1>
                    <p className="text-gray-500 text-sm">AI-Generated Strategy</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">{marketingReport.productName}</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-orange-700 text-sm font-medium">{marketingReport.category}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200 p-6 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Executive Summary</h3>
                    <Sparkles className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
                    <p className="text-gray-700 leading-relaxed italic text-lg font-medium">
                      "{marketingReport.valueProposition}"
                    </p>
                  </div>
                </div>

                {/* Demographics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Demographics</h4>
                    <Eye className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{marketingReport.userPersona.demographics}</p>
                  </div>
                </div>

                {/* Platform Presence */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Platform Presence</h4>
                    <Heart className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{marketingReport.userPersona.whereTheyHangOut}</p>
                  </div>
                </div>

                {/* Mindset & Psychology */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Mindset & Psychology</h4>
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{marketingReport.userPersona.mindset}</p>
                  </div>
                </div>

                {/* Pain Points */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Pain Points</h4>
                    <Zap className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ul className="space-y-3">
                      {marketingReport.painPoints.map((point, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Content Pillars */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Palette className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Content Pillars</h4>
                    <PenTool className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketingReport.contentPillars.map((pillar, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                        <h5 className="font-semibold text-orange-600 mb-2">{pillar.pillar}</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Types */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Video className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Content Types</h4>
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketingReport.postTypes.map((type, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publishing Schedule */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Publishing Schedule</h4>
                    <Rocket className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-600">Monday</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{marketingReport.weeklyCalendar.monday}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-600">Wednesday</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{marketingReport.weeklyCalendar.wednesday}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-600">Friday</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{marketingReport.weeklyCalendar.friday}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-600">Sunday</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{marketingReport.weeklyCalendar.sunday}</p>
                    </div>
                  </div>
                </div>

                {/* Hashtag Strategy */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <Hash className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Hashtag Strategy</h4>
                    <span className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-full border border-orange-200">{marketingReport.hashtagStyle.tone}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex flex-wrap gap-2">
                      {marketingReport.hashtagStyle.exampleHashtags.map((tag, index) => (
                        <span key={index} className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200 transition-colors border border-orange-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Engagement Tactics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Engagement Tactics</h4>
                    <Heart className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-3">
                      {marketingReport.engagementStrategy.map((strategy, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:bg-orange-50/50 transition-colors">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm leading-relaxed">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Success Metrics</h4>
                    <Target className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketingReport.metricsToTrack.map((metric, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-orange-50/50 transition-colors">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Takeaway */}
                <div className="bg-gradient-to-br from-orange-100 to-orange-200/60 rounded-2xl border-2 border-orange-300 p-6 hover:shadow-lg hover:shadow-orange-500/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Key Takeaway</h3>
                    <Rocket className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="bg-white/80 rounded-xl p-5 border border-orange-200">
                    <p className="text-gray-800 leading-relaxed font-medium italic text-lg">
                      {marketingReport.keyTakeaway}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                  <button 
                    onClick={() => {
                      setMarketingReport(null);
                      setScrapedData(null);
                      setUrl("");
                      setProductName("");
                      setProductDescription("");
                      setShowManualForm(false);
                      setError("");
                    }}
                    className="px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors font-medium hover:bg-white/5"
                  >
                    Analyze Another Website
                  </button>
                  <a 
                    href={scrapedData.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(255,107,53,0.3)] active:translate-y-0"
                    style={{
                      background: "linear-gradient(45deg, #ff6b35, #f7931e)"
                    }}
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}