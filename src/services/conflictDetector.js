const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Built-in schedule presets for instant testing
 */
export const SAMPLE_SCHEDULE_PRESETS = [
  {
    id: 'vt-student',
    name: 'VT Computer Science Student',
    description: 'MWF Data Structures & Algorithms (4:00 PM - 5:15 PM) & TR Senior Design Lab',
    blocks: [
      {
        id: 'blk-cs3114',
        title: 'CS 3114: Data Structures & Algorithms',
        location: 'McBryde Hall 100',
        type: 'recurring',
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '16:00',
        endTime: '17:15',
        color: '#861F41'
      },
      {
        id: 'blk-cs4624',
        title: 'CS 4624: Multimedia & Capstone Lab',
        location: 'Torgersen Hall 1100',
        type: 'recurring',
        days: ['Tuesday', 'Thursday'],
        startTime: '18:00',
        endTime: '19:30',
        color: '#E87722'
      },
      {
        id: 'blk-study-grp',
        title: 'Team Sprint Meeting',
        location: 'Newman Library',
        type: 'recurring',
        days: ['Wednesday'],
        startTime: '17:30',
        endTime: '18:30',
        color: '#4F46E5'
      }
    ]
  },
  {
    id: 'campus-job',
    name: 'Student Employee (Dining Services)',
    description: 'Campus job shifts on Monday & Wednesday afternoons (3:30 PM - 7:30 PM)',
    blocks: [
      {
        id: 'blk-job-mw',
        title: 'Dining Services Shift (Owens)',
        location: 'Owens Food Court',
        type: 'recurring',
        days: ['Monday', 'Wednesday'],
        startTime: '15:30',
        endTime: '19:30',
        color: '#059669'
      }
    ]
  },
  {
    id: 'night-owl',
    name: 'Evening Commuter / Intern',
    description: 'Remote internship meetings Mon-Fri 5:00 PM - 6:30 PM',
    blocks: [
      {
        id: 'blk-remote-work',
        title: 'Remote Software Internship Standup',
        location: 'Online / Zoom',
        type: 'recurring',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '17:00',
        endTime: '18:30',
        color: '#2563EB'
      }
    ]
  }
];

/**
 * Checks if a specific event has a time conflict with any user schedule block.
 * @param {Object} event
 * @param {Array} userScheduleBlocks
 * @param {Array} registeredEvents - other events user has added to their calendar
 * @returns {{ hasConflict: boolean, conflicts: Array<{ title: string, timeRange: string, location?: string }> }}
 */
export function checkEventConflict(event, userScheduleBlocks = [], registeredEvents = []) {
  if (!event || !event.startDate || !event.endDate) {
    return { hasConflict: false, conflicts: [] };
  }

  const conflicts = [];
  const eventStart = new Date(event.startDate).getTime();
  const eventEnd = new Date(event.endDate).getTime();
  const eventDayName = DAY_NAMES[new Date(event.startDate).getDay()];

  // 1. Check against custom user schedule blocks
  for (const block of userScheduleBlocks) {
    if (block.type === 'recurring') {
      // Check if event falls on one of the days
      if (block.days && block.days.includes(eventDayName)) {
        // Convert block start/end string (e.g. "16:00") to today's event date timestamps
        const eventDateStr = new Date(event.startDate).toISOString().split('T')[0];
        const [startH, startM] = block.startTime.split(':').map(Number);
        const [endH, endM] = block.endTime.split(':').map(Number);

        const blockStartDate = new Date(event.startDate);
        blockStartDate.setHours(startH, startM, 0, 0);

        const blockEndDate = new Date(event.startDate);
        blockEndDate.setHours(endH, endM, 0, 0);

        const blockStartMs = blockStartDate.getTime();
        const blockEndMs = blockEndDate.getTime();

        // Check time interval overlap
        if (Math.max(eventStart, blockStartMs) < Math.min(eventEnd, blockEndMs)) {
          conflicts.push({
            title: block.title,
            timeRange: `${block.startTime} - ${block.endTime} (${eventDayName})`,
            location: block.location || 'Class / Commitment'
          });
        }
      }
    } else if (block.type === 'specific') {
      // Specific single-instance block
      const blockStartMs = new Date(block.startDateTime).getTime();
      const blockEndMs = new Date(block.endDateTime).getTime();

      if (Math.max(eventStart, blockStartMs) < Math.min(eventEnd, blockEndMs)) {
        conflicts.push({
          title: block.title,
          timeRange: `${new Date(block.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(block.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          location: block.location || 'Personal Commitment'
        });
      }
    }
  }

  // 2. Check against other registered events (prevent double booking)
  for (const regEvent of registeredEvents) {
    if (regEvent.id === event.id) continue;
    const regStart = new Date(regEvent.startDate).getTime();
    const regEnd = new Date(regEvent.endDate).getTime();

    if (Math.max(eventStart, regStart) < Math.min(eventEnd, regEnd)) {
      conflicts.push({
        title: `Registered Event: ${regEvent.title}`,
        timeRange: `${new Date(regEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(regEvent.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        location: regEvent.locationName
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}

/**
 * Filters and marks events with conflict status.
 * @param {Array} events
 * @param {Array} scheduleBlocks
 * @param {Array} registeredEvents
 * @param {boolean} excludeConflicts - If true, strips conflicting events from the list
 * @returns {Array}
 */
export function applyScheduleConflicts(events, scheduleBlocks, registeredEvents, excludeConflicts = false) {
  const processed = events.map(event => {
    const conflictInfo = checkEventConflict(event, scheduleBlocks, registeredEvents);
    return {
      ...event,
      hasConflict: conflictInfo.hasConflict,
      conflicts: conflictInfo.conflicts
    };
  });

  if (excludeConflicts) {
    return processed.filter(e => !e.hasConflict);
  }

  return processed;
}
