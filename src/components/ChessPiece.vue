<template>
  <div class="chess-piece" :class="[color, { selected, valid }]" @click="$emit('click')">
    {{ name }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PIECE_NAMES } from '../game/constants.js'

const props = defineProps({
  type: { type: String, required: true },
  color: { type: String, required: true },
  selected: { type: Boolean, default: false },
  valid: { type: Boolean, default: false }
})

defineEmits(['click'])

const name = computed(() => PIECE_NAMES[props.color][props.type])
</script>

<style scoped>
.chess-piece {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid #8B6914;
  user-select: none;
  z-index: 2;
  background:
    radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), transparent 60%),
    radial-gradient(circle at 65% 70%, rgba(0,0,0,0.15), transparent 50%),
    linear-gradient(135deg, #D4A050 0%, #C4903A 25%, #B8842E 50%, #C4903A 75%, #D4A050 100%);
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,0.4),
    inset 0 -1px 2px rgba(0,0,0,0.2),
    0 2px 4px rgba(0,0,0,0.3);
}

.chess-piece.red {
  border-color: #A02020;
  color: #A01010;
  text-shadow: 0 1px 1px rgba(255,255,255,0.3);
}

.chess-piece.black {
  border-color: #3E2723;
  color: #1B0000;
  text-shadow: 0 1px 1px rgba(255,255,255,0.3);
}

.chess-piece.selected {
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,0.4),
    inset 0 -1px 2px rgba(0,0,0,0.2),
    0 0 0 3px #FFC107,
    0 2px 6px rgba(0,0,0,0.4);
  transform: translate(-50%, -50%) scale(1.1);
}

.chess-piece.valid {
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,0.4),
    inset 0 -1px 2px rgba(0,0,0,0.2),
    0 0 0 3px #4CAF50,
    0 2px 4px rgba(0,0,0,0.3);
}

.chess-piece:hover {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,0.4),
    inset 0 -1px 2px rgba(0,0,0,0.2),
    0 3px 8px rgba(0,0,0,0.4);
}
</style>
