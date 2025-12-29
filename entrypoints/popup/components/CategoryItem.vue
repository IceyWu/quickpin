<script setup lang="ts">
import { computed, ref } from "vue";
import type { Bookmark, Category } from "../../../types/bookmark";
import BookmarkItem from "./BookmarkItem.vue";

const props = defineProps<{
  category: Category & { count: number };
  bookmarks: Bookmark[];
}>();

const emit = defineEmits<{
  openAll: [categoryId: string];
  openBookmark: [bookmark: Bookmark];
  deleteBookmark: [bookmark: Bookmark];
}>();

const expanded = ref(true);
const showWarning = ref(false);

const categoryBookmarks = computed(() =>
  props.bookmarks.filter((b) => b.categoryId === props.category.id)
);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};

const handleOpenAll = () => {
  if (categoryBookmarks.value.length > 10) {
    showWarning.value = true;
  } else {
    emit("openAll", props.category.id);
  }
};

const confirmOpenAll = () => {
  showWarning.value = false;
  emit("openAll", props.category.id);
};
</script>

<template>
  <div class="mb-2 glass rounded-xl overflow-hidden animate-fadeIn">
    <!-- Category Header -->
    <div
      class="flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      @click="toggleExpand"
    >
      <div
        class="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
        :style="{ backgroundColor: category.color, boxShadow: `0 2px 8px ${category.color}50` }"
      />
      <span class="flex-1 font-medium text-sm text-slate-700 dark:text-slate-200">
        {{ category.name }}
      </span>
      <span class="text-xs text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
        {{ category.count }}
      </span>
      <button
        v-if="categoryBookmarks.length > 0"
        @click.stop="handleOpenAll"
        class="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
        title="打开全部"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
      <svg
        class="w-4 h-4 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Bookmarks -->
    <div v-show="expanded" class="border-t border-slate-100 dark:border-slate-800">
      <BookmarkItem
        v-for="bookmark in categoryBookmarks"
        :key="bookmark.id"
        :bookmark="bookmark"
        @open="$emit('openBookmark', $event)"
        @delete="$emit('deleteBookmark', $event)"
      />
      <div
        v-if="categoryBookmarks.length === 0"
        class="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center"
      >
        暂无书签
      </div>
    </div>

    <!-- Warning Modal -->
    <div
      v-if="showWarning"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click="showWarning = false"
    >
      <div
        class="glass rounded-2xl p-5 m-4 max-w-sm shadow-xl animate-slideUp"
        @click.stop
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800 dark:text-slate-100">确认打开</h3>
            <p class="text-sm text-slate-500">将打开 {{ categoryBookmarks.length }} 个标签页</p>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button
            @click="showWarning = false"
            class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmOpenAll"
            class="px-4 py-2 text-sm font-medium btn-primary rounded-xl"
          >
            确定打开
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
