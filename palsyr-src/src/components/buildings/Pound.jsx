import { useGame } from '../../state/GameContext.jsx'
import { palIcon, speciesLabel } from '../../lib/pals.js'
import PanelShell from '../ui/PanelShell.jsx'

function daysLeft(expiresAt) {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 86400000))
}

export default function Pound({ onClose }) {
  const { player, adoptFromPound, ADOPT_FEE } = useGame()

  return (
    <PanelShell title="Pound" onClose={onClose}>
      <div className="p-4">
        <p className="text-xs text-white/50 mb-4">
          Released Pals wait here for 30 days before being permanently rehomed. Re-adopt for {ADOPT_FEE} 🪙 before
          time runs out.
        </p>
        {player.poundPals.length === 0 ? (
          <div className="text-center text-white/40 text-sm p-6">The pound is empty right now.</div>
        ) : (
          <div className="space-y-2">
            {player.poundPals.map((pal) => (
              <div key={pal.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-3xl">{palIcon(pal)}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{pal.nickname}</div>
                  <div className="text-xs text-white/50">{speciesLabel(pal)}</div>
                  <div className="text-[10px] text-yellow-400">{daysLeft(pal.poundExpiresAt)} days left</div>
                </div>
                <button
                  disabled={player.palsBalance < ADOPT_FEE}
                  onClick={() => adoptFromPound(pal.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 disabled:opacity-40 text-xs font-semibold"
                >
                  Adopt ({ADOPT_FEE} 🪙)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}
