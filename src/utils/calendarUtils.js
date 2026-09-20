/**
 * Formats start and end dates into a readable string
 * e.g. "Mon, Oct 5, 2026 • 5:00 PM – 7:00 PM"
 */
export function formatEventDateTime(startDate, endDate) {
  if (!startDate) return 'Date TBD';
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (!end || isNaN(end.getTime())) {
    return `${dateStr} • ${startTimeStr}`;
  }

  const endTimeStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${dateStr} • ${startTimeStr} – ${endTimeStr}`;
}

/**
 * Returns a human-friendly duration string, e.g. "2 hrs" or "1 hr 30 mins"
 */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${mins} mins`;
}

/**
 * Generates an .ics iCalendar file and triggers download
 */
export function downloadIcsFile(event) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  const formatIcsDate = (date) => {
    const d = new Date(date);
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  };

  const startStr = formatIcsDate(event.startDate);
  const endStr = formatIcsDate(event.endDate);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Blacksburg Events Explorer//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}-${Date.now()}@blacksburgevents.vt`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${(event.title || '').replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${(event.description || '').replace(/[\n\r]/g, ' ').replace(/[,;]/g, ' ')}`,
    `LOCATION:${(event.locationName + ', ' + event.address).replace(/[,;]/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(event.title || 'event').toLowerCase().replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Returns a Google Calendar web link for this event
 */
export function getGoogleCalendarUrl(event) {
  const pad = (n) => (n < 10 ? '0' + n : n);
  const formatUtc = (date) => {
    const d = new Date(date);
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  };

  const dates = `${formatUtc(event.startDate)}/${formatUtc(event.endDate)}`;
  const text = encodeURIComponent(event.title || 'Event');
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(`${event.locationName}, ${event.address}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}
