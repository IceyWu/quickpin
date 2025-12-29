<script setup lang="ts">
import { storage } from "@wxt-dev/storage";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { bookmarkService } from "@/services/bookmark";
import { categoryService } from "@/services/category";
import { storageService } from "@/services/storage";
import type { Bookmark, Category } from "@/types/bookmark";
import FloatingButton from "./components/FloatingButton.vue";
import FloatingPanel from "./components/FloatingPanel.vue";

const isOpen = ref(false);
const isBookmarked = ref(false);
const categories = ref<Category[]>([]);
const bookmarks = ref<Bookmark[]>([]);
const searchQuery = ref("");
const buttonPosition = ref({ x: 20, y: window.innerHeight - 100 });

// 使用 @wxt-dev/storage 同步开关状态
const panelStateItem = storage.defineItem<boolean>(
  "local:quickpin-panel-open",
  {
    fallback: false,
  }
);

let unwatchPanelState: (() => void) | null = null;
let unwatchBookmarks: (() => void) | null = null;
let unwatchCategories: (() => void) | null = null;

const pageInfo = ref({
  url: window.location.href,
  title: document.title,
  favicon: getFavicon(),
});

function getFavicon(): string {
  const link = document.querySelector<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel*="icon"]'
  );
  if (link?.href) return link.href;
  return `${window.location.origin}/favicon.ico`;
}

// 按分类分组的书签
const groupedBookmarks = computed(() => {
  const query = searchQuery.value.toLowerCase();
  let filtered = bookmarks.value;

  if (query) {
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query)
    );
  }

  const groups: { category: Category | null; bookmarks: Bookmark[] }[] = [];

  // 未分类
  const uncategorized = filtered.filter((b) => !b.categoryId);
  if (uncategorized.length > 0) {
    groups.push({ category: null, bookmarks: uncategorized });
  }

  // 按分类分组
  for (const cat of categories.value) {
    const catBookmarks = filtered.filter((b) => b.categoryId === cat.id);
    if (catBookmarks.length > 0) {
      groups.push({ category: cat, bookmarks: catBookmarks });
    }
  }

  return groups;
});

async function loadData() {
  const [cats, bms] = await Promise.all([
    categoryService.getCategories(),
    bookmarkService.searchBookmarks(""),
  ]);
  categories.value = cats;
  bookmarks.value = bms;

  const bookmark = await bookmarkService.getBookmarkByUrl(pageInfo.value.url);
  isBookmarked.value = bookmark !== null;
}

async function handleSave(data: { categoryId: string | null }) {
  await bookmarkService.addBookmark({
    url: pageInfo.value.url,
    title: pageInfo.value.title,
    favicon: pageInfo.value.favicon,
    categoryId: data.categoryId,
  });
  isBookmarked.value = true;
  await loadData();
}

async function handleAddCategory(name: string) {
  await categoryService.addCategory(name);
  await loadData();
}

async function handleOpenBookmark(bookmark: Bookmark) {
  window.open(bookmark.url, "_blank");
}

async function handleOpenAllBookmarks(bookmarks: Bookmark[]) {
  for (const bookmark of bookmarks) {
    window.open(bookmark.url, "_blank");
  }
}

async function handleEditBookmark(
  id: string,
  updates: { title: string; url: string }
) {
  await bookmarkService.updateBookmark(id, updates);
  await loadData();
}

async function handleDeleteBookmark(bookmark: Bookmark) {
  await bookmarkService.deleteBookmark(bookmark.id);
  await loadData();
}

function handleToggle() {
  isOpen.value = !isOpen.value;
  panelStateItem.setValue(isOpen.value);
}

function handleClose() {
  isOpen.value = false;
  panelStateItem.setValue(false);
}

function handlePositionUpdate(pos: { x: number; y: number }) {
  buttonPosition.value = pos;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }
}

onMounted(async () => {
  // 加载面板状态
  isOpen.value = await panelStateItem.getValue();

  // 监听其他标签页的状态变化
  unwatchPanelState = panelStateItem.watch((newValue) => {
    isOpen.value = newValue;
  });

  // 监听书签数据变化
  unwatchBookmarks = storageService.watchBookmarks(async (newBookmarks) => {
    bookmarks.value = newBookmarks;
    const bookmark = await bookmarkService.getBookmarkByUrl(pageInfo.value.url);
    isBookmarked.value = bookmark !== null;
  });

  // 监听分类数据变化
  unwatchCategories = storageService.watchCategories((newCategories) => {
    categories.value = newCategories;
  });

  await loadData();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (unwatchPanelState) {
    unwatchPanelState();
  }
  if (unwatchBookmarks) {
    unwatchBookmarks();
  }
  if (unwatchCategories) {
    unwatchCategories();
  }
});
</script>

<template>
  <div class="bookmark-widget">
    <FloatingButton
      :is-bookmarked="isBookmarked"
      :is-open="isOpen"
      @toggle="handleToggle"
      @update:position="handlePositionUpdate"
    />
    <FloatingPanel
      v-if="isOpen"
      :page-info="pageInfo"
      :categories="categories"
      :is-bookmarked="isBookmarked"
      :grouped-bookmarks="groupedBookmarks"
      :search-query="searchQuery"
      :button-position="buttonPosition"
      @save="handleSave"
      @add-category="handleAddCategory"
      @open-bookmark="handleOpenBookmark"
      @open-all-bookmarks="handleOpenAllBookmarks"
      @edit-bookmark="handleEditBookmark"
      @delete-bookmark="handleDeleteBookmark"
      @update:search-query="searchQuery = $event"
      @data-imported="loadData"
      @close="handleClose"
    />
  </div>
</template>

<style>
.bookmark-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
