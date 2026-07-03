import { TABLE_COUNT } from './protocol.js'

const tables = []

for (let i = 1; i <= TABLE_COUNT; i++) {
  tables.push({
    id: i,
    seats: [null, null],
    isPlaying: false,
    gameMode: null,
    spectators: []
  })
}

export function getTables() {
  return tables.map(t => ({
    id: t.id,
    seats: t.seats.map(s => s ? { id: s.userId, name: s.playerName } : null),
    isPlaying: t.isPlaying,
    spectatorCount: t.spectators.length
  }))
}

export function getTableById(id) {
  return tables.find(t => t.id === id)
}

export function sitDown(tableId, userId, playerName, seatIndex) {
  const table = getTableById(tableId)
  if (!table) return { error: '桌子不存在' }
  if (table.isPlaying) return { error: '该桌正在进行对局' }

  if (seatIndex < 0 || seatIndex > 1) return { error: '无效的位置' }
  if (table.seats[seatIndex] !== null) return { error: '该位置已有人' }

  const alreadySitting = tables.some(t => t.seats.some(s => s && s.userId === userId))
  if (alreadySitting) return { error: '你已经坐在其他位置' }

  table.seats[seatIndex] = { userId, playerName }

  if (table.seats[0] && table.seats[1]) {
    return { success: true, tableId, seatIndex, startGame: true }
  }

  return { success: true, tableId, seatIndex, startGame: false }
}

export function leaveSeat(tableId, userId) {
  const table = getTableById(tableId)
  if (!table) return -1

  const seatIndex = table.seats.findIndex(s => s && s.userId === userId)
  if (seatIndex === -1) return -1

  table.seats[seatIndex] = null

  if (!table.seats[0] && !table.seats[1]) {
    table.isPlaying = false
  }

  return seatIndex
}

export function removeUser(userId) {
  for (const table of tables) {
    const seatIndex = table.seats.findIndex(s => s && s.userId === userId)
    if (seatIndex !== -1) {
      table.seats[seatIndex] = null

      if (!table.seats[0] && !table.seats[1]) {
        table.isPlaying = false
      }

      return { tableId: table.id, seatIndex }
    }
  }
  return null
}

export function addSpectator(tableId, userId, playerName) {
  const table = getTableById(tableId)
  if (!table) return { error: '桌子不存在' }
  if (!table.isPlaying) return { error: '该桌没有进行中的对局' }
  if (table.spectators.some(s => s.userId === userId)) return { error: '你已经在旁观' }
  table.spectators.push({ userId, playerName })
  return { success: true }
}

export function removeSpectator(tableId, userId) {
  const table = getTableById(tableId)
  if (!table) return false
  const idx = table.spectators.findIndex(s => s.userId === userId)
  if (idx === -1) return false
  table.spectators.splice(idx, 1)
  return true
}
