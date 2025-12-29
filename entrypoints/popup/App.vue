<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Bookmark } from "../../types/bookmark";
import AddBookmark from "./components/AddBookmark.vue";
import CategoryList from "./components/CategoryList.vue";
import Header from "./components/Header.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import { useBookmarks } from "./composables/useBookmarks";
import { useCategories } from "./composables/useCategories";
import { useSearch } from "./composables/useSearch";
import { useTheme } from "./composables/useTheme";

useTheme();

const {
  bookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  getBookmarkByUrl,
  refresh: refreshBookmarks,
} = useBookmarks();
const { categories, addCategory, refresh: refreshCategories } = useCategories();
const { searchQuery, isSearching, filteredBookmarks } = useSearch(bookmarks);

const showSettings = ref(false);
const existingBookmark = ref<Bookmark | null>(null);

onMounted(async () => {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url) {
      existingBookmark.value = await getBookmarkByUrl(tab.url);
    }
  } catch (e) {
    console.error("Failed to check existing bookmark:", e);
  }
});

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handleSave = async (data: {
  url: string;
  title: string;
  favicon: string;
  categoryId: string | null;
}) => {
  await addBookmark(data);
  existingBookmark.value = await getBookmarkByUrl(data.url);
};

const handleUpdate = async (data: {
  url: string;
  title: string;
  favicon: string;
  categoryId: string | null;
}) => {
  if (existingBookmark.value) {
    await updateBookmark(existingBookmark.value.id, data);
    existingBookmark.value = await getBookmarkByUrl(data.url);
  }
};

const handleAddCategory = async (name: string) => {
  await addCategory(name);
};

const handleOpenBookmark = async (bookmark: Bookmark) => {
  await browser.tabs.create({ url: bookmark.url });
};

const handleDeleteBookmark = async (bookmark: Bookmark) => {
  if (confirm(`确定要删除 "${bookmark.title}" 吗？`)) {
    await deleteBookmark(bookmark.id);
  }
};

const handleOpenAll = async (categoryId: string) => {
  const categoryBookmarks = bookmarks.value.filter(
    (b) => b.categoryId === categoryId
  );
  for (const bookmark of categoryBookmarks) {
    await browser.tabs.create({ url: bookmark.url, active: false });
    await new Promise((r) => setTimeout(r, 100));
  }
};

const handleImported = () => {
  refreshBookmarks();
  refreshCategories();
};
</script>

<template>
  <div class="w-[420px] h-[560px] flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
    <!-- Animated background orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    
    <!-- Noise texture overlay -->
    <div class="absolute inset-0 opacity-[0.015] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.8&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E');"></div>
    
    <!-- Content -->
    <div class="relative z-10 flex flex-col h-full">
      <Header @search="handleSearch" @open-settings="showSettings = true" />

      <AddBookmark
        :categories="categories"
        :existing-bookmark="existingBookmark"
        @save="handleSave"
        @update="handleUpdate"
        @add-category="handleAddCategory"
      />

      <CategoryList
        :categories="categories"
        :bookmarks="isSearching ? filteredBookmarks : bookmarks"
        @open-all="handleOpenAll"
        @open-bookmark="handleOpenBookmark"
        @delete-bookmark="handleDeleteBookmark"
      />
      
      <!-- Bottom fade -->
      <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 dark:from-slate-900/80 to-transparent pointer-events-none z-20"></div>
    </div>

    <SettingsPanel
      v-if="showSettings"
      @close="showSettings = false"
      @imported="handleImported"
    />
  </div>
</template>
