import Papa from 'papaparse';

// Central Blacksburg coordinates (Virginia Tech Drillfield)
const BLACKSBURG_DEFAULT_LAT = 37.2284;
const BLACKSBURG_DEFAULT_LNG = -80.4234;

/**
 * Normalizes an object's keys for case-insensitive and flexible mapping
 */
function findValue(row, possibleKeys) {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
    // Also try lowercased version of row keys
    for (const rowKey in row) {
      if (rowKey.toLowerCase().replace(/[\s_-]/g, '') === key.toLowerCase().replace(/[\s_-]/g, '')) {
        const val = row[rowKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

/**
 * Parses and validates CSV string into structured Event objects
 */
export function parseEventsCSV(csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            resolve([]);
            return;
          }

          const parsedEvents = results.data.map((row, index) => {
            const id = findValue(row, ['id', 'event_id', 'eventId']) || `event-${index + 1}`;
            const title = findValue(row, ['title', 'event_name', 'name', 'event']) || 'Untitled Event';
            const description = findValue(row, ['description', 'desc', 'summary', 'details']) || 'No description provided.';
            const category = findValue(row, ['category', 'type', 'genre', 'tag']) || 'General';
            const organization = findValue(row, ['organization', 'org', 'host', 'organizer', 'club']) || 'Community Organizer';
            
            const startTimeRaw = findValue(row, ['start_time', 'startDate', 'start_date', 'start', 'time']);
            const endTimeRaw = findValue(row, ['end_time', 'endDate', 'end_date', 'end']);
            
            const locationName = findValue(row, ['location_name', 'location', 'venue', 'place', 'room']) || 'Blacksburg, VA';
            const address = findValue(row, ['address', 'street', 'addr']) || 'Blacksburg, VA 24061';
            
            let lat = parseFloat(findValue(row, ['latitude', 'lat', 'y']));
            let lng = parseFloat(findValue(row, ['longitude', 'long', 'lng', 'lon', 'x']));

            // Validate coordinates - keep within Blacksburg area bounds, fallback if invalid
            if (isNaN(lat) || isNaN(lng) || lat < 37.10 || lat > 37.35 || lng < -80.60 || lng > -80.30) {
              // Offset slightly so markers don't overlap exactly
              lat = BLACKSBURG_DEFAULT_LAT + (Math.random() - 0.5) * 0.005;
              lng = BLACKSBURG_DEFAULT_LNG + (Math.random() - 0.5) * 0.005;
            }

            const sourceUrl = findValue(row, ['source_url', 'url', 'link']);
            const registrationUrl = findValue(row, ['registration_url', 'rsvp_url', 'signup_url', 'ticket_url']);

            const startDate = startTimeRaw ? new Date(startTimeRaw) : new Date();
            let endDate = endTimeRaw ? new Date(endTimeRaw) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
            if (isNaN(endDate.getTime()) || endDate <= startDate) {
              endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
            }

            // Duration in minutes
            const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

            return {
              id,
              title,
              description,
              category,
              organization,
              startTimeRaw,
              endTimeRaw,
              startDate,
              endDate,
              durationMinutes,
              locationName,
              address,
              latitude: lat,
              longitude: lng,
              sourceUrl,
              registrationUrl,
              raw: row
            };
          });

          // Filter out rows without at least a title
          const validEvents = parsedEvents.filter(e => e.title && e.title !== 'Untitled Event');
          resolve(validEvents);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}
