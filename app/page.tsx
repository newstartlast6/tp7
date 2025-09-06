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
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Demographics</h4>
                      <Eye className="w-4 h-4 text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <p className="text-white/90 leading-relaxed">{marketingReport.userPersona.demographics}</p>
                    </div>
                  </div>
                </div>

                {/* Platform Presence */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Platform Presence</h4>
                      <Heart className="w-4 h-4 text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <p className="text-white/90 leading-relaxed">{marketingReport.userPersona.whereTheyHangOut}</p>
                    </div>
                  </div>
                </div>

                {/* Mindset & Psychology */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Brain className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Mindset & Psychology</h4>
                      <Sparkles className="w-4 h-4 text-orange-400/60 animate-pulse" />
                    </div>
                    <div className="p-4">
                      <p className="text-white/90 leading-relaxed">{marketingReport.userPersona.mindset}</p>
                    </div>
                  </div>
                </div>

                {/* Pain Points */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Pain Points</h4>
                      <Zap className="w-4 h-4 text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {marketingReport.painPoints.map((point, index) => (
                          <li key={index} className="text-white/90 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Content Pillars */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Palette className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Content Pillars</h4>
                      <PenTool className="w-4 h-4 text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {marketingReport.contentPillars.map((pillar, index) => (
                          <div key={index} className="rounded-lg p-3 transition-colors border border-white/10 bg-white/5">
                            <h5 className="font-semibold text-orange-300 mb-2">{pillar.pillar}</h5>
                            <p className="text-white/90 text-sm leading-relaxed">{pillar.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Types */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Video className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Content Types</h4>
                      <Sparkles className="w-4 h-4 text-orange-400/60 animate-pulse" />
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {marketingReport.postTypes.map((type, index) => (
                          
                          <div key={index} className="flex items-center gap-3 p-2 px-3 rounded-sm transition-colors border border-white/10 bg-white/5">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                            <span className="text-white/90 text-sm">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publishing Schedule */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Publishing Schedule</h4>
                      <Rocket className="w-4 h-4 text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-lg p-3 transition-colors border border-white/10 bg-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-semibold text-orange-300">Monday</span>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">{marketingReport.weeklyCalendar.monday}</p>
                        </div>
                        
                        <div className="rounded-lg p-3 transition-colors border border-white/10 bg-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-semibold text-orange-300">Wednesday</span>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">{marketingReport.weeklyCalendar.wednesday}</p>
                        </div>
                        
                        <div className="rounded-lg p-3 transition-colors border border-white/10 bg-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-semibold text-orange-300">Friday</span>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">{marketingReport.weeklyCalendar.friday}</p>
                        </div>
                        
                        <div className="rounded-lg p-3 transition-colors border border-white/10 bg-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="font-semibold text-orange-300">Sunday</span>
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">{marketingReport.weeklyCalendar.sunday}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hashtag Strategy */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Hashtag Strategy</h4>
                      <span className="text-sm px-2 py-1 bg-orange-500/30 text-orange-200 rounded-full border border-orange-400/30">{marketingReport.hashtagStyle.tone}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {marketingReport.hashtagStyle.exampleHashtags.map((tag, index) => (
                          <span key={index} className="px-3 py-1.5 rounded-full text-orange-200 text-sm font-medium transition-colors border border-white/10 bg-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Tactics */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Engagement Tactics</h4>
                      <Heart className="w-4 h-4 text-orange-400/60 animate-pulse" />
                    </div>
                    <div className="p-4">
                      <div className="space-y-2">
                        {marketingReport.engagementStrategy.map((strategy, index) => (
                          <div key={index} className="flex items-start gap-3 p-2 rounded-lg transition-colors border border-white/10 bg-white/5">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white/90 text-sm leading-relaxed">{strategy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="relative group">
                  <div className="relative border border-white/10 rounded-xl p-5 hover:border-orange-400/30 transition-all duration-300 bg-white/5" >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-400">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">Success Metrics</h4>
                      <Target className="w-4 h-4 text-orange-400/60" />
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {marketingReport.metricsToTrack.map((metric, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg transition-colors border border-white/10 bg-white/5">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                            <span className="text-white/90 text-sm">{metric}</span>
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