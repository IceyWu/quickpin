import { storageService } from "@/services/storage";
import type { BookmarkData, ImportResult } from "@/types/bookmark";

const CURRENT_VERSION = 1;

export const exportService = {
  async exportToJson(): Promise<string> {
    const [bookmarks, categories] = await Promise.all([
      storageService.getBookmarks(),
      storageService.getCategories(),
    ]);

    const data: BookmarkData = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      bookmarks,
      categories,
    };

    return JSON.stringify(data, null, 2);
  },

  downloadJson(content: string, filename?: string): void {
    const timestamp = new Date().toISOString().slice(0, 10);
    const name = filename || `bookmarks-${timestamp}.json`;
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  validateJsonStructure(data: unknown): data is BookmarkData {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;

    if (!(Array.isArray(d.bookmarks) && Array.isArray(d.categories))) {
      return false;
    }

    // Validate bookmarks structure
    for (const b of d.bookmarks) {
      if (typeof b !== "object" || !b) return false;
      const bookmark = b as Record<string, unknown>;
      if (
        typeof bookmark.id !== "string" ||
        typeof bookmark.url !== "string" ||
        typeof bookmark.title !== "string"
      ) {
        return false;
      }
    }

    // Validate categories structure
    for (const c of d.categories) {
      if (typeof c !== "object" || !c) return false;
      const category = c as Record<string, unknown>;
      if (
        typeof category.id !== "string" ||
        typeof category.name !== "string"
      ) {
        return false;
      }
    }

    return true;
  },

  async importFromJson(
    jsonString: string,
    mode: "merge" | "replace"
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      bookmarksImported: 0,
      categoriesImported: 0,
      errors: [],
    };

    let data: unknown;
    try {
      data = JSON.parse(jsonString);
    } catch {
      result.errors.push("无效的 JSON 格式");
      return result;
    }

    if (!this.validateJsonStructure(data)) {
      result.errors.push("JSON 结构不符合要求");
      return result;
    }

    try {
      if (mode === "replace") {
        await storageService.setBookmarks(data.bookmarks);
        await storageService.setCategories(data.categories);
        result.bookmarksImported = data.bookmarks.length;
        result.categoriesImported = data.categories.length;
      } else {
        // Merge mode
        const [existingBookmarks, existingCategories] = await Promise.all([
          storageService.getBookmarks(),
          storageService.getCategories(),
        ]);

        // Merge categories (skip duplicates by name)
        const existingCatNames = new Set(existingCategories.map((c) => c.name));
        const newCategories = data.categories.filter(
          (c) => !existingCatNames.has(c.name)
        );
        const mergedCategories = [...existingCategories, ...newCategories];

        // Merge bookmarks (skip duplicates by URL)
        const existingUrls = new Set(existingBookmarks.map((b) => b.url));
        const newBookmarks = data.bookmarks.filter(
          (b) => !existingUrls.has(b.url)
        );
        const mergedBookmarks = [...existingBookmarks, ...newBookmarks];

        await storageService.setCategories(mergedCategories);
        await storageService.setBookmarks(mergedBookmarks);

        result.bookmarksImported = newBookmarks.length;
        result.categoriesImported = newCategories.length;
      }

      result.success = true;
    } catch (e) {
      result.errors.push(
        `导入失败: ${e instanceof Error ? e.message : "未知错误"}`
      );
    }

    return result;
  },
};
