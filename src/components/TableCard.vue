<template>
  <div class="table-card" :class="{ playing: table.isPlaying }">
    <div class="table-header">
      <span class="table-number">第 {{ table.id }} 桌</span>
      <span v-if="table.isPlaying" class="status playing">对弈中</span>
      <span v-else class="status waiting">等待中</span>
    </div>
    <div class="seats">
      <div class="seat" :class="{ occupied: table.seats[0] }">
        <span class="seat-label">红方</span>
        <span class="seat-info">{{ table.seats[0] ? table.seats[0].name : '空位' }}</span>
        <button
          v-if="!table.seats[0] && (!myTableId || myTableId === table.id)"
          class="sit-btn"
          @click="handleSit(table.id, 0)"
        >坐下</button>
      </div>
      <div class="vs">VS</div>
      <div class="seat" :class="{ occupied: table.seats[1] }">
        <span class="seat-label">黑方</span>
        <span class="seat-info">{{ table.seats[1] ? table.seats[1].name : '空位' }}</span>
        <button
          v-if="!table.seats[1] && (!myTableId || myTableId === table.id)"
          class="sit-btn"
          @click="handleSit(table.id, 1)"
        >坐下</button>
      </div>
    </div>
    <button
      v-if="myTableId === table.id"
      class="leave-btn"
      @click="$emit('leave')"
    >离开</button>

    <div v-if="showModeDialog" class="mode-dialog">
      <div class="mode-box">
        <p>选择游戏模式</p>
        <div class="mode-actions">
          <button class="mode-btn single" @click="selectMode('single')">一人玩</button>
          <button class="mode-btn ai" @click="showDepthDialog = true; showModeDialog = false">人机对玩</button>
          <button class="mode-btn cancel" @click="cancelMode">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showDepthDialog" class="mode-dialog">
      <div class="mode-box">
        <p>选择 AI 难度</p>
        <div class="mode-actions">
          <button class="mode-btn easy" @click="selectMode('ai', 1)">简单</button>
          <button class="mode-btn medium" @click="selectMode('ai', 2)">中等</button>
          <button class="mode-btn hard" @click="selectMode('ai', 3)">困难</button>
          <button class="mode-btn cancel" @click="cancelMode">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  table: { type: Object, required: true },
  myTableId: { type: Number, default: null },
  mySeatIndex: { type: Number, default: null }
})

const emit = defineEmits(['sit', 'leave', 'selectMode'])

const showModeDialog = ref(false)
const showDepthDialog = ref(false)
const pendingSeatIndex = ref(null)

function handleSit(tableId, seatIndex) {
  if (props.myTableId === tableId && props.mySeatIndex !== null && props.mySeatIndex !== seatIndex) {
    pendingSeatIndex.value = seatIndex
    showModeDialog.value = true
  } else {
    emit('sit', tableId, seatIndex)
  }
}

function selectMode(mode, depth) {
  emit('selectMode', props.table.id, pendingSeatIndex.value, mode, depth)
  showModeDialog.value = false
  showDepthDialog.value = false
  pendingSeatIndex.value = null
}

function cancelMode() {
  showModeDialog.value = false
  showDepthDialog.value = false
  pendingSeatIndex.value = null
}
</script>

<style scoped>
.table-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  position: relative;
}

.table-card:hover {
  transform: translateY(-2px);
}

.table-card.playing {
  opacity: 0.7;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-number {
  font-weight: bold;
  font-size: 18px;
  color: #5D4037;
}

.status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.status.playing {
  background: #FFCDD2;
  color: #C62828;
}

.status.waiting {
  background: #C8E6C9;
  color: #2E7D32;
}

.seats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seat {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  background: #FAFAFA;
  border-radius: 8px;
  border: 2px solid #E0E0E0;
}

.seat.occupied {
  background: #FFF3E0;
  border-color: #FF9800;
}

.seat-label {
  display: block;
  font-size: 12px;
  color: #9E9E9E;
  margin-bottom: 4px;
}

.seat-info {
  display: block;
  font-weight: bold;
  color: #424242;
  margin-bottom: 8px;
}

.vs {
  font-weight: bold;
  color: #9E9E9E;
}

.sit-btn {
  padding: 6px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}

.sit-btn:hover {
  background: #388E3C;
}

.leave-btn {
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
}

.leave-btn:hover {
  background: #d32f2f;
}

.mode-dialog {
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

.mode-box {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.mode-box p {
  font-size: 18px;
  margin-bottom: 20px;
  color: #424242;
}

.mode-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.mode-btn {
  padding: 10px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.mode-btn.single {
  background: #4CAF50;
  color: white;
}

.mode-btn.ai {
  background: #2196F3;
  color: white;
}

.mode-btn.easy {
  background: #4CAF50;
  color: white;
}

.mode-btn.medium {
  background: #FF9800;
  color: white;
}

.mode-btn.hard {
  background: #f44336;
  color: white;
}

.mode-btn.cancel {
  background: #9E9E9E;
  color: white;
}
</style>
