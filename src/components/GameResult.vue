<template>
  <div class="game-result-overlay" @click.self="$emit('close')">
    <div class="game-result">
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.game-result {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.game-result h2 {
  margin-bottom: 16px;
  color: #5D4037;
  font-size: 28px;
}

.game-result p {
  margin-bottom: 24px;
  color: #795548;
  font-size: 18px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.result-actions button {
  padding: 12px 32px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.close-btn {
  background: #4CAF50;
  color: white;
}

.close-btn:hover {
  background: #388E3C;
}



.lobby-btn {
  background: #8B4513;
  color: white;
}

.lobby-btn:hover {
  background: #A0522D;
}
</style>
