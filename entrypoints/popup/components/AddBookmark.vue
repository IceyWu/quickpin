<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { Bookmark, Category } from "../../../types/bookmark";

const props = defineProps<{
  categories: Category[];
  existingBookmark: Bookmark | null;
}>();

const emit = defineEmits<{
  save: [
    data: {
      url: string;
      title: string;
      favicon: string;
      categoryId: string | null;
    },
  ];
  update: [
    data: {
      url: string;
      title: string;
      favicon: string;
      categoryId: string | null;
    },
  ];
  addCategory: [name: string];
}>();

const url = ref("");
const title = ref("");
const favicon = ref("");
const categoryId = ref<string | null>(null);
const newCategoryName = ref("");
const showNewCategory = ref(false);
const isSaving = ref(false);

const isExisting = computed(() => props.existingBookmark !== null);

watch(
  () => props.existingBookmark,
  (bookmark) => {
    if (bookmark) {
      url.value = bookmark.url;
      title.value = bookmark.title;
      favicon.value = bookmark.favicon;
      categoryId.value = bookmark.categoryId;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      url.value = tab.url || "";
      title.value = tab.title || "";
      favicon.value = tab.favIconUrl || "";
    }
  } catch (e) {
    console.error("Failed to get current tab:", e);
  }
});

const handleSave = async () => {
  isSaving.value = true;
  const data = {
    url: url.value,
    title: title.value,
    favicon: favicon.value,
    categoryId: categoryId.value,
  };

  if (isExisting.value) {
    emit("update", data);
  } else {
    emit("save", data);
  }

  setTimeout(() => {
    isSaving.value = false;
  }, 500);
};

const handleAddCategory = () => {
  if (newCategoryName.value.trim()) {
    emit("addCategory", newCategoryName.value.trim());
    newCategoryName.value = "";
    showNewCategory.value = false;
  }
};
</script>

<template>
  <div class="mx-4 mb-3 p-4 glass rounded-2xl animate-fadeIn">
    <!-- Current Page Info -->
    <div class="flex items-start gap-3 mb-4">
      <div class="relative">
        <img
          v-if="favicon"
          :src="favicon"
          class="w-12 h-12 rounded-xl shadow-lg object-cover"
          @error="favicon = ''"
        />
        <div v-else class="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div 
          v-if="isExisting"
          class="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
        >
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <input
          v-model="title"
          type="text"
          placeholder="标题"
          class="w-full text-sm font-medium bg-transparent border-0 p-0 focus:ring-0 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
        <p class="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">{{ url }}</p>
        <div 
          v-if="isExisting"
          class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded-full"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          已收藏
        </div>
      </div>
    </div>

    <!-- Category & Save -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <select
          v-if="!showNewCategory"
          v-model="categoryId"
          class="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 appearance-none cursor-pointer transition-all text-slate-700 dark:text-slate-200"
        >
          <option :value="null">未分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <input
          v-else
          v-model="newCategoryName"
          type="text"
          placeholder="新分类名称"
          class="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all text-slate-700 dark:text-slate-200"
          @keyup.enter="handleAddCategory"
          @keyup.esc="showNewCategory = false"
        />
        <svg 
          v-if="!showNewCategory"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <button
        v-if="!showNewCategory"
        @click="showNewCategory = true"
        class="p-2.5 rounded-xl text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
        title="新建分类"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        v-else
        @click="showNewCategory = false"
        class="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button
        v-if="showNewCategory"
        @click="handleAddCategory"
        class="px-4 py-2.5 text-sm font-medium btn-secondary rounded-xl"
      >
        添加
      </button>
      <button
        v-else
        @click="handleSave"
        :disabled="isSaving"
        class="px-5 py-2.5 text-sm font-medium btn-primary rounded-xl disabled:opacity-70"
      >
        <span v-if="!isSaving">{{ isExisting ? '更新' : '保存' }}</span>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    </div>
  </div>
</template>
