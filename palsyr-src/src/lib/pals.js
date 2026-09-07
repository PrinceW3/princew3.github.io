import { getSpecies, getSubspecies } from '../data/species.js'
import { randInt, uid } from './rng.js'

export function computeMaxHP(stats) {
  return 20 + stats.strength * 3 + Math.round(stats.luck * 1.2)
}

function rollStat(range, rand = Math.random) {
  return randInt(range[0], range[1], rand)
}

export function rollStats(species, rand = Math.random) {
  const r = species.statRanges
  return {
    strength: rollStat(r.strength, rand),
    speed: rollStat(r.speed, rand),
    cuteness: rollStat(r.cuteness, rand),
    luck: rollStat(r.luck, rand),
  }
}

export function applySubspeciesMods(stats, subspecies) {
  if (!subspecies) return stats
  const mods = subspecies.statMods
  return {
    strength: Math.max(1, stats.strength + mods.strength),
    speed: Math.max(1, stats.speed + mods.speed),
    cuteness: Math.max(1, stats.cuteness + mods.cuteness),
    luck: Math.max(1, stats.luck + mods.luck),
  }
}

export function createPal({ speciesId, subspeciesId = null, rand = Math.random, level = 1, nickname = null }) {
  const species = getSpecies(speciesId)
  if (!species) throw new Error(`Unknown species: ${speciesId}`)
  const subspecies = subspeciesId ? getSubspecies(subspeciesId) : null

  let stats = rollStats(species, rand)
  stats = applySubspeciesMods(stats, subspecies)
  const maxHP = computeMaxHP(stats)

  return {
    id: uid('pal'),
    speciesId,
    subspeciesId,
    nickname: nickname || subspecies?.name || species.name,
    level,
    stats,
    maxHP,
    currentHP: maxHP,
    moves: species.moveSet,
    status: 'owned', // owned | pound | sold
    isActiveBattler: false,
    caughtAt: Date.now(),
    poundExpiresAt: null,
  }
}

export function displayName(pal) {
  return pal.nickname
}

export function speciesLabel(pal) {
  const species = getSpecies(pal.speciesId)
  const sub = pal.subspeciesId ? getSubspecies(pal.subspeciesId) : null
  return sub ? sub.name : species?.name || 'Unknown'
}

export function palIcon(pal) {
  const species = getSpecies(pal.speciesId)
  return species?.icon || '❓'
}

export function palColor(pal) {
  const sub = pal.subspeciesId ? getSubspecies(pal.subspeciesId) : null
  if (sub) return sub.tint
  const species = getSpecies(pal.speciesId)
  return species?.color || '#888'
}

export function statTotal(pal) {
  const s = pal.stats
  return s.strength + s.speed + s.cuteness + s.luck
}

export function healFull(pal) {
  return { ...pal, currentHP: pal.maxHP }
}
