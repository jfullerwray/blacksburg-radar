import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import MapView from './components/MapView.jsx';
import EventList from './components/EventList.jsx';
import EventDetailModal from './components/EventDetailModal.jsx';
import ScheduleModal from './components/ScheduleModal.jsx';
import InterestsModal from './components/InterestsModal.jsx';
import CsvUploadModal from './components/CsvUploadModal.jsx';

import { parseEventsCSV } from './services/csvParser.js';
import { extractEventTopics } from './services/topicExtractor.js';
import { rankEventsByRelevance, DEFAULT_USER_INTERESTS } from './services/recommendationEngine.js';
import { applyScheduleConflicts, SAMPLE_SCHEDULE_PRESETS } from './services/conflictDetector.js';
import { DEFAULT_CSV_STRING } from './data/defaultCsv.js';

import { 
  Sparkles, 
  MapPin, 
  Layers, 
  Calendar, 
  SlidersHorizontal,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function App() {
  // Core state
  const [rawEvents, setRawEvents] = useState([]);
  const [dataSourceName, setDataSourceName] = useState('Virginia Tech Campus Demo Events');
  const [isLoading, setIsLoading] = useState(true);

  // User Profile & Interests
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_INTERESTS);

  // Schedule & Conflict Exclusion
  // Initialize with VT CS Student schedule so conflict detection is immediately demonstrable!
  const [scheduleBlocks, setScheduleBlocks] = useState(SAMPLE_SCHEDULE_PRESETS[0].blocks);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [excludeConflicts, setExcludeConflicts] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Interaction & Modals
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // 1. Initial Load of default CSV
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const parsed = await parseEventsCSV(DEFAULT_CSV_STRING);
        // Pre-compute topics for all events
        const enriched = parsed.map(evt => ({
          ...evt,
          topics: extractEventTopics(evt)
        }));
        setRawEvents(enriched);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load initial events:', err);
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // 2. Compute Recommendations & Ranking
  const rankedEvents = useMemo(() => {
    if (!rawEvents || rawEvents.length === 0) return [];
    return rankEventsByRelevance(rawEvents, userProfile);
  }, [rawEvents, userProfile]);

  // 3. Apply Schedule Conflict Analysis
  const eventsWithConflicts = useMemo(() => {
    return applyScheduleConflicts(rankedEvents, scheduleBlocks, registeredEvents, false);
  }, [rankedEvents, scheduleBlocks, registeredEvents]);

  // Count total conflicts detected
  const totalConflictsCount = useMemo(() => {
    return eventsWithConflicts.filter(e => e.hasConflict).length;
  }, [eventsWithConflicts]);

  // 4. Filter and Sort Events for Display
  const displayEvents = useMemo(() => {
    let result = [...eventsWithConflicts];

    // Conflict exclusion filter
    if (excludeConflicts) {
      result = result.filter(e => !e.hasConflict);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e => {
        const titleMatch = (e.title || '').toLowerCase().includes(q);
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const locMatch = (e.locationName || '').toLowerCase().includes(q);
        const orgMatch = (e.organization || '').toLowerCase().includes(q);
        const catMatch = (e.category || '').toLowerCase().includes(q);
        const topicMatch = (e.topics || []).some(t => t.topic.toLowerCase().includes(q));
        return titleMatch || descMatch || locMatch || orgMatch || catMatch || topicMatch;
      });
    }

    // Sort order
    if (sortBy === 'relevance') {
      result.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.startDate.getTime() - b.startDate.getTime();
      });
    } else if (sortBy === 'date_asc') {
      result.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } else if (sortBy === 'duration_asc') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortBy === 'title_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [eventsWithConflicts, excludeConflicts, selectedCategory, searchQuery, sortBy]);

  // Unique categories list
  const allCategories = useMemo(() => {
    const cats = new Set();
    rawEvents.forEach(e => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [rawEvents]);

  // Toggle registered event (Add to My Schedule)
  const handleToggleRegister = (event) => {
    const isAlready = registeredEvents.some(e => e.id === event.id);
    if (isAlready) {
      setRegisteredEvents(registeredEvents.filter(e => e.id !== event.id));
    } else {
      setRegisteredEvents([...registeredEvents, event]);
    }
  };

  // Reset to default dataset
  const handleResetToDefault = async () => {
    setIsLoading(true);
    const parsed = await parseEventsCSV(DEFAULT_CSV_STRING);
    const enriched = parsed.map(evt => ({
      ...evt,
      topics: extractEventTopics(evt)
    }));
    setRawEvents(enriched);
    setDataSourceName('Virginia Tech Campus Demo Events');
    setScheduleBlocks(SAMPLE_SCHEDULE_PRESETS[0].blocks);
    setRegisteredEvents([]);
    setIsLoading(false);
  };

  // Load custom CSV
  const handleLoadCsvEvents = (newEvents, name) => {
    const enriched = newEvents.map(evt => ({
      ...evt,
      topics: extractEventTopics(evt)
    }));
    setRawEvents(enriched);
    setDataSourceName(name);
  };

  // Synchronized Selection: When map marker or card is clicked
  const handleSelectEvent = (event) => {
    setHighlightedEventId(event.id);
    setSelectedEventForDetail(event);
  };

  // When card is hovered
  const handleHighlightEvent = (eventId) => {
    setHighlightedEventId(eventId);
  };

  // Scroll card into view when clicked from map
  const handleMapFocusOnCard = (event) => {
    setHighlightedEventId(event.id);
    const cardEl = document.getElementById(`event-card-${event.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans selection:bg-[#861F41] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenInterests={() => setIsInterestsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetDefault={handleResetToDefault}
        scheduleBlocksCount={scheduleBlocks.length}
        excludeConflicts={excludeConflicts}
        registeredEventsCount={registeredEvents.length}
        totalEventsCount={rawEvents.length}
        visibleEventsCount={displayEvents.length}
        userInterestsCount={(userProfile.categories || []).length + (userProfile.keywords || []).length}
      />

      {/* Campus Hero / Status Sub-Header */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 flex-wrap text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#861F41]" />
              Data Source:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {dataSourceName}
            </span>
            <span className="text-slate-400">•</span>
            <span>
              Showing <strong className="text-slate-800">{displayEvents.length}</strong> of {rawEvents.length} events
            </span>
            {excludeConflicts && (
              <span className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {totalConflictsCount} conflicting events excluded
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInterestsOpen(true)}
              className="text-[#861F41] hover:text-[#64132F] font-bold inline-flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E87722]" />
              Sorted by Personalized Recommendation Match
            </button>
          </div>

        </div>
      </div>

      {/* Main Split Layout: Left Map, Right Events List */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Map of Blacksburg (5 cols on lg) */}
        <div className="lg:col-span-5 h-[420px] lg:h-[calc(100vh-170px)] lg:sticky lg:top-24">
          <MapView
            events={displayEvents}
            highlightedEventId={highlightedEventId}
            onSelectEvent={handleSelectEvent}
            onHoverEvent={handleHighlightEvent}
          />
        </div>

        {/* Right Column: Recommended Events Stream (7 cols on lg) */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <EventList
            events={displayEvents}
            highlightedEventId={highlightedEventId}
            onHighlightEvent={handleHighlightEvent}
            onSelectEvent={handleSelectEvent}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            allCategories={allCategories}
            sortBy={sortBy}
            setSortBy={setSortBy}
            excludeConflicts={excludeConflicts}
            setExcludeConflicts={setExcludeConflicts}
            conflictsCount={totalConflictsCount}
            registeredEventIds={registeredEvents.map(e => e.id)}
            onToggleRegister={handleToggleRegister}
          />
        </div>

      </main>

      {/* Modals */}
      <EventDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        isRegistered={selectedEventForDetail ? registeredEvents.some(e => e.id === selectedEventForDetail.id) : false}
        onToggleRegister={handleToggleRegister}
        onFocusOnMap={handleMapFocusOnCard}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        scheduleBlocks={scheduleBlocks}
        setScheduleBlocks={setScheduleBlocks}
        excludeConflicts={excludeConflicts}
        setExcludeConflicts={setExcludeConflicts}
        conflictsCount={totalConflictsCount}
        registeredEvents={registeredEvents}
        onRemoveRegisteredEvent={(id) => setRegisteredEvents(registeredEvents.filter(e => e.id !== id))}
      />

      <InterestsModal
        isOpen={isInterestsOpen}
        onClose={() => setIsInterestsOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      <CsvUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLoadCsvEvents={handleLoadCsvEvents}
      />
    </div>
  );
}
