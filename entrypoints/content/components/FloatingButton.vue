<script setup lang="ts">
import { storage } from "@wxt-dev/storage";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import iconUrl from "@/assets/icon.svg";

const props = defineProps<{
  isBookmarked: boolean;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  "update:position": [pos: { x: number; y: number }];
}>();

// 主题同步
const themeMode = ref<"light" | "dark" | "system">("system");
const themeItem = storage.defineItem<"light" | "dark" | "system">(
  "local:quickpin-theme",
  {
    fallback: "system",
  }
);

const isDark = computed(() => {
  if (themeMode.value === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return themeMode.value === "dark";
});

let unwatchTheme: (() => void) | null = null;

// 拖拽状态
const position = ref({ x: 20, y: window.innerHeight - 100 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const hasMoved = ref(false);

// 使用 chrome.storage 同步位置
const positionItem = storage.defineItem<{ x: number; y: number }>(
  "local:quickpin-position",
  {
    fallback: { x: 20, y: 500 },
  }
);

let unwatchPosition: (() => void) | null = null;

// 加载位置
async function loadPosition() {
  try {
    const saved = await positionItem.getValue();
    position.value = {
      x: Math.min(Math.max(0, saved.x), window.innerWidth - 56),
      y: Math.min(Math.max(0, saved.y), window.innerHeight - 56),
    };
  } catch (e) {
    console.error("Failed to load widget position:", e);
  }
}

// 保存位置
async function savePosition() {
  try {
    await positionItem.setValue({ ...position.value });
  } catch (e) {
    console.error("Failed to save widget position:", e);
  }
}

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true;
  hasMoved.value = false;
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  dragStart.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y,
  };
  e.preventDefault();
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  const newX = clientX - dragStart.value.x;
  const newY = clientY - dragStart.value.y;

  // 检测是否移动了
  if (
    Math.abs(newX - position.value.x) > 5 ||
    Math.abs(newY - position.value.y) > 5
  ) {
    hasMoved.value = true;
  }

  // 限制在视口内
  position.value = {
    x: Math.min(Math.max(0, newX), window.innerWidth - 56),
    y: Math.min(Math.max(0, newY), window.innerHeight - 56),
  };
}

function endDrag() {
  if (isDragging.value) {
    isDragging.value = false;
    savePosition();
  }
}

function handleClick() {
  // 只有没有拖动时才触发点击
  if (!hasMoved.value) {
    emit("toggle");
  }
}

const buttonStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}));

// 监听位置变化，通知父组件
watch(
  position,
  (newPos) => {
    emit("update:position", { ...newPos });
  },
  { deep: true }
);

onMounted(async () => {
  // 加载主题
  themeMode.value = await themeItem.getValue();
  unwatchTheme = themeItem.watch((newValue) => {
    themeMode.value = newValue;
  });

  await loadPosition();
  // 初始化时也通知父组件
  emit("update:position", { ...position.value });

  // 监听其他标签页的位置变化
  unwatchPosition = positionItem.watch((newValue) => {
    if (!isDragging.value) {
      position.value = {
        x: Math.min(Math.max(0, newValue.x), window.innerWidth - 56),
        y: Math.min(Math.max(0, newValue.y), window.innerHeight - 56),
      };
    }
  });

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchmove", onDrag);
  document.addEventListener("touchend", endDrag);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", endDrag);
  if (unwatchPosition) {
    unwatchPosition();
  }
  if (unwatchTheme) {
    unwatchTheme();
  }
});
</script>

<template>
  <button
    class="floating-button"
    :class="{ 
      'is-bookmarked': isBookmarked, 
      'is-open': isOpen,
      'is-dragging': isDragging,
      'dark': isDark
    }"
    :style="buttonStyle"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @click="handleClick"
  >
    <img class="button-icon" :src="iconUrl" alt="" />
    <span v-if="isBookmarked" class="status-dot"></span>
  </button>
</template>

<style scoped>
.floating-button {
  position: fixed;
  z-index: 2147483647;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  border: none;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  user-select: none;
  touch-action: none;
}

.floating-button.dark {
  background: #27272a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.floating-button:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
}

.floating-button.dark:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.floating-button:active,
.floating-button.is-dragging {
  cursor: grabbing;
  transform: scale(1.02);
}

.floating-button.is-open {
  transform: scale(1.08);
  box-shadow: 0 8px 30px rgba(129, 140, 248, 0.4), 0 0 0 3px rgba(129, 140, 248, 0.3);
}

.floating-button.is-bookmarked {
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3), 0 0 0 2px rgba(34, 197, 94, 0.4);
}

.button-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.floating-button.dark .button-icon {
  filter: invert(1);
}

.status-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.floating-button.dark .status-dot {
  border-color: #27272a;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
</style>
