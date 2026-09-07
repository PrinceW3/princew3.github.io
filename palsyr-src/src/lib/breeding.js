import { getSpecies, subspeciesForSpecies, MUTATION_SPECIES } from '../data/species.js'
import { computeMaxHP } from './pals.js'
import { pick, uid } from './rng.js'

// Real-time cooldown per Pal after breeding. Kept short for playability
// (a "day" in Palsyr terms) rather than a literal 24h wait.
export const BREEDING_COOLDOWN_MS = 15 * 60 * 1000

export function isOnCooldown(cooldowns, palId, now = Date.now()) {
  const until = cooldowns[palId]
  return !!until && until > now
}

export function cooldownRemainingMs(cooldowns, palId, now = Date.now()) {
  const until = cooldowns[palId]
  if (!until) return 0
  return Math.max(0, until - now)
}

function blendStat(a, b, rand) {
  const avg = (a + b) / 2
  const mutation = (rand() - 0.5) * 0.3 * avg // +/-15%
  return Math.max(1, Math.round(avg + mutation))
}

export function breedPals(parentA, parentB, rand = Math.random) {
  const roll = rand()

  if (roll < 0.6) {
    const base = rand() < 0.5 ? parentA : parentB
    const other = base === parentA ? parentB : parentA
    const species = getSpecies(base.speciesId)
    const stats = {
      strength: blendStat(base.stats.strength, other.stats.strength, rand),
      speed: blendStat(base.stats.speed, other.stats.speed, rand),
      cuteness: blendStat(base.stats.cuteness, other.stats.cuteness, rand),
      luck: blendStat(base.stats.luck, other.stats.luck, rand),
    }
    const inheritSub = base.subspeciesId && rand() < 0.5 ? base.subspeciesId : null
    const maxHP = computeMaxHP(stats)
    return {
      id: uid('pal'),
      speciesId: base.speciesId,
      subspeciesId: inheritSub,
      nickname: species.name,
      level: 1,
      stats,
      maxHP,
      currentHP: maxHP,
      moves: species.moveSet,
      status: 'owned',
      isActiveBattler: false,
      caughtAt: Date.now(),
      poundExpiresAt: null,
      breedResult: 'inherited',
    }
  }

  // 40%: a new subspecies or an entirely new mutation species
  const subCandidates = [...subspeciesForSpecies(parentA.speciesId), ...subspeciesForSpecies(parentB.speciesId)]
  const wantSub = subCandidates.length > 0 && rand() < 0.5

  if (wantSub) {
    const sub = pick(subCandidates, rand)
    const species = getSpecies(sub.speciesId)
    const parent = parentA.speciesId === sub.speciesId ? parentA : parentB
    const baseStats = {
      strength: blendStat(parent.stats.strength, parent.stats.strength, rand),
      speed: blendStat(parent.stats.speed, parent.stats.speed, rand),
      cuteness: blendStat(parent.stats.cuteness, parent.stats.cuteness, rand),
      luck: blendStat(parent.stats.luck, parent.stats.luck, rand),
    }
    const stats = {
      strength: Math.max(1, baseStats.strength + sub.statMods.strength),
      speed: Math.max(1, baseStats.speed + sub.statMods.speed),
      cuteness: Math.max(1, baseStats.cuteness + sub.statMods.cuteness),
      luck: Math.max(1, baseStats.luck + sub.statMods.luck),
    }
    const maxHP = computeMaxHP(stats)
    return {
      id: uid('pal'),
      speciesId: sub.speciesId,
      subspeciesId: sub.id,
      nickname: sub.name,
      level: 1,
      stats,
      maxHP,
      currentHP: maxHP,
      moves: species.moveSet,
      status: 'owned',
      isActiveBattler: false,
      caughtAt: Date.now(),
      poundExpiresAt: null,
      breedResult: 'subspecies',
    }
  }

  const species = pick(MUTATION_SPECIES, rand)
  const r = species.statRanges
  const stats = {
    strength: Math.round((r.strength[0] + r.strength[1]) / 2),
    speed: Math.round((r.speed[0] + r.speed[1]) / 2),
    cuteness: Math.round((r.cuteness[0] + r.cuteness[1]) / 2),
    luck: Math.round((r.luck[0] + r.luck[1]) / 2),
  }
  const maxHP = computeMaxHP(stats)
  return {
    id: uid('pal'),
    speciesId: species.id,
    subspeciesId: null,
    nickname: species.name,
    level: 1,
    stats,
    maxHP,
    currentHP: maxHP,
    moves: species.moveSet,
    status: 'owned',
    isActiveBattler: false,
    caughtAt: Date.now(),
    poundExpiresAt: null,
    breedResult: 'mutation',
  }
}
