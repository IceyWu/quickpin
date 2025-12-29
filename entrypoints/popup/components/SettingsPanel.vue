<script setup lang="ts">
import { ref } from "vue";
import { exportService } from "../../../services/export";
import type { ImportResult } from "../../../types/bookmark";

const emit = defineEmits<{
  close: [];
  imported: [];
}>();

const importMode = ref<"merge" | "replace">("merge");
const importing = ref(false);
const importResult = ref<ImportResult | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const handleExport = async () => {
  const json = await exportService.exportToJson();
  exportService.downloadJson(json);
};

const handleImportClick = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  importing.value = true;
  importResult.value = null;

  try {
    const text = await file.text();
    importResult.value = await exportService.importFromJson(
      text,
      importMode.value
    );
    if (importResult.value.success) {
      emit("imported");
    }
  } catch (err) {
    importResult.value = {
      success: false,
      bookmarksImported: 0,
      categoriesImported: 0,
      errors: ["读取文件失败"],
    };
  } finally {
    importing.value = false;
    input.value = "";
  }
};
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" @click="$emit('close')">
    <div
      class="w-full max-w-md glass rounded-t-2xl p-5 animate-slideUp"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold gradient-text">设置</h2>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Export -->
      <div class="mb-5">
        <h3 class="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">导出数据</h3>
        <button
          @click="handleExport"
          class="w-full py-3 text-sm font-medium btn-secondary rounded-xl flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          导出为 JSON 文件
        </button>
      </div>

      <!-- Import -->
      <div class="mb-5">
        <h3 class="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">导入数据</h3>
        <div class="flex gap-2 mb-3">
          <label class="flex-1">
            <input
              type="radio"
              v-model="importMode"
              value="merge"
              class="sr-only peer"
            />
            <div class="py-2.5 text-center text-sm rounded-xl border-2 cursor-pointer transition-all peer-checked:border-violet-500 peer-checked:bg-violet-50 dark:peer-checked:bg-violet-900/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              合并数据
            </div>
          </label>
          <label class="flex-1">
            <input
              type="radio"
              v-model="importMode"
              value="replace"
              class="sr-only peer"
            />
            <div class="py-2.5 text-center text-sm rounded-xl border-2 cursor-pointer transition-all peer-checked:border-violet-500 peer-checked:bg-violet-50 dark:peer-checked:bg-violet-900/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              替换数据
            </div>
          </label>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="handleImportClick"
          :disabled="importing"
          class="w-full py-3 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ importing ? '导入中...' : '选择 JSON 文件' }}
        </button>
      </div>

      <!-- Import Result -->
      <div
        v-if="importResult"
        class="p-4 rounded-xl text-sm animate-fadeIn"
        :class="importResult.success ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'"
      >
        <div class="flex items-center gap-2">
          <svg v-if="importResult.success" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span v-if="importResult.success">
            导入成功！书签: {{ importResult.bookmarksImported }}，分类: {{ importResult.categoriesImported }}
          </span>
          <span v-else>{{ importResult.errors.join(', ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
