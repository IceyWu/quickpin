import { computed, ref, watch } from "vue";
import type { Bookmark } from "../../../types/bookmark";

export function useSearch(bookmarks: { value: Bookmark[] }) {
  const searchQuery = ref("");
  const isSearching = computed(() => searchQuery.value.trim().length > 0);

  const filteredBookmarks = computed(() => {
    if (!isSearching.value) return bookmarks.value;

    const query = searchQuery.value.toLowerCase();
    return bookmarks.value.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query)
    );
  });

  const clearSearch = () => {
    searchQuery.value = "";
  };

  return {
    searchQuery,
    isSearching,
    filteredBookmarks,
    clearSearch,
  };
}
