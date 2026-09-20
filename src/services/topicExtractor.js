/**
 * Dictionary of topic keywords and patterns mapped to canonical topic tags
 */
const TOPIC_TAXONOMY = [
  {
    topic: 'Cloud Computing & DevOps',
    keywords: ['cloud', 'aws', 'azure', 'gcp', 'deployment', 'kubernetes', 'docker', 'infrastructure', 'serverless', 'devops'],
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  {
    topic: 'Artificial Intelligence & Ethics',
    keywords: ['ai', 'artificial intelligence', 'ethics', 'machine learning', 'responsible ai', 'privacy', 'deep learning', 'algorithms'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    topic: 'Software Engineering',
    keywords: ['programming', 'code', 'computing', 'developer', 'software', 'python', 'java', 'web development'],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    topic: 'Sustainability & Conservation',
    keywords: ['sustainability', 'recycling', 'conservation', 'environment', 'green energy', 'climate', 'zero waste', 'eco-friendly'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    topic: 'Career & Interview Preparation',
    keywords: ['resume', 'interview', 'career', 'job', 'mentors', 'internship', 'professional development', 'linkedin', 'hiring'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    topic: 'Startups & Entrepreneurship',
    keywords: ['startup', 'pitch', 'founder', 'entrepreneur', 'venture', 'business', 'judges', 'investors', 'incubation'],
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300'
  },
  {
    topic: 'Diversity & Women in STEM',
    keywords: ['women in engineering', 'diversity', 'inclusion', 'women in tech', 'minorities', 'stem'],
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  {
    topic: 'Collegiate Athletics & Sports',
    keywords: ['basketball', 'hokies', 'athletics', 'game', 'sports', 'football', 'fitness', 'acc', 'tournament'],
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    topic: 'Music & Creative Arts',
    keywords: ['open mic', 'music', 'poetry', 'comedy', 'spoken-word', 'performance', 'arts', 'acoustic', 'theater'],
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    topic: 'Photography & Visual Arts',
    keywords: ['photography', 'camera', 'photo walk', 'visual arts', 'gallery', 'design', 'lighting'],
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    topic: 'Global Culture & International Community',
    keywords: ['international', 'global', 'cultural', 'world', 'exchange', 'immigrant', 'language', 'study abroad'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    topic: 'Mindfulness & Physical Wellness',
    keywords: ['yoga', 'wellness', 'stress management', 'mobility', 'health', 'meditation', 'relaxation', 'mental health'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    topic: 'Community Service & Volunteering',
    keywords: ['volunteer', 'service learning', 'community service', 'outreach', 'civic engagement', 'nonprofit'],
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  {
    topic: 'Food, Dining & Culinary Culture',
    keywords: ['food truck', 'food', 'tasting', 'dining', 'culinary', 'vendors', 'festival', 'snacks'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    topic: 'Academic Research & Innovation',
    keywords: ['research', 'undergraduate research', 'graduate', 'scientific showcase', 'symposium', 'poster session', 'experiments'],
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    topic: 'Leadership & Student Governance',
    keywords: ['leadership', 'facilitation', 'event planning', 'budgeting', 'member engagement', 'governance', 'organization management'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    topic: 'Games & Social Entertainment',
    keywords: ['game night', 'board games', 'trivia', 'trivia night', 'gaming', 'study break', 'social mixer'],
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'
  },
  {
    topic: 'Industry Networking',
    keywords: ['networking', 'mixer', 'alumni', 'professionals', 'meet and greet', 'industry connect'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  }
];

/**
 * Extracts general topics discussed and key takeaway themes from an event.
 * @param {Object} event
 * @returns {Array<{ topic: string, badgeColor: string }>}
 */
export function extractEventTopics(event) {
  const textToScan = [
    event.title || '',
    event.description || '',
    event.category || '',
    event.organization || ''
  ].join(' ').toLowerCase();

  const matchedTopics = [];
  const addedTopicNames = new Set();

  for (const item of TOPIC_TAXONOMY) {
    const isMatched = item.keywords.some(keyword => {
      // Regex boundary search for keywords
      const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      return regex.test(textToScan);
    });

    if (isMatched && !addedTopicNames.has(item.topic)) {
      matchedTopics.push({
        topic: item.topic,
        badgeColor: item.badgeColor
      });
      addedTopicNames.add(item.topic);
    }
  }

  // Fallback: If no taxonomy match, synthesize a topic tag from category and key title words
  if (matchedTopics.length === 0) {
    if (event.category && event.category !== 'General') {
      matchedTopics.push({
        topic: `${event.category} Discussion`,
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
      });
    } else {
      matchedTopics.push({
        topic: 'Campus Life & Community',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
      });
    }
  }

  return matchedTopics;
}
