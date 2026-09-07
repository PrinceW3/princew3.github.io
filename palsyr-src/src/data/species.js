// Species seed data. Population counts are the *initial* Master Log values;
// they mutate at runtime (see lib/masterLog.js) as Pals are bred/sold/released.
// Market price = round(basePrice / population) — scarcity drives price up.

export const RARITY = {
  common: { label: 'Common', color: '#9ca3af', basePriceMul: 1 },
  uncommon: { label: 'Uncommon', color: '#4ade80', basePriceMul: 2.4 },
  rare: { label: 'Rare', color: '#60a5fa', basePriceMul: 5.5 },
  epic: { label: 'Epic', color: '#c084fc', basePriceMul: 12 },
}

// Wild-encounterable starter roster, tagged by the biome(s) they spawn in.
export const SPECIES = [
  {
    id: 'fluffkit',
    name: 'Fluffkit',
    category: 'Beast',
    rarity: 'common',
    biomes: ['grass'],
    icon: '🐿️',
    color: '#d97706',
    statRanges: { strength: [4, 9], speed: [8, 14], cuteness: [10, 16], luck: [5, 10] },
    basePrice: 300,
    seedPopulation: 140,
    moveSet: ['tackle', 'quickStrike', 'guard'],
  },
  {
    id: 'thistlehog',
    name: 'Thistlehog',
    category: 'Beast',
    rarity: 'common',
    biomes: ['forest'],
    icon: '🦔',
    color: '#7c3aed',
    statRanges: { strength: [7, 12], speed: [4, 8], cuteness: [6, 11], luck: [4, 9] },
    basePrice: 320,
    seedPopulation: 130,
    moveSet: ['tackle', 'guard', 'focus'],
  },
  {
    id: 'mossling',
    name: 'Mossling',
    category: 'Sprite',
    rarity: 'common',
    biomes: ['forest'],
    icon: '🍃',
    color: '#22c55e',
    statRanges: { strength: [3, 7], speed: [6, 11], cuteness: [11, 17], luck: [8, 13] },
    basePrice: 340,
    seedPopulation: 120,
    moveSet: ['quickStrike', 'focus', 'guard'],
  },
  {
    id: 'glimmoth',
    name: 'Glimmoth',
    category: 'Insect',
    rarity: 'common',
    biomes: ['forest', 'grass'],
    icon: '🦋',
    color: '#f472b6',
    statRanges: { strength: [3, 6], speed: [10, 16], cuteness: [9, 15], luck: [7, 12] },
    basePrice: 300,
    seedPopulation: 150,
    moveSet: ['quickStrike', 'focus', 'tackle'],
  },
  {
    id: 'aquabub',
    name: 'Aquabub',
    category: 'Aqua',
    rarity: 'common',
    biomes: ['coast'],
    icon: '🐡',
    color: '#38bdf8',
    statRanges: { strength: [5, 9], speed: [7, 12], cuteness: [8, 14], luck: [6, 11] },
    basePrice: 310,
    seedPopulation: 135,
    moveSet: ['tackle', 'quickStrike', 'guard'],
  },
  {
    id: 'tidefin',
    name: 'Tidefin',
    category: 'Aqua',
    rarity: 'uncommon',
    biomes: ['coast'],
    icon: '🐬',
    color: '#0ea5e9',
    statRanges: { strength: [8, 13], speed: [11, 16], cuteness: [10, 15], luck: [6, 10] },
    basePrice: 700,
    seedPopulation: 60,
    moveSet: ['tackle', 'quickStrike', 'focus', 'guard'],
  },
  {
    id: 'dunestrider',
    name: 'Dunestrider',
    category: 'Reptile',
    rarity: 'uncommon',
    biomes: ['desert'],
    icon: '🦎',
    color: '#eab308',
    statRanges: { strength: [10, 15], speed: [9, 13], cuteness: [3, 8], luck: [5, 9] },
    basePrice: 680,
    seedPopulation: 65,
    moveSet: ['tackle', 'focus', 'guard'],
  },
  {
    id: 'emberail',
    name: 'Emberail',
    category: 'Reptile',
    rarity: 'uncommon',
    biomes: ['desert', 'forest'],
    icon: '🦂',
    color: '#f97316',
    statRanges: { strength: [11, 16], speed: [6, 10], cuteness: [4, 9], luck: [6, 11] },
    basePrice: 720,
    seedPopulation: 55,
    moveSet: ['tackle', 'guard', 'focus'],
  },
  {
    id: 'skyquill',
    name: 'Skyquill',
    category: 'Flyer',
    rarity: 'common',
    biomes: ['grass', 'coast'],
    icon: '🦅',
    color: '#94a3b8',
    statRanges: { strength: [6, 10], speed: [13, 18], cuteness: [7, 12], luck: [7, 12] },
    basePrice: 330,
    seedPopulation: 125,
    moveSet: ['quickStrike', 'tackle', 'focus'],
  },
  {
    id: 'cragoon',
    name: 'Cragoon',
    category: 'Beast',
    rarity: 'rare',
    biomes: ['desert'],
    icon: '🐊',
    color: '#78716c',
    statRanges: { strength: [15, 20], speed: [4, 8], cuteness: [2, 6], luck: [4, 8] },
    basePrice: 1800,
    seedPopulation: 22,
    moveSet: ['tackle', 'guard', 'focus'],
  },
]

// Only obtainable through breeding mutations (Nursery) - never spawn in the wild.
export const MUTATION_SPECIES = [
  {
    id: 'starwhelp',
    name: 'Starwhelp',
    category: 'Sprite',
    rarity: 'rare',
    biomes: [],
    icon: '✨',
    color: '#a78bfa',
    statRanges: { strength: [9, 14], speed: [12, 17], cuteness: [14, 19], luck: [12, 17] },
    basePrice: 2200,
    seedPopulation: 6,
    moveSet: ['quickStrike', 'focus', 'guard', 'tackle'],
  },
  {
    id: 'duskmaw',
    name: 'Duskmaw',
    category: 'Beast',
    rarity: 'rare',
    biomes: [],
    icon: '🐺',
    color: '#4c1d95',
    statRanges: { strength: [16, 21], speed: [10, 15], cuteness: [5, 10], luck: [7, 12] },
    basePrice: 2400,
    seedPopulation: 5,
    moveSet: ['tackle', 'quickStrike', 'guard'],
  },
  {
    id: 'gleamowl',
    name: 'Gleamowl',
    category: 'Flyer',
    rarity: 'epic',
    biomes: [],
    icon: '🦉',
    color: '#fbbf24',
    statRanges: { strength: [10, 15], speed: [15, 20], cuteness: [13, 18], luck: [14, 19] },
    basePrice: 5000,
    seedPopulation: 3,
    moveSet: ['quickStrike', 'focus', 'guard', 'tackle'],
  },
  {
    id: 'coralynx',
    name: 'Coralynx',
    category: 'Aqua',
    rarity: 'epic',
    biomes: [],
    icon: '🐆',
    color: '#f43f5e',
    statRanges: { strength: [14, 19], speed: [13, 18], cuteness: [11, 16], luck: [10, 15] },
    basePrice: 5200,
    seedPopulation: 3,
    moveSet: ['tackle', 'quickStrike', 'focus', 'guard'],
  },
]

export const ALL_SPECIES = [...SPECIES, ...MUTATION_SPECIES]

export function getSpecies(id) {
  return ALL_SPECIES.find((s) => s.id === id)
}

// A handful of predefined subspecies (visual + stat variants). More can be
// discovered at runtime during breeding (see lib/breeding.js) but these are
// the "known" seed pool.
export const SUBSPECIES = [
  {
    id: 'fluffkit-frost',
    speciesId: 'fluffkit',
    name: 'Frost Fluffkit',
    appearanceTag: 'frost',
    tint: '#7dd3fc',
    statMods: { strength: 0, speed: 1, cuteness: 2, luck: 1 },
  },
  {
    id: 'thistlehog-shadow',
    speciesId: 'thistlehog',
    name: 'Shadow Thistlehog',
    appearanceTag: 'shadow',
    tint: '#4b5563',
    statMods: { strength: 2, speed: 0, cuteness: -1, luck: 2 },
  },
  {
    id: 'tidefin-golden',
    speciesId: 'tidefin',
    name: 'Golden Tidefin',
    appearanceTag: 'golden',
    tint: '#fde047',
    statMods: { strength: 1, speed: 1, cuteness: 2, luck: 2 },
  },
  {
    id: 'dunestrider-crimson',
    speciesId: 'dunestrider',
    name: 'Crimson Dunestrider',
    appearanceTag: 'crimson',
    tint: '#dc2626',
    statMods: { strength: 3, speed: 0, cuteness: 0, luck: 1 },
  },
  {
    id: 'skyquill-storm',
    speciesId: 'skyquill',
    name: 'Storm Skyquill',
    appearanceTag: 'storm',
    tint: '#334155',
    statMods: { strength: 1, speed: 2, cuteness: 0, luck: 1 },
  },
]

export function getSubspecies(id) {
  return SUBSPECIES.find((s) => s.id === id)
}

export function subspeciesForSpecies(speciesId) {
  return SUBSPECIES.filter((s) => s.speciesId === speciesId)
}
