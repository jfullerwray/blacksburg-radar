import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Layers, Maximize2 } from 'lucide-react';

const CATEGORY_COLORS = {
  Technology: '#0284c7',
  Environment: '#059669',
  Career: '#d97706',
  Entrepreneurship: '#7c3aed',
  Networking: '#2563eb',
  Sports: '#ea580c',
  'Arts and Entertainment': '#e11d48',
  Social: '#db2777',
  Wellness: '#10b981',
  'Volunteer and Service': '#ca8a04',
  'Food and Social': '#f59e0b',
  Academic: '#4f46e5',
  Leadership: '#9333ea',
  General: '#861F41'
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#861F41';
}

function createCustomPin(event, isHighlighted, isConflicted) {
  const color = getCategoryColor(event.category);
  const size = isHighlighted ? 38 : 28;
  const strokeColor = isHighlighted ? '#ffffff' : '#ffffff';
  const strokeWidth = isHighlighted ? 3 : 2;

  const html = `
    <div class="relative custom-map-marker ${isHighlighted ? 'is-highlighted' : ''} ${isConflicted ? 'is-conflicted' : ''}" style="width: ${size}px; height: ${size}px;">
      ${isHighlighted ? '<div class="pulse-ring"></div>' : ''}
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" class="drop-shadow-md">
        <path fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
      </svg>
      ${event.matchScore >= 80 ? `
        <span class="absolute -top-1 -right-1 bg-amber-400 text-amber-950 font-black text-[9px] px-1 rounded-full border border-white shadow-sm">
          ★
        </span>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'leaflet-custom-div-icon',
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4]
  });
}

export default function MapView({
  events,
  highlightedEventId,
  onSelectEvent,
  onHoverEvent
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on Virginia Tech Campus, Blacksburg VA
      const map = L.map(mapContainerRef.current, {
        center: [37.2284, -80.4234],
        zoom: 15,
        zoomControl: false
      });

      // Nice clean high-contrast tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control on bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Do not destroy map eagerly on re-render to avoid flashing,
      // but clean up when unmounted from DOM
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    const group = [];

    events.forEach(event => {
      if (typeof event.latitude !== 'number' || typeof event.longitude !== 'number') return;

      const isHighlighted = event.id === highlightedEventId;
      const isConflicted = event.hasConflict;
      const icon = createCustomPin(event, isHighlighted, isConflicted);

      const marker = L.marker([event.latitude, event.longitude], {
        icon,
        title: event.title
      }).addTo(map);

      // Popup with brief description & topics preview
      const topicsPreview = (event.topics || []).slice(0, 2).map(t => 
        `<span class="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-1 mt-1">${t.topic}</span>`
      ).join('');

      const popupHtml = `
        <div class="p-3 max-w-[240px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style="background-color: ${getCategoryColor(event.category)}20; color: ${getCategoryColor(event.category)}">
              ${event.category}
            </span>
            <span class="text-xs font-semibold text-amber-600 ml-auto">${event.matchScore}% Match</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-tight hover:text-[#861F41] cursor-pointer" id="popup-title-${event.id}">
            ${event.title}
          </h4>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">${event.description}</p>
          <div class="text-[11px] font-medium text-slate-600 mt-2 flex items-center gap-1">
            <span>📍 ${event.locationName}</span>
          </div>
          ${topicsPreview ? `<div class="mt-1 pt-1 border-t border-slate-100">${topicsPreview}</div>` : ''}
          ${event.hasConflict ? `
            <div class="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 p-1 rounded border border-amber-200 flex items-center gap-1">
              ⚠️ Schedule Conflict
            </div>
          ` : ''}
          <button id="popup-btn-${event.id}" class="mt-2 w-full py-1 text-xs font-semibold text-white rounded bg-[#861F41] hover:bg-[#64132F] transition-colors">
            View Full Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });

      marker.on('click', () => {
        onSelectEvent(event);
      });

      marker.on('mouseover', () => {
        if (onHoverEvent) onHoverEvent(event.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${event.id}`);
        if (btn) {
          btn.onclick = () => onSelectEvent(event);
        }
        const titleEl = document.getElementById(`popup-title-${event.id}`);
        if (titleEl) {
          titleEl.onclick = () => onSelectEvent(event);
        }
      });

      markersRef.current.set(event.id, marker);
      group.push([event.latitude, event.longitude]);
    });

    // If events are loaded, adjust bounds gently if there's no active highlight
    if (group.length > 0 && !highlightedEventId) {
      map.fitBounds(L.latLngBounds(group).pad(0.1), { maxZoom: 16, animate: true });
    }
  }, [events]);

  // React to highlightedEventId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker, id) => {
      const event = events.find(e => e.id === id);
      if (!event) return;

      const isHighlighted = id === highlightedEventId;
      const isConflicted = event.hasConflict;
      marker.setIcon(createCustomPin(event, isHighlighted, isConflicted));

      if (isHighlighted) {
        marker.setZIndexOffset(1000);
        map.panTo([event.latitude, event.longitude], { animate: true, duration: 0.6 });
        marker.openPopup();
      } else {
        marker.setZIndexOffset(0);
      }
    });
  }, [highlightedEventId, events]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([37.2284, -80.4234], 15, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-100 flex flex-col">
      {/* Top Banner on Map */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-800">
        <MapPin className="w-4 h-4 text-[#861F41]" />
        <span>Blacksburg, VA Map</span>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-bold">
          {events.length} pins
        </span>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleResetView}
          className="bg-white/95 backdrop-blur p-2 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          title="Reset to Campus Center (Drillfield)"
        >
          <Navigation className="w-4 h-4 text-[#861F41]" />
        </button>
      </div>

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Category Legend Bar on bottom */}
      <div className="bg-white/95 backdrop-blur border-t border-slate-200 px-3 py-2 z-10 flex items-center justify-between overflow-x-auto text-[11px] text-slate-600">
        <span className="font-semibold text-slate-700 shrink-0 mr-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" /> Categories:
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" /> Technology
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Environment
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" /> Career
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" /> Sports
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" /> Arts
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Entrepreneurship
          </span>
        </div>
      </div>
    </div>
  );
}
