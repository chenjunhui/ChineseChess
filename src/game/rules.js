import { ROWS, COLS, RED, BLACK } from './constants.js'

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

export function getValidMoves(board, fromR, fromC) {
  const piece = board[fromR][fromC]
  if (!piece) return []

  const moves = []
  const { type, color } = piece

  switch (type) {
    case 'K':
      addKingMoves(board, fromR, fromC, color, moves)
      break
    case 'A':
      addAdvisorMoves(board, fromR, fromC, color, moves)
      break
    case 'B':
      addBishopMoves(board, fromR, fromC, color, moves)
      break
    case 'N':
      addKnightMoves(board, fromR, fromC, color, moves)
      break
    case 'R':
      addRookMoves(board, fromR, fromC, color, moves)
      break
    case 'C':
      addCannonMoves(board, fromR, fromC, color, moves)
      break
    case 'P':
      addPawnMoves(board, fromR, fromC, color, moves)
      break
  }

  return moves.filter(([r, c]) => {
    const target = board[r][c]
    return !target || target.color !== color
  })
}

function addKingMoves(board, r, c, color, moves) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (inPalace(nr, nc, color)) {
      const target = board[nr][nc]
      if (!target || target.color !== color) {
        moves.push([nr, nc])
      }
    }
  }
}

function addAdvisorMoves(board, r, c, color, moves) {
  const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (inPalace(nr, nc, color)) {
      const target = board[nr][nc]
      if (!target || target.color !== color) {
        moves.push([nr, nc])
      }
    }
  }
}

function addBishopMoves(board, r, c, color, moves) {
  const dirs = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (inBounds(nr, nc) && inOwnHalf(nr, color)) {
      const eyeR = r + dr / 2
      const eyeC = c + dc / 2
      if (!board[eyeR][eyeC]) {
        const target = board[nr][nc]
        if (!target || target.color !== color) {
          moves.push([nr, nc])
        }
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
    const nr = r + dr
    const nc = c + dc
    if (inBounds(nr, nc)) {
      const legR = r + lr
      const legC = c + lc
      if (!board[legR][legC]) {
        const target = board[nr][nc]
        if (!target || target.color !== color) {
          moves.push([nr, nc])
        }
      }
    }
  }
}

function addRookMoves(board, r, c, color, moves) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of dirs) {
    let nr = r + dr
    let nc = c + dc
    while (inBounds(nr, nc)) {
      const target = board[nr][nc]
      if (target) {
        if (target.color !== color) moves.push([nr, nc])
        break
      }
      moves.push([nr, nc])
      nr += dr
      nc += dc
    }
  }
}

function addCannonMoves(board, r, c, color, moves) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of dirs) {
    let nr = r + dr
    let nc = c + dc
    let jumped = false
    while (inBounds(nr, nc)) {
      const target = board[nr][nc]
      if (!jumped) {
        if (target) {
          jumped = true
        } else {
          moves.push([nr, nc])
        }
      } else {
        if (target) {
          if (target.color !== color) moves.push([nr, nc])
          break
        }
      }
      nr += dr
      nc += dc
    }
  }
}

function addPawnMoves(board, r, c, color, moves) {
  const forward = color === RED ? -1 : 1
  const crossed = color === RED ? r <= 4 : r >= 5

  const nr = r + forward
  if (inBounds(nr, c)) {
    const target = board[nr][c]
    if (!target || target.color !== color) {
      moves.push([nr, c])
    }
  }

  if (crossed) {
    for (const dc of [-1, 1]) {
      const nc = c + dc
      if (inBounds(r, nc)) {
        const target = board[r][nc]
        if (!target || target.color !== color) {
          moves.push([r, nc])
        }
      }
    }
  }
}

export function findKing(board, color) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.type === 'K' && p.color === color) {
        return [r, c]
      }
    }
  }
  return null
}

export function kingsAreFacing(board) {
  const redKing = findKing(board, RED)
  const blackKing = findKing(board, BLACK)
  if (!redKing || !blackKing) return false
  if (redKing[1] !== blackKing[1]) return false

  const minR = Math.min(redKing[0], blackKing[0])
  const maxR = Math.max(redKing[0], blackKing[0])
  for (let r = minR + 1; r < maxR; r++) {
    if (board[r][redKing[1]]) return false
  }
  return true
}

export function isInCheck(board, color) {
  const kingPos = findKing(board, color)
  if (!kingPos) return true
  const enemy = color === RED ? BLACK : RED

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.color === enemy) {
        const moves = getValidMoves(board, r, c)
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
          return true
        }
      }
    }
  }
  return false
}

export function wouldBeInCheck(board, fromR, fromC, toR, toC) {
  const newBoard = board.map(row => row.slice())
  newBoard[toR][toC] = newBoard[fromR][fromC]
  newBoard[fromR][fromC] = null
  const color = newBoard[toR][toC].color
  return isInCheck(newBoard, color)
}

export function isLegalMove(board, fromR, fromC, toR, toC) {
  const piece = board[fromR][fromC]
  if (!piece) return false

  const validMoves = getValidMoves(board, fromR, fromC)
  if (!validMoves.some(([r, c]) => r === toR && c === toC)) return false
  if (wouldBeInCheck(board, fromR, fromC, toR, toC)) return false
  if (kingsAreFacing(board.map(row => {
    const newRow = row.slice()
    return newRow
  }).map((row, r) => {
    if (r === fromR) {
      const newRow = [...row]
      newRow[fromC] = null
      return newRow
    }
    if (r === toR) {
      const newRow = [...row]
      newRow[toC] = board[fromR][fromC]
      return newRow
    }
    return row
  }))) return false

  const simBoard = board.map(row => row.slice())
  simBoard[toR][toC] = simBoard[fromR][fromC]
  simBoard[fromR][fromC] = null
  if (kingsAreFacing(simBoard)) return false

  return true
}
