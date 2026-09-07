import { getMove } from '../data/moves.js'

// Pure, framework-agnostic turn-based battle engine shared by PvE and Social
// battles. A "combatant" wraps a Pal snapshot with battle-only transient
// flags (guard/focus) so the underlying inventory Pal stays untouched until
// the battle result is applied.

export function toCombatant(pal, side, label) {
  return {
    palId: pal.id,
    side, // 'player' | 'enemy'
    label,
    speciesId: pal.speciesId,
    subspeciesId: pal.subspeciesId,
    stats: pal.stats,
    maxHP: pal.maxHP,
    currentHP: pal.currentHP > 0 ? pal.currentHP : pal.maxHP,
    moves: pal.moves,
    guardActive: false,
    focusActive: false,
    fainted: false,
  }
}

export function initBattle({ playerPal, enemyTeam, playerLabel = 'You', mode = 'pve' }) {
  const enemyCombatants = enemyTeam.map((p, i) => toCombatant(p, 'enemy', p.nickname || `Rival Pal ${i + 1}`))
  return {
    mode,
    player: toCombatant(playerPal, 'player', playerLabel),
    enemyTeam: enemyCombatants,
    enemyIndex: 0,
    log: [`A battle begins!`],
    finished: false,
    outcome: null, // 'win' | 'loss' | 'flee'
    turnNumber: 1,
  }
}

function activeEnemy(state) {
  return state.enemyTeam[state.enemyIndex]
}

function critChance(attacker) {
  return Math.min(0.35, 0.05 + attacker.stats.luck * 0.012)
}

function dodgeChance(defender) {
  return Math.min(0.25, 0.02 + defender.stats.luck * 0.008)
}

function computeDamage(attacker, move, defender, rand) {
  const statVal = attacker.stats[move.scalesOn]
  let dmg = Math.round(statVal * move.power * 2.1 + 2)

  if (attacker.focusActive) {
    dmg = Math.round(dmg * 1.5)
  }

  const dodged = rand() < dodgeChance(defender)
  if (dodged) {
    return { dmg: 0, dodged: true, crit: false }
  }

  const crit = rand() < critChance(attacker)
  if (crit) {
    dmg = Math.round(dmg * 1.5)
  }

  if (defender.guardActive) {
    dmg = Math.round(dmg * 0.5)
  }

  return { dmg: Math.max(0, dmg), dodged: false, crit }
}

function applyMove(actor, target, moveId, rand, log) {
  const move = getMove(moveId)
  if (!move) return
  if (move.kind === 'guard') {
    actor.guardActive = true
    log.push(`${actor.label} guards, bracing for the next hit.`)
    return
  }
  if (move.kind === 'focus') {
    actor.focusActive = true
    log.push(`${actor.label} focuses, powering up its next attack.`)
    return
  }
  if (move.kind === 'attack') {
    const { dmg, dodged, crit } = computeDamage(actor, move, target, rand)
    if (dodged) {
      log.push(`${actor.label} used ${move.name}, but ${target.label} dodged!`)
    } else {
      target.currentHP = Math.max(0, target.currentHP - dmg)
      log.push(
        `${actor.label} used ${move.name}${crit ? ' — critical hit!' : ''} dealing ${dmg} damage to ${target.label}.`,
      )
      if (target.currentHP <= 0) {
        target.fainted = true
        log.push(`${target.label} fainted!`)
      }
    }
    actor.focusActive = false
  }
}

function turnOrder(a, b, rand) {
  const aPriority = a.pendingMoveId === 'quickStrike' ? 1 : 0
  const bPriority = b.pendingMoveId === 'quickStrike' ? 1 : 0
  if (aPriority !== bPriority) return aPriority > bPriority ? -1 : 1
  if (a.stats.speed !== b.stats.speed) return a.stats.speed > b.stats.speed ? -1 : 1
  return rand() < 0.5 ? -1 : 1
}

function pickEnemyMove(enemy, player, rand) {
  const hpRatio = enemy.currentHP / enemy.maxHP
  if (hpRatio < 0.3 && !enemy.guardActive && rand() < 0.4) return 'guard'
  if (hpRatio > 0.6 && !enemy.focusActive && rand() < 0.25) return 'focus'
  const attackMoves = enemy.moves.filter((m) => getMove(m)?.kind === 'attack')
  return attackMoves.length ? attackMoves[Math.floor(rand() * attackMoves.length)] : enemy.moves[0]
}

// Resolves one full turn: both sides act in speed order, then checks for
// faint/battle-end. Returns a NEW state object (does not mutate input).
export function takeTurn(state, playerMoveId, rand = Math.random) {
  if (state.finished) return state

  const player = { ...state.player, guardActive: false }
  const enemy = { ...activeEnemy(state) }
  // carry forward guard reset: guard only protects the turn it's used
  player.guardActive = false
  const enemyMoveId = pickEnemyMove(enemy, player, rand)

  const log = []
  const pActor = { ...player, pendingMoveId: playerMoveId }
  const eActor = { ...enemy, pendingMoveId: enemyMoveId }

  const order = turnOrder(pActor, eActor, rand) < 0 ? ['player', 'enemy'] : ['enemy', 'player']

  let liveEnemyTeam = state.enemyTeam.map((c, i) => (i === state.enemyIndex ? enemy : { ...c }))
  const combatants = { player, enemy }

  for (const who of order) {
    const actor = who === 'player' ? combatants.player : combatants.enemy
    const target = who === 'player' ? combatants.enemy : combatants.player
    if (actor.fainted || target.fainted) continue
    const moveId = who === 'player' ? playerMoveId : enemyMoveId
    applyMove(actor, target, moveId, rand, log)
  }

  liveEnemyTeam = liveEnemyTeam.map((c, i) => (i === state.enemyIndex ? combatants.enemy : c))

  let enemyIndex = state.enemyIndex
  let finished = false
  let outcome = null

  if (combatants.player.fainted) {
    finished = true
    outcome = 'loss'
  } else if (combatants.enemy.fainted) {
    const nextIndex = enemyIndex + 1
    if (nextIndex >= liveEnemyTeam.length) {
      finished = true
      outcome = 'win'
    } else {
      enemyIndex = nextIndex
      log.push(`${state.mode === 'pve' ? 'The trainer' : 'Your rival'} sends out ${liveEnemyTeam[nextIndex].label}!`)
    }
  }

  return {
    ...state,
    player: combatants.player,
    enemyTeam: liveEnemyTeam,
    enemyIndex,
    log: [...state.log, `— Turn ${state.turnNumber} —`, ...log],
    finished,
    outcome,
    turnNumber: state.turnNumber + 1,
  }
}

export function flee(state) {
  return { ...state, finished: true, outcome: 'flee', log: [...state.log, 'You fled from the battle.'] }
}
