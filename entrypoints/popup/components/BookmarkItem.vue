<script setup lang="ts">
import { ref } from "vue";
import type { Bookmark } from "../../../types/bookmark";

const props = defineProps<{
  bookmark: Bookmark;
}>();

const emit = defineEmits<{
  open: [bookmark: Bookmark];
  delete: [bookmark: Bookmark];
}>();

const showMenu = ref(false);

const handleClick = () => {
  emit("open", props.bookmark);
};

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  showMenu.value = true;
};

const closeMenu = () => {
  showMenu.value = false;
};

const handleDelete = () => {
  closeMenu();
  emit("delete", props.bookmark);
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};
</script>

<template>
  <div
    class="group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 card-hover"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <div class="relative">
      <img
        v-if="bookmark.favicon"
        :src="bookmark.favicon"
        class="w-8 h-8 rounded-lg shadow-sm object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div v-else class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
        <span class="text-xs font-medium text-slate-400">{{ bookmark.title[0]?.toUpperCase() }}</span>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
        {{ bookmark.title }}
      </p>
      <p class="text-xs text-slate-400 dark:text-slate-500 truncate">
        {{ getDomain(bookmark.url) }}
      </p>
    </div>

    <button
      @click.stop="showMenu = !showMenu"
      class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>

    <!-- Context Menu -->
    <div
      v-if="showMenu"
      class="absolute right-2 top-full mt-1 z-20 glass rounded-xl shadow-xl py-1 min-w-[100px] animate-fadeIn"
      @click.stop
    >
      <button
        @click="handleDelete"
        class="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        删除
      </button>
    </div>
  </div>

  <!-- Backdrop -->
  <div
    v-if="showMenu"
    class="fixed inset-0 z-10"
    @click="closeMenu"
  />
</template>
