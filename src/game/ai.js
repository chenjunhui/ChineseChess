import { ROWS, COLS, RED, BLACK } from './constants.js'
import { getValidMoves, kingsAreFacing, isInCheck } from './rules.js'

const PIECE_VALUE = { K: 10000, R: 900, C: 450, N: 400, B: 200, A: 200, P: 100 }

const POS_VALUE = {
  K: [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,2,2,2,0,0,0],
    [0,0,0,11,15,11,0,0,0]
  ],
  A: [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,20,0,20,0,0,0],
    [0,0,0,0,23,0,0,0,0],
    [0,0,0,20,0,20,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ],
  B: [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,20,0,0,0,20,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,23,0,0,0,0],
    [0,0,20,0,0,0,20,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ],
  N: [
    [90,90,90,96,90,96,90,90,90],
    [90,96,103,97,94,97,103,96,90],
    [92,98,99,103,99,103,99,98,92],
    [93,108,100,107,100,107,100,108,93],
    [90,100,99,103,104,103,99,100,90],
    [90,98,101,102,103,102,101,98,90],
    [97,100,101,98,100,98,101,100,97],
    [92,94,98,95,98,95,98,94,92],
    [90,92,94,95,92,95,94,92,90],
    [88,88,90,88,90,88,90,88,88]
  ],
  R: [
    [206,208,207,213,214,213,207,208,206],
    [206,212,209,216,233,216,209,212,206],
    [206,208,207,214,216,214,207,208,206],
    [206,213,213,216,216,216,213,213,206],
    [208,211,211,214,215,214,211,211,208],
    [208,212,212,214,215,214,212,212,208],
    [204,209,204,212,214,212,204,209,204],
    [198,208,204,212,212,212,204,208,198],
    [200,208,206,212,200,212,206,208,200],
    [194,206,204,212,200,212,204,206,194]
  ],
  C: [
    [100,100,96,91,90,91,96,100,100],
    [98,98,96,92,89,92,96,98,98],
    [97,97,96,91,92,91,96,97,97],
    [96,99,99,98,100,98,99,99,96],
    [96,96,96,96,100,96,96,96,96],
    [95,96,99,96,100,96,99,96,95],
    [96,96,96,96,96,96,96,96,96],
    [97,96,100,99,101,99,100,96,97],
    [96,97,98,98,98,98,98,97,96],
    [96,96,97,99,99,99,97,96,96]
  ],
  P: [
    [9,9,9,11,13,11,9,9,9],
    [19,24,34,42,44,42,34,24,19],
    [19,24,32,37,37,37,32,24,19],
    [19,23,27,29,30,29,27,23,19],
    [14,18,20,27,29,27,20,18,14],
    [7,0,13,0,8,0,13,0,7],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ]
}

function evaluate(board, color) {
  let score = 0
  let myPieces = 0
  let enemyPieces = 0
  const enemy = color === RED ? BLACK : RED

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (!p) continue
      const base = PIECE_VALUE[p.type] || 0
      const posTable = POS_VALUE[p.type]
      let pos = 0
      if (posTable) {
        const pr = p.color === RED ? r : (ROWS - 1 - r)
        pos = posTable[pr][c]
      }
      const value = base + pos
      if (p.color === color) {
        score += value
        myPieces += value
      } else {
        score -= value
        enemyPieces += value
      }
    }
  }

  if (isInCheck(board, enemy)) score += 50
  if (isInCheck(board, color)) score -= 50

  return score
}

function simulateMove(board, fromR, fromC, toR, toC) {
  const newBoard = board.map(row => row.slice())
  newBoard[toR][toC] = newBoard[fromR][fromC]
  newBoard[fromR][fromC] = null
  return newBoard
}

function getAllMoves(board, color) {
  const moves = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c]
      if (p && p.color === color) {
        const targets = getValidMoves(board, r, c)
        for (const [toR, toC] of targets) {
          moves.push({ fromR: r, fromC: c, toR, toC })
        }
      }
    }
  }
  return moves
}

function moveScore(board, move) {
  const target = board[move.toR][move.toC]
  if (target) {
    return (PIECE_VALUE[target.type] || 0) * 10 - (PIECE_VALUE[board[move.fromR][move.fromC].type] || 0)
  }
  const centerDist = Math.abs(move.toC - 4) + Math.abs(move.toR - 4.5)
  return -centerDist
}

function orderMoves(board, moves) {
  return moves.sort((a, b) => moveScore(board, b) - moveScore(board, a))
}

function quiesce(board, alpha, beta, maximizing, aiColor) {
  const standPat = evaluate(board, aiColor)
  const color = maximizing ? aiColor : (aiColor === RED ? BLACK : RED)

  if (maximizing) {
    if (standPat >= beta) return beta
    if (standPat > alpha) alpha = standPat
  } else {
    if (standPat <= alpha) return alpha
    if (standPat < beta) beta = standPat
  }

  const moves = getAllMoves(board, color).filter(m => board[m.toR][m.toC])

  if (moves.length === 0) return standPat

  const ordered = orderMoves(board, moves)

  if (maximizing) {
    for (const move of ordered) {
      const sim = simulateMove(board, move.fromR, move.fromC, move.toR, move.toC)
      if (kingsAreFacing(sim) || isInCheck(sim, color)) continue
      const ev = quiesce(sim, alpha, beta, false, aiColor)
      if (ev > alpha) alpha = ev
      if (alpha >= beta) break
    }
    return alpha
  } else {
    for (const move of ordered) {
      const sim = simulateMove(board, move.fromR, move.fromC, move.toR, move.toC)
      if (kingsAreFacing(sim) || isInCheck(sim, color)) continue
      const ev = quiesce(sim, alpha, beta, true, aiColor)
      if (ev < beta) beta = ev
      if (alpha >= beta) break
    }
    return beta
  }
}

function minimax(board, depth, alpha, beta, maximizing, aiColor) {
  if (depth === 0) {
    return quiesce(board, alpha, beta, maximizing, aiColor)
  }

  const color = maximizing ? aiColor : (aiColor === RED ? BLACK : RED)
  const moves = getAllMoves(board, color)

  if (moves.length === 0) {
    return maximizing ? -99999 : 99999
  }

  const ordered = orderMoves(board, moves)

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of ordered) {
      const sim = simulateMove(board, move.fromR, move.fromC, move.toR, move.toC)
      if (kingsAreFacing(sim) || isInCheck(sim, color)) continue
      const ev = minimax(sim, depth - 1, alpha, beta, false, aiColor)
      if (ev > maxEval) maxEval = ev
      if (maxEval > alpha) alpha = maxEval
      if (alpha >= beta) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of ordered) {
      const sim = simulateMove(board, move.fromR, move.fromC, move.toR, move.toC)
      if (kingsAreFacing(sim) || isInCheck(sim, color)) continue
      const ev = minimax(sim, depth - 1, alpha, beta, true, aiColor)
      if (ev < minEval) minEval = ev
      if (minEval < beta) beta = minEval
      if (alpha >= beta) break
    }
    return minEval
  }
}

export function getAIMove(board, aiColor, depth = 2) {
  const moves = getAllMoves(board, aiColor)
  let bestScore = -Infinity
  let bestMove = null

  const ordered = orderMoves(board, moves)

  for (const move of ordered) {
    const sim = simulateMove(board, move.fromR, move.fromC, move.toR, move.toC)
    if (kingsAreFacing(sim) || isInCheck(sim, aiColor)) continue
    const score = minimax(sim, depth - 1, -Infinity, Infinity, false, aiColor)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}
