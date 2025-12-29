import { onMounted, onUnmounted, ref } from "vue";
import { bookmarkService } from "../../../services/bookmark";
import { storageService } from "../../../services/storage";
import type { Bookmark } from "../../../types/bookmark";

export function useBookmarks() {
  const bookmarks = ref<Bookmark[]>([]);
  const loading = ref(true);
  let unwatch: (() => void) | null = null;

  const loadBookmarks = async () => {
    loading.value = true;
    bookmarks.value = await storageService.getBookmarks();
    loading.value = false;
  };

  const addBookmark = async (
    data: Omit<Bookmark, "id" | "createdAt" | "updatedAt">
  ) => {
    return await bookmarkService.addBookmark(data);
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    return await bookmarkService.updateBookmark(id, updates);
  };

  const deleteBookmark = async (id: string) => {
    return await bookmarkService.deleteBookmark(id);
  };

  const getBookmarkByUrl = async (url: string) => {
    return await bookmarkService.getBookmarkByUrl(url);
  };

  const searchBookmarks = async (query: string) => {
    return await bookmarkService.searchBookmarks(query);
  };

  onMounted(async () => {
    await loadBookmarks();
    unwatch = storageService.watchBookmarks((newBookmarks) => {
      bookmarks.value = newBookmarks;
    });
  });

  onUnmounted(() => {
    unwatch?.();
  });

  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmarkByUrl,
    searchBookmarks,
    refresh: loadBookmarks,
  };
}
