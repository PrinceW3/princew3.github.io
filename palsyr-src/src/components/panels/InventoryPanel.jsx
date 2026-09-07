import { useState } from 'react'
import { useGame } from '../../state/GameContext.jsx'
import { palIcon, palColor, speciesLabel, statTotal } from '../../lib/pals.js'
import PanelShell from '../ui/PanelShell.jsx'

function PalCard({ pal, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 flex flex-col items-center text-center relative"
      style={{ boxShadow: pal.isActiveBattler ? `0 0 0 2px ${palColor(pal)}` : undefined }}
    >
      {pal.isActiveBattler && (
        <span className="absolute top-1 right-1 text-[9px] bg-emerald-600 rounded-full px-1.5 py-0.5">ACTIVE</span>
      )}
      <div className="text-3xl">{palIcon(pal)}</div>
      <div className="text-xs font-semibold mt-1 truncate w-full">{pal.nickname}</div>
      <div className="text-[10px] text-white/50">{speciesLabel(pal)}</div>
      <div className="text-[10px] text-white/40">HP {pal.currentHP}/{pal.maxHP}</div>
    </button>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function PalDetail({ pal, onBack }) {
  const { renamePal, setActiveBattler, releaseToPound } = useGame()
  const [nickname, setNickname] = useState(pal.nickname)

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-sm text-white/60 mb-3">
        ← Back
      </button>
      <div className="flex flex-col items-center mb-4">
        <div className="text-6xl">{palIcon(pal)}</div>
        <div className="text-xs text-white/50 mt-1">{speciesLabel(pal)}</div>
      </div>

      <label className="block text-xs text-white/50 mb-1">Nickname</label>
      <div className="flex gap-2 mb-4">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
          maxLength={20}
        />
        <button
          onClick={() => renamePal(pal.id, nickname.trim() || pal.nickname)}
          className="px-3 py-2 rounded-lg bg-indigo-600 text-sm font-semibold"
        >
          Save
        </button>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-3 mb-4">
        <StatRow label="Strength" value={pal.stats.strength} />
        <StatRow label="Speed" value={pal.stats.speed} />
        <StatRow label="Cuteness" value={pal.stats.cuteness} />
        <StatRow label="Luck" value={pal.stats.luck} />
        <StatRow label="Stat Total" value={statTotal(pal)} />
        <StatRow label="HP" value={`${pal.currentHP}/${pal.maxHP}`} />
      </div>

      <button
        onClick={() => setActiveBattler(pal.id)}
        disabled={pal.isActiveBattler}
        className="w-full py-2.5 rounded-lg bg-emerald-600 disabled:opacity-40 font-semibold text-sm mb-2"
      >
        {pal.isActiveBattler ? 'Currently Active Battler' : 'Set as Active Battler'}
      </button>
      <button
        onClick={() => {
          releaseToPound(pal.id)
          onBack()
        }}
        className="w-full py-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 font-semibold text-sm"
      >
        Release to Pound
      </button>
    </div>
  )
}

export default function InventoryPanel({ onClose }) {
  const { player } = useGame()
  const [selected, setSelected] = useState(null)

  const selectedPal = player.inventory.find((p) => p.id === selected)

  return (
    <PanelShell title={`Inventory (${player.inventory.length})`} onClose={onClose}>
      {selectedPal ? (
        <PalDetail pal={selectedPal} onBack={() => setSelected(null)} />
      ) : player.inventory.length === 0 ? (
        <div className="p-8 text-center text-white/50 text-sm">No Pals yet — go explore the wild biomes!</div>
      ) : (
        <div className="grid grid-cols-3 gap-3 p-4">
          {player.inventory.map((pal) => (
            <PalCard key={pal.id} pal={pal} onClick={() => setSelected(pal.id)} />
          ))}
        </div>
      )}
    </PanelShell>
  )
}
