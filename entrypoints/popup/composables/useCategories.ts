import { onMounted, onUnmounted, ref } from "vue";
import { categoryService } from "../../../services/category";
import { storageService } from "../../../services/storage";
import type { Category } from "../../../types/bookmark";

export interface CategoryWithCount extends Category {
  count: number;
}

export function useCategories() {
  const categories = ref<CategoryWithCount[]>([]);
  const loading = ref(true);
  let unwatch: (() => void) | null = null;

  const loadCategories = async () => {
    loading.value = true;
    categories.value = await categoryService.getAllCategoriesWithCount();
    loading.value = false;
  };

  const addCategory = async (name: string, color?: string) => {
    const cat = await categoryService.addCategory(name, color);
    await loadCategories();
    return cat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const cat = await categoryService.updateCategory(id, updates);
    await loadCategories();
    return cat;
  };

  const deleteCategory = async (id: string) => {
    const result = await categoryService.deleteCategory(id);
    await loadCategories();
    return result;
  };

  onMounted(async () => {
    await loadCategories();
    unwatch = storageService.watchCategories(async () => {
      await loadCategories();
    });
  });

  onUnmounted(() => {
    unwatch?.();
  });

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
}
