const ROWS = 10
const COLS = 9
const RED = 'red'
const BLACK = 'black'

function createInitialBoard() {
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  const backRow = ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R']

  for (let c = 0; c < COLS; c++) {
    board[0][c] = { type: backRow[c], color: BLACK }
    board[9][c] = { type: backRow[c], color: RED }
  }

  board[2][1] = { type: 'C', color: BLACK }
  board[2][7] = { type: 'C', color: BLACK }
  board[7][1] = { type: 'C', color: RED }
  board[7][7] = { type: 'C', color: RED }

  for (let c = 0; c < COLS; c += 2) {
    board[3][c] = { type: 'P', color: BLACK }
    board[6][c] = { type: 'P', color: RED }
  }

  return board
}

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS
}

function inPalace(r, c, color) {
  if (c < 3 || c > 5) return false
  if (color === RED) return r >= 7 && r <= 9
  return r >= 0 && r <= 2
}

function inOwnHalf(r, color) {
  return color === RED ? r >= 5 : r <= 4
}

function getValidMoves(board, fromR, fromC) {
  const piece = board[fromR][fromC]
  if (!piece) return []

  const moves = []
  const { type, color } = piece

  switch (type) {
    case 'K': addKingMoves(board, fromR, fromC, color, moves); break
    case 'A': addAdvisorMoves(board, fromR, fromC, color, moves); break
    case 'B': addBishopMoves(board, fromR, fromC, color, moves); break
    case 'N': addKnightMoves(board, fromR, fromC, color, moves); break
    case 'R': addRookMoves(board, fromR, fromC, color, moves); break
    case 'C': addCannonMoves(board, fromR, fromC, color, moves); break
    case 'P': addPawnMoves(board, fromR, fromC, color, moves); break
  }

  return moves.filter(([r, c]) => {
    const target = board[r][c]
    return !target || target.color !== color
  })
}

function addKingMoves(board, r, c, color, moves) {
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = r + dr, nc = c + dc
    if (inPalace(nr, nc, color)) {
      const t = board[nr][nc]
      if (!t || t.color !== color) moves.push([nr, nc])
    }
  }
}

function addAdvisorMoves(board, r, c, color, moves) {
  for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    const nr = r + dr, nc = c + dc
    if (inPalace(nr, nc, color)) {
      const t = board[nr][nc]
      if (!t || t.color !== color) moves.push([nr, nc])
    }
  }
}

function addBishopMoves(board, r, c, color, moves) {
  for (const [dr, dc] of [[-2, -2], [-2, 2], [2, -2], [2, 2]]) {
    const nr = r + dr, nc = c + dc
    if (inBounds(nr, nc) && inOwnHalf(nr, color)) {
      if (!board[r + dr / 2][c + dc / 2]) {
        const t = board[nr][nc]
        if (!t || t.color !== color) moves.push([nr, nc])
      }
    }
  }
}

function addKnightMoves(board, r, c, color, moves) {
  const knightMoves = [
    [-2, -1, -1, 0], [-2, 1, -1, 0],
    [2, -1, 1, 0], [2, 1, 1, 0],
    [-1, -2, 0, -1], [-1, 2, 0, 1],
    [1, -2, 0, -1], [1, 2, 0, 1]
  ]
  for (const [dr, dc, lr, lc] of knightMoves) {
    const nr = r + dr, nc = c + dc
    if (inBounds(nr, nc) && !board[r + lr][c + lc]) {
      const t = board[nr][nc]
      if (!t || t.color !== color) moves.push([nr, nc])
    }
  }
}

function addRookMoves(board, r, c, color, moves) {
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    let nr = r + dr, nc = c + dc
    while (inBounds(nr, nc)) {
      const t = board[nr][nc]
      if (t) {
        if (t.color !== color) moves.push([nr, nc])
        break
      }
      moves.push([nr, nc])
      nr += dr; nc += dc
    }
  }
}

function addCannonMoves(board, r, c, color, moves) {
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    let nr = r + dr, nc = c + dc, jumped = false
    while (inBounds(nr, nc)) {
      const t = board[nr][nc]
      if (!jumped) {
        if (t) jumped = true
        else moves.push([nr, nc])
      } else {
        if (t) {
          if (t.color !== color) moves.push([nr, nc])
          break
        }
      }
      nr += dr; nc += dc
    }
  }
}

function addPawnMoves(board, r, c, color, moves) {
  const forward = color === RED ? -1 : 1
  const crossed = color === RED ? r <= 4 : r >= 5

  const nr = r + forward
  if (inBounds(nr, c)) {
    const t = board[nr][c]
    if (!t || t.color !== color) moves.push([nr, c])
  }

  if (crossed) {
    for (const dc of [-1, 1]) {
      const nc = c + dc
      if (inBounds(r, nc)) {
        const t = board[r][nc]
        if (!t || t.color !== color) moves.push([r, nc])
      }
    }
  }
}

function findKing(board, color) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.type === 'K' && p.color === color) return [r, c]
    }
  }
  return null
}

function kingsAreFacing(board) {
  const redKing = findKing(board, RED)
  const blackKing = findKing(board, BLACK)
  if (!redKing || !blackKing || redKing[1] !== blackKing[1]) return false
  const minR = Math.min(redKing[0], blackKing[0])
  const maxR = Math.max(redKing[0], blackKing[0])
  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][redKing[1]]) return false
  }
  return true
}

function isInCheck(board, color) {
  const kingPos = findKing(board, color)
  if (!kingPos) return true
  const enemy = color === RED ? BLACK : RED

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.color === enemy) {
        const moves = getValidMoves(board, r, c)
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) return true
      }
    }
  }
  return false
}

function simulateMove(board, fromR, fromC, toR, toC) {
  const newBoard = board.map(row => row.slice())
  newBoard[toR][toC] = newBoard[fromR][fromC]
  newBoard[fromR][fromC] = null
  return newBoard
}

function hasLegalMoves(board, color) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.color === color) {
        const moves = getValidMoves(board, r, c)
        for (const [toR, toC] of moves) {
          if (!kingsAreFacing(simulateMove(board, r, c, toR, toC)) &&
              !isInCheck(simulateMove(board, r, c, toR, toC), color)) {
            return true
          }
        }
      }
    }
  }
  return false
}

export class GameState {
  constructor(playerRed, playerBlack) {
    this.board = createInitialBoard()
    this.currentTurn = RED
    this.playerRed = playerRed
    this.playerBlack = playerBlack
    this.moveHistory = []
    this.lastMovePlayer = null
    this.isSinglePlayer = playerRed.userId === playerBlack.userId
  }

  makeMove(userId, fromR, fromC, toR, toC) {
    const playerColor = this.getPlayerColor(userId, this.currentTurn)
    if (!playerColor) return { error: '你不是这局的玩家' }

    const piece = this.board[fromR][fromC]
    if (!piece) return { error: '该位置没有棋子' }
    if (piece.color !== this.currentTurn) return { error: '不能移动对方的棋子' }

    const validMoves = getValidMoves(this.board, fromR, fromC)
    if (!validMoves.some(([r, c]) => r === toR && c === toC)) return { error: '不合法的走法' }

    const simBoard = simulateMove(this.board, fromR, fromC, toR, toC)
    if (kingsAreFacing(simBoard)) return { error: '不能送将（对面笑）' }
    if (isInCheck(simBoard, playerColor)) return { error: '不能让自己被将军' }

    const captured = this.board[toR][toC]
    this.moveHistory.push({ from: [fromR, fromC], to: [toR, toC], captured, board: this.board.map(r => r.slice()), fromPlayer: userId })
    this.board = simBoard
    this.currentTurn = this.currentTurn === RED ? BLACK : RED
    this.lastMovePlayer = userId

    const enemyColor = playerColor === RED ? BLACK : RED
    if (captured && captured.type === 'K') {
      return { success: true, captured, winner: playerColor, gameOver: true }
    }

    if (!hasLegalMoves(this.board, enemyColor)) {
      return { success: true, captured, winner: playerColor, gameOver: true, reason: 'stalemate' }
    }

    return { success: true, captured, winner: null, gameOver: false }
  }

  requestUndo(userId) {
    if (this.moveHistory.length === 0) return { error: '没有可以撤销的走法' }
    if (this.isSinglePlayer) {
      return { success: true }
    }
    const lastMoveEntry = this.moveHistory[this.moveHistory.length - 1]
    if (lastMoveEntry.fromPlayer !== userId) return { error: '只能撤销自己刚走的棋' }
    return { success: true }
  }

  applyUndo(skipTurnFlip = false) {
    if (this.moveHistory.length === 0) return null
    const lastMove = this.moveHistory.pop()
    this.board = lastMove.board
    if (!skipTurnFlip) {
      this.currentTurn = this.currentTurn === RED ? BLACK : RED
    }
    this.lastMovePlayer = lastMove.fromPlayer
    return this.board
  }

  applySinglePlayerUndo() {
    if (this.moveHistory.length === 0) return null
    if (this.currentTurn === RED) {
      // AI just moved: undo AI's move + player's move before it
      this.moveHistory.pop()
      if (this.moveHistory.length > 0) {
        this.board = this.moveHistory.pop().board
      }
    } else {
      // Player just moved: undo only the player's move
      this.board = this.moveHistory.pop().board
    }
    this.currentTurn = RED
    return this.board
  }

  getPlayerColor(userId, currentTurn = null) {
    if (this.isSinglePlayer && currentTurn) {
      return currentTurn
    }
    if (this.playerRed.userId === userId) return RED
    if (this.playerBlack.userId === userId) return BLACK
    return null
  }

  getPlayerName(color) {
    return color === RED ? this.playerRed.playerName : this.playerBlack.playerName
  }

  getOpponentName(userId) {
    const myColor = this.getPlayerColor(userId)
    if (!myColor) return ''
    const enemyColor = myColor === RED ? BLACK : RED
    return this.getPlayerName(enemyColor)
  }
}
