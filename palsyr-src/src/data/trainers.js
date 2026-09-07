import { CITIES, CITY_TIERS } from './cities.js'

// Fixed outskirts NPC trainers per city. Offsets are relative to the city
// center and land within the outskirts ring (distance ~3-5 tiles).
// speciesTeam length and stat scaling grow with tier (1=easiest .. 5=hardest).

const RAW_TRAINERS = [
  // Havenmere (tier 0 - tutorial-easy)
  { cityId: 'havenmere', name: 'Scout Mira', dx: -4, dy: -3, speciesTeam: ['fluffkit'] },
  { cityId: 'havenmere', name: 'Scout Tobin', dx: 4, dy: 3, speciesTeam: ['fluffkit', 'skyquill'] },

  // Rootwood (forest)
  { cityId: 'rootwood', name: 'Ranger Elowen', dx: -3, dy: 4, speciesTeam: ['mossling'] },
  { cityId: 'rootwood', name: 'Ranger Fenn', dx: 4, dy: -3, speciesTeam: ['thistlehog', 'glimmoth'] },

  // Suncrag (desert)
  { cityId: 'suncrag', name: 'Nomad Kess', dx: -4, dy: 3, speciesTeam: ['dunestrider'] },
  { cityId: 'suncrag', name: 'Nomad Rask', dx: 4, dy: 4, speciesTeam: ['dunestrider', 'emberail'] },

  // Tideport (coast)
  { cityId: 'tideport', name: 'Mariner Yui', dx: 4, dy: -3, speciesTeam: ['aquabub'] },
  { cityId: 'tideport', name: 'Mariner Bosk', dx: -3, dy: 4, speciesTeam: ['tidefin', 'aquabub'] },

  // Windmere (grass)
  { cityId: 'windmere', name: 'Herder Sable', dx: -4, dy: -4, speciesTeam: ['skyquill', 'fluffkit'] },
  { cityId: 'windmere', name: 'Herder Orin', dx: 4, dy: -3, speciesTeam: ['skyquill', 'cragoon'] },

  // Ashglen (forest border)
  { cityId: 'ashglen', name: 'Warden Iska', dx: -4, dy: -3, speciesTeam: ['thistlehog', 'emberail'] },
  { cityId: 'ashglen', name: 'Warden Dray', dx: 3, dy: 4, speciesTeam: ['cragoon'] },
]

export const TRAINERS = RAW_TRAINERS.map((t, i) => {
  const city = CITIES.find((c) => c.id === t.cityId)
  const tier = CITY_TIERS[t.cityId]
  return {
    id: `trainer_${i}`,
    ...t,
    tier,
    x: city.x + t.dx,
    y: city.y + t.dy,
    rewardPals: 40 + tier * 35,
    bonusStatXpChance: 0.15 + tier * 0.05,
  }
})

export function getTrainer(id) {
  return TRAINERS.find((t) => t.id === id)
}

export function trainersForCity(cityId) {
  return TRAINERS.filter((t) => t.cityId === cityId)
}
