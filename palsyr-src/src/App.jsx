import { useCallback, useRef, useState } from 'react'
import { GameProvider, useGame } from './state/GameContext.jsx'
import GameCanvas from './components/game/GameCanvas.jsx'
import DPad from './components/game/DPad.jsx'
import Minimap from './components/game/Minimap.jsx'
import BottomMenu from './components/game/BottomMenu.jsx'
import StarterSelect from './components/panels/StarterSelect.jsx'
import InventoryPanel from './components/panels/InventoryPanel.jsx'
import JobsPanel from './components/panels/JobsPanel.jsx'
import MasterLogPanel from './components/panels/MasterLogPanel.jsx'
import SocialPanel from './components/panels/SocialPanel.jsx'
import Market from './components/buildings/Market.jsx'
import Nursery from './components/buildings/Nursery.jsx'
import Pound from './components/buildings/Pound.jsx'
import BattleScreen from './components/battle/BattleScreen.jsx'
import WildEncounterModal from './components/modals/WildEncounterModal.jsx'
import { biomeEncounterSpecies } from './data/world.js'
import { getTrainer } from './data/trainers.js'
import { buildTrainerTeam } from './lib/trainerPals.js'
import { challengeToBattle, recordSocialBattleResult } from './lib/social.js'
import { getCity } from './data/cities.js'

const WILD_ENCOUNTER_CHANCE = 0.14

const BUILDING_COMPONENTS = { market: Market, nursery: Nursery, pound: Pound }

function GameShell() {
  const {
    player,
    movePlayer,
    getActivePal,
    catchWildPal,
    canEncounterToday,
    isTrainerDefeatedToday,
    defeatTrainer,
    healActivePal,
  } = useGame()

  const canvasRef = useRef(null)
  const [panel, setPanel] = useState(null) // 'inventory'|'jobs'|'masterlog'|'social'
  const [building, setBuilding] = useState(null) // { cityId, buildingType }
  const [wildEncounter, setWildEncounter] = useState(null) // { speciesId }
  const [battle, setBattle] = useState(null) // { mode, title, enemyTeam, onFinish }
  const [socialRefreshTick, setSocialRefreshTick] = useState(0)

  const anyOverlayOpen = !!(panel || building || wildEncounter || battle)

  const handleArrive = useCallback(
    (tile) => {
      movePlayer(tile.x, tile.y)
      if (anyOverlayOpen) return

      if (tile.buildingType) {
        setBuilding({ cityId: tile.cityId, buildingType: tile.buildingType })
        return
      }

      if (tile.trainerId && !isTrainerDefeatedToday(tile.trainerId)) {
        const trainer = getTrainer(tile.trainerId)
        const activePal = getActivePal()
        if (!trainer || !activePal) return
        const enemyTeam = buildTrainerTeam(trainer)
        setBattle({
          mode: 'pve',
          title: `Trainer battle: ${trainer.name}`,
          enemyTeam,
          playerPal: activePal,
          onFinish: (outcome) => {
            if (outcome === 'win') defeatTrainer(trainer.id, trainer.rewardPals)
            healActivePal()
            setBattle(null)
          },
        })
        return
      }

      if (tile.zone === 'wild' && canEncounterToday()) {
        if (Math.random() < WILD_ENCOUNTER_CHANCE) {
          const species = biomeEncounterSpecies(tile.biome)
          if (species.length) {
            const speciesId = species[Math.floor(Math.random() * species.length)]
            setWildEncounter({ speciesId })
          }
        }
      }
    },
    [anyOverlayOpen, movePlayer, isTrainerDefeatedToday, getActivePal, defeatTrainer, healActivePal, canEncounterToday],
  )

  const startSocialBattle = useCallback(
    (bot) => {
      const enemyPal = challengeToBattle(bot.id)
      const activePal = getActivePal()
      if (!enemyPal || !activePal) return
      setBattle({
        mode: 'social',
        title: `Battle vs ${bot.name}`,
        enemyTeam: [enemyPal],
        playerPal: activePal,
        onFinish: (outcome) => {
          recordSocialBattleResult(bot.id, outcome === 'win')
          healActivePal()
          setBattle(null)
          setSocialRefreshTick((t) => t + 1)
        },
      })
    },
    [getActivePal, healActivePal],
  )

  const closePanel = () => setPanel(null)
  const city = building ? getCity(building.cityId) : null
  const BuildingComponent = building ? BUILDING_COMPONENTS[building.buildingType] : null

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950">
      <div className="relative w-full max-w-[430px] h-full sm:h-[820px] flex flex-col bg-slate-900 sm:rounded-2xl overflow-hidden sm:border sm:border-white/10 sm:my-4 shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2 bg-black/40 shrink-0 text-white text-xs">
          <span className="font-black tracking-tight text-sm">Palsyr</span>
          <div className="flex items-center gap-3">
            <span>🪙 {player.palsBalance}</span>
            <span>🎣 {3 - player.dailyEncounters.count}/3</span>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black">
          <GameCanvas
            ref={canvasRef}
            player={player}
            isTrainerDefeatedToday={isTrainerDefeatedToday}
            disabled={anyOverlayOpen}
            onArrive={handleArrive}
            width={390}
            height={420}
          />
          <Minimap player={player} />
          <div className="absolute bottom-3 right-3 z-20">
            <DPad onMove={(dir) => canvasRef.current?.move(dir)} disabled={anyOverlayOpen} />
          </div>
        </div>

        <BottomMenu onOpen={setPanel} />

        {panel === 'inventory' && <InventoryPanel onClose={closePanel} />}
        {panel === 'jobs' && <JobsPanel onClose={closePanel} />}
        {panel === 'masterlog' && <MasterLogPanel onClose={closePanel} />}
        {panel === 'social' && <SocialPanel key={socialRefreshTick} onClose={closePanel} onBattle={startSocialBattle} />}

        {building && BuildingComponent && (
          <BuildingComponent cityId={building.cityId} cityName={city?.name} onClose={() => setBuilding(null)} />
        )}

        {wildEncounter && (
          <WildEncounterModal
            speciesId={wildEncounter.speciesId}
            onCatch={() => {
              catchWildPal(wildEncounter.speciesId)
              setWildEncounter(null)
            }}
            onDismiss={() => setWildEncounter(null)}
          />
        )}

        {battle && (
          <BattleScreen
            playerPal={battle.playerPal}
            enemyTeam={battle.enemyTeam}
            mode={battle.mode}
            title={battle.title}
            onComplete={(state) => battle.onFinish(state.outcome)}
          />
        )}
      </div>
    </div>
  )
}

function GameRoot() {
  const { player } = useGame()
  if (!player.starterChosen) return <StarterSelect />
  return <GameShell />
}

export default function App() {
  return (
    <GameProvider>
      <div className="h-screen w-screen overflow-hidden">
        <GameRoot />
      </div>
    </GameProvider>
  )
}
