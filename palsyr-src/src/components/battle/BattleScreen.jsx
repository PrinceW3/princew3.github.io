import { useEffect, useRef, useState } from 'react'
import { initBattle, takeTurn, flee } from '../../lib/battle.js'
import { getMove } from '../../data/moves.js'
import { getSpecies } from '../../data/species.js'

function HPBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function Combatant({ combatant, icon, reverse }) {
  return (
    <div className={`flex items-center gap-3 ${reverse ? 'flex-row-reverse text-right' : ''}`}>
      <div className="text-4xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{combatant.label}</div>
        <HPBar current={combatant.currentHP} max={combatant.maxHP} />
        <div className="text-[10px] text-white/60 mt-0.5">
          {combatant.currentHP}/{combatant.maxHP} HP
        </div>
      </div>
    </div>
  )
}

export default function BattleScreen({ playerPal, enemyTeam, mode = 'pve', title, onComplete, allowFlee = true }) {
  const [state, setState] = useState(() => initBattle({ playerPal, enemyTeam, mode }))
  const [busy, setBusy] = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [state.log])

  const handleMove = (moveId) => {
    if (busy || state.finished) return
    setBusy(true)
    setTimeout(() => {
      setState((s) => takeTurn(s, moveId))
      setBusy(false)
    }, 250)
  }

  const handleFlee = () => {
    if (busy || state.finished) return
    setState((s) => flee(s))
  }

  const playerIcon = getSpecies(playerPal.speciesId)?.icon || '❓'
  const enemyIcon = getSpecies(state.enemyTeam[state.enemyIndex]?.speciesId)?.icon || '❓'

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-bold text-lg">{title || 'Battle'}</h2>
        {allowFlee && !state.finished && (
          <button onClick={handleFlee} className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20">
            Flee
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <Combatant combatant={state.enemyTeam[state.enemyIndex]} icon={enemyIcon} reverse />
        <div className="text-center text-white/40 text-xs">VS</div>
        <Combatant combatant={state.player} icon={playerIcon} />
      </div>

      <div
        ref={logRef}
        className="flex-1 mx-4 mb-3 overflow-y-auto rounded-lg bg-black/30 border border-white/10 p-3 text-xs space-y-1 font-mono"
      >
        {state.log.map((line, i) => (
          <div key={i} className={line.startsWith('—') ? 'text-white/40 mt-1' : 'text-white/80'}>
            {line}
          </div>
        ))}
      </div>

      {!state.finished ? (
        <div className="grid grid-cols-2 gap-2 p-4 pt-0">
          {playerPal.moves.map((moveId) => {
            const move = getMove(moveId)
            return (
              <button
                key={moveId}
                disabled={busy}
                onClick={() => handleMove(moveId)}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 px-2 text-sm font-semibold flex flex-col items-center"
              >
                <span>{move.name}</span>
                <span className="text-[10px] font-normal text-white/70">{move.description}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="p-4 border-t border-white/10">
          <ResultBanner outcome={state.outcome} mode={mode} />
          <button
            onClick={() => onComplete(state)}
            className="mt-3 w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

function ResultBanner({ outcome, mode }) {
  const text =
    outcome === 'win'
      ? mode === 'pve'
        ? 'Victory! Rewards earned.'
        : 'Victory! Your record improves.'
      : outcome === 'loss'
        ? 'You lost this battle. Your Pal will be healed up.'
        : 'You fled the battle. No rewards.'
  const color = outcome === 'win' ? 'text-emerald-400' : outcome === 'loss' ? 'text-red-400' : 'text-yellow-400'
  return <div className={`text-center font-bold ${color}`}>{text}</div>
}
