import { useEffect, useRef, useState } from 'react'
import PanelShell from '../ui/PanelShell.jsx'
import { useGame } from '../../state/GameContext.jsx'
import { palIcon, speciesLabel } from '../../lib/pals.js'
import {
  getGlobalMessages,
  postGlobalMessage,
  maybeGenerateBotChatter,
  getAllBotProfiles,
  getBotProfile,
  addFriend,
  removeFriend,
  getMessages,
  sendMessage,
  sendTradeOffer,
  getPlayerRecord,
} from '../../lib/social.js'

const TABS = [
  { id: 'global', label: 'Global Chat' },
  { id: 'friends', label: 'Friends' },
]

function TimeAgo({ ts }) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000))
  return <span className="text-[10px] text-white/30">{mins < 1 ? 'now' : `${mins}m ago`}</span>
}

function GlobalChatTab() {
  const [messages, setMessages] = useState(getGlobalMessages())
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    const iv = setInterval(() => setMessages([...maybeGenerateBotChatter(0.4)]), 6000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    setMessages(postGlobalMessage(text.trim()))
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="flex gap-2 items-start">
            <div className="text-xl leading-none">{m.avatar}</div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold">{m.authorName}</span>
                <TimeAgo ts={m.ts} />
              </div>
              <div className="text-sm text-white/80 break-words">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Say something..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
          maxLength={140}
        />
        <button onClick={send} className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold">
          Send
        </button>
      </div>
    </div>
  )
}

function FriendsTab({ onOpenProfile }) {
  const [profiles, setProfiles] = useState(getAllBotProfiles())
  const friends = profiles.filter((p) => p.isFriend)
  const others = profiles.filter((p) => !p.isFriend)

  const toggleFriend = (bot) => {
    if (bot.isFriend) removeFriend(bot.id)
    else addFriend(bot.id)
    setProfiles(getAllBotProfiles())
  }

  const Row = ({ bot }) => (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
      <button onClick={() => onOpenProfile(bot.id)} className="flex items-center gap-3 flex-1 text-left">
        <div className="text-3xl">{bot.avatar}</div>
        <div>
          <div className="font-semibold text-sm">{bot.name}</div>
          <div className="text-xs text-white/50">
            {bot.wins}W - {bot.losses}L · {bot.roster.length} Pals
          </div>
        </div>
      </button>
      <button
        onClick={() => toggleFriend(bot)}
        className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
          bot.isFriend ? 'bg-white/10 hover:bg-white/20' : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
      >
        {bot.isFriend ? 'Friends' : 'Add'}
      </button>
    </div>
  )

  return (
    <div className="p-3 space-y-4">
      {friends.length > 0 && (
        <div>
          <div className="text-xs text-white/40 uppercase font-semibold mb-2">Your Friends</div>
          <div className="space-y-2">
            {friends.map((b) => (
              <Row key={b.id} bot={b} />
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="text-xs text-white/40 uppercase font-semibold mb-2">Other Trainers</div>
        <div className="space-y-2">
          {others.map((b) => (
            <Row key={b.id} bot={b} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DMThread({ botId }) {
  const [thread, setThread] = useState(getMessages(botId))
  const [text, setText] = useState('')

  const send = () => {
    if (!text.trim()) return
    setThread(sendMessage(botId, text.trim()))
    setText('')
  }

  return (
    <div className="mt-3">
      <div className="text-xs text-white/40 uppercase font-semibold mb-2">Direct Messages</div>
      <div className="space-y-2 max-h-40 overflow-y-auto mb-2 rounded-lg bg-black/20 p-2">
        {thread.length === 0 && <div className="text-xs text-white/30 p-2">No messages yet. Say hi!</div>}
        {thread.map((m) => (
          <div key={m.id} className={`text-xs px-2 py-1 rounded-lg max-w-[80%] ${m.from === 'player' ? 'bg-indigo-600 ml-auto' : 'bg-white/10'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
          maxLength={140}
        />
        <button onClick={send} className="px-3 py-2 rounded-lg bg-indigo-600 text-xs font-semibold">
          Send
        </button>
      </div>
    </div>
  )
}

function TradePanel({ botId, bot }) {
  const { player } = useGame()
  const [offerId, setOfferId] = useState(null)
  const [requestId, setRequestId] = useState(null)
  const [result, setResult] = useState(null)

  const offerPal = player.inventory.find((p) => p.id === offerId)
  const requestPal = bot.roster.find((p) => p.id === requestId)

  const propose = () => {
    if (!offerPal || !requestPal) return
    const res = sendTradeOffer(botId, [offerPal], [requestPal])
    setResult(res)
  }

  return (
    <div className="mt-4">
      <div className="text-xs text-white/40 uppercase font-semibold mb-2">Propose a Trade</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-[10px] text-white/40 mb-1">Your Pal</div>
          <select
            value={offerId || ''}
            onChange={(e) => setOfferId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs"
          >
            <option value="">Select...</option>
            {player.inventory.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nickname}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-[10px] text-white/40 mb-1">{bot.name}'s Pal</div>
          <select
            value={requestId || ''}
            onChange={(e) => setRequestId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs"
          >
            <option value="">Select...</option>
            {bot.roster.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nickname}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={propose}
        disabled={!offerPal || !requestPal}
        className="w-full py-2 rounded-lg bg-indigo-600 disabled:opacity-40 text-xs font-semibold"
      >
        Propose Trade
      </button>
      {result && (
        <div className={`mt-2 text-xs p-2 rounded-lg ${result.accepted ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-600/30 text-red-300'}`}>
          {result.message}
        </div>
      )}
    </div>
  )
}

function BotProfileView({ botId, onBack, onBattle }) {
  const [bot, setBot] = useState(getBotProfile(botId))
  useEffect(() => setBot(getBotProfile(botId)), [botId])
  if (!bot) return null

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-sm text-white/60 mb-3">
        ← Back
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-5xl">{bot.avatar}</div>
        <div>
          <div className="font-bold text-lg">{bot.name}</div>
          <div className="text-xs text-white/50">
            {bot.wins}W - {bot.losses}L
          </div>
        </div>
        <button
          onClick={() => {
            if (bot.isFriend) removeFriend(bot.id)
            else addFriend(bot.id)
            setBot(getBotProfile(botId))
          }}
          className={`ml-auto text-xs px-3 py-1.5 rounded-full font-semibold ${bot.isFriend ? 'bg-white/10' : 'bg-indigo-600'}`}
        >
          {bot.isFriend ? 'Friends' : 'Add Friend'}
        </button>
      </div>

      <div className="text-xs text-white/40 uppercase font-semibold mb-2">Pal Roster</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {bot.roster.map((p) => (
          <div key={p.id} className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
            <div className="text-2xl">{palIcon(p)}</div>
            <div className="text-[10px] font-semibold truncate">{p.nickname}</div>
            <div className="text-[9px] text-white/40">{speciesLabel(p)}</div>
          </div>
        ))}
      </div>

      <button onClick={() => onBattle(bot)} className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-semibold text-sm">
        Challenge to Battle
      </button>

      <TradePanel botId={botId} bot={bot} />
      <DMThread botId={botId} />
    </div>
  )
}

export default function SocialPanel({ onClose, onBattle }) {
  const [tab, setTab] = useState('global')
  const [profileId, setProfileId] = useState(null)
  const record = getPlayerRecord()

  return (
    <PanelShell
      title="Social"
      onClose={onClose}
      tabs={
        !profileId && (
          <div className="flex border-b border-white/10 shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 text-sm font-semibold ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/40'}`}
              >
                {t.label}
              </button>
            ))}
            <div className="flex items-center px-3 text-xs text-white/40">
              {record.wins}W-{record.losses}L
            </div>
          </div>
        )
      }
    >
      {profileId ? (
        <BotProfileView botId={profileId} onBack={() => setProfileId(null)} onBattle={onBattle} />
      ) : tab === 'global' ? (
        <GlobalChatTab />
      ) : (
        <FriendsTab onOpenProfile={setProfileId} />
      )}
    </PanelShell>
  )
}
