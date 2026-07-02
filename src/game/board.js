import { ROWS, COLS, createInitialBoard } from './constants.js'

export function makeMove(board, fromR, fromC, toR, toC) {
  const newBoard = board.map(row => row.slice())
  const captured = newBoard[toR][toC]
  newBoard[toR][toC] = newBoard[fromR][fromC]
  newBoard[fromR][fromC] = null
  return { board: newBoard, captured }
}

export function cloneBoard(board) {
  return board.map(row => row.slice())
}
