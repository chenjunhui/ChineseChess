<template>
  <div class="game-result-overlay" @click.self="$emit('close')">
    <div class="game-result">
      <div class="result-icon">{{ winnerColor === game.myColor ? '🎉' : '😢' }}</div>
      <h2>{{ winnerColor === game.myColor ? '恭喜你赢了!' : '很遗憾, 你输了' }}</h2>
      <p>{{ winnerName }} 获胜!{{ reasonText }}</p>
      <div class="result-actions">
        <button class="close-btn" @click="$emit('close')">关闭</button>
        <button class="lobby-btn" @click="backToLobby">返回大厅</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { useLobbyStore } from '../stores/lobby.js'
import router from '../router'

const game = useGameStore()
const lobby = useLobbyStore()

defineEmits(['close'])

const winnerColor = computed(() => game.winner)
const winnerName = computed(() => {
  if (game.winner === game.myColor) return lobby.playerName
  return game.opponentName
})
const reasonText = computed(() => {
  if (game.gameOverReason === 'opponent_left') return ' (对方离开)'
  if (game.gameOverReason === 'stalemate') return ' (困毙)'
  return ''
})

function backToLobby() {
  game.reset()
  router.push('/')
}


</script>

<style scoped>
.game-result-overlay {
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
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.game-result {
  background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
  padding: 48px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  min-width: 360px;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.result-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.game-result h2 {
  margin-bottom: 12px;
  color: #5D4037;
  font-size: 28px;
  font-weight: 600;
}

.game-result p {
  margin-bottom: 32px;
  color: #795548;
  font-size: 18px;
}

.result-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.result-actions button {
  padding: 14px 40px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.result-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.result-actions button:active {
  transform: translateY(0);
}

.close-btn {
  background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);
  color: white;
}

.lobby-btn {
  background: linear-gradient(135deg, #8D6E63 0%, #6D4C41 100%);
  color: white;
}
</style>
