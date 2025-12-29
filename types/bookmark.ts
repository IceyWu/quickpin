export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon: string;
  categoryId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: number;
}

export interface BookmarkData {
  version: number;
  exportedAt?: string;
  bookmarks: Bookmark[];
  categories: Category[];
}

export interface ImportResult {
  success: boolean;
  bookmarksImported: number;
  categoriesImported: number;
  errors: string[];
}

export type CreateBookmarkInput = Omit<
  Bookmark,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateBookmarkInput = Partial<Omit<Bookmark, "id" | "createdAt">>;
export type CreateCategoryInput = Omit<Category, "id" | "order" | "createdAt">;
export type UpdateCategoryInput = Partial<Omit<Category, "id" | "createdAt">>;
