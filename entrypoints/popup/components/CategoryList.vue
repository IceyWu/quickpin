<script setup lang="ts">
import { computed } from "vue";
import type { Bookmark, Category } from "../../../types/bookmark";
import BookmarkItem from "./BookmarkItem.vue";
import CategoryItem from "./CategoryItem.vue";

const props = defineProps<{
  categories: (Category & { count: number })[];
  bookmarks: Bookmark[];
}>();

const emit = defineEmits<{
  openAll: [categoryId: string];
  openBookmark: [bookmark: Bookmark];
  deleteBookmark: [bookmark: Bookmark];
}>();

const uncategorizedBookmarks = computed(() =>
  props.bookmarks.filter((b) => !b.categoryId)
);
</script>

<template>
  <div class="flex-1 overflow-y-auto px-4 pb-4">
    <!-- Categories -->
    <CategoryItem
      v-for="category in categories"
      :key="category.id"
      :category="category"
      :bookmarks="bookmarks"
      @open-all="$emit('openAll', $event)"
      @open-bookmark="$emit('openBookmark', $event)"
      @delete-bookmark="$emit('deleteBookmark', $event)"
    />

    <!-- Uncategorized -->
    <div v-if="uncategorizedBookmarks.length > 0" class="mt-3">
      <div class="flex items-center gap-2 px-2 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
        <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
        未分类
        <span class="ml-auto px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
          {{ uncategorizedBookmarks.length }}
        </span>
      </div>
      <div class="space-y-1">
        <BookmarkItem
          v-for="bookmark in uncategorizedBookmarks"
          :key="bookmark.id"
          :bookmark="bookmark"
          @open="$emit('openBookmark', $event)"
          @delete="$emit('deleteBookmark', $event)"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="categories.length === 0 && uncategorizedBookmarks.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center animate-fadeIn"
    >
      <div class="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
        <svg class="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">还没有书签</p>
      <p class="text-xs text-slate-400 dark:text-slate-500">点击上方保存当前页面</p>
    </div>
  </div>
</template>
