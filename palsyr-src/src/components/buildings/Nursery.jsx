import { useState } from 'react'
import { useGame } from '../../state/GameContext.jsx'
import { palIcon, speciesLabel } from '../../lib/pals.js'
import PanelShell from '../ui/PanelShell.jsx'

function fmtMs(ms) {
  const mins = Math.ceil(ms / 60000)
  return `${mins}m`
}

export default function Nursery({ onClose }) {
  const { player, canBreed, breedingRemainingMs, breedPals } = useGame()
  const [parentA, setParentA] = useState(null)
  const [parentB, setParentB] = useState(null)
  const [result, setResult] = useState(null)

  const eligible = player.inventory.filter((p) => canBreed(p.id))

  const doBreed = () => {
    if (!parentA || !parentB || parentA === parentB) return
    const offspring = breedPals(parentA, parentB)
    setResult(offspring)
    setParentA(null)
    setParentB(null)
  }

  return (
    <PanelShell title="Nursery" onClose={onClose}>
      <div className="p-4">
        <p className="text-xs text-white/50 mb-4">
          Breed two of your Pals. 60% chance the offspring shares a parent's species with blended stats — 40% chance
          of a rare subspecies or an entirely new species!
        </p>

        {result && (
          <div className="mb-4 rounded-xl bg-emerald-600/20 border border-emerald-500/40 p-3 text-center">
            <div className="text-4xl">{palIcon(result)}</div>
            <div className="text-sm font-bold mt-1">A new {speciesLabel(result)} was born!</div>
            <div className="text-xs text-white/50">Nicknamed {result.nickname}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <PalPicker label="Parent A" pals={player.inventory} selected={parentA} exclude={parentB} onSelect={setParentA} canBreed={canBreed} breedingRemainingMs={breedingRemainingMs} />
          <PalPicker label="Parent B" pals={player.inventory} selected={parentB} exclude={parentA} onSelect={setParentB} canBreed={canBreed} breedingRemainingMs={breedingRemainingMs} />
        </div>

        <button
          disabled={!parentA || !parentB || parentA === parentB}
          onClick={doBreed}
          className="w-full py-3 rounded-lg bg-indigo-600 disabled:opacity-40 font-semibold"
        >
          Breed
        </button>

        <div className="mt-4 text-xs text-white/40">{eligible.length} of {player.inventory.length} Pals are off cooldown.</div>
      </div>
    </PanelShell>
  )
}

function PalPicker({ label, pals, selected, exclude, onSelect, canBreed, breedingRemainingMs }) {
  return (
    <div>
      <div className="text-xs text-white/40 mb-1">{label}</div>
      <div className="rounded-lg bg-white/5 border border-white/10 max-h-56 overflow-y-auto">
        {pals.map((p) => {
          const onCd = !canBreed(p.id)
          const disabled = onCd || p.id === exclude
          return (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              className={`w-full flex items-center gap-2 px-2 py-2 text-left text-xs border-b border-white/5 last:border-0 disabled:opacity-30 ${
                selected === p.id ? 'bg-indigo-600/40' : ''
              }`}
            >
              <span className="text-lg">{palIcon(p)}</span>
              <span className="flex-1 truncate">{p.nickname}</span>
              {onCd && <span className="text-[9px] text-yellow-400">{fmtMs(breedingRemainingMs(p.id))}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
