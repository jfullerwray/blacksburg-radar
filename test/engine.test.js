import assert from 'node:assert';
import { parseEventsCSV } from '../src/services/csvParser.js';
import { extractEventTopics } from '../src/services/topicExtractor.js';
import { rankEventsByRelevance, DEFAULT_USER_INTERESTS } from '../src/services/recommendationEngine.js';
import { checkEventConflict, applyScheduleConflicts, SAMPLE_SCHEDULE_PRESETS } from '../src/services/conflictDetector.js';
import { DEFAULT_CSV_STRING } from '../src/data/defaultCsv.js';

async function runTests() {
  console.log('🧪 Starting engine tests...\n');

  // Test 1: CSV Parsing
  console.log('Test 1: Parsing default CSV events...');
  const events = await parseEventsCSV(DEFAULT_CSV_STRING);
  assert.strictEqual(events.length, 16, `Expected 16 events, got ${events.length}`);
  
  const firstEvent = events[0];
  assert.strictEqual(firstEvent.title, 'Intro to Cloud Computing Workshop');
  assert.strictEqual(firstEvent.category, 'Technology');
  assert.strictEqual(firstEvent.locationName, 'Newman Library');
  assert.strictEqual(typeof firstEvent.latitude, 'number');
  assert.strictEqual(typeof firstEvent.longitude, 'number');
  assert(firstEvent.latitude > 37.1 && firstEvent.latitude < 37.3, 'Latitude should be in Blacksburg area');
  assert(firstEvent.longitude > -80.5 && firstEvent.longitude < -80.3, 'Longitude should be in Blacksburg area');
  console.log('✅ CSV parsing test passed!');

  // Test 2: Topic Extraction
  console.log('\nTest 2: Extracting topics discussed...');
  const topics1 = extractEventTopics(firstEvent);
  assert(topics1.length > 0, 'Expected at least 1 topic for Cloud Computing Workshop');
  const topicNames1 = topics1.map(t => t.topic);
  assert(
    topicNames1.some(t => t.includes('Cloud Computing')),
    `Expected Cloud Computing topic, got: ${topicNames1.join(', ')}`
  );

  const ethicsEvent = events.find(e => e.title.includes('AI and Ethics'));
  assert(ethicsEvent, 'AI and Ethics event should exist');
  const ethicsTopics = extractEventTopics(ethicsEvent).map(t => t.topic);
  assert(
    ethicsTopics.some(t => t.includes('Artificial Intelligence')),
    `Expected AI topic, got: ${ethicsTopics.join(', ')}`
  );
  console.log('✅ Topic extraction test passed! (Topics extracted:', ethicsTopics.join(', '), ')');

  // Test 3: Recommendation Engine Ranking
  console.log('\nTest 3: Recommendation engine ranking...');
  // With Technology & Cloud preferences, Cloud Workshop and AI event should rank highest
  const ranked = rankEventsByRelevance(events, DEFAULT_USER_INTERESTS);
  assert(ranked[0].matchScore >= ranked[ranked.length - 1].matchScore, 'Events should be sorted descending by matchScore');
  assert(ranked[0].category === 'Technology' || ranked[0].category === 'Career' || ranked[0].category === 'Entrepreneurship', 
    `Top ranked event category should be favored, got: ${ranked[0].title} (${ranked[0].category})`
  );
  assert(typeof ranked[0].matchReason === 'string' && ranked[0].matchReason.length > 0, 'Match reason should be provided');
  console.log(`✅ Recommendation ranking test passed! Top event: "${ranked[0].title}" (Score: ${ranked[0].matchScore}%, Reason: "${ranked[0].matchReason}")`);

  // Test 4: Conflict Detection Logic
  console.log('\nTest 4: Schedule conflict detection...');
  const studentPreset = SAMPLE_SCHEDULE_PRESETS[0]; // MWF 16:00-17:15 CS 3114
  
  // vt-demo-001 is on 2026-10-05 (Monday) from 17:00 to 19:00
  // CS 3114 on Monday is 16:00 to 17:15 -> Overlaps between 17:00 and 17:15!
  const cloudEvent = events.find(e => e.id === 'vt-demo-001');
  const conflict1 = checkEventConflict(cloudEvent, studentPreset.blocks, []);
  assert.strictEqual(conflict1.hasConflict, true, 'Intro to Cloud Computing should have conflict with CS 3114');
  console.log(`✅ Conflict detected correctly for Monday event: "${conflict1.conflicts[0].title}" (${conflict1.conflicts[0].timeRange})`);

  // vt-demo-002 is on 2026-10-06 (Tuesday) from 11:00 to 14:00
  // On Tuesday, blocks are TR 18:00-19:30 -> No overlap with 11:00-14:00!
  const sustainEvent = events.find(e => e.id === 'vt-demo-002');
  const conflict2 = checkEventConflict(sustainEvent, studentPreset.blocks, []);
  assert.strictEqual(conflict2.hasConflict, false, 'Sustainability Fair should not conflict with evening lab');
  console.log('✅ Non-conflicting event correctly recognized as clear!');

  // Test 5: Conflict Exclusion Filtering
  console.log('\nTest 5: Schedule conflict exclusion filter...');
  const excluded = applyScheduleConflicts(events, studentPreset.blocks, [], true);
  assert(excluded.length < events.length, 'Excluded list should have fewer events than total');
  assert(!excluded.some(e => e.id === 'vt-demo-001'), 'Conflicted event should not be in excluded list');
  console.log(`✅ Conflict exclusion filter passed! (${events.length} total -> ${excluded.length} free of conflicts)`);

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
