export const ROWS = 10
export const COLS = 9

export const RED = 'red'
export const BLACK = 'black'

export const PIECE_TYPES = {
  K: 'K', // 将/帅
  A: 'A', // 士/仕
  B: 'B', // 象/相
  N: 'N', // 马
  R: 'R', // 车
  C: 'C', // 炮
  P: 'P'  // 兵/卒
}

export const PIECE_NAMES = {
  red: { K: '帅', A: '仕', B: '相', N: '马', R: '车', C: '炮', P: '兵' },
  black: { K: '将', A: '士', B: '象', N: '马', R: '车', C: '炮', P: '卒' }
}

export function createInitialBoard() {
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  const backRow = [PIECE_TYPES.R, PIECE_TYPES.N, PIECE_TYPES.B, PIECE_TYPES.A, PIECE_TYPES.K, PIECE_TYPES.A, PIECE_TYPES.B, PIECE_TYPES.N, PIECE_TYPES.R]

  for (let c = 0; c < COLS; c++) {
    board[0][c] = { type: backRow[c], color: BLACK }
    board[9][c] = { type: backRow[c], color: RED }
  }

  board[2][1] = { type: PIECE_TYPES.C, color: BLACK }
  board[2][7] = { type: PIECE_TYPES.C, color: BLACK }
  board[7][1] = { type: PIECE_TYPES.C, color: RED }
  board[7][7] = { type: PIECE_TYPES.C, color: RED }

  for (let c = 0; c < COLS; c += 2) {
    board[3][c] = { type: PIECE_TYPES.P, color: BLACK }
    board[6][c] = { type: PIECE_TYPES.P, color: RED }
  }

  return board
}
