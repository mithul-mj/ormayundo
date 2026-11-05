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
  MousePointerClick
} from 'lucide-react';

export default function LandingPage({ onGetStarted, isAuthenticated }) {
  const [activePreviewTab, setActivePreviewTab] = useState('extension'); // 'extension' | 'dashboard' | 'manager'
  const [cardFlipped, setCardFlipped] = useState(false);
  const [copiedStep, setCopiedStep] = useState(false);

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedStep(true);
    setTimeout(() => setCopiedStep(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col font-sans selection:bg-[#FF385C]/15 selection:text-[#FF385C]">
      {/* 1. Header / Navbar (Airbnb Style) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBEBEB]">
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
            <a href="#preview" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Product Tour
            </a>
            <a href="#how-it-works" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              How It Works
            </a>
            <a href="#download" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Extension ZIP
            </a>
            <a href="#science" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Spaced Repetition
            </a>
            <a href="#features" className="px-4 py-1.5 rounded-full hover:text-[#222222] hover:bg-white transition-all">
              Features
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
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
            <span>AI Active Recall • SuperMemo SM-2 Engine</span>
            <span className="text-[#717171]">• 100% Free</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#222222] leading-[1.08] mb-6">
            Remember everything <br className="hidden sm:inline" />
            you <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466]">read on the web.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#717171] font-normal leading-relaxed mb-10">
            Highlight any key sentence or code fragment on any website. Ormayundo turns it into high-yield active-recall flashcards with mathematically scheduled spaced repetition.
          </p>

          {/* Airbnb Iconic Floating Pill Bar */}
          <div className="max-w-3xl mx-auto mb-12 p-2 sm:p-2.5 bg-white border border-[#DDDDDD] rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex-1 px-4 sm:px-6 py-1.5 sm:border-r border-[#EBEBEB] w-full sm:w-auto">
              <span className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider">Highlight</span>
              <span className="text-xs text-[#717171] font-medium truncate block">Select text on any webpage</span>
            </div>
            <div className="flex-1 px-4 sm:px-6 py-1.5 sm:border-r border-[#EBEBEB] w-full sm:w-auto">
              <span className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider">AI Synthesis</span>
              <span className="text-xs text-[#717171] font-medium truncate block">Generates active recall questions</span>
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

          {/* Social Proof / Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#717171]">
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
      </section>

      {/* 3. Interactive Product Showcase (Airbnb Clean Cards) */}
      <section id="preview" className="py-16 bg-[#F7F7F7] border-y border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mb-3">
              Experience the Product
            </h2>
            <p className="text-[#717171] max-w-lg mx-auto text-sm sm:text-base">
              Interactive previews of the Chrome extension popup and the full web dashboard.
            </p>

            {/* Segmented Filter Pills */}
            <div className="inline-flex p-1 bg-white rounded-full mt-6 border border-[#DDDDDD] shadow-xs">
              <button
                onClick={() => setActivePreviewTab('extension')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activePreviewTab === 'extension' ? 'bg-[#222222] text-white shadow-sm' : 'text-[#717171] hover:text-[#222222]'}`}
              >
                Chrome Extension & Popup
              </button>
              <button
                onClick={() => setActivePreviewTab('dashboard')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activePreviewTab === 'dashboard' ? 'bg-[#222222] text-white shadow-sm' : 'text-[#717171] hover:text-[#222222]'}`}
              >
                Analytics Dashboard
              </button>
              <button
                onClick={() => setActivePreviewTab('manager')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activePreviewTab === 'manager' ? 'bg-[#222222] text-white shadow-sm' : 'text-[#717171] hover:text-[#222222]'}`}
              >
                Flashcard Manager
              </button>
            </div>
          </div>

          {/* TAB 1: EXTENSION PREVIEW */}
          {activePreviewTab === 'extension' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              {/* Left: Webpage Highlight Simulator */}
              <div className="lg:col-span-7 bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#EBEBEB] text-xs text-[#717171] font-mono">
                  <div className="w-3 h-3 rounded-full bg-[#FF5A5F]" />
                  <div className="w-3 h-3 rounded-full bg-[#FF9532]" />
                  <div className="w-3 h-3 rounded-full bg-[#008A05]" />
                  <span className="ml-2 truncate text-[#717171]">https://developer.mozilla.org/articles/event-loop</span>
                </div>

                <div className="relative text-left space-y-4 text-sm text-[#222222] leading-relaxed">
                  <h3 className="text-xl font-extrabold text-[#222222] tracking-tight">Understanding the JavaScript Event Loop</h3>
                  <p className="text-[#717171]">
                    JavaScript executes all tasks on a single thread using an event loop architecture that schedules asynchronous callbacks and promises.
                  </p>

                  {/* Highlight Box */}
                  <div className="relative p-4 bg-[#FF385C]/10 border-l-4 border-[#FF385C] rounded-r-2xl">
                    <p className="font-semibold text-[#222222]">
                      "Microtasks (e.g. Promise callbacks) execute immediately after each macrotask completes and are completely drained before the next timer or event fires."
                    </p>

                    {/* Floating Save Button */}
                    <div className="absolute -bottom-4 right-4 z-20 flex items-center gap-1.5 bg-[#222222] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl border border-black/10">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
                      <span>Save to Ormayundo ✓</span>
                    </div>
                  </div>

                  <p className="text-[#717171] text-xs pt-3">
                    💡 Selecting text triggers the floating save button. AI synthesizes an active-recall question and files it into your deck in the background.
                  </p>
                </div>
              </div>

              {/* Right: Authentic Extension Popup Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[360px] bg-white border border-[#EBEBEB] rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] p-6 flex flex-col items-center">
                  {/* Popup Header */}
                  <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[#EBEBEB]">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-[#FF385C]" />
                      <span className="font-bold text-sm text-[#222222]">Active Recall</span>
                    </div>
                    <span className="text-[11px] font-bold bg-[#FF385C]/10 text-[#FF385C] px-3 py-1 rounded-full">
                      1 Card Due
                    </span>
                  </div>

                  {/* The Interactive Flashcard */}
                  <div
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="w-full h-52 rounded-2xl cursor-pointer transition-all duration-300 relative p-5 flex flex-col justify-between text-center select-none shadow-sm hover:shadow-md"
                    style={{
                      backgroundColor: cardFlipped ? '#FF385C' : '#FFFFFF',
                      color: cardFlipped ? '#FFFFFF' : '#222222',
                      border: cardFlipped ? '1px solid #E61E4D' : '1px solid #DDDDDD'
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cardFlipped ? 'bg-white/20 text-white' : 'bg-[#F7F7F7] text-[#222222] border border-[#EBEBEB]'}`}>
                        JavaScript
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                        {cardFlipped ? 'Answer' : 'Question'}
                      </span>
                    </div>

                    <div className="my-auto px-2">
                      {cardFlipped ? (
                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          Microtasks (e.g. Promise callbacks) take precedence and are drained entirely after every macrotask before timers run.
                        </p>
                      ) : (
                        <p className="text-sm font-bold leading-snug">
                          How does the execution priority of microtasks compare to macrotasks in the event loop?
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] opacity-70">
                      Click to flip ({cardFlipped ? 'show question' : 'show answer'})
                    </span>
                  </div>

                  {/* Rating Buttons with Accurate Intervals */}
                  <div className="w-full grid grid-cols-4 gap-2 mt-4">
                    <button className="flex flex-col items-center p-2.5 rounded-xl bg-[#F7F7F7] hover:bg-red-50 text-[#222222] hover:text-[#FF385C] transition-colors border border-[#EBEBEB] cursor-pointer">
                      <span className="font-bold text-xs">Forgot</span>
                      <span className="text-[10px] text-[#717171] mt-0.5">&lt;1m</span>
                    </button>
                    <button className="flex flex-col items-center p-2.5 rounded-xl bg-[#F7F7F7] hover:bg-orange-50 text-[#222222] hover:text-orange-600 transition-colors border border-[#EBEBEB] cursor-pointer">
                      <span className="font-bold text-xs">Hard</span>
                      <span className="text-[10px] text-[#717171] mt-0.5">2d</span>
                    </button>
                    <button className="flex flex-col items-center p-2.5 rounded-xl bg-[#F7F7F7] hover:bg-blue-50 text-[#222222] hover:text-blue-600 transition-colors border border-[#EBEBEB] cursor-pointer">
                      <span className="font-bold text-xs">Good</span>
                      <span className="text-[10px] text-[#717171] mt-0.5">6d</span>
                    </button>
                    <button className="flex flex-col items-center p-2.5 rounded-xl bg-[#F7F7F7] hover:bg-emerald-50 text-[#222222] hover:text-[#008A05] transition-colors border border-[#EBEBEB] cursor-pointer">
                      <span className="font-bold text-xs">Easy</span>
                      <span className="text-[10px] text-[#717171] mt-0.5">8d</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS DASHBOARD PREVIEW */}
          {activePreviewTab === 'dashboard' && (
            <div className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.04)] animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#EBEBEB] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Streak</span>
                    <h4 className="text-2xl font-extrabold text-[#222222]">7 Days 🔥</h4>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#EBEBEB] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#008A05] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Retention</span>
                    <h4 className="text-2xl font-extrabold text-[#222222]">92.4%</h4>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#EBEBEB] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#FF385C] flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Active Cards</span>
                    <h4 className="text-2xl font-extrabold text-[#222222]">142</h4>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#EBEBEB] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">Mastered</span>
                    <h4 className="text-2xl font-extrabold text-[#222222]">68</h4>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-6 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-[#222222] text-sm">Knowledge Mastery Breakdown</h4>
                  <span className="text-xs text-[#717171]">142 total memory units</span>
                </div>
                <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden flex">
                  <div style={{ width: '48%' }} className="bg-[#008A05] h-full" title="Mastered (48%)" />
                  <div style={{ width: '32%' }} className="bg-[#FF385C] h-full" title="Learning (32%)" />
                  <div style={{ width: '12%' }} className="bg-amber-400 h-full" title="Relearning (12%)" />
                  <div style={{ width: '8%' }} className="bg-gray-300 h-full" title="New (8%)" />
                </div>
                <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-semibold text-[#717171]">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#008A05]" /> Mastered (48%)</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF385C]" /> Learning (32%)</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /> Relearning (12%)</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300" /> New (8%)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLASHCARD MANAGER PREVIEW */}
          {activePreviewTab === 'manager' && (
            <div className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#EBEBEB]">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-[#222222] text-white text-xs font-bold rounded-full">All (142)</span>
                  <span className="px-3.5 py-1 bg-[#F7F7F7] text-[#222222] border border-[#EBEBEB] text-xs font-bold rounded-full">System Design</span>
                  <span className="px-3.5 py-1 bg-[#F7F7F7] text-[#222222] border border-[#EBEBEB] text-xs font-bold rounded-full">JavaScript</span>
                </div>
                <span className="text-xs text-[#717171]">Full markdown & table support</span>
              </div>

              {/* Sample Card Rows */}
              <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#FF385C]/15 text-[#FF385C] px-2.5 py-0.5 rounded-full">System Design</span>
                    <span className="text-xs text-[#717171] truncate max-w-[240px]">martinfowler.com/articles/cqrs</span>
                  </div>
                  <h5 className="font-bold text-[#222222] text-sm">What is the core premise of Command Query Responsibility Segregation (CQRS)?</h5>
                  <p className="text-xs text-[#717171] line-clamp-1 italic">"CQRS strictly separates the data model for reading from the model used for updates..."</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-[#008A05] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Interval: 15d</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#222222]/10 text-[#222222] px-2.5 py-0.5 rounded-full">JavaScript</span>
                    <span className="text-xs text-[#717171] truncate max-w-[240px]">developer.mozilla.org</span>
                  </div>
                  <h5 className="font-bold text-[#222222] text-sm">What is the difference between shallow and deep copying of objects?</h5>
                  <p className="text-xs text-[#717171] line-clamp-1 italic">"Shallow copy duplicates top-level properties while nested objects remain references..."</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Interval: 6d</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. How It Works (Airbnb 4-Step Cards) */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Seamless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              How to use Ormayundo
            </h2>
            <p className="text-[#717171] max-w-lg mx-auto text-sm sm:text-base">
              Turn passive reading into permanent knowledge without breaking your concentration.
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
                  Read articles, documentation, or code. Simply highlight any core concept or takeaway.
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
                  Click "Save to Ormayundo". AI creates an active recall prompt and files it into the matching deck.
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
                  Review due cards via the extension popup. Grade yourself to schedule optimal future spaced repetition.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EBEBEB] text-xs font-bold text-[#FF385C] flex items-center gap-1">
                Permanent memory retention <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Extension Download & Setup Box (Airbnb Luxe / Booking Card Style) */}
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
                  Download the unpacked Chrome extension ZIP. Free, private, and compatible with all Chromium browsers.
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

      {/* 6. Spaced Repetition Science (SuperMemo SM-2) */}
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

      {/* 7. Key Features Grid */}
      <section id="features" className="py-20 bg-[#F7F7F7] border-t border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold text-[#FF385C] tracking-widest uppercase bg-[#FF385C]/10 px-3.5 py-1.5 rounded-full">
              Full Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight mt-3 mb-3">
              Engineered for permanent memory
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
                Automatically analyzes the text and source URL to organize flashcards into fitting subject decks like System Design or JavaScript.
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

      {/* 8. Bottom CTA Banner (Airbnb Rausch Gradient) */}
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

      {/* 9. Footer (Airbnb Clean Footer) */}
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
    </div>
  );
}
