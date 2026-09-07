// Generic move set shared by all Pals. Damage scales off the user's strength
// or speed as noted; a couple have secondary effects (guard mitigates,
// focus buffs). Kept small and generic per spec (3-4 moves per Pal).

export const MOVES = {
  tackle: {
    id: 'tackle',
    name: 'Tackle',
    power: 1.0,
    scalesOn: 'strength',
    kind: 'attack',
    description: 'A basic body slam.',
  },
  quickStrike: {
    id: 'quickStrike',
    name: 'Quick Strike',
    power: 0.75,
    scalesOn: 'speed',
    kind: 'attack',
    priority: 1,
    description: 'A fast jab that scales with speed and often goes first.',
  },
  guard: {
    id: 'guard',
    name: 'Guard',
    kind: 'guard',
    description: 'Braces, halving incoming damage this turn.',
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    kind: 'focus',
    description: 'Concentrates, boosting the next attack this battle.',
  },
}

export function getMove(id) {
  return MOVES[id]
}
