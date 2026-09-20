import { extractEventTopics } from './topicExtractor.js';

export const DEFAULT_USER_INTERESTS = {
  categories: ['Technology', 'Entrepreneurship', 'Career', 'Environment'],
  keywords: ['cloud', 'ai', 'sustainability', 'workshop', 'networking'],
  timePreference: 'all', // 'morning' (before 12pm), 'afternoon' (12pm-5pm), 'evening' (after 5pm), 'all'
  savedEventIds: []
};

/**
 * Categorizes an event's start time into time of day
 */
export function getTimeOfDay(date) {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Calculates a match score (0-100) and reason for an event based on user profile.
 * @param {Object} event
 * @param {Object} userProfile
 * @returns {{ score: number, reason: string, matchedTags: string[] }}
 */
export function calculateEventRelevance(event, userProfile = DEFAULT_USER_INTERESTS) {
  let score = 20; // Base score
  const matchedReasons = [];
  const matchedTags = [];

  const eventTopics = event.topics || extractEventTopics(event);
  const topicNames = eventTopics.map(t => t.topic.toLowerCase());

  // 1. Category match (up to 35 points)
  const categoryMatch = (userProfile.categories || []).some(cat => 
    cat.toLowerCase() === (event.category || '').toLowerCase()
  );
  if (categoryMatch) {
    score += 35;
    matchedReasons.push(`Matches your interest in ${event.category}`);
    matchedTags.push(event.category);
  }

  // 2. Topic matches (up to 30 points)
  let topicPoints = 0;
  for (const topic of topicNames) {
    for (const kw of (userProfile.keywords || [])) {
      if (topic.includes(kw.toLowerCase())) {
        topicPoints += 15;
        matchedReasons.push(`Relevant topic: ${kw}`);
        matchedTags.push(kw);
        break;
      }
    }
  }
  score += Math.min(topicPoints, 30);

  // 3. Keyword scan in title & description (up to 20 points)
  const fullText = `${event.title} ${event.description}`.toLowerCase();
  let keywordPoints = 0;
  for (const kw of (userProfile.keywords || [])) {
    if (fullText.includes(kw.toLowerCase()) && !matchedTags.includes(kw)) {
      keywordPoints += 10;
      matchedTags.push(kw);
    }
  }
  score += Math.min(keywordPoints, 20);

  // 4. Time preference match (up to 10 points)
  if (userProfile.timePreference && userProfile.timePreference !== 'all') {
    const timeOfDay = getTimeOfDay(event.startDate);
    if (timeOfDay === userProfile.timePreference) {
      score += 10;
      matchedReasons.push(`Matches your ${timeOfDay} availability`);
    } else {
      score -= 5;
    }
  } else {
    score += 5;
  }

  // 5. Affinity boost from saved events in same category
  if (userProfile.savedCategories && userProfile.savedCategories.includes(event.category)) {
    score += 10;
    matchedReasons.push(`Similar to other saved events`);
  }

  // Bound score between 15 and 99
  const finalScore = Math.max(15, Math.min(99, Math.round(score)));

  // Generate friendly reason summary
  let reason = 'General campus activity';
  if (matchedReasons.length > 0) {
    reason = matchedReasons.slice(0, 2).join(' • ');
  } else if (event.category) {
    reason = `Explore ${event.category} in Blacksburg`;
  }

  return {
    score: finalScore,
    reason,
    matchedTags: Array.from(new Set(matchedTags))
  };
}

/**
 * Enriches and sorts a list of events by relevance score (highest first).
 */
export function rankEventsByRelevance(events, userProfile = DEFAULT_USER_INTERESTS) {
  const ranked = events.map(event => {
    const topics = event.topics || extractEventTopics(event);
    const relevance = calculateEventRelevance({ ...event, topics }, userProfile);
    return {
      ...event,
      topics,
      matchScore: relevance.score,
      matchReason: relevance.reason,
      matchedTags: relevance.matchedTags
    };
  });

  // Sort descending by match score, tie breaker by start date
  return ranked.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.startDate.getTime() - b.startDate.getTime();
  });
}
