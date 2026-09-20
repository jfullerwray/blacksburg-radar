import React, { useState } from 'react';
import { X, Upload, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseEventsCSV } from '../services/csvParser.js';

export default function CsvUploadModal({
  isOpen,
  onClose,
  onLoadCsvEvents
}) {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewEvents, setPreviewEvents] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        setCsvContent(text);
        const parsed = await parseEventsCSV(text);
        setPreviewEvents(parsed);
        setIsProcessing(false);
      } catch (err) {
        setError('Failed to parse CSV file: ' + err.message);
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = async (e) => {
    const text = e.target.value;
    setCsvContent(text);
    setError(null);

    if (text.trim().length > 20) {
      try {
        const parsed = await parseEventsCSV(text);
        setPreviewEvents(parsed);
      } catch (err) {
        // user may still be typing
      }
    }
  };

  const handleApply = () => {
    if (previewEvents && previewEvents.length > 0) {
      onLoadCsvEvents(previewEvents, fileName || 'Custom CSV');
      onClose();
    } else {
      setError('Please provide a valid CSV containing at least one event row.');
    }
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
            <span className="p-2 rounded-xl bg-slate-800 text-white">
              <Upload className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Load Events from CSV</h2>
              <p className="text-xs text-slate-500">
                Upload your own CSV or paste CSV data to explore and get recommendations
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-[#861F41] rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              id="csv-file-input"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                {fileName ? fileName : 'Click to browse or drop CSV file here'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Supports standard event columns (title, description, start_time, location, lat, lon)
              </span>
            </label>
          </div>

          {/* Download Sample Link */}
          <div className="flex items-center justify-between text-xs bg-slate-100 p-3 rounded-xl">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#861F41]" />
              Need a sample file to test with?
            </span>
            <a
              href="/virginia_tech_demo_events.csv"
              download="virginia_tech_demo_events.csv"
              className="font-bold text-[#861F41] hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download VT Events CSV
            </a>
          </div>

          {/* Paste CSV raw text option */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Or Paste CSV Content
            </span>
            <textarea
              rows={4}
              value={csvContent}
              onChange={handleTextChange}
              placeholder="id,title,description,category,start_time,end_time,location_name,latitude,longitude..."
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#861F41]"
            />
          </div>

          {/* Parsing Results / Preview */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {previewEvents && previewEvents.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Successfully parsed {previewEvents.length} events!</span>
                <span className="text-emerald-700 text-[11px] block mt-0.5">
                  Columns recognized: Title, Description, Category, Start/End Times, Coordinates for Blacksburg map.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!previewEvents || previewEvents.length === 0}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors ${
              previewEvents && previewEvents.length > 0
                ? 'bg-[#861F41] text-white hover:bg-[#64132F]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Load into EventRadar
          </button>
        </div>
      </div>
    </div>
  );
}
