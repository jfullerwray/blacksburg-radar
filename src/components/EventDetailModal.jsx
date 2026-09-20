import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  ExternalLink,
  Tag, 
  Building2, 
  Compass,
  CheckCircle2,
  Info
} from 'lucide-react';
import { formatEventDateTime, formatDuration, downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendarUtils.js';

export default function EventDetailModal({
  event,
  onClose,
  isRegistered,
  onToggleRegister,
  onFocusOnMap
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#861F41]/10 text-[#861F41] border border-[#861F41]/20 uppercase tracking-wider text-[11px]">
                {event.category}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {event.organization}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Match & Recommendation Highlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-950">
                  {event.matchScore}% Match for You
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                  Personalized Recommendation
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                {event.matchReason || 'Matches your selected interests and campus event preferences.'}
              </p>
            </div>
          </div>

          {/* Time Conflict Alert (If active) */}
          {event.hasConflict && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-red-950">
                  Schedule Time Conflict
                </span>
                <p className="text-xs text-red-800 mt-1">
                  This event overlaps with commitments in your personal schedule:
                </p>
                <div className="mt-2 space-y-1">
                  {event.conflicts && event.conflicts.map((c, i) => (
                    <div key={i} className="text-xs font-semibold bg-white/70 px-2.5 py-1.5 rounded-lg border border-red-200/80 flex items-center justify-between">
                      <span>• {c.title}</span>
                      <span className="text-red-700">{c.timeRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#861F41] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Date & Time</span>
                <span className="text-slate-600 font-medium">
                  {formatEventDateTime(event.startDate, event.endDate)}
                </span>
                {event.durationMinutes > 0 && (
                  <span className="text-slate-400 block mt-0.5">
                    Duration: {formatDuration(event.durationMinutes)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#E87722] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Location</span>
                <span className="text-slate-700 font-medium block">{event.locationName}</span>
                <span className="text-slate-500 block">{event.address}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationName + ' ' + event.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#861F41] hover:underline mt-1"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Brief Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#861F41]" /> Brief Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {event.description}
            </p>
          </div>

          {/* General Topics Discussed */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#E87722]" /> General Topics Discussed
            </h3>
            {event.topics && event.topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {event.topics.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${t.badgeColor}`}
                  >
                    <span>💬</span>
                    <span>{t.topic}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific topics tagged.</p>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 pt-3 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={() => {
              onFocusOnMap(event);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Compass className="w-4 h-4 text-[#861F41]" />
            Center on Blacksburg Map
          </button>

          <div className="flex items-center gap-2">
            {/* Download iCal / Add to Google Calendar */}
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Add to Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Cal</span>
            </a>

            <button
              onClick={() => downloadIcsFile(event)}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Download .ics calendar file"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Save to My Schedule */}
            <button
              onClick={() => onToggleRegister(event)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${
                isRegistered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-[#861F41] hover:bg-[#64132F] text-white shadow-[#861F41]/25'
              }`}
            >
              {isRegistered ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>In My Schedule</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Add to My Schedule</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
