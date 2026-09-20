import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, SlidersHorizontal, Sun, Sunset, Moon, Clock } from 'lucide-react';

const AVAILABLE_CATEGORIES = [
  'Technology',
  'Environment',
  'Career',
  'Entrepreneurship',
  'Networking',
  'Sports',
  'Arts and Entertainment',
  'Social',
  'Wellness',
  'Volunteer and Service',
  'Food and Social',
  'Academic',
  'Leadership'
];

const SUGGESTED_KEYWORDS = [
  'cloud',
  'ai',
  'ethics',
  'sustainability',
  'resume',
  'interview',
  'startup',
  'pitch',
  'networking',
  'basketball',
  'open mic',
  'yoga',
  'volunteer',
  'food truck',
  'research',
  'leadership',
  'game night'
];

export default function InterestsModal({
  isOpen,
  onClose,
  userProfile,
  setUserProfile
}) {
  const [customKeyword, setCustomKeyword] = useState('');

  if (!isOpen) return null;

  const handleToggleCategory = (category) => {
    const current = userProfile.categories || [];
    if (current.includes(category)) {
      setUserProfile({
        ...userProfile,
        categories: current.filter(c => c !== category)
      });
    } else {
      setUserProfile({
        ...userProfile,
        categories: [...current, category]
      });
    }
  };

  const handleToggleKeyword = (kw) => {
    const current = userProfile.keywords || [];
    if (current.includes(kw)) {
      setUserProfile({
        ...userProfile,
        keywords: current.filter(k => k !== kw)
      });
    } else {
      setUserProfile({
        ...userProfile,
        keywords: [...current, kw]
      });
    }
  };

  const handleAddCustomKeyword = (e) => {
    e.preventDefault();
    const trimmed = customKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (!(userProfile.keywords || []).includes(trimmed)) {
      setUserProfile({
        ...userProfile,
        keywords: [...(userProfile.keywords || []), trimmed]
      });
    }
    setCustomKeyword('');
  };

  const handleSetTimePreference = (pref) => {
    setUserProfile({
      ...userProfile,
      timePreference: pref
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-[#861F41] to-[#E87722] text-white">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personalize Your Recommendations</h2>
              <p className="text-xs text-slate-500">
                Select your interests to tailor match scores and rank the most relevant events first
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Categories */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Favorite Event Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = (userProfile.categories || []).includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#861F41] text-white border-[#861F41] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Time of Day */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Preferred Time of Day
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Anytime', icon: Clock },
                { id: 'morning', label: 'Morning (<12pm)', icon: Sun },
                { id: 'afternoon', label: 'Afternoon (12-5pm)', icon: Sunset },
                { id: 'evening', label: 'Evening (>5pm)', icon: Moon }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSetTimePreference(id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    userProfile.timePreference === id
                      ? 'bg-[#861F41]/10 border-[#861F41] text-[#861F41]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Keywords & Topic Interests */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Specific Topic Keywords
            </span>

            {/* Custom Input */}
            <form onSubmit={handleAddCustomKeyword} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add custom topic (e.g. machine learning, hackathon)..."
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#861F41]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#861F41] hover:bg-[#64132F] rounded-lg transition-colors"
              >
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {/* Combine suggested and custom keywords */}
              {Array.from(new Set([...SUGGESTED_KEYWORDS, ...(userProfile.keywords || [])])).map((kw) => {
                const isSelected = (userProfile.keywords || []).includes(kw);
                return (
                  <button
                    key={kw}
                    onClick={() => handleToggleKeyword(kw)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#E87722] text-white border-[#E87722]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    #{kw}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Recommendations update automatically
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Apply & View Ranked Events
          </button>
        </div>
      </div>
    </div>
  );
}
