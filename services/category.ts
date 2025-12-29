import { storageService } from "@/services/storage";
import type { Category } from "@/types/bookmark";

const DEFAULT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

function generateId(): string {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getRandomColor(): string {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return storageService.getCategories();
  },

  async addCategory(name: string, color?: string): Promise<Category> {
    const categories = await storageService.getCategories();
    const now = Date.now();
    const newCategory: Category = {
      id: generateId(),
      name,
      color: color || getRandomColor(),
      order: categories.length,
      createdAt: now,
    };
    categories.push(newCategory);
    await storageService.setCategories(categories);
    return newCategory;
  },

  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, "id" | "createdAt">>
  ): Promise<Category | null> {
    const categories = await storageService.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = {
      ...categories[index],
      ...updates,
    };
    await storageService.setCategories(categories);
    return categories[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await storageService.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return false;

    // Move bookmarks to uncategorized
    const bookmarks = await storageService.getBookmarks();
    const updatedBookmarks = bookmarks.map((b) =>
      b.categoryId === id
        ? { ...b, categoryId: null, updatedAt: Date.now() }
        : b
    );
    await storageService.setBookmarks(updatedBookmarks);

    // Remove category
    categories.splice(index, 1);
    // Update order
    categories.forEach((c, i) => (c.order = i));
    await storageService.setCategories(categories);
    return true;
  },

  async reorderCategories(orderedIds: string[]): Promise<void> {
    const categories = await storageService.getCategories();
    const reordered = orderedIds
      .map((id, index) => {
        const cat = categories.find((c) => c.id === id);
        return cat ? { ...cat, order: index } : null;
      })
      .filter((c): c is Category => c !== null);
    await storageService.setCategories(reordered);
  },

  async getCategoryById(id: string): Promise<Category | null> {
    const categories = await storageService.getCategories();
    return categories.find((c) => c.id === id) || null;
  },

  async getCategoryBookmarkCount(categoryId: string): Promise<number> {
    const bookmarks = await storageService.getBookmarks();
    return bookmarks.filter((b) => b.categoryId === categoryId).length;
  },

  async getAllCategoriesWithCount(): Promise<
    Array<Category & { count: number }>
  > {
    const [categories, bookmarks] = await Promise.all([
      storageService.getCategories(),
      storageService.getBookmarks(),
    ]);

    return categories
      .sort((a, b) => a.order - b.order)
      .map((cat) => ({
        ...cat,
        count: bookmarks.filter((b) => b.categoryId === cat.id).length,
      }));
  },
};
