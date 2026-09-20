import React from 'react';
import { 
  Compass, 
  Calendar, 
  Sparkles, 
  Upload, 
  RotateCcw, 
  Search, 
  MapPin, 
  ShieldAlert,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onOpenSchedule,
  onOpenInterests,
  onOpenUpload,
  onResetDefault,
  scheduleBlocksCount,
  excludeConflicts,
  registeredEventsCount,
  totalEventsCount,
  visibleEventsCount,
  userInterestsCount
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & Campus Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#861F41] to-[#E87722] flex items-center justify-center text-white shadow-md shadow-[#861F41]/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Blacksburg <span className="text-[#861F41]">Event</span><span className="text-[#E87722]">Radar</span>
                </span>
                <span className="hidden md:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-[#861F41]/10 text-[#861F41] border border-[#861F41]/20">
                  Virginia Tech & Area
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                AI Recommendations • Schedule Conflict Exclusion • Interactive Map
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search events, topics (e.g. AI, Cloud, Yoga, Basketball)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-[#861F41] focus:ring-2 focus:ring-[#861F41]/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Interests & Recommendation Profile Button */}
            <button
              onClick={onOpenInterests}
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80"
              title="Configure your interests to personalize recommendations"
            >
              <Sparkles className="w-4 h-4 text-[#E87722]" />
              <span className="hidden md:inline">My Interests</span>
              <span className="bg-[#E87722]/15 text-[#E87722] text-xs px-1.5 py-0.2 rounded-full font-bold">
                {userInterestsCount}
              </span>
            </button>

            {/* Schedule & Conflict Manager Button */}
            <button
              onClick={onOpenSchedule}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all border ${
                excludeConflicts
                  ? 'bg-amber-500/10 text-amber-900 border-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
              }`}
              title="Set your schedule and conflict exclusion"
            >
              <Calendar className="w-4 h-4 text-[#861F41]" />
              <span className="hidden md:inline">My Schedule</span>
              {scheduleBlocksCount > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  excludeConflicts ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-800'
                }`}>
                  {scheduleBlocksCount + registeredEventsCount}
                </span>
              )}
              {excludeConflicts && (
                <span className="hidden lg:inline-flex text-[10px] uppercase font-bold bg-amber-600 text-white px-1.5 py-0.5 rounded">
                  Conflict Filter On
                </span>
              )}
            </button>

            {/* Upload CSV */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 rounded-lg shadow-sm transition-colors"
              title="Upload your own CSV file"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">CSV File</span>
            </button>

            {/* Reset to VT default */}
            <button
              onClick={onResetDefault}
              className="p-2 text-slate-500 hover:text-[#861F41] hover:bg-slate-100 rounded-lg transition-colors"
              title="Reload default Virginia Tech demo events"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
