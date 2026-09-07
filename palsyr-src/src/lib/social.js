// Mock social "server" module. Every social feature (Global Chat, DMs,
// Friends, Trades, Battle Challenges) reads/writes exclusively through this
// file's exported functions. A real backend could later replace just this
// module's internals (swap localStorage calls for fetch calls) without any
// UI code changing, since callers only ever see these function signatures.

import { BOTS, getBot } from '../data/bots.js'
import { loadJSON, saveJSON } from './storage.js'
import { uid as makeId } from './rng.js'
import { loadMasterLog, marketPrice } from './masterLog.js'

const KEY = 'social'

function seedState() {
  const now = Date.now()
  const globalChat = [
    { id: makeId('msg'), authorId: 'bot-nova', authorName: 'Nova', avatar: '🌟', text: 'welcome to global chat, trainers!', ts: now - 1000 * 60 * 40 },
    { id: makeId('msg'), authorId: 'bot-jaxon', authorName: 'Jaxon', avatar: '🪓', text: 'anyone up for a battle later', ts: now - 1000 * 60 * 25 },
    { id: makeId('msg'), authorId: 'bot-wren', authorName: 'Wren', avatar: '🌿', text: 'just bred a new subspecies, so cute', ts: now - 1000 * 60 * 10 },
  ]
  const botRecords = {}
  for (const bot of BOTS) botRecords[bot.id] = { wins: bot.wins, losses: bot.losses }
  return {
    globalChat,
    dms: {},
    friends: [],
    tradeOffers: [],
    playerRecord: { wins: 0, losses: 0 },
    botRecords,
    lastBotChatTs: now,
  }
}

function load() {
  const s = loadJSON(KEY, null)
  if (!s) {
    const fresh = seedState()
    saveJSON(KEY, fresh)
    return fresh
  }
  return s
}

function save(state) {
  saveJSON(KEY, state)
  return state
}

// ---------- Global Chat ----------

export function getGlobalMessages() {
  return load().globalChat
}

export function postGlobalMessage(text) {
  const state = load()
  state.globalChat = [
    ...state.globalChat,
    { id: makeId('msg'), authorId: 'player', authorName: 'You', avatar: '🧑', text, ts: Date.now() },
  ].slice(-100)
  save(state)
  return state.globalChat
}

// Called periodically (e.g. on an interval while the Social panel is open)
// to simulate other players chatting. Returns the (possibly unchanged) feed.
export function maybeGenerateBotChatter(probability = 0.35) {
  const state = load()
  if (Math.random() < probability) {
    const bot = BOTS[Math.floor(Math.random() * BOTS.length)]
    const line = bot.chatLines[Math.floor(Math.random() * bot.chatLines.length)]
    state.globalChat = [
      ...state.globalChat,
      { id: makeId('msg'), authorId: bot.id, authorName: bot.name, avatar: bot.avatar, text: line, ts: Date.now() },
    ].slice(-100)
    state.lastBotChatTs = Date.now()
    save(state)
  }
  return state.globalChat
}

// ---------- Direct Messages ----------

export function getMessages(botId) {
  const state = load()
  return state.dms[botId] || []
}

export function sendMessage(botId, text) {
  const state = load()
  const thread = state.dms[botId] || []
  const playerMsg = { id: makeId('dm'), from: 'player', text, ts: Date.now() }
  const bot = getBot(botId)
  const reply = bot
    ? { id: makeId('dm'), from: botId, text: bot.chatLines[Math.floor(Math.random() * bot.chatLines.length)], ts: Date.now() + 800 }
    : null
  state.dms = { ...state.dms, [botId]: [...thread, playerMsg, ...(reply ? [reply] : [])] }
  save(state)
  return state.dms[botId]
}

// ---------- Friends ----------

export function getFriendsList() {
  const state = load()
  return state.friends.map((id) => getBotProfile(id)).filter(Boolean)
}

export function getAllBotProfiles() {
  const state = load()
  return BOTS.map((b) => ({ ...b, ...state.botRecords[b.id], isFriend: state.friends.includes(b.id) }))
}

export function getBotProfile(botId) {
  const state = load()
  const bot = getBot(botId)
  if (!bot) return null
  return { ...bot, ...state.botRecords[botId], isFriend: state.friends.includes(botId) }
}

export function addFriend(botId) {
  const state = load()
  if (!state.friends.includes(botId)) {
    state.friends = [...state.friends, botId]
    save(state)
  }
  return state.friends
}

export function removeFriend(botId) {
  const state = load()
  state.friends = state.friends.filter((id) => id !== botId)
  save(state)
  return state.friends
}

// ---------- Trades ----------

function palValue(pal) {
  const log = loadMasterLog()
  return marketPrice(log, pal.speciesId, pal.subspeciesId)
}

// offerPals/requestPals are arrays of Pal objects (offerPals = player's,
// requestPals = the bot's chosen roster members). Bots auto-accept when the
// offered value is roughly >= the requested value (within 20% tolerance).
export function sendTradeOffer(botId, offerPals, requestPals) {
  const state = load()
  const bot = getBot(botId)
  const offerValue = offerPals.reduce((sum, p) => sum + palValue(p), 0)
  const requestValue = requestPals.reduce((sum, p) => sum + palValue(p), 0)
  const accepted = offerValue >= requestValue * 0.8
  const record = {
    id: makeId('trade'),
    botId,
    offerPals: offerPals.map((p) => p.id),
    requestPals: requestPals.map((p) => p.id),
    offerValue,
    requestValue,
    status: accepted ? 'accepted' : 'declined',
    ts: Date.now(),
  }
  state.tradeOffers = [record, ...state.tradeOffers].slice(0, 50)
  save(state)
  return {
    accepted,
    record,
    message: accepted
      ? `${bot.name} accepted the trade!`
      : `${bot.name} declined — they wanted a fairer offer (needs ~${Math.ceil(requestValue * 0.8)} value, offered ${offerValue}).`,
  }
}

export function getTradeOffers() {
  return load().tradeOffers
}

// ---------- Battle Challenge ----------

// Returns the bot's currently listed active Pal to hand to the shared
// battle engine (lib/battle.js). The caller drives the actual battle UI.
export function challengeToBattle(botId) {
  const bot = getBot(botId)
  if (!bot) return null
  const activePal = bot.roster.find((p) => p.id === bot.activePalId) || bot.roster[0]
  return { ...activePal, currentHP: activePal.maxHP }
}

export function recordSocialBattleResult(botId, playerWon) {
  const state = load()
  state.playerRecord = {
    wins: state.playerRecord.wins + (playerWon ? 1 : 0),
    losses: state.playerRecord.losses + (playerWon ? 0 : 1),
  }
  const botRecord = state.botRecords[botId] || { wins: 0, losses: 0 }
  state.botRecords = {
    ...state.botRecords,
    [botId]: {
      wins: botRecord.wins + (playerWon ? 0 : 1),
      losses: botRecord.losses + (playerWon ? 1 : 0),
    },
  }
  save(state)
  return state.playerRecord
}

export function getPlayerRecord() {
  return load().playerRecord
}
