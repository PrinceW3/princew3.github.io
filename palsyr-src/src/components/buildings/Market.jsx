import { useMemo, useState } from 'react'
import { useGame } from '../../state/GameContext.jsx'
import { SPECIES, subspeciesForSpecies } from '../../data/species.js'
import { marketPrice } from '../../lib/masterLog.js'
import { mulberry32 } from '../../lib/rng.js'
import { localDateString } from '../../lib/storage.js'
import { palIcon, speciesLabel } from '../../lib/pals.js'
import PanelShell from '../ui/PanelShell.jsx'

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h
}

function useDailyListings(cityId, masterLog) {
  return useMemo(() => {
    const seed = hashString(`${cityId}-${localDateString()}`)
    const rand = mulberry32(seed)
    const count = 6
    const listings = []
    for (let i = 0; i < count; i++) {
      const species = SPECIES[Math.floor(rand() * SPECIES.length)]
      const subs = subspeciesForSpecies(species.id)
      const useSub = subs.length > 0 && rand() < 0.15
      const sub = useSub ? subs[Math.floor(rand() * subs.length)] : null
      const price = Math.round(marketPrice(masterLog, species.id, sub?.id) * (1.15 + rand() * 0.2))
      listings.push({ id: `${species.id}-${sub?.id || 'base'}-${i}`, speciesId: species.id, subspeciesId: sub?.id || null, price })
    }
    return listings
  }, [cityId, masterLog])
}

export default function Market({ cityId, onClose }) {
  const { masterLog, player, buyPal, sellPal } = useGame()
  const [tab, setTab] = useState('buy')
  const listings = useDailyListings(cityId, masterLog)

  return (
    <PanelShell
      title="Market"
      onClose={onClose}
      tabs={
        <div className="flex border-b border-white/10 shrink-0">
          {['buy', 'sell'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize ${tab === t ? 'bg-white/10' : 'text-white/40'}`}
            >
              {t}
            </button>
          ))}
          <div className="flex items-center px-3 text-xs text-white/50 whitespace-nowrap">{player.palsBalance} 🪙</div>
        </div>
      }
    >
      {tab === 'buy' ? (
        <div className="p-3 space-y-2">
          {listings.map((l) => {
            const pal = { speciesId: l.speciesId, subspeciesId: l.subspeciesId, nickname: '' }
            const canAfford = player.palsBalance >= l.price
            return (
              <div key={l.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-3xl">{palIcon(pal)}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{speciesLabel(pal)}</div>
                  <div className="text-xs text-white/50">{l.price} 🪙</div>
                </div>
                <button
                  disabled={!canAfford}
                  onClick={() => buyPal(l.speciesId, l.subspeciesId, l.price)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 disabled:opacity-40 text-xs font-semibold"
                >
                  Buy
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {player.inventory.length === 0 && <div className="text-center text-white/40 text-sm p-6">Nothing to sell.</div>}
          {player.inventory.map((pal) => {
            const price = Math.max(5, Math.round(marketPrice(masterLog, pal.speciesId, pal.subspeciesId) * 0.6))
            return (
              <div key={pal.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-3xl">{palIcon(pal)}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{pal.nickname}</div>
                  <div className="text-xs text-white/50">{speciesLabel(pal)} · sells for {price} 🪙</div>
                </div>
                <button onClick={() => sellPal(pal.id)} className="px-3 py-1.5 rounded-lg bg-red-600/80 text-xs font-semibold">
                  Sell
                </button>
              </div>
            )
          })}
        </div>
      )}
    </PanelShell>
  )
}
