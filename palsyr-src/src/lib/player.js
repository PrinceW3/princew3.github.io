import { loadJSON, saveJSON, localDateString } from './storage.js'
import { HUB_SPAWN } from '../data/world.js'

const KEY = 'player'

export const STARTING_PALS_BALANCE = 100
export const DAILY_ENCOUNTER_CAP = 3
export const POUND_DAYS = 30

function defaultPlayer() {
  const today = localDateString()
  return {
    starterChosen: false,
    position: { x: HUB_SPAWN.x, y: HUB_SPAWN.y },
    facing: 'down',
    palsBalance: STARTING_PALS_BALANCE,
    inventory: [],
    poundPals: [],
    dailyEncounters: { date: today, count: 0 },
    jobAttempts: { date: today, counts: {} },
    defeatedTrainers: { date: today, trainerIds: [] },
    breedingCooldowns: {},
  }
}

function rollDaily(player) {
  const today = localDateString()
  let changed = false
  const next = { ...player }
  if (next.dailyEncounters.date !== today) {
    next.dailyEncounters = { date: today, count: 0 }
    changed = true
  }
  if (next.jobAttempts.date !== today) {
    next.jobAttempts = { date: today, counts: {} }
    changed = true
  }
  if (next.defeatedTrainers.date !== today) {
    next.defeatedTrainers = { date: today, trainerIds: [] }
    changed = true
  }
  return { next, changed }
}

function expirePoundPals(player) {
  const now = Date.now()
  const stillIn = player.poundPals.filter((p) => !p.poundExpiresAt || p.poundExpiresAt > now)
  const changed = stillIn.length !== player.poundPals.length
  return { next: { ...player, poundPals: stillIn }, changed, expired: player.poundPals.filter((p) => p.poundExpiresAt && p.poundExpiresAt <= now) }
}

export function loadPlayer() {
  const stored = loadJSON(KEY, null)
  const player = stored || defaultPlayer()
  const merged = { ...defaultPlayer(), ...player }
  const { next: afterDaily } = rollDaily(merged)
  const { next: afterExpiry } = expirePoundPals(afterDaily)
  if (!stored || afterExpiry !== player) savePlayer(afterExpiry)
  return afterExpiry
}

export function savePlayer(player) {
  saveJSON(KEY, player)
}
