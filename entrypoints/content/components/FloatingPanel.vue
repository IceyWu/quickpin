<script setup lang="ts">
import { storage } from "@wxt-dev/storage";
import { computed, onMounted, onUnmounted, ref } from "vue";
import iconUrl from "@/assets/icon.svg";
import { exportService } from "@/services/export";
import type { Bookmark, Category } from "@/types/bookmark";

const props = defineProps<{
  pageInfo: { url: string; title: string; favicon: string };
  categories: Category[];
  isBookmarked: boolean;
  groupedBookmarks: { category: Category | null; bookmarks: Bookmark[] }[];
  searchQuery: string;
  buttonPosition: { x: number; y: number };
}>();

const emit = defineEmits<{
  save: [data: { categoryId: string | null }];
  "add-category": [name: string];
  "open-bookmark": [bookmark: Bookmark];
  "open-all-bookmarks": [bookmarks: Bookmark[]];
  "edit-bookmark": [id: string, updates: { title: string; url: string }];
  "delete-bookmark": [bookmark: Bookmark];
  "update:search-query": [value: string];
  "data-imported": [];
  close: [];
}>();

const selectedCategoryId = ref<string | null>(null);
const newCategoryName = ref("");
const showNewCategory = ref(false);
const expandedCategories = ref<string[]>(["uncategorized"]);
const showSettings = ref(false);
const showDropdown = ref(false);
const importMessage = ref<{ type: "success" | "error"; text: string } | null>(
  null
);
const fileInputRef = ref<HTMLInputElement | null>(null);

// 编辑状态
const editingBookmarkId = ref<string | null>(null);
const editTitle = ref("");
const editUrl = ref("");

// 计算选中的分类名称
const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return "未分类";
  const cat = props.categories.find((c) => c.id === selectedCategoryId.value);
  return cat?.name || "未分类";
});

// 选择分类
function selectCategory(categoryId: string | null) {
  selectedCategoryId.value = categoryId;
  showDropdown.value = false;
}

// 点击面板时关闭下拉
function handlePanelClick() {
  showDropdown.value = false;
}

// 主题模式: 'light' | 'dark' | 'system'
const themeMode = ref<"light" | "dark" | "system">("system");

// 使用 chrome.storage 同步主题
const themeItem = storage.defineItem<"light" | "dark" | "system">(
  "local:quickpin-theme",
  {
    fallback: "system",
  }
);

// 使用 chrome.storage 同步折叠状态
const expandedItem = storage.defineItem<string[]>("local:quickpin-expanded", {
  fallback: ["uncategorized"],
});

let unwatchTheme: (() => void) | null = null;
let unwatchExpanded: (() => void) | null = null;

// 计算实际主题
const isDark = computed(() => {
  if (themeMode.value === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return themeMode.value === "dark";
});

// 检查分类是否展开
function isExpanded(categoryId: string): boolean {
  return expandedCategories.value.includes(categoryId);
}

async function loadTheme() {
  themeMode.value = await themeItem.getValue();
}

async function loadExpanded() {
  expandedCategories.value = await expandedItem.getValue();
}

async function toggleTheme() {
  const modes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
  const currentIndex = modes.indexOf(themeMode.value);
  themeMode.value = modes[(currentIndex + 1) % modes.length];
  await themeItem.setValue(themeMode.value);
}

onMounted(async () => {
  await loadTheme();
  await loadExpanded();

  // 监听其他标签页的主题变化
  unwatchTheme = themeItem.watch((newValue) => {
    themeMode.value = newValue;
  });

  // 监听其他标签页的折叠状态变化
  unwatchExpanded = expandedItem.watch((newValue) => {
    expandedCategories.value = newValue;
  });
});

onUnmounted(() => {
  if (unwatchTheme) {
    unwatchTheme();
  }
  if (unwatchExpanded) {
    unwatchExpanded();
  }
});

const totalBookmarks = computed(() =>
  props.groupedBookmarks.reduce((sum, g) => sum + g.bookmarks.length, 0)
);

// 计算面板位置，跟随按钮
const panelStyle = computed(() => {
  const btnX = props.buttonPosition.x;
  const btnY = props.buttonPosition.y;
  const panelWidth = 340;
  const panelHeight = 480;
  const buttonSize = 48;
  const gap = 12;

  let left = btnX + buttonSize + gap;
  let top = btnY;

  if (left + panelWidth > window.innerWidth - 20) {
    left = btnX - panelWidth - gap;
  }

  if (left < 20) {
    left = Math.max(20, Math.min(btnX, window.innerWidth - panelWidth - 20));
    top = btnY - panelHeight - gap;
    if (top < 20) {
      top = btnY + buttonSize + gap;
    }
  }

  if (top + panelHeight > window.innerHeight - 20) {
    top = window.innerHeight - panelHeight - 20;
  }

  if (top < 20) {
    top = 20;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
});

function toggleCategory(categoryId: string) {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.value.splice(index, 1);
  } else {
    expandedCategories.value.push(categoryId);
  }
  // 同步到 storage
  expandedItem.setValue([...expandedCategories.value]);
}

function handleSave(e: Event) {
  e.stopPropagation();
  emit("save", { categoryId: selectedCategoryId.value });
}

function handleAddCategory(e: Event) {
  e.stopPropagation();
  if (newCategoryName.value.trim()) {
    emit("add-category", newCategoryName.value.trim());
    newCategoryName.value = "";
    showNewCategory.value = false;
  }
}

function handleOpenBookmark(e: Event, bookmark: Bookmark) {
  e.stopPropagation();
  emit("open-bookmark", bookmark);
}

function handleOpenAllBookmarks(e: Event, bookmarks: Bookmark[]) {
  e.stopPropagation();
  emit("open-all-bookmarks", bookmarks);
}

function startEditBookmark(e: Event, bookmark: Bookmark) {
  e.stopPropagation();
  editingBookmarkId.value = bookmark.id;
  editTitle.value = bookmark.title;
  editUrl.value = bookmark.url;
}

function cancelEditBookmark(e: Event) {
  e.stopPropagation();
  editingBookmarkId.value = null;
  editTitle.value = "";
  editUrl.value = "";
}

function saveEditBookmark(e: Event) {
  e.stopPropagation();
  if (
    editingBookmarkId.value &&
    editTitle.value.trim() &&
    editUrl.value.trim()
  ) {
    emit("edit-bookmark", editingBookmarkId.value, {
      title: editTitle.value.trim(),
      url: editUrl.value.trim(),
    });
    editingBookmarkId.value = null;
    editTitle.value = "";
    editUrl.value = "";
  }
}

function handleDeleteBookmark(e: Event, bookmark: Bookmark) {
  e.stopPropagation();
  emit("delete-bookmark", bookmark);
}

function handleClose(e: Event) {
  e.stopPropagation();
  emit("close");
}

function handleSearchInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:search-query", target.value);
}

function stopPropagation(e: Event) {
  e.stopPropagation();
}

// 导出数据
async function handleExport() {
  try {
    const json = await exportService.exportToJson();
    exportService.downloadJson(json, "quickpin-backup.json");
    importMessage.value = { type: "success", text: "导出成功" };
    setTimeout(() => {
      importMessage.value = null;
    }, 2000);
  } catch (e) {
    importMessage.value = { type: "error", text: "导出失败" };
  }
}

// 触发文件选择
function triggerImport() {
  fileInputRef.value?.click();
}

// 处理文件导入
async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const result = await exportService.importFromJson(text, "merge");

    if (result.success) {
      importMessage.value = {
        type: "success",
        text: `导入成功: ${result.categoriesImported} 个分类, ${result.bookmarksImported} 个书签`,
      };
      emit("data-imported");
    } else {
      importMessage.value = { type: "error", text: result.errors.join(", ") };
    }
  } catch (e) {
    importMessage.value = { type: "error", text: "文件读取失败" };
  }

  // 清空 input 以便再次选择同一文件
  input.value = "";
  setTimeout(() => {
    importMessage.value = null;
  }, 3000);
}
</script>

<template>
  <div class="floating-panel" :class="{ dark: isDark }" :style="panelStyle" @click="handlePanelClick">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        <img class="logo" :src="iconUrl" alt="QuickPin" />
        <span class="title">QuickPin</span>
      </div>
      <div class="header-actions">
        <button class="icon-btn" @click.stop="showSettings = !showSettings" title="设置">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button class="icon-btn" @click.stop="toggleTheme" :title="themeMode === 'light' ? '浅色' : themeMode === 'dark' ? '深色' : '跟随系统'">
          <svg v-if="themeMode === 'light'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else-if="themeMode === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        </button>
        <button class="icon-btn close" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-title">数据管理</div>
      <div class="settings-actions">
        <button class="settings-btn" @click.stop="handleExport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          导出数据
        </button>
        <button class="settings-btn" @click.stop="triggerImport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          导入数据
        </button>
        <input 
          ref="fileInputRef"
          type="file" 
          accept=".json"
          style="display: none"
          @change="handleFileSelect"
        />
      </div>
      <div v-if="importMessage" class="import-message" :class="importMessage.type">
        {{ importMessage.text }}
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input 
        type="text" 
        class="search-input"
        placeholder="搜索书签..." 
        :value="searchQuery"
        @input="handleSearchInput"
        @click="stopPropagation"
      />
    </div>

    <!-- Current Page Card -->
    <div class="page-card">
      <div class="page-row">
        <img :src="pageInfo.favicon" class="favicon" @error="($event.target as HTMLImageElement).src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2394a3b8%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z%22/></svg>'" />
        <div class="page-text">
          <div class="page-title" :title="pageInfo.title">{{ pageInfo.title || '当前页面' }}</div>
          <div class="page-url" :title="pageInfo.url">{{ pageInfo.url }}</div>
        </div>
      </div>
      
      <div v-if="!isBookmarked" class="save-row">
        <div class="custom-select" @click.stop="showDropdown = !showDropdown">
          <div class="select-trigger">
            <span class="select-value">{{ selectedCategoryName }}</span>
            <svg class="select-arrow" :class="{ open: showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <div v-if="showDropdown" class="select-dropdown">
            <div 
              class="select-option" 
              :class="{ active: selectedCategoryId === null }"
              @click.stop="selectCategory(null)"
            >
              <span class="option-dot" style="background: #94a3b8"></span>
              未分类
            </div>
            <div 
              v-for="cat in categories" 
              :key="cat.id"
              class="select-option"
              :class="{ active: selectedCategoryId === cat.id }"
              @click.stop="selectCategory(cat.id)"
            >
              <span class="option-dot" :style="{ background: cat.color }"></span>
              {{ cat.name }}
            </div>
          </div>
        </div>
        <button class="btn-primary" @click="handleSave">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          保存
        </button>
      </div>
      <div v-else class="saved-row">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        已收藏
      </div>
    </div>

    <!-- Add Category -->
    <div class="add-section">
      <button v-if="!showNewCategory" class="add-btn" @click.stop="showNewCategory = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建分类
      </button>
      <div v-else class="add-form" @click="stopPropagation">
        <input 
          v-model="newCategoryName" 
          type="text" 
          class="input"
          placeholder="分类名称"
          @keyup.enter="handleAddCategory"
          @click="stopPropagation"
        />
        <button class="btn-sm primary" @click="handleAddCategory">添加</button>
        <button class="btn-sm" @click.stop="showNewCategory = false">取消</button>
      </div>
    </div>

    <!-- Bookmark List -->
    <div class="list-section">
      <div class="list-title">
        <span>书签</span>
        <span class="badge">{{ totalBookmarks }}</span>
      </div>
      
      <div v-if="groupedBookmarks.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
        <span>暂无书签</span>
      </div>
      
      <div v-for="group in groupedBookmarks" :key="group.category?.id || 'uncategorized'" class="group">
        <div class="group-header" @click.stop="toggleCategory(group.category?.id || 'uncategorized')">
          <svg 
            class="chevron" 
            :class="{ open: isExpanded(group.category?.id || 'uncategorized') }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <span class="dot" :style="{ background: group.category?.color || '#94a3b8' }"></span>
          <span class="group-name">{{ group.category?.name || '未分类' }}</span>
          <button 
            class="open-all-btn" 
            @click="handleOpenAllBookmarks($event, group.bookmarks)"
            title="打开全部"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </button>
          <span class="group-count">{{ group.bookmarks.length }}</span>
        </div>
        
        <div v-if="isExpanded(group.category?.id || 'uncategorized')" class="group-items">
          <div 
            v-for="bookmark in group.bookmarks" 
            :key="bookmark.id" 
            class="item"
            :class="{ editing: editingBookmarkId === bookmark.id }"
            :title="editingBookmarkId === bookmark.id ? '' : bookmark.url"
            @click="editingBookmarkId === bookmark.id ? null : handleOpenBookmark($event, bookmark)"
          >
            <!-- 编辑模式 -->
            <template v-if="editingBookmarkId === bookmark.id">
              <div class="edit-form" @click.stop>
                <input 
                  v-model="editTitle" 
                  type="text" 
                  class="edit-input"
                  placeholder="标题"
                  @click.stop
                />
                <input 
                  v-model="editUrl" 
                  type="text" 
                  class="edit-input"
                  placeholder="网址"
                  @click.stop
                  @keyup.enter="saveEditBookmark"
                />
                <div class="edit-actions">
                  <button class="btn-sm primary" @click="saveEditBookmark">保存</button>
                  <button class="btn-sm" @click="cancelEditBookmark">取消</button>
                </div>
              </div>
            </template>
            <!-- 正常显示模式 -->
            <template v-else>
              <img :src="bookmark.favicon" class="item-icon" @error="($event.target as HTMLImageElement).style.opacity='0.3'" />
              <div class="item-text">
                <div class="item-title">{{ bookmark.title }}</div>
                <div class="item-url">{{ bookmark.url }}</div>
              </div>
              <button class="item-edit" @click="startEditBookmark($event, bookmark)" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="item-delete" @click="handleDeleteBookmark($event, bookmark)" title="删除">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Base */
.floating-panel {
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --border: #e5e7eb;
  --text: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent: #6366f1;
  --accent-light: #eef2ff;
  --success: #10b981;
  --success-light: #d1fae5;
  --hover: #f3f4f6;
  
  position: fixed;
  width: 340px;
  max-height: 480px;
  background: var(--bg);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03);
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.floating-panel.dark {
  --bg: #18181b;
  --bg-secondary: #27272a;
  --border: #3f3f46;
  --text: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --accent: #818cf8;
  --accent-light: #312e81;
  --success: #34d399;
  --success-light: #064e3b;
  --hover: #3f3f46;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  transition: filter 0.2s ease;
}

.dark .logo {
  filter: invert(1);
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.3px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.15s;
}

.icon-btn:hover {
  background: var(--hover);
  color: var(--text-secondary);
}

.icon-btn.close:hover {
  background: #fef2f2;
  color: #ef4444;
}

.dark .icon-btn.close:hover {
  background: #450a0a;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

/* Settings Panel */
.settings-panel {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.settings-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.settings-actions {
  display: flex;
  gap: 8px;
}

.settings-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.settings-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.settings-btn svg {
  width: 16px;
  height: 16px;
}

.import-message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
}

.import-message.success {
  background: var(--success-light);
  color: var(--success);
}

.import-message.error {
  background: #fef2f2;
  color: #ef4444;
}

.dark .import-message.error {
  background: #450a0a;
}

/* Search */
.search-wrapper {
  padding: 12px 16px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  background: var(--bg-secondary);
  color: var(--text);
  box-sizing: border-box;
  transition: all 0.15s;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent);
  background: var(--bg);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Page Card */
.page-card {
  margin: 0 16px 12px;
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 14px;
  border: 1px solid var(--border);
}

.page-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.favicon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
  background: var(--bg);
  padding: 6px;
  box-sizing: border-box;
}

.page-text {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.page-url {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.save-row {
  display: flex;
  gap: 8px;
}

/* Custom Select */
.custom-select {
  flex: 1;
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  cursor: pointer;
  transition: all 0.15s;
}

.select-trigger:hover {
  border-color: var(--accent);
}

.select-value {
  font-size: 13px;
  color: var(--text);
}

.select-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.select-arrow.open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 10;
  max-height: 160px;
  overflow-y: auto;
  animation: dropdownIn 0.15s ease-out;
}

.dark .select-dropdown {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.1s;
}

.select-option:first-child {
  border-radius: 9px 9px 0 0;
}

.select-option:last-child {
  border-radius: 0 0 9px 9px;
}

.select-option:only-child {
  border-radius: 9px;
}

.select-option:hover {
  background: var(--hover);
}

.select-option.active {
  background: var(--accent-light);
  color: var(--accent);
}

.option-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.select-dropdown::-webkit-scrollbar {
  width: 4px;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-primary svg {
  width: 16px;
  height: 16px;
}

.saved-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: var(--success-light);
  color: var(--success);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
}

.saved-row svg {
  width: 18px;
  height: 18px;
}

/* Add Section */
.add-section {
  padding: 0 16px 12px;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.add-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.add-btn svg {
  width: 16px;
  height: 16px;
}

.add-form {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.add-form .input {
  flex: 1;
  min-width: 0;
}

.add-form .btn-sm {
  flex-shrink: 0;
  white-space: nowrap;
}

.input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  background: var(--bg);
  color: var(--text);
  transition: all 0.15s;
}

.input:focus {
  border-color: var(--accent);
}

.btn-sm {
  padding: 9px 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  background: var(--hover);
  color: var(--text-secondary);
  transition: all 0.15s;
}

.btn-sm:hover {
  background: var(--border);
}

.btn-sm.primary {
  background: var(--accent);
  color: white;
}

.btn-sm.primary:hover {
  filter: brightness(1.1);
}

/* List Section */
.list-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.list-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge {
  background: var(--hover);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 13px;
}

.empty svg {
  width: 32px;
  height: 32px;
  opacity: 0.5;
}

/* Group */
.group {
  margin-bottom: 2px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.group-header:hover {
  background: var(--hover);
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(90deg);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.group-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.group-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--hover);
  padding: 2px 8px;
  border-radius: 8px;
}

.open-all-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.15s;
  margin-left: auto;
}

.group-header:hover .open-all-btn {
  opacity: 1;
}

.open-all-btn:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.open-all-btn svg {
  width: 14px;
  height: 14px;
}

.group-items {
  padding-left: 16px;
}

/* Item */
.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.item:hover {
  background: var(--hover);
}

.item-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: contain;
}

.item-text {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-url {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-delete {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.15s;
}

.item:hover .item-delete {
  opacity: 1;
}

.item-delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.dark .item-delete:hover {
  background: #450a0a;
}

.item-delete svg {
  width: 14px;
  height: 14px;
}

/* Edit Mode */
.item.editing {
  background: var(--bg-secondary);
  padding: 12px;
  cursor: default;
}

.edit-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: var(--bg);
  color: var(--text);
  box-sizing: border-box;
  transition: all 0.15s;
}

.edit-input:focus {
  border-color: var(--accent);
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.item-edit {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.15s;
}

.item:hover .item-edit {
  opacity: 1;
}

.item-edit:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.item-edit svg {
  width: 14px;
  height: 14px;
}

/* Scrollbar */
.list-section::-webkit-scrollbar {
  width: 6px;
}

.list-section::-webkit-scrollbar-track {
  background: transparent;
}

.list-section::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.list-section::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
