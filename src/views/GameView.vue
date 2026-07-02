<template>
  <div class="game-view">
    <div v-if="game.gameOver" class="game-over-banner">
      <h2 v-if="game.gameOverReason === 'opponent_left'">对方已离开，你赢了!</h2>
      <h2 v-else-if="game.gameMode === 'single' || game.gameMode === 'ai'">{{ game.winner === 'red' ? '红方获胜!' : '黑方获胜!' }}</h2>
      <h2 v-else>{{ game.winner === game.myColor ? '你赢了!' : '你输了!' }}</h2>
    </div>

    <div class="game-info">
      <div class="player-info">
        <span class="label">对方:</span>
        <span>{{ game.opponentName }}</span>
        <span class="color-tag" :class="enemyColor">{{ enemyColorName }}</span>
      </div>
      <div class="turn-info" :class="{ myTurn: game.myTurn }">
        <span v-if="game.gameMode === 'single'">
          {{ turnColorName }}走棋
        </span>
        <span v-else>
          {{ game.myTurn ? '轮到你走棋' : '等待对方走棋' }}
        </span>
      </div>
      <div class="player-info">
        <span class="label">我:</span>
        <span>{{ lobby.playerName }}</span>
        <span class="color-tag" :class="game.myColor">{{ myColorName }}</span>
      </div>
    </div>

    <div v-if="game.gameMode === 'single'" class="mode-tag">单人模式</div>
    <div v-if="game.gameMode === 'ai'" class="mode-tag ai">人机对战 - {{ aiDepthName }}</div>
    <div v-if="game.thinking" class="thinking-tag">AI 思考中...</div>

    <ChessBoard
      v-if="game.board"
      :board="game.board"
      :my-color="game.myColor"
      :player-name="lobby.playerName"
      :opponent-name="game.opponentName"
      :selected-piece="game.selectedPiece"
      :valid-moves="game.validMoves"
      :game-mode="game.gameMode"
      :current-turn="game.turn"
      @select="onSelect"
      @move="onMove"
    />

    <div class="controls">
      <button v-if="!game.gameOver && game.lastMove && (game.gameMode === 'single' || game.turn === 'red')" class="undo-btn" @click="game.requestUndo()">
        悔棋
      </button>
      <button class="restart-btn" @click="game.requestRestart()">
        重新开始
      </button>
      <button class="leave-btn" @click="leaveGame">离开对局</button>
    </div>

    <div v-if="game.pendingUndo" class="undo-dialog">
      <div class="undo-box">
        <p>{{ game.undoRequestFrom }} 请求悔棋</p>
        <div class="undo-actions">
          <button class="accept" @click="game.respondUndo(true)">同意</button>
          <button class="reject" @click="game.respondUndo(false)">拒绝</button>
        </div>
      </div>
    </div>

    <div v-if="game.pendingRestart" class="undo-dialog">
      <div class="undo-box">
        <p>{{ game.restartRequestFrom }} 请求重新开始</p>
        <div class="undo-actions">
          <button class="accept" @click="game.respondRestart(true)">同意</button>
          <button class="reject" @click="game.respondRestart(false)">拒绝</button>
        </div>
      </div>
    </div>

    <GameResult v-if="game.gameOver && showResult" @close="showResult = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/game.js'
import { useLobbyStore } from '../stores/lobby.js'
import ChessBoard from '../components/ChessBoard.vue'
import GameResult from '../components/GameResult.vue'
import router from '../router'

const game = useGameStore()
const lobby = useLobbyStore()
const showResult = ref(false)

watch(() => game.gameOver, (val) => {
  if (val) showResult.value = true
})

const enemyColor = computed(() => game.myColor === 'red' ? 'black' : 'red')
const myColorName = computed(() => game.myColor === 'red' ? '红方' : '黑方')
const enemyColorName = computed(() => enemyColor.value === 'red' ? '红方' : '黑方')
const turnColorName = computed(() => game.turn === 'red' ? '红方' : '黑方')
const aiDepthName = computed(() => {
  const names = { 1: '简单', 2: '中等', 3: '困难' }
  return names[game.aiDepth] || '中等'
})

function onSelect(r, c) {
  game.selectPiece(r, c)
}

function onMove(fromR, fromC, toR, toC) {
  game.movePiece(fromR, fromC, toR, toC)
}

function leaveGame() {
  if (!game.gameOver) {
    const solo = game.gameMode === 'single' || game.gameMode === 'ai'
    const msg = solo ? '确定要离开对局吗？' : '确定要离开对局吗？离开将判负。'
    if (!confirm(msg)) return
  }
  game.reset()
  showResult.value = false
  lobby.leave()
  router.push('/')
}
</script>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.game-over-banner {
  background: linear-gradient(135deg, #FF6F00, #FF8F00);
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.game-over-banner h2 {
  margin: 0;
  font-size: 24px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.label {
  color: #9E9E9E;
}

.color-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.color-tag.red {
  background: #FFCDD2;
  color: #C62828;
}

.color-tag.black {
  background: #CFD8DC;
  color: #37474F;
}

.turn-info {
  padding: 8px 16px;
  border-radius: 8px;
  background: #E0E0E0;
  color: #616161;
  font-weight: bold;
}

.turn-info.myTurn {
  background: #C8E6C9;
  color: #2E7D32;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.controls {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.undo-btn {
  padding: 10px 24px;
  font-size: 16px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 8px;
}

.undo-btn:hover {
  background: #F57C00;
}

.restart-btn {
  padding: 10px 24px;
  font-size: 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
}

.restart-btn:hover {
  background: #1976D2;
}

.leave-btn {
  padding: 10px 24px;
  font-size: 16px;
  background: #9E9E9E;
  color: white;
  border: none;
  border-radius: 8px;
}

.leave-btn:hover {
  background: #757575;
}

.mode-tag {
  margin-top: 8px;
  padding: 4px 12px;
  background: #9C27B0;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.mode-tag.ai {
  background: #1565C0;
}

.thinking-tag {
  margin-top: 8px;
  padding: 4px 12px;
  background: #FF9800;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  animation: pulse 1s infinite;
}

.undo-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.undo-box {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.undo-box p {
  font-size: 18px;
  margin-bottom: 20px;
  color: #424242;
}

.undo-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.undo-actions button {
  padding: 10px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
}

.undo-actions .accept {
  background: #4CAF50;
  color: white;
}

.undo-actions .reject {
  background: #f44336;
  color: white;
}
</style>
