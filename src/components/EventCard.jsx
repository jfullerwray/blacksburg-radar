import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Bookmark, 
  BookmarkCheck,
  Tag,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { formatEventDateTime, formatDuration } from '../utils/calendarUtils.js';

export default function EventCard({
  event,
  isHighlighted,
  onHighlight,
  onSelect,
  isRegistered,
  onToggleRegister
}) {
  const isHighMatch = event.matchScore >= 75;
  const isMediumMatch = event.matchScore >= 50 && event.matchScore < 75;

  return (
    <div
      id={`event-card-${event.id}`}
      onMouseEnter={() => onHighlight(event.id)}
      onClick={() => onSelect(event)}
      className={`relative rounded-2xl p-5 transition-all duration-200 cursor-pointer border ${
        isHighlighted
          ? 'bg-white border-[#861F41] ring-2 ring-[#861F41]/30 shadow-xl -translate-y-1'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      } ${event.hasConflict ? 'bg-amber-50/20' : ''}`}
    >
      {/* Top Meta: Category + Match Score */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60 uppercase tracking-wider text-[11px]">
            {event.category}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {event.organization}
          </span>
        </div>

        {/* Relevance Score Pill */}
        <div 
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${
            isHighMatch 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : isMediumMatch 
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title={event.matchReason}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{event.matchScore}% Match</span>
        </div>
      </div>

      {/* Event Title */}
      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#861F41] leading-snug mb-2">
        {event.title}
      </h3>

      {/* Date, Time & Venue */}
      <div className="space-y-1.5 mb-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700">
            {formatEventDateTime(event.startDate, event.endDate)}
          </span>
          {event.durationMinutes > 0 && (
            <span className="text-slate-400 font-normal">
              ({formatDuration(event.durationMinutes)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{event.locationName} • {event.address}</span>
        </div>
      </div>

      {/* Schedule Conflict Notice (If Any) */}
      {event.hasConflict && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Time Conflict Detected!</span>
            {event.conflicts && event.conflicts.map((c, i) => (
              <p key={i} className="text-amber-800 text-[11px] mt-0.5">
                Overlaps with: <span className="font-semibold">{c.title}</span> ({c.timeRange})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Highlighted Detailed Section: Brief Description & General Topics Discussed */}
      <div className={`pt-3 border-t border-slate-100 transition-all ${
        isHighlighted ? 'block' : 'line-clamp-2'
      }`}>
        <div className="mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Info className="w-3 h-3 text-[#861F41]" /> Brief Description
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* General Topics Discussed */}
        {event.topics && event.topics.length > 0 && (
          <div className="mt-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#E87722]" /> General Topics Discussed
            </div>
            <div className="flex flex-wrap gap-1.5">
              {event.topics.map((t, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${t.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  {t.topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendation Reason Pill */}
      {event.matchReason && (
        <div className="mt-3 pt-2 border-t border-slate-100/70 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 italic truncate max-w-[70%]">
            💡 {event.matchReason}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRegister(event);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              isRegistered
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isRegistered ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>In My Schedule</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Save to Schedule</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
