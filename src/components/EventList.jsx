import React from 'react';
import EventCard from './EventCard.jsx';
import { 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  CalendarOff, 
  ShieldAlert, 
  Layers, 
  Check,
  CalendarCheck
} from 'lucide-react';

export default function EventList({
  events,
  highlightedEventId,
  onHighlightEvent,
  onSelectEvent,
  selectedCategory,
  setSelectedCategory,
  allCategories,
  sortBy,
  setSortBy,
  excludeConflicts,
  setExcludeConflicts,
  conflictsCount,
  registeredEventIds,
  onToggleRegister
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 mb-4">
        
        {/* Sort and Conflict Exclusion Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#861F41]/30 cursor-pointer"
            >
              <option value="relevance">✨ Most Relevant First (Recommended)</option>
              <option value="date_asc">📅 Date & Time (Soonest)</option>
              <option value="duration_asc">⏱️ Shortest Duration</option>
              <option value="title_asc">🔤 Title (A - Z)</option>
            </select>
          </div>

          {/* Schedule Conflict Exclusion Switch */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={excludeConflicts}
                onChange={(e) => setExcludeConflicts(e.target.checked)}
                className="w-4 h-4 rounded text-[#861F41] focus:ring-[#861F41] accent-[#861F41] cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CalendarOff className="w-3.5 h-3.5 text-amber-600" />
                Exclude Time Conflicts
              </span>
              {conflictsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                  {conflictsCount}
                </span>
              )}
            </label>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#861F41] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#861F41] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-8">
        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CalendarOff className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No matching events found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {excludeConflicts
                ? 'Some events may have been excluded due to time conflicts with your schedule. Try turning off "Exclude Time Conflicts" or changing your category/search filters.'
                : 'Try adjusting your search query or selecting a different category filter.'}
            </p>
            {excludeConflicts && (
              <button
                onClick={() => setExcludeConflicts(false)}
                className="text-xs font-semibold px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5"
              >
                Show All Including Conflicted Events
              </button>
            )}
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isHighlighted={event.id === highlightedEventId}
              onHighlight={onHighlightEvent}
              onSelect={onSelectEvent}
              isRegistered={registeredEventIds.includes(event.id)}
              onToggleRegister={onToggleRegister}
            />
          ))
        )}
      </div>
    </div>
  );
}
