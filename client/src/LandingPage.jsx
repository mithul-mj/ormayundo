import React, { useState } from 'react';
import {
  Brain,
  Download,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  ShieldCheck,
  Search,
  Check,
  Copy,
  Laptop,
  BarChart3,
  BookOpen,
  Tag,
  Star,
  Zap,
  ExternalLink,
  Eye,
  Maximize2
} from 'lucide-react';

export default function LandingPage({ onGetStarted, isAuthenticated }) {
  const [copiedStep, setCopiedStep] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState(null);

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedStep(true);
    setTimeout(() => setCopiedStep(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col font-sans selection:bg-[#FF385C]/15 selection:text-[#FF385C]">
      {/* 1. Header / Navbar (Airbnb Style) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF385C] to-[#E61E4D] flex items-center justify-center text-white shadow-sm shadow-[#FF385C]/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-[#FF385C]">
              Ormayundo.
            </span>
          </div>

          {/* Navigation Links (Airbnb Pill Style) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F7F7F7] p-1.5 rounded-full border border-[#EBEBEB] text-xs font-semibold text-[#717171]">
            <a href="#showcase-extension" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Extension in Action
            </a>
            <a href="#showcase-dashboard" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Brain Dashboard
            </a>
            <a href="#showcase-manager" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Manage Decks
            </a>
            <a href="#how-it-works" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              How It Works
            </a>
            <a href="#download" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Download ZIP
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="/ormayundo-extension.zip"
              download="ormayundo-extension.zip"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#222222] bg-white border border-[#DDDDDD] rounded-full hover:border-[#222222] transition-all shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#FF385C]" />
              <span>Download ZIP</span>
            </a>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466] hover:opacity-95 shadow-md shadow-[#FF385C]/20 active:scale-95 transition-all cursor-pointer"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Airbnb Editorial Style) */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
            <span>AI Active Recall • SuperMemo SM-2 Engine</span>
            <span className="text-[#717171]">• 100% Free Unpacked Extension</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#222222] leading-[1.08] mb-6">
            Remember everything <br className="hidden sm:inline" />
            you <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466]">read on the web.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#717171] font-normal leading-relaxed mb-10">
            Highlight any sentence or code block on any website. Ormayundo turns it into high-yield active-recall flashcards with mathematically scheduled spaced repetition.
          </p>

          {/* Airbnb Iconic Floating Search/Action Pill Bar */}
          <div className="max-w-3xl mx-auto mb-14 p-2 sm:p-2.5 bg-white border border-[#DDDDDD] rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex-1 px-4 sm:px-6 py-1.5 sm:border-r border-[#EBEBEB] w-full sm:w-auto">
              <span className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider">Highlight</span>
              <span className="text-xs text-[#717171] font-medium truncate block">Select text on Wikipedia, MDN, blogs</span>
            </div>
            <div className="flex-1 px-4 sm:px-6 py-1.5 sm:border-r border-[#EBEBEB] w-full sm:w-auto">
              <span className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider">AI Question</span>
              <span className="text-xs text-[#717171] font-medium truncate block">Generates active recall cards</span>
            </div>
            <div className="flex-1 px-4 sm:px-6 py-1.5 w-full sm:w-auto">
              <span className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider">Spaced Recall</span>
              <span className="text-xs text-[#717171] font-medium truncate block">&lt;1m, 2d, 6d, 8d intervals</span>
            </div>

            {/* Pill Action Button */}
            <a
              href="/ormayundo-extension.zip"
              download="ormayundo-extension.zip"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#FF385C]/25 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Get Extension (.ZIP)</span>
            </a>
          </div>

          {/* Real In-Action Hero Screenshot */}
          <div className="relative max-w-5xl mx-auto">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF385C]/20 via-[#FF9532]/10 to-[#FF385C]/20 rounded-3xl blur-2xl opacity-60 -z-10" />

            {/* Browser Frame */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#DDDDDD] shadow-[0_16px_48px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Browser Address Bar Header */}
              <div className="bg-[#F7F7F7] px-4 py-3 border-b border-[#EBEBEB] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>

                <div className="flex-1 max-w-md bg-white border border-[#EBEBEB] rounded-full px-4 py-1 text-xs text-[#717171] font-mono flex items-center gap-2 shadow-xs">
                  <span className="text-[#008A05]">https://</span>
                  <span className="text-[#222222] font-semibold truncate">en.wikipedia.org/wiki/Steve_Jobs</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#FF385C] bg-[#FF385C]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Capture
                  </span>
                </div>
              </div>

              {/* Real Full Image with Floating Annotation Overlays */}
              <div className="relative group cursor-pointer" onClick={() => setActiveModalImg('/images/extension-in-action.jpg')}>
                <img
                  src="/images/extension-in-action.jpg"
                  alt="Ormayundo Chrome Extension in action on Wikipedia"
                  className="w-full h-auto block object-cover"
                />

                {/* Annotation Pin 1: Text Highlight & Save Button */}
                <div className="absolute top-[42%] left-[24%] -translate-y-1/2 hidden md:flex items-center gap-2 bg-[#222222]/90 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border border-white/20 animate-bounce duration-1000">
                  <span className="w-2 h-2 rounded-full bg-[#FF385C]" />
                  <span>Highlight & Click "Save to Ormayundo"</span>
                </div>

                {/* Annotation Pin 2: Extension Popup & Question */}
                <div className="absolute top-[28%] right-[8%] hidden md:flex items-center gap-2 bg-[#FF385C] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border border-white/30">
                  <Brain className="w-3.5 h-3.5" />
                  <span>AI Flashcard with Spaced Repetition</span>
                </div>

                {/* Hover to Expand Pill */}
                <div className="absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to view full screenshot</span>
                </div>
              </div>
            </div>

            {/* Sub-bar Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#717171] mt-8">
              <div className="flex items-center gap-1.5 text-[#222222]">
                <Star className="w-4 h-4 fill-[#FF385C] text-[#FF385C]" />
                <span className="font-bold">4.98</span>
                <span className="text-[#717171] font-normal">(Learning Retention)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008A05]" />
                <span>SuperMemo-2 Spaced Repetition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008A05]" />
                <span>Zero Browsing Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008A05]" />
                <span>Free Unpacked Extension</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE SECTION: Real Extension Features & Cropped Parts */}
      <section id="showcase-extension" className="py-20 bg-[#F7F7F7] border-y border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Chrome Extension Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              Capture knowledge without breaking concentration
            </h2>
            <p className="text-[#717171] max-w-xl mx-auto text-sm sm:text-base">
              See the exact workflow: highlight any sentence on the web to trigger the floating button, then review active-recall prompts directly in the browser popup.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Two Cropped Highlight Parts */}
            <div className="lg:col-span-5 space-y-6">
              {/* Part 1: Highlight + Save Button */}
              <div className="bg-white p-6 rounded-3xl border border-[#DDDDDD] shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF385C] bg-[#FF385C]/10 px-2.5 py-1 rounded-full">
                    Part 1 • Text Selection
                  </span>
                  <span className="text-xs text-[#717171]">Any webpage</span>
                </div>

                <div className="rounded-2xl border border-[#EBEBEB] overflow-hidden mb-4 shadow-inner bg-gray-50">
                  <img
                    src="/images/part-save-button.png"
                    alt="Highlighted text with Save to Ormayundo floating button"
                    className="w-full h-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setActiveModalImg('/images/part-save-button.png')}
                  />
                </div>

                <h3 className="font-extrabold text-base text-[#222222] mb-1">
                  1-Click "Save to Ormayundo" Floating Button
                </h3>
                <p className="text-xs text-[#717171] leading-relaxed">
                  Select text on Wikipedia, articles, or documentation. The distinctive red pill appears automatically right under your cursor. Click it to immediately synthesize an active-recall card.
                </p>
              </div>

              {/* Part 2: Extension Popup & Question */}
              <div className="bg-white p-6 rounded-3xl border border-[#DDDDDD] shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#008A05] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Part 2 • In-Tab Popup
                  </span>
                  <span className="text-xs font-semibold text-[#FF385C]">94 Due Today</span>
                </div>

                <div className="rounded-2xl border border-[#EBEBEB] overflow-hidden mb-4 shadow-inner bg-gray-50 max-h-56 flex items-center justify-center">
                  <img
                    src="/images/part-extension-popup.png"
                    alt="Extension popup with Active Recall question card"
                    className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setActiveModalImg('/images/part-extension-popup.png')}
                  />
                </div>

                <h3 className="font-extrabold text-base text-[#222222] mb-1">
                  Active Recall Flashcards Inside Any Tab
                </h3>
                <p className="text-xs text-[#717171] leading-relaxed">
                  No need to open separate study software. The extension popup lets you flip cards, test comprehension with questions (like stored procedures or algorithms), and rate difficulty.
                </p>
              </div>
            </div>

            {/* Right: Full Extension in Action */}
            <div className="lg:col-span-7">
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#DDDDDD] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBEBEB]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#008A05]" />
                    <span className="text-xs font-bold text-[#222222]">Full Extension Context</span>
                  </div>
                  <span className="text-[11px] text-[#717171] font-mono">en.wikipedia.org/wiki/Steve_Jobs</span>
                </div>

                <div
                  className="rounded-2xl overflow-hidden border border-[#EBEBEB] relative group cursor-pointer"
                  onClick={() => setActiveModalImg('/images/extension-in-action.jpg')}
                >
                  <img
                    src="/images/extension-in-action.jpg"
                    alt="Full Wikipedia view with Ormayundo popup"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-[#222222] px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Click to enlarge
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EBEBEB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#717171]">
                  <span>💡 Notice the highlighted sentence and the open Active Recall flashcard on the right side.</span>
                  <a
                    href="/ormayundo-extension.zip"
                    download="ormayundo-extension.zip"
                    className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1 shrink-0"
                  >
                    Download Extension ZIP <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOWCASE SECTION: Real Brain Analytics Dashboard */}
      <section id="showcase-dashboard" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Web Dashboard Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              Your Brain Dashboard & Memory Analytics
            </h2>
            <p className="text-[#717171] max-w-xl mx-auto text-sm sm:text-base">
              Real analytics from real users. Track your retention rate, creation streaks, and upcoming review workload across days and weeks.
            </p>
          </div>

          {/* Full Dashboard Screenshot in App Frame */}
          <div className="bg-white rounded-3xl border border-[#DDDDDD] shadow-[0_16px_40px_rgba(0,0,0,0.08)] overflow-hidden mb-10">
            {/* App Frame Bar */}
            <div className="bg-[#F7F7F7] px-6 py-3.5 border-b border-[#EBEBEB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-3 text-xs font-bold text-[#222222] hidden sm:inline">Ormayundo Analytics Hub</span>
              </div>
              <div className="bg-white border border-[#DDDDDD] rounded-full px-4 py-1 text-xs text-[#717171] font-mono shadow-xs truncate max-w-xs">
                ormayundo-woad.vercel.app/app
              </div>
              <button
                onClick={onGetStarted}
                className="text-xs font-bold text-[#FF385C] hover:underline cursor-pointer"
              >
                Open Dashboard →
              </button>
            </div>

            <div
              className="relative group cursor-pointer"
              onClick={() => setActiveModalImg('/images/dashboard-analytics.png')}
            >
              <img
                src="/images/dashboard-analytics.png"
                alt="Ormayundo Brain Analytics Dashboard"
                className="w-full h-auto block object-cover"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-[#222222] px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" /> View full resolution analytics
                </span>
              </div>
            </div>
          </div>

          {/* Cropped Feature Highlights from the Analytics Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Highlight 1: Knowledge Mastery Donut */}
            <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-[#EBEBEB] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#222222] bg-white px-2.5 py-1 rounded-full border border-[#DDDDDD] inline-block mb-3">
                  Donut Breakdown
                </span>
                <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] mb-4 bg-white p-2">
                  <img
                    src="/images/part-analytics-mastery.png"
                    alt="Knowledge Mastery Donut Breakdown"
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => setActiveModalImg('/images/part-analytics-mastery.png')}
                  />
                </div>
                <h4 className="font-extrabold text-[#222222] text-sm mb-1">Knowledge Mastery Donut</h4>
                <p className="text-xs text-[#717171] leading-relaxed">
                  Real-time visual distribution dividing all your cards into: Learning (orange), Mastered (green), New (blue), and Relearning (red).
                </p>
              </div>
            </div>

            {/* Highlight 2: Upcoming Workload Forecast */}
            <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-[#EBEBEB] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#222222] bg-white px-2.5 py-1 rounded-full border border-[#DDDDDD] inline-block mb-3">
                  Spaced Workload
                </span>
                <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] mb-4 bg-white p-2">
                  <img
                    src="/images/part-analytics-workload.png"
                    alt="Upcoming Workload Spaced Repetition Chart"
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => setActiveModalImg('/images/part-analytics-workload.png')}
                  />
                </div>
                <h4 className="font-extrabold text-[#222222] text-sm mb-1">Upcoming Workload Forecast</h4>
                <p className="text-xs text-[#717171] leading-relaxed">
                  Bar chart showing review volume scheduled for Today, Tomorrow, in 3 Days, and Next Week based on SM-2 calculation.
                </p>
              </div>
            </div>

            {/* Highlight 3: Retention Rate & Streaks */}
            <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-[#EBEBEB] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#222222] bg-white px-2.5 py-1 rounded-full border border-[#DDDDDD] inline-block mb-3">
                  Retention Metrics
                </span>
                <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] mb-4 bg-white p-2">
                  <img
                    src="/images/part-analytics-streak-retention.png"
                    alt="Streak and Retention Rate 77%"
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => setActiveModalImg('/images/part-analytics-streak-retention.png')}
                  />
                </div>
                <h4 className="font-extrabold text-[#222222] text-sm mb-1">77% Retention & Streak Tracker</h4>
                <p className="text-xs text-[#717171] leading-relaxed">
                  Gauge your long-term memory score and stay consistent with daily study streaks and milestone confetti rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOWCASE SECTION: Real Flashcard Manager & Tables */}
      <section id="showcase-manager" className="py-20 bg-[#F7F7F7] border-y border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Flashcard Knowledge Base
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              Multi-Deck Organization & Structured Tables
            </h2>
            <p className="text-[#717171] max-w-xl mx-auto text-sm sm:text-base">
              Organize cards by technical subject. Tables, code syntax, and multi-field data are parsed cleanly without breaking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Decks & Table Details */}
            <div className="lg:col-span-6 space-y-6">
              {/* Part: Decks Selector */}
              <div className="bg-white p-6 rounded-3xl border border-[#DDDDDD] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#222222] bg-[#F7F7F7] px-2.5 py-1 rounded-full border border-[#EBEBEB] inline-block mb-3">
                  Automatic Tagging
                </span>
                <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] mb-4 bg-gray-50">
                  <img
                    src="/images/part-manage-decks.png"
                    alt="Subject deck filter pills"
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => setActiveModalImg('/images/part-manage-decks.png')}
                  />
                </div>
                <h4 className="font-extrabold text-base text-[#222222] mb-1">
                  Categorized Subject Decks
                </h4>
                <p className="text-xs text-[#717171] leading-relaxed">
                  Automatic AI tagging organizes cards into decks: <strong>Nodejs & express (11)</strong>, <strong>javascript (49)</strong>, <strong>noSql (6)</strong>, <strong>dsa (5)</strong>, <strong>sql</strong>, and <strong>wikipedia</strong>.
                </p>
              </div>

              {/* Part: Rich Card with Table */}
              <div className="bg-white p-6 rounded-3xl border border-[#DDDDDD] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF385C] bg-[#FF385C]/10 px-2.5 py-1 rounded-full inline-block mb-3">
                  Table & Markdown Support
                </span>
                <div className="rounded-2xl overflow-hidden border border-[#EBEBEB] mb-4 bg-gray-50">
                  <img
                    src="/images/part-manage-card-table.png"
                    alt="MongoDB index type flashcard table"
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => setActiveModalImg('/images/part-manage-card-table.png')}
                  />
                </div>
                <h4 className="font-extrabold text-base text-[#222222] mb-1">
                  Preserves Tables, Code & Structure
                </h4>
                <p className="text-xs text-[#717171] leading-relaxed">
                  Technical cards retain table comparisons (such as MongoDB Single Field, Compound, Multikey, and Text indexes) for crystal-clear revision.
                </p>
              </div>
            </div>

            {/* Right: Full Manager Screenshot */}
            <div className="lg:col-span-6">
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#DDDDDD] shadow-[0_10px_30px_rgba(0,0,0,0.06)] sticky top-28">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBEBEB]">
                  <span className="text-xs font-bold text-[#222222]">Full Flashcard Manager</span>
                  <span className="text-[11px] text-[#717171] font-mono">96 Total Flashcards</span>
                </div>

                <div
                  className="rounded-2xl overflow-hidden border border-[#EBEBEB] relative group cursor-pointer"
                  onClick={() => setActiveModalImg('/images/dashboard-manage-cards.png')}
                >
                  <img
                    src="/images/dashboard-manage-cards.png"
                    alt="Full Flashcard Manager Screenshot"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-[#222222] px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Enlarge full manager
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EBEBEB] flex items-center justify-between text-xs text-[#717171]">
                  <span>Filter by deck, search by concept, or wipe all with 1 click.</span>
                  <button
                    onClick={onGetStarted}
                    className="font-bold text-[#FF385C] hover:underline cursor-pointer"
                  >
                    Try it live →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 Step Airbnb Cards) */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              4-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              How to use Ormayundo
            </h2>
            <p className="text-[#717171] max-w-lg mx-auto text-sm sm:text-base">
              Turn passive reading into permanent memory in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#DDDDDD] transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] font-extrabold text-sm flex items-center justify-center mb-5">
                  01
                </span>
                <h3 className="font-bold text-[#222222] text-lg mb-2">Install Extension</h3>
                <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                  Download the ZIP below, extract it, and click "Load unpacked" in Chrome Developer mode.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EBEBEB] text-xs font-bold text-[#FF385C] flex items-center gap-1">
                Takes 30 seconds <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#DDDDDD] transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] font-extrabold text-sm flex items-center justify-center mb-5">
                  02
                </span>
                <h3 className="font-bold text-[#222222] text-lg mb-2">Highlight Anything</h3>
                <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                  Read Wikipedia, technical docs, or articles. Highlight any core sentence or formula.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EBEBEB] text-xs font-bold text-[#FF385C] flex items-center gap-1">
                Preserves code & tables <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#DDDDDD] transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] font-extrabold text-sm flex items-center justify-center mb-5">
                  03
                </span>
                <h3 className="font-bold text-[#222222] text-lg mb-2">1-Click Save</h3>
                <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                  Click the red "Save to Ormayundo" button. AI synthesizes an active recall card in the background.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EBEBEB] text-xs font-bold text-[#FF385C] flex items-center gap-1">
                Instant background save <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md hover:border-[#DDDDDD] transition-all flex flex-col justify-between">
              <div>
                <span className="w-10 h-10 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] font-extrabold text-sm flex items-center justify-center mb-5">
                  04
                </span>
                <h3 className="font-bold text-[#222222] text-lg mb-2">Active Recall</h3>
                <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                  Review due cards via the extension popup or web dashboard using SM-2 spaced repetition intervals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EBEBEB] text-xs font-bold text-[#FF385C] flex items-center gap-1">
                Permanent retention <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Extension Download Section (Airbnb Luxe / Booking Card Style) */}
      <section id="download" className="py-20 bg-[#F7F7F7] border-y border-[#EBEBEB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="bg-white border border-[#DDDDDD] rounded-3xl p-8 sm:p-12 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF385C]/10 text-[#FF385C] text-xs font-bold">
                  <Download className="w-3.5 h-3.5" />
                  Direct Download • Chrome, Edge, Brave, Opera
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight">
                  Download the Extension
                </h2>
                <p className="text-[#717171] text-sm leading-relaxed">
                  Download the unpacked Chrome extension ZIP. 100% free, private, and compatible with all Chromium browsers.
                </p>

                <div className="pt-2">
                  <a
                    href="/ormayundo-extension.zip"
                    download="ormayundo-extension.zip"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#FF385C]/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ormayundo-extension.zip</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Step-by-Step Installation */}
              <div className="md:col-span-5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl p-5 space-y-3.5 text-xs text-[#717171]">
                <h4 className="font-bold text-sm text-[#222222] flex items-center gap-2 pb-2 border-b border-[#EBEBEB]">
                  <Laptop className="w-4 h-4 text-[#FF385C]" />
                  Installation in 3 steps:
                </h4>

                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#222222] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p>
                    <strong className="text-[#222222]">Extract</strong> the downloaded <code className="bg-gray-200 px-1 py-0.5 rounded text-[#222222] font-mono">ormayundo-extension.zip</code> file.
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="w-5 h-5 rounded-full bg-[#222222] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <div className="flex-1">
                    <span>Open <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[#222222] font-mono">chrome://extensions</code></span>
                  </div>
                  <button
                    onClick={copyChromeUrl}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 text-[#222222] font-bold text-[10px] border border-[#DDDDDD] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedStep ? <Check className="w-3 h-3 text-[#008A05]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#222222] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p>
                    Enable <strong className="text-[#222222]">Developer mode</strong> (top-right), click <strong className="text-[#222222]">Load unpacked</strong>, and choose the extracted folder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Spaced Repetition Science (SuperMemo SM-2) */}
      <section id="science" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Cognitive Science
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              SuperMemo SM-2 Spaced Repetition
            </h2>
            <p className="text-[#717171] max-w-lg mx-auto text-sm sm:text-base">
              Rote cramming fades in 48 hours. Spaced repetition recalculates the exact interval before memory decay occurs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <span className="text-[11px] font-bold text-[#FF385C] uppercase tracking-wider block mb-1">Forgot</span>
              <span className="text-3xl font-extrabold text-[#222222]">&lt;1 min</span>
              <p className="text-xs text-[#717171] mt-2">Re-enters learning queue immediately to reset synaptic recall.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider block mb-1">Hard</span>
              <span className="text-3xl font-extrabold text-[#222222]">2 Days</span>
              <p className="text-xs text-[#717171] mt-2">Conservative interval progression (~1.2x) for difficult cards.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block mb-1">Good</span>
              <span className="text-3xl font-extrabold text-[#222222]">6 Days</span>
              <p className="text-xs text-[#717171] mt-2">Standard SM-2 progression based on your card's Easiness Factor.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-[#EBEBEB]">
              <span className="text-[11px] font-bold text-[#008A05] uppercase tracking-wider block mb-1">Easy</span>
              <span className="text-3xl font-extrabold text-[#222222]">8 Days</span>
              <p className="text-xs text-[#717171] mt-2">Applies a 1.3x Easy Bonus and elevates long-term card strength.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Key Features Grid */}
      <section id="features" className="py-20 bg-[#F7F7F7] border-t border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Engineered for Mastery
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              Built for serious learners & developers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF385C]/10 text-[#FF385C] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#222222] text-base">Active Recall Prompts</h4>
              <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                Rather than memorizing verbatim text, Ormayundo formulates questions that test underlying conceptual mechanics.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#222222] text-base">Smart Deck Categorization</h4>
              <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                Automatically organizes flashcards into fitting subject decks like Node.js, JavaScript, NoSQL, or DSA.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008A05] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#222222] text-base">Retention & Heatmap Analytics</h4>
              <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                Track study streaks, retention percentages, and card mastery breakdowns with GitHub-style activity heatmaps.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#222222] text-base">Table & Code Structure</h4>
              <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                HTML tables and multi-line code fragments are extracted cleanly into markdown format without losing formatting.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#222222] text-base">Streak Habit Building</h4>
              <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                Build a daily learning ritual. Celebrate study milestones with streak tracking and milestone confetti rewards.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#222222] text-base">Privacy by Architecture</h4>
              <p className="text-[#717171] text-xs sm:text-sm leading-relaxed">
                We never monitor or log your general browsing history. Only text you deliberately highlight and save is transmitted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Bottom CTA Banner (Airbnb Rausch Gradient) */}
      <section className="py-20 bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466] text-white text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Start remembering what you read.
          </h2>
          <p className="text-white/90 max-w-xl mx-auto text-base sm:text-lg">
            Download the free Chrome extension or try the web dashboard with Google login.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="/ormayundo-extension.zip"
              download="ormayundo-extension.zip"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#222222] font-extrabold text-sm shadow-xl active:scale-95 transition-all hover:bg-gray-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FF385C]" />
              <span>Download Extension (.ZIP)</span>
            </a>

            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black/20 hover:bg-black/30 text-white font-extrabold text-sm border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign in with Google'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 11. Footer (Airbnb Clean Footer) */}
      <footer className="bg-white border-t border-[#EBEBEB] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF385C] to-[#E61E4D] flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-[#222222] tracking-tight">Ormayundo.</span>
            <span className="text-xs text-[#717171] ml-2">© {new Date().getFullYear()} Active Recall</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-[#717171]">
            <a href="/privacy" className="hover:text-[#222222] transition-colors">Privacy</a>
            <a href="#how-it-works" className="hover:text-[#222222] transition-colors">How It Works</a>
            <a href="/ormayundo-extension.zip" download="ormayundo-extension.zip" className="hover:text-[#222222] transition-colors">Download Extension</a>
          </div>
        </div>
      </footer>

      {/* 12. Modal Lightbox for Full-Resolution Image Inspection */}
      {activeModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setActiveModalImg(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl border border-white/20 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-2 border-b border-[#EBEBEB]">
              <span className="text-xs font-bold text-[#717171]">Ormayundo High-Resolution Screenshot</span>
              <button
                onClick={() => setActiveModalImg(null)}
                className="w-7 h-7 rounded-full bg-[#F7F7F7] hover:bg-gray-200 flex items-center justify-center text-[#222222] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] p-2">
              <img
                src={activeModalImg}
                alt="Enlarged screenshot"
                className="w-full h-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
