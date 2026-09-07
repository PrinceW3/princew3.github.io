import { mulberry32 } from '../lib/rng.js'
import { rollStats } from '../lib/pals.js'
import { getSpecies } from './species.js'
import { computeMaxHP } from '../lib/pals.js'

// Mock "server" seed data for bot players. Rosters are generated once at
// module load with a per-bot seeded RNG so they're stable across sessions
// without needing to persist them.

function buildBotPal(speciesId, rand, nickname) {
  const species = getSpecies(speciesId)
  const stats = rollStats(species, rand)
  const maxHP = computeMaxHP(stats)
  return {
    id: `${speciesId}_${nickname}`.toLowerCase().replace(/\s+/g, '-'),
    speciesId,
    subspeciesId: null,
    nickname: nickname || species.name,
    level: 3,
    stats,
    maxHP,
    currentHP: maxHP,
    moves: species.moveSet,
    status: 'bot',
    isActiveBattler: true,
  }
}

const RAW_BOTS = [
  {
    id: 'bot-nova',
    name: 'Nova',
    avatar: '🌟',
    seed: 101,
    roster: ['skyquill', 'fluffkit', 'glimmoth'],
    personality: 'chatty',
    chatLines: [
      "anyone else's Fluffkit refuse to nap today lol",
      'just hit a new personal best at Reflex Catch!',
      'trading Tidefins for Cragoons, dm me',
      'Havenmere market prices are wild rn',
      'good luck out there trainers ✨',
    ],
  },
  {
    id: 'bot-jaxon',
    name: 'Jaxon',
    avatar: '🪓',
    seed: 202,
    roster: ['cragoon', 'dunestrider'],
    personality: 'competitive',
    chatLines: [
      'undefeated this week, who wants smoke',
      'Suncrag outskirts trainers are a joke now',
      'my Cragoon could solo the whole map',
      'anyone breeding rares? need a Starwhelp',
      'gg to everyone I battled today',
    ],
  },
  {
    id: 'bot-wren',
    name: 'Wren',
    avatar: '🌿',
    seed: 303,
    roster: ['mossling', 'thistlehog', 'emberail'],
    personality: 'friendly',
    chatLines: [
      'Rootwood forest is so pretty this time of day',
      'just adopted a pound Pal, felt so good',
      'does anyone else nickname every single Pal',
      'my Mossling says hi 🍃',
      'happy to trade, just ask!',
    ],
  },
  {
    id: 'bot-milo',
    name: 'Milo',
    avatar: '🌊',
    seed: 404,
    roster: ['tidefin', 'aquabub'],
    personality: 'chill',
    chatLines: [
      'Tideport sunsets hit different',
      'lost a battle but my Tidefin fought hard',
      'anyone want to do a friendly match',
      'saving up for a Coralynx one day...',
      'gm palsyr fam',
    ],
  },
  {
    id: 'bot-ivy',
    name: 'Ivy',
    avatar: '🔥',
    seed: 505,
    roster: ['emberail', 'dunestrider', 'skyquill'],
    personality: 'competitive',
    chatLines: [
      'grinding jobs for Pals all day',
      'my win streak is at 7, come test me',
      'Ashglen outskirts nearly wrecked my team',
      'breeding two rares tonight, wish me luck',
      'anyone selling Starwhelps?',
    ],
  },
  {
    id: 'bot-baz',
    name: 'Baz',
    avatar: '🥔',
    seed: 606,
    roster: ['fluffkit', 'thistlehog'],
    personality: 'friendly',
    chatLines: [
      'new to Palsyr, this game is so relaxing',
      'my starter Fluffkit is my best friend fr',
      'can someone explain breeding to me',
      'love the minimap feature honestly',
      'just vibing at the market today',
    ],
  },
]

export const BOTS = RAW_BOTS.map((b) => {
  const rand = mulberry32(b.seed)
  const roster = b.roster.map((speciesId, i) => buildBotPal(speciesId, rand, `${b.name}'s ${getSpecies(speciesId).name}`))
  roster[0].isActiveBattler = true
  return {
    id: b.id,
    name: b.name,
    avatar: b.avatar,
    personality: b.personality,
    chatLines: b.chatLines,
    roster,
    activePalId: roster[0].id,
    wins: Math.floor(mulberry32(b.seed + 1)() * 10) + 2,
    losses: Math.floor(mulberry32(b.seed + 2)() * 6) + 1,
  }
})

export function getBot(id) {
  return BOTS.find((b) => b.id === id)
}
