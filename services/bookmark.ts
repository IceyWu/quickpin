import { storageService } from "@/services/storage";
import type { Bookmark } from "@/types/bookmark";

function generateId(): string {
  return `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const bookmarkService = {
  async addBookmark(
    bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt">
  ): Promise<Bookmark> {
    const bookmarks = await storageService.getBookmarks();
    const now = Date.now();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    bookmarks.push(newBookmark);
    await storageService.setBookmarks(bookmarks);
    return newBookmark;
  },

  async updateBookmark(
    id: string,
    updates: Partial<Omit<Bookmark, "id" | "createdAt">>
  ): Promise<Bookmark | null> {
    const bookmarks = await storageService.getBookmarks();
    const index = bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return null;

    bookmarks[index] = {
      ...bookmarks[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await storageService.setBookmarks(bookmarks);
    return bookmarks[index];
  },

  async deleteBookmark(id: string): Promise<boolean> {
    const bookmarks = await storageService.getBookmarks();
    const index = bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return false;

    bookmarks.splice(index, 1);
    await storageService.setBookmarks(bookmarks);
    return true;
  },

  async getBookmarkByUrl(url: string): Promise<Bookmark | null> {
    const bookmarks = await storageService.getBookmarks();
    return bookmarks.find((b) => b.url === url) || null;
  },

  async getBookmarkById(id: string): Promise<Bookmark | null> {
    const bookmarks = await storageService.getBookmarks();
    return bookmarks.find((b) => b.id === id) || null;
  },

  async moveBookmark(id: string, categoryId: string | null): Promise<boolean> {
    const bookmark = await this.updateBookmark(id, { categoryId });
    return bookmark !== null;
  },

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const bookmarks = await storageService.getBookmarks();
    if (!query.trim()) return bookmarks;

    const lowerQuery = query.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.url.toLowerCase().includes(lowerQuery)
    );
  },

  async getBookmarksByCategory(categoryId: string | null): Promise<Bookmark[]> {
    const bookmarks = await storageService.getBookmarks();
    return bookmarks.filter((b) => b.categoryId === categoryId);
  },
};
