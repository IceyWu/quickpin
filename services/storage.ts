import { storage } from "@wxt-dev/storage";
import type { Bookmark, Category } from "@/types/bookmark";

const bookmarksItem = storage.defineItem<Bookmark[]>("local:bookmarks", {
  fallback: [],
  version: 1,
});

const categoriesItem = storage.defineItem<Category[]>("local:categories", {
  fallback: [],
  version: 1,
});

export const storageService = {
  // Bookmarks
  getBookmarks: () => bookmarksItem.getValue(),
  setBookmarks: (bookmarks: Bookmark[]) => bookmarksItem.setValue(bookmarks),
  watchBookmarks: (
    callback: (newValue: Bookmark[], oldValue: Bookmark[]) => void
  ) => bookmarksItem.watch(callback),

  // Categories
  getCategories: () => categoriesItem.getValue(),
  setCategories: (categories: Category[]) =>
    categoriesItem.setValue(categories),
  watchCategories: (
    callback: (newValue: Category[], oldValue: Category[]) => void
  ) => categoriesItem.watch(callback),
};
