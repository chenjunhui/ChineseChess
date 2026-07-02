import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wsClient } from '../ws/client.js'
import { MSG } from '../ws/protocol.js'
import { getValidMoves } from '../game/rules.js'
import { getAIMove } from '../game/ai.js'

export const useGameStore = defineStore('game', () => {
  const tableId = ref(null)
  const board = ref(null)
  const myColor = ref(null)
  const opponentName = ref('')
  const selectedPiece = ref(null)
  const validMoves = ref([])
  const turn = ref('red')
  const gameOver = ref(false)
  const winner = ref(null)
  const gameOverReason = ref(null)
  const lastMove = ref(null)
  const pendingUndo = ref(false)
  const undoRequestFrom = ref(null)
  const pendingRestart = ref(false)
  const restartRequestFrom = ref(null)
  const gameMode = ref('multiplayer')
  const thinking = ref(false)
  const aiDepth = ref(2)

  const myTurn = computed(() => {
    if (gameMode.value === 'single') return true
    return turn.value === myColor.value
  })

  function startGame(payload) {
    tableId.value = payload.tableId
    board.value = payload.board
    myColor.value = payload.yourColor
    opponentName.value = payload.opponentName
    turn.value = 'red'
    gameOver.value = false
    winner.value = null
    lastMove.value = null
    selectedPiece.value = null
    validMoves.value = []
    gameMode.value = payload.gameMode || 'multiplayer'
    aiDepth.value = payload.aiDepth || 2
    thinking.value = false

    wsClient.on(MSG.GAME_MOVED, (p) => {
      board.value = p.board
      turn.value = p.turn
      lastMove.value = { from: p.from, to: p.to }
      selectedPiece.value = null
      validMoves.value = []

      if (gameMode.value === 'ai' && turn.value !== myColor.value && !gameOver.value) {
        thinking.value = true
        setTimeout(() => {
          const move = getAIMove(board.value, turn.value, aiDepth.value)
          if (move && !gameOver.value) {
            wsClient.send(MSG.GAME_MOVE, { from: [move.fromR, move.fromC], to: [move.toR, move.toC] })
          }
          thinking.value = false
        }, 500)
      }
    })

    wsClient.on(MSG.GAME_OVER, (p) => {
      gameOver.value = true
      winner.value = p.winner
      gameOverReason.value = p.reason
    })

    wsClient.on(MSG.OPPONENT_LEFT, (p) => {
      gameOver.value = true
      winner.value = myColor.value
      gameOverReason.value = 'opponent_left'
    })

    wsClient.on(MSG.GAME_UNDO_REQUEST, (p) => {
      undoRequestFrom.value = p.fromPlayer
      pendingUndo.value = true
    })

    wsClient.on(MSG.GAME_UNDO_RESULT, (p) => {
      board.value = p.board
      turn.value = p.turn
      lastMove.value = null
      selectedPiece.value = null
      validMoves.value = []
      pendingUndo.value = false
    })

    wsClient.on(MSG.GAME_RESTART_REQUEST, (p) => {
      restartRequestFrom.value = p.fromPlayer
      pendingRestart.value = true
    })

    wsClient.on(MSG.ERROR, (p) => {
      alert(p.message)
    })
  }

  function selectPiece(r, c) {
    if (gameOver.value || thinking.value) return
    if (gameMode.value !== 'single' && !myTurn.value) return
    const piece = board.value[r][c]
    if (!piece || (gameMode.value !== 'single' && piece.color !== myColor.value)) {
      selectedPiece.value = null
      validMoves.value = []
      return
    }
    selectedPiece.value = [r, c]
    validMoves.value = getValidMoves(board.value, r, c)
  }

  function movePiece(fromR, fromC, toR, toC) {
    if (gameOver.value || thinking.value) return
    if (gameMode.value !== 'single' && !myTurn.value) return
    wsClient.send(MSG.GAME_MOVE, { from: [fromR, fromC], to: [toR, toC] })
  }

  function requestUndo() {
    if (gameMode.value === 'ai' && !confirm('要撤回 AI 的走法吗？')) return
    wsClient.send(MSG.GAME_UNDO, { tableId: tableId.value })
  }

  function respondUndo(accept) {
    wsClient.send(MSG.GAME_UNDO_RESPOND, { tableId: tableId.value, accept })
    pendingUndo.value = false
    undoRequestFrom.value = null
  }

  function requestRestart() {
    if ((gameMode.value === 'single' || gameMode.value === 'ai') && !confirm('你想重新开始玩吗？')) return
    wsClient.send(MSG.GAME_RESTART, { tableId: tableId.value })
  }

  function respondRestart(accept) {
    wsClient.send(MSG.GAME_RESTART_RESPOND, { tableId: tableId.value, accept })
    pendingRestart.value = false
    restartRequestFrom.value = null
  }

  function reset() {
    tableId.value = null
    board.value = null
    myColor.value = null
    opponentName.value = ''
    turn.value = 'red'
    gameOver.value = false
    winner.value = null
    gameOverReason.value = null
    lastMove.value = null
    selectedPiece.value = null
    validMoves.value = []
    pendingUndo.value = false
    undoRequestFrom.value = null
    pendingRestart.value = false
    restartRequestFrom.value = null
    gameMode.value = 'multiplayer'
    thinking.value = false
    aiDepth.value = 2
  }

  return {
    tableId, board, myColor, opponentName, selectedPiece, validMoves,
    turn, gameOver, winner, gameOverReason, lastMove, pendingUndo, undoRequestFrom, myTurn,
    pendingRestart, restartRequestFrom, gameMode, thinking, aiDepth,
    startGame, selectPiece, movePiece, requestUndo, respondUndo, requestRestart, respondRestart, reset
  }
})
