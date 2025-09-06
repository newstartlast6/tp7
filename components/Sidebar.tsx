"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Calendar,
  BarChart3,
  Settings,
  Twitter,
  Menu,
  X,
  Rocket,
  Users,
  TrendingUp
} from "lucide-react";

const navigationItems = [
  {
    name: "Marketing Report",
    href: "/",
    icon: BarChart3,
    description: "AI-powered insights"
  },
  {
    name: "Content Planner",
    href: "/content",
    icon: Calendar,
    description: "Schedule your posts"
  },
  {
    name: "Twitter Scheduler",
    href: "/twitter",
    icon: Twitter,
    description: "Automated tweets"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    description: "Track performance"
  }
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-orange-100 shadow-lg hover:shadow-orange-500/10 transition-all"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm border-r border-orange-100 z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:w-72 lg:bg-white
        `}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-24 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-24 w-48 h-48 bg-orange-300/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo/Brand Section */}
          <div className="p-6 border-b border-orange-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  TractionPilot
                </h1>
                <p className="text-xs text-gray-500">AI Marketing Suite</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-4">
              <h2 className="text-xs uppercase tracking-wide text-gray-400 font-medium px-3 mb-3">
                Main Menu
              </h2>
            </div>
            
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'} transition-colors`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-900'} truncate`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-500'} truncate`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-orange-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">User Account</p>
                <p className="text-xs text-gray-500 truncate">Manage settings</p>
              </div>
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>

          {/* Status Indicator */}
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              All systems operational
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}