// Short tap/reaction minigames that pay Pals currency. Attempts reset daily
// at local midnight (tracked in state/player.js via localDateString).

export const JOBS = [
  {
    id: 'sprint-tap',
    name: 'Sprint Tapper',
    icon: '⚡',
    description: 'Tap the target as many times as you can in 5 seconds.',
    type: 'tap',
    durationMs: 5000,
    maxAttemptsPerDay: 5,
    basePayout: 8,
  },
  {
    id: 'reflex-catch',
    name: 'Reflex Catch',
    icon: '🎯',
    description: 'Wait for GO, then tap as fast as possible.',
    type: 'reflex',
    maxAttemptsPerDay: 5,
    basePayout: 25,
  },
  {
    id: 'pattern-recall',
    name: 'Pattern Recall',
    icon: '🧠',
    description: 'Memorize the sequence, then repeat it.',
    type: 'pattern',
    maxAttemptsPerDay: 4,
    basePayout: 30,
  },
]

export function getJob(id) {
  return JOBS.find((j) => j.id === id)
}
