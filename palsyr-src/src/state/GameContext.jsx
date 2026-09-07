import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { loadPlayer, savePlayer, DAILY_ENCOUNTER_CAP, POUND_DAYS } from '../lib/player.js'
import { loadMasterLog, recordDiscovery, recordRemoval, marketPrice as calcMarketPrice } from '../lib/masterLog.js'
import { createPal, healFull } from '../lib/pals.js'
import { breedPals as breedPalsLib, isOnCooldown, cooldownRemainingMs, BREEDING_COOLDOWN_MS } from '../lib/breeding.js'
import { getJob } from '../data/jobs.js'
import { localDateString } from '../lib/storage.js'

const GameStateContext = createContext(null)

export function GameProvider({ children }) {
  const [player, setPlayerRaw] = useState(() => loadPlayer())
  const [masterLog, setMasterLog] = useState(() => loadMasterLog())
  const playerRef = useRef(player)
  playerRef.current = player

  useEffect(() => {
    savePlayer(player)
  }, [player])

  const setPlayer = useCallback((updater) => {
    setPlayerRaw((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }, [])

  // ---------- Movement ----------
  const movePlayer = useCallback(
    (x, y, facing) => {
      setPlayer((p) => ({ ...p, position: { x, y }, facing: facing ?? p.facing }))
    },
    [setPlayer],
  )

  const setFacing = useCallback(
    (facing) => {
      setPlayer((p) => ({ ...p, facing }))
    },
    [setPlayer],
  )

  // ---------- Currency ----------
  const earnPals = useCallback(
    (amount) => setPlayer((p) => ({ ...p, palsBalance: p.palsBalance + amount })),
    [setPlayer],
  )
  const spendPals = useCallback(
    (amount) => {
      let ok = false
      setPlayer((p) => {
        if (p.palsBalance < amount) return p
        ok = true
        return { ...p, palsBalance: p.palsBalance - amount }
      })
      return ok
    },
    [setPlayer],
  )

  // ---------- Pals / Master Log ----------
  const addPalToInventory = useCallback(
    (pal) => {
      setPlayer((p) => ({ ...p, inventory: [...p.inventory, pal] }))
      setMasterLog((log) => recordDiscovery(log, pal.speciesId, pal.subspeciesId))
    },
    [setPlayer],
  )

  const removePalPermanently = useCallback((pal) => {
    setMasterLog((log) => recordRemoval(log, pal.speciesId, pal.subspeciesId))
  }, [])

  const updatePal = useCallback(
    (palId, patch) => {
      setPlayer((p) => ({
        ...p,
        inventory: p.inventory.map((pal) => (pal.id === palId ? { ...pal, ...patch } : pal)),
      }))
    },
    [setPlayer],
  )

  const renamePal = useCallback((palId, nickname) => updatePal(palId, { nickname }), [updatePal])

  const setActiveBattler = useCallback(
    (palId) => {
      setPlayer((p) => ({
        ...p,
        inventory: p.inventory.map((pal) => ({ ...pal, isActiveBattler: pal.id === palId })),
      }))
    },
    [setPlayer],
  )

  const getActivePal = useCallback(() => {
    return playerRef.current.inventory.find((p) => p.isActiveBattler) || playerRef.current.inventory[0] || null
  }, [])

  const healActivePal = useCallback(() => {
    setPlayer((p) => ({
      ...p,
      inventory: p.inventory.map((pal) => (pal.isActiveBattler ? healFull(pal) : pal)),
    }))
  }, [setPlayer])

  const healAllPals = useCallback(() => {
    setPlayer((p) => ({ ...p, inventory: p.inventory.map(healFull) }))
  }, [setPlayer])

  // ---------- Wild encounters ----------
  const canEncounterToday = useCallback(() => {
    return playerRef.current.dailyEncounters.count < DAILY_ENCOUNTER_CAP
  }, [])

  const encountersRemaining = useMemo(
    () => Math.max(0, DAILY_ENCOUNTER_CAP - player.dailyEncounters.count),
    [player.dailyEncounters.count],
  )

  const catchWildPal = useCallback(
    (speciesId, subspeciesId = null) => {
      const pal = createPal({ speciesId, subspeciesId })
      addPalToInventory(pal)
      setPlayer((p) => ({
        ...p,
        dailyEncounters: { ...p.dailyEncounters, count: p.dailyEncounters.count + 1 },
      }))
      return pal
    },
    [addPalToInventory, setPlayer],
  )

  // ---------- Pound ----------
  const releaseToPound = useCallback(
    (palId) => {
      setPlayer((p) => {
        const pal = p.inventory.find((x) => x.id === palId)
        if (!pal) return p
        const poundedPal = { ...pal, status: 'pound', isActiveBattler: false, poundExpiresAt: Date.now() + POUND_DAYS * 86400000 }
        return {
          ...p,
          inventory: p.inventory.filter((x) => x.id !== palId),
          poundPals: [...p.poundPals, poundedPal],
        }
      })
    },
    [setPlayer],
  )

  const ADOPT_FEE = 40
  const adoptFromPound = useCallback(
    (palId) => {
      let success = false
      setPlayer((p) => {
        if (p.palsBalance < ADOPT_FEE) return p
        const pal = p.poundPals.find((x) => x.id === palId)
        if (!pal) return p
        success = true
        const adopted = { ...pal, status: 'owned', poundExpiresAt: null }
        return {
          ...p,
          palsBalance: p.palsBalance - ADOPT_FEE,
          poundPals: p.poundPals.filter((x) => x.id !== palId),
          inventory: [...p.inventory, adopted],
        }
      })
      return success
    },
    [setPlayer],
  )

  // sweep expired pound pals (checked on load, plus a light interval while running)
  useEffect(() => {
    const sweep = () => {
      setPlayer((p) => {
        const now = Date.now()
        const expired = p.poundPals.filter((x) => x.poundExpiresAt && x.poundExpiresAt <= now)
        if (expired.length === 0) return p
        expired.forEach((pal) => setMasterLog((log) => recordRemoval(log, pal.speciesId, pal.subspeciesId)))
        return { ...p, poundPals: p.poundPals.filter((x) => !x.poundExpiresAt || x.poundExpiresAt > now) }
      })
    }
    const interval = setInterval(sweep, 60000)
    return () => clearInterval(interval)
  }, [setPlayer])

  // ---------- Market ----------
  const buyPal = useCallback(
    (speciesId, subspeciesId, price) => {
      const ok = spendPals(price)
      if (!ok) return null
      const pal = createPal({ speciesId, subspeciesId })
      addPalToInventory(pal)
      return pal
    },
    [spendPals, addPalToInventory],
  )

  const sellPal = useCallback(
    (palId) => {
      const pal = playerRef.current.inventory.find((x) => x.id === palId)
      if (!pal) return 0
      const price = calcMarketPrice(masterLog, pal.speciesId, pal.subspeciesId)
      const sellPrice = Math.max(5, Math.round(price * 0.6))
      setPlayer((p) => ({
        ...p,
        palsBalance: p.palsBalance + sellPrice,
        inventory: p.inventory.filter((x) => x.id !== palId),
      }))
      setMasterLog((log) => recordRemoval(log, pal.speciesId, pal.subspeciesId))
      return sellPrice
    },
    [masterLog, setPlayer],
  )

  // ---------- Nursery / Breeding ----------
  const canBreed = useCallback(
    (palId) => !isOnCooldown(playerRef.current.breedingCooldowns, palId),
    [],
  )
  const breedingRemainingMs = useCallback(
    (palId) => cooldownRemainingMs(playerRef.current.breedingCooldowns, palId),
    [],
  )

  const breedPals = useCallback(
    (parentAId, parentBId) => {
      const p = playerRef.current
      const parentA = p.inventory.find((x) => x.id === parentAId)
      const parentB = p.inventory.find((x) => x.id === parentBId)
      if (!parentA || !parentB) return null
      if (isOnCooldown(p.breedingCooldowns, parentAId) || isOnCooldown(p.breedingCooldowns, parentBId)) return null
      const offspring = breedPalsLib(parentA, parentB)
      const until = Date.now() + BREEDING_COOLDOWN_MS
      setPlayer((prev) => ({
        ...prev,
        inventory: [...prev.inventory, offspring],
        breedingCooldowns: { ...prev.breedingCooldowns, [parentAId]: until, [parentBId]: until },
      }))
      setMasterLog((log) => recordDiscovery(log, offspring.speciesId, offspring.subspeciesId))
      return offspring
    },
    [setPlayer],
  )

  // ---------- Jobs ----------
  const jobAttemptsUsed = useCallback((jobId) => playerRef.current.jobAttempts.counts[jobId] || 0, [])
  const jobAttemptsRemaining = useCallback((jobId) => {
    const job = getJob(jobId)
    if (!job) return 0
    return Math.max(0, job.maxAttemptsPerDay - (playerRef.current.jobAttempts.counts[jobId] || 0))
  }, [])

  const useJobAttempt = useCallback(
    (jobId, payout) => {
      const job = getJob(jobId)
      if (!job) return false
      const used = playerRef.current.jobAttempts.counts[jobId] || 0
      if (used >= job.maxAttemptsPerDay) return false
      setPlayer((p) => ({
        ...p,
        palsBalance: p.palsBalance + payout,
        jobAttempts: { ...p.jobAttempts, counts: { ...p.jobAttempts.counts, [jobId]: used + 1 } },
      }))
      return true
    },
    [setPlayer],
  )

  // ---------- Trainers ----------
  const isTrainerDefeatedToday = useCallback(
    (trainerId) => playerRef.current.defeatedTrainers.trainerIds.includes(trainerId),
    [],
  )

  const defeatTrainer = useCallback(
    (trainerId, rewardPals) => {
      setPlayer((p) => ({
        ...p,
        palsBalance: p.palsBalance + rewardPals,
        defeatedTrainers: {
          ...p.defeatedTrainers,
          trainerIds: p.defeatedTrainers.trainerIds.includes(trainerId)
            ? p.defeatedTrainers.trainerIds
            : [...p.defeatedTrainers.trainerIds, trainerId],
        },
      }))
    },
    [setPlayer],
  )

  // ---------- Starter ----------
  const chooseStarter = useCallback(
    (speciesId) => {
      const pal = createPal({ speciesId, nickname: null })
      pal.isActiveBattler = true
      setPlayer((p) => ({ ...p, starterChosen: true, inventory: [pal] }))
      setMasterLog((log) => recordDiscovery(log, pal.speciesId, pal.subspeciesId))
    },
    [setPlayer],
  )

  const value = useMemo(
    () => ({
      player,
      masterLog,
      encountersRemaining,
      movePlayer,
      setFacing,
      earnPals,
      spendPals,
      addPalToInventory,
      removePalPermanently,
      updatePal,
      renamePal,
      setActiveBattler,
      getActivePal,
      healActivePal,
      healAllPals,
      canEncounterToday,
      catchWildPal,
      releaseToPound,
      adoptFromPound,
      ADOPT_FEE,
      buyPal,
      sellPal,
      canBreed,
      breedingRemainingMs,
      breedPals,
      jobAttemptsUsed,
      jobAttemptsRemaining,
      useJobAttempt,
      isTrainerDefeatedToday,
      defeatTrainer,
      chooseStarter,
    }),
    [
      player,
      masterLog,
      encountersRemaining,
      movePlayer,
      setFacing,
      earnPals,
      spendPals,
      addPalToInventory,
      removePalPermanently,
      updatePal,
      renamePal,
      setActiveBattler,
      getActivePal,
      healActivePal,
      healAllPals,
      canEncounterToday,
      catchWildPal,
      releaseToPound,
      adoptFromPound,
      buyPal,
      sellPal,
      canBreed,
      breedingRemainingMs,
      breedPals,
      jobAttemptsUsed,
      jobAttemptsRemaining,
      useJobAttempt,
      isTrainerDefeatedToday,
      defeatTrainer,
      chooseStarter,
    ],
  )

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameStateContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
