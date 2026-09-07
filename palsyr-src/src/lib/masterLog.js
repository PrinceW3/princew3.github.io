import { ALL_SPECIES, SUBSPECIES, getSpecies, RARITY } from '../data/species.js'
import { loadJSON, saveJSON } from './storage.js'

const KEY = 'masterLog'

// Master Log rows keyed by "speciesId" or "speciesId::subspeciesId".
// Each row: { key, speciesId, subspeciesId, population, discovered }

function rowKey(speciesId, subspeciesId) {
  return subspeciesId ? `${speciesId}::${subspeciesId}` : speciesId
}

function seedLog() {
  const rows = {}
  for (const species of ALL_SPECIES) {
    const key = rowKey(species.id, null)
    rows[key] = {
      key,
      speciesId: species.id,
      subspeciesId: null,
      population: species.seedPopulation,
      discovered: species.rarity === 'common' || species.rarity === 'uncommon',
    }
  }
  // Predefined subspecies start undiscovered with tiny seed population.
  for (const sub of SUBSPECIES) {
    const key = rowKey(sub.speciesId, sub.id)
    rows[key] = {
      key,
      speciesId: sub.speciesId,
      subspeciesId: sub.id,
      population: 4,
      discovered: false,
    }
  }
  return rows
}

export function loadMasterLog() {
  const stored = loadJSON(KEY, null)
  if (!stored) {
    const fresh = seedLog()
    saveJSON(KEY, fresh)
    return fresh
  }
  // merge in any new species added since last save (forward-compat)
  const fresh = seedLog()
  let changed = false
  for (const key of Object.keys(fresh)) {
    if (!stored[key]) {
      stored[key] = fresh[key]
      changed = true
    }
  }
  if (changed) saveJSON(KEY, stored)
  return stored
}

export function saveMasterLog(log) {
  saveJSON(KEY, log)
}

export function recordDiscovery(log, speciesId, subspeciesId) {
  const key = rowKey(speciesId, subspeciesId)
  const next = { ...log }
  const row = next[key] || {
    key,
    speciesId,
    subspeciesId: subspeciesId || null,
    population: 0,
    discovered: false,
  }
  next[key] = { ...row, population: row.population + 1, discovered: true }
  saveMasterLog(next)
  return next
}

export function recordRemoval(log, speciesId, subspeciesId) {
  const key = rowKey(speciesId, subspeciesId)
  const row = log[key]
  if (!row) return log
  const next = { ...log, [key]: { ...row, population: Math.max(1, row.population - 1) } }
  saveMasterLog(next)
  return next
}

export function marketPrice(log, speciesId, subspeciesId) {
  const key = rowKey(speciesId, subspeciesId)
  const row = log[key]
  const species = getSpecies(speciesId)
  if (!species) return 0
  const pop = Math.max(1, row?.population ?? species.seedPopulation)
  return Math.max(10, Math.round(species.basePrice / pop))
}

export function masterLogRows(log) {
  return Object.values(log)
    .filter((r) => r.discovered)
    .map((r) => {
      const species = getSpecies(r.speciesId)
      const sub = r.subspeciesId ? SUBSPECIES.find((s) => s.id === r.subspeciesId) : null
      return {
        ...r,
        name: sub ? sub.name : species?.name,
        category: species?.category,
        rarity: species?.rarity,
        rarityColor: RARITY[species?.rarity]?.color,
        price: marketPrice(log, r.speciesId, r.subspeciesId),
      }
    })
}
