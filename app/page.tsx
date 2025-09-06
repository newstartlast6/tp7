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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f172a 100%)"
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center animate-bounce">
                <span className="text-xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                TractionPilot
              </h1>
            </div>

            <div className="space-y-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="min-h-[60px] flex items-center justify-center">
                <div className="text-lg text-white/90 font-medium">
                  {displayText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form - Only show when not loading and no report */}
        {!loading && !marketingReport && !showManualForm && (
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/25">
                <span className="text-2xl font-bold">🚀</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  TractionPilot
                </h1>
                <p className="text-white/60 text-sm">AI Marketing Intelligence</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Get Your Marketing Strategy
                </h2>
                <p className="text-white/70">
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
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(255,107,53,0.3)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  style={{
                    background: "linear-gradient(45deg, #ff6b35, #f7931e)"
                  }}
                >
                  Analyze Website →
                </button>
              </form>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Form - Show when automatic scraping fails */}
        {showManualForm && !loading && !marketingReport && (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-xl">✏️</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Manual Entry Required</h2>
            </div>

            <p className="text-white/70 mb-6">
              We couldn't automatically analyze this website. Please provide some basic information:
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product/Company Name"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Brief description of what your product/service does..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!productName.trim() || !productDescription.trim()}
                className="w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(255,107,53,0.3)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                style={{
                  background: "linear-gradient(45deg, #ff6b35, #f7931e)"
                }}
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
                className="w-full py-2 px-4 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.1)"
                }}
              >
                Try Another URL
              </button>
            </form>
          </div>
        )}

        {error && !showManualForm && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Marketing Report Display */}
      {marketingReport && scrapedData && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            background: "radial-gradient(ellipse at center, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f172a 100%)"
          }}
        >
          {/* Enhanced Background Effects with Scroll */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="fixed w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse"
              style={{
                top: '10%',
                left: '15%'
              }}
            ></div>
            <div 
              className="fixed w-80 h-80 bg-orange-600/25 rounded-full blur-3xl animate-pulse delay-700"
              style={{
                top: '40%',
                right: '10%'
              }}
            ></div>
            <div 
              className="fixed w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"
              style={{
                bottom: '20%',
                left: '20%'
              }}
            ></div>
            <div 
              className="fixed w-64 h-64 bg-orange-500/18 rounded-full blur-3xl animate-pulse delay-1500"
              style={{
                bottom: '10%',
                right: '25%'
              }}
            ></div>
          </div>

          <div className="min-h-screen py-8 px-4 relative z-10 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto border-2 border-orange-400/40 rounded-2xl backdrop-blur-xl p-8 shadow-2xl shadow-orange-500/30"
              style={{
                background: "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,15,35,0.8) 30%, rgba(0,0,0,0.5) 70%, rgba(10,10,25,0.7) 100%)"
              }}
            >
              {/* Clean Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/25">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                      Marketing Report
                    </h1>
                    <p className="text-white/60 text-sm">AI-Generated Strategy</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{marketingReport.productName}</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    <span className="text-white/80 text-sm font-medium">{marketingReport.category}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 via-orange-400/15 to-orange-600/25 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-orange-300/40 rounded-xl p-6 hover:border-orange-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-white drop-shadow-lg">Executive Summary</h3>
                      <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                    </div>
                    <div className="rounded-lg p-4">
                      <p className="text-white leading-relaxed italic text-lg font-medium drop-shadow-md">
                        "{marketingReport.valueProposition}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-400/12 to-blue-600/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-blue-300/40 rounded-xl p-5 hover:border-blue-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Demographics</h4>
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="rounded-lg p-4">
                      <p className="text-white leading-relaxed drop-shadow-md">{marketingReport.userPersona.demographics}</p>
                    </div>
                  </div>
                </div>

                {/* Platform Presence */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-400/12 to-purple-600/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-purple-300/40 rounded-xl p-5 hover:border-purple-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Platform Presence</h4>
                      <Heart className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="rounded-lg p-4">
                      <p className="text-white leading-relaxed drop-shadow-md">{marketingReport.userPersona.whereTheyHangOut}</p>
                    </div>
                  </div>
                </div>

                {/* Mindset & Psychology */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-400/12 to-green-600/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-green-300/40 rounded-xl p-5 hover:border-green-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg">
                        <Brain className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Mindset & Psychology</h4>
                      <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
                    </div>
                    <div className="rounded-lg p-4">
                      <p className="text-white leading-relaxed drop-shadow-md">{marketingReport.userPersona.mindset}</p>
                    </div>
                  </div>
                </div>

                {/* Pain Points */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-red-400/12 to-red-600/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-red-300/40 rounded-xl p-5 hover:border-red-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Pain Points</h4>
                      <Zap className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="rounded-lg p-4">
                      <ul className="space-y-2">
                        {marketingReport.painPoints.map((point, index) => (
                          <li key={index} className="text-white flex items-start gap-3 drop-shadow-md">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Content Pillars */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-cyan-400/12 to-cyan-600/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-cyan-300/40 rounded-xl p-5 hover:border-cyan-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg">
                        <Palette className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Content Pillars</h4>
                      <PenTool className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {marketingReport.contentPillars.map((pillar, index) => (
                          <div key={index} className="rounded-lg p-3 transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                            <h5 className="font-semibold text-cyan-200 mb-2 drop-shadow-md">{pillar.pillar}</h5>
                            <p className="text-white text-sm leading-relaxed drop-shadow-md">{pillar.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Types */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-pink-400/12 to-pink-600/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-pink-300/40 rounded-xl p-5 hover:border-pink-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg">
                        <Video className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Content Types</h4>
                      <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                    </div>
                    <div className="rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {marketingReport.postTypes.map((type, index) => (
                          
                          <div key={index} className="flex items-center gap-3 p-2 px-3 rounded-sm transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full flex-shrink-0"></div>
                            <span className="text-white text-sm drop-shadow-md">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publishing Schedule */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-400/12 to-orange-500/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-yellow-300/40 rounded-xl p-5 hover:border-orange-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Publishing Schedule</h4>
                      <Rocket className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg p-3 transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="font-semibold text-orange-200 drop-shadow-md">Monday</span>
                          </div>
                          <p className="text-white text-sm leading-relaxed drop-shadow-md">{marketingReport.weeklyCalendar.monday}</p>
                        </div>
                        
                        <div className="rounded-lg p-3 transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="font-semibold text-orange-200 drop-shadow-md">Wednesday</span>
                          </div>
                          <p className="text-white text-sm leading-relaxed drop-shadow-md">{marketingReport.weeklyCalendar.wednesday}</p>
                        </div>
                        
                        <div className="rounded-lg p-3 transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="font-semibold text-orange-200 drop-shadow-md">Friday</span>
                          </div>
                          <p className="text-white text-sm leading-relaxed drop-shadow-md">{marketingReport.weeklyCalendar.friday}</p>
                        </div>
                        
                        <div className="rounded-lg p-3 transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-semibold text-orange-200 drop-shadow-md">Sunday</span>
                          </div>
                          <p className="text-white text-sm leading-relaxed drop-shadow-md">{marketingReport.weeklyCalendar.sunday}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hashtag Strategy */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-400/12 to-purple-500/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-indigo-300/40 rounded-xl p-5 hover:border-indigo-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                        <Hash className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Hashtag Strategy</h4>
                      <span className="text-sm px-2 py-1 bg-indigo-500/30 text-indigo-200 rounded-full">{marketingReport.hashtagStyle.tone}</span>
                    </div>
                    <div className="rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {marketingReport.hashtagStyle.exampleHashtags.map((tag, index) => (
                          <span key={index} className="px-3 py-1.5 rounded-full text-indigo-200 text-sm font-medium transition-colors drop-shadow-md backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Tactics */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-400/12 to-teal-500/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-emerald-300/40 rounded-xl p-5 hover:border-emerald-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Engagement Tactics</h4>
                      <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="rounded-lg p-4">
                      <div className="space-y-2">
                        {marketingReport.engagementStrategy.map((strategy, index) => (
                          <div key={index} className="flex items-start gap-3 p-2 rounded-lg transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white text-sm leading-relaxed drop-shadow-md">{strategy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-violet-400/12 to-fuchsia-500/20 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-violet-300/40 rounded-xl p-5 hover:border-violet-400/60 transition-all duration-300" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-600 text-white shadow-lg">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white drop-shadow-lg">Success Metrics</h4>
                      <Target className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {marketingReport.metricsToTrack.map((metric, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg transition-colors backdrop-blur-sm" style={{background: "rgba(0,0,0,0.4)"}}>
                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0"></div>
                            <span className="text-white text-sm drop-shadow-md">{metric}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Takeaway */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-orange-400/20 to-red-500/25 rounded-xl blur-lg"></div>
                  <div className="relative backdrop-blur-lg border-2 border-orange-300/50 rounded-xl p-6 hover:border-orange-400/70 transition-all duration-300" style={{background: "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(15,15,35,0.7) 50%, rgba(0,0,0,0.6) 100%)"}}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-lg">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-white drop-shadow-lg">Key Takeaway</h3>
                      <Rocket className="w-5 h-5 text-orange-400 animate-bounce" />
                    </div>
                    <div className="bg-black/60 rounded-lg p-5 backdrop-blur-sm">
                      <p className="text-white leading-relaxed font-medium italic text-lg drop-shadow-md">
                        {marketingReport.keyTakeaway}
                      </p>
                    </div>
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