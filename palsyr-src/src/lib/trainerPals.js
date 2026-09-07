import { getSpecies } from '../data/species.js'
import { computeMaxHP } from './pals.js'
import { mulberry32 } from './rng.js'

// Builds a trainer's battle team deterministically from their species list
// and tier. Higher tier = stats biased toward the top of the species range
// plus a flat bonus, so farther-city trainers hit noticeably harder.
export function buildTrainerTeam(trainer) {
  const rand = mulberry32(hashString(trainer.id))
  return trainer.speciesTeam.map((speciesId, i) => {
    const species = getSpecies(speciesId)
    const r = species.statRanges
    const bias = 0.5 + trainer.tier * 0.08 // 0.5 (tier0) .. ~0.9 (tier5)
    const bonus = trainer.tier * 1.5
    const stats = {
      strength: Math.round(lerp(r.strength, bias, rand) + bonus),
      speed: Math.round(lerp(r.speed, bias, rand) + bonus * 0.6),
      cuteness: Math.round(lerp(r.cuteness, bias, rand)),
      luck: Math.round(lerp(r.luck, bias, rand) + bonus * 0.4),
    }
    const maxHP = computeMaxHP(stats)
    return {
      id: `${trainer.id}_pal_${i}`,
      speciesId,
      subspeciesId: null,
      nickname: species.name,
      level: 1 + trainer.tier,
      stats,
      maxHP,
      currentHP: maxHP,
      moves: species.moveSet,
      status: 'trainer',
      isActiveBattler: true,
    }
  })
}

function lerp(range, t, rand) {
  const jitter = (rand() - 0.5) * 0.15
  const clampedT = Math.min(1, Math.max(0, t + jitter))
  return range[0] + (range[1] - range[0]) * clampedT
}

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return h
}
