# TractionPilot

## Overview

TractionPilot is an AI-powered marketing intelligence platform built with Next.js. The application analyzes websites using advanced web scraping techniques and generates comprehensive marketing strategies using Google's Gemini AI. It features social media integration (Twitter/LinkedIn), intelligent content analysis, and provides actionable marketing reports with user personas, content strategies, and engagement tactics. Built with modern React patterns and styled with Tailwind CSS, it provides a clean, user-friendly experience with animated gradients and intuitive interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows Next.js 15 App Router architecture with React 19, utilizing a component-based design pattern. The main interface features URL analysis forms, comprehensive marketing report displays, and social media integration pages. It includes advanced web scraping APIs using Puppeteer with stealth capabilities, AI-powered content generation using Google Gemini, and social media APIs for Twitter and LinkedIn. The project uses TypeScript for type safety and maintains clean separation between UI components, API routes, and business logic.

### UI Component System
The application implements a comprehensive design system based on Radix UI primitives and shadcn/ui components. This provides a consistent, accessible component library including forms, dialogs, buttons, and navigation elements. The components are styled using Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes through next-themes integration.

### Styling and Theming
The styling architecture uses a modern CSS approach with Tailwind CSS as the primary framework, enhanced with custom CSS variables for dynamic theming. The application features a distinctive radial gradient background and implements a cohesive color system that can adapt to different themes. Font optimization is handled through Next.js font loading with Geist Sans and Geist Mono typefaces.

### State Management
The application uses React's built-in state management with hooks for complex form interactions, loading states, and report displays. Features include real-time progress tracking, animated typing effects, error handling for failed scraping attempts, and dynamic content rendering. State is managed locally within components with NextAuth for authentication state management.

### Development Configuration
The project is configured with TypeScript for type safety, ESLint for code quality, and includes path aliases for clean imports. The development setup supports hot reloading and includes proper TypeScript configuration for Next.js App Router patterns.

## External Dependencies

### Core Framework Dependencies
- **Next.js 15.5.2**: React framework providing App Router, server-side rendering, and build optimization
- **React 19.1.0**: Core React library for component-based UI development
- **TypeScript**: Static type checking and enhanced development experience

### UI and Component Libraries
- **Radix UI Components**: Comprehensive set of accessible, unstyled UI primitives including dialogs, forms, navigation, and interactive elements
- **shadcn/ui**: Pre-built component system built on Radix UI with consistent styling patterns
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **class-variance-authority**: Utility for creating component variants with conditional styling

### Styling and Animation
- **Tailwind CSS**: Utility-first CSS framework for responsive design and component styling
- **next-themes**: Theme management system supporting light/dark mode switching
- **clsx & tailwind-merge**: Utilities for conditional class management and Tailwind class merging

### Form and Interaction Libraries
- **React Hook Form**: Form state management and validation library
- **@hookform/resolvers**: Validation resolvers for React Hook Form integration
- **input-otp**: Specialized component for OTP/PIN input functionality
- **cmdk**: Command palette and search interface components

### Additional UI Enhancements
- **embla-carousel-react**: Carousel/slider component for content presentation
- **react-day-picker**: Date picker component with internationalization support
- **date-fns**: Date utility library for formatting and manipulation
- **sonner**: Toast notification system for user feedback

### AI and Automation Libraries
- **@google/genai**: Google Gemini AI integration for content generation and analysis
- **@mozilla/readability**: Content extraction and text analysis from web pages
- **puppeteer & puppeteer-extra**: Headless browser automation for web scraping
- **puppeteer-extra-plugin-stealth**: Anti-detection plugin for bypassing website protections
- **@sparticuz/chromium**: Serverless Chromium for production deployment
- **cheerio**: Server-side HTML parsing and manipulation
- **jsdom**: DOM implementation for server-side content processing

### Social Media Integration
- **next-auth**: Authentication framework with social provider support
- **twitter-api-v2**: Twitter API v2 client for posting and profile management
- **linkedin-api-client**: LinkedIn API integration for professional networking

### Development Tools and Production
- **Geist Fonts**: Optimized font loading through Next.js font system
- **CSS Custom Properties**: Dynamic theming system using CSS variables
- **MIME Type Detection**: Content type identification for file processing

## Environment Configuration

### Required Environment Variables (Production)
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Gemini AI API key for content generation
- `NEXTAUTH_SECRET`: Secret key for NextAuth session encryption
- `NEXTAUTH_URL`: Base URL for authentication callbacks
- `TWITTER_CLIENT_ID`: Twitter OAuth 2.0 client ID
- `TWITTER_CLIENT_SECRET`: Twitter OAuth 2.0 client secret
- `LINKEDIN_CLIENT_ID`: LinkedIn OAuth 2.0 client ID
- `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth 2.0 client secret

### Current Configuration
- Application runs in test mode by default (returns dummy marketing reports)
- Web scraping works without additional API keys
- Social authentication is configured but requires API credentials for full functionality
- Puppeteer configured for both development (local Chromium) and production (Sparticuz Chromium)

## Recent Changes

### September 2025 Setup
- Imported from GitHub and configured for Replit environment
- All dependencies installed and working
- Development server running on port 5000 with proper host configuration
- Next.js configuration updated for Replit proxy compatibility
- All core functionality tested and operational in development mode