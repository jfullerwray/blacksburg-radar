import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  CalendarOff, 
  AlertTriangle, 
  Zap,
  BookmarkCheck
} from 'lucide-react';
import { SAMPLE_SCHEDULE_PRESETS } from '../services/conflictDetector.js';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleModal({
  isOpen,
  onClose,
  scheduleBlocks,
  setScheduleBlocks,
  excludeConflicts,
  setExcludeConflicts,
  conflictsCount,
  registeredEvents,
  onRemoveRegisteredEvent
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Wednesday']);
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newEndTime, setNewEndTime] = useState('17:15');

  if (!isOpen) return null;

  const handleToggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddCustomBlock = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBlock = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      location: newLocation.trim() || 'Blacksburg Campus',
      type: 'recurring',
      days: selectedDays.length > 0 ? selectedDays : ['Monday'],
      startTime: newStartTime,
      endTime: newEndTime,
      color: '#861F41'
    };

    setScheduleBlocks([...scheduleBlocks, newBlock]);
    setNewTitle('');
    setNewLocation('');
  };

  const handleRemoveBlock = (id) => {
    setScheduleBlocks(scheduleBlocks.filter(b => b.id !== id));
  };

  const handleApplyPreset = (preset) => {
    setScheduleBlocks([...preset.blocks]);
    setExcludeConflicts(true);
  };

  const handleClearAll = () => {
    setScheduleBlocks([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#861F41] text-white">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Schedule & Conflict Exclusion</h2>
                <p className="text-xs text-slate-500">
                  Manage your commitments to automatically identify or exclude conflicting events
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Master Exclusion Switch Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            excludeConflicts
              ? 'bg-amber-500/10 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="flex items-start justify-between gap-4 cursor-pointer">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-amber-600" />
                  Exclude Conflicting Events from Event Explorer
                </span>
                <p className="text-xs text-slate-600">
                  When enabled, events that overlap with any of your classes or schedule commitments will be excluded from the list and map.
                </p>
                {conflictsCount > 0 && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Currently filtering out {conflictsCount} conflicting event{conflictsCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <input
                type="checkbox"
                checked={excludeConflicts}
                onChange={(e) => setExcludeConflicts(e.target.checked)}
                className="w-5 h-5 mt-1 rounded text-[#861F41] focus:ring-[#861F41] accent-[#861F41] cursor-pointer"
              />
            </label>
          </div>

          {/* Preset Quick Loaders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Schedule Presets
              </span>
              {scheduleBlocks.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear All Commitments
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_SCHEDULE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3 text-left rounded-xl border border-slate-200 hover:border-[#861F41] hover:bg-[#861F41]/5 transition-all text-xs group"
                >
                  <span className="font-bold text-slate-900 group-hover:text-[#861F41] block">
                    {preset.name}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Commitment Form */}
          <form onSubmit={handleAddCustomBlock} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              + Add Class or Commitment
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Commitment Title (e.g. CS 3114, Lab, Work)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#861F41] focus:ring-1 focus:ring-[#861F41]"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g. McBryde Hall, Library)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#861F41] focus:ring-1 focus:ring-[#861F41]"
              />
            </div>

            {/* Day Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Days of Week:</span>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#861F41] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selector */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Start Time:</span>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#861F41]"
                />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">End Time:</span>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#861F41]"
                />
              </div>
              <button
                type="submit"
                className="self-end px-4 py-2 text-xs font-bold text-white bg-[#861F41] hover:bg-[#64132F] rounded-lg shadow-sm transition-colors"
              >
                Add Block
              </button>
            </div>
          </form>

          {/* Current Schedule Commitments */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Active Schedule Commitments ({scheduleBlocks.length})
            </span>

            {scheduleBlocks.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No schedule blocks defined. Try loading one of the presets above or add your classes!
              </p>
            ) : (
              <div className="space-y-2">
                {scheduleBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{block.title}</span>
                        <span className="text-[11px] text-slate-400">📍 {block.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-600 text-[11px]">
                        <Clock className="w-3 h-3 text-[#861F41]" />
                        <span>{block.startTime} – {block.endTime}</span>
                        <span className="text-slate-300">•</span>
                        <span>{(block.days || []).join(', ')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveBlock(block.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove commitment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered / Saved Events in My Schedule */}
          {registeredEvents && registeredEvents.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                Saved Campus Events ({registeredEvents.length})
              </span>

              <div className="space-y-2">
                {registeredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-emerald-950 block">{evt.title}</span>
                      <span className="text-[11px] text-emerald-700">
                        {evt.locationName} • {new Date(evt.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveRegisteredEvent(evt.id)}
                      className="text-emerald-700 hover:text-red-600 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {excludeConflicts ? '✓ Conflicting events are currently hidden' : 'Showing all events with conflict alerts'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
