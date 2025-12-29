<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  search: [query: string];
  openSettings: [];
}>();

const searchQuery = ref("");
const isFocused = ref(false);

const onSearch = () => {
  emit("search", searchQuery.value);
};
</script>

<template>
  <header class="px-5 pt-5 pb-4">
    <!-- Logo & Title -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg glow-violet animate-bounce-soft">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
        </div>
        <div>
          <h1 class="text-xl font-bold gradient-text">QuickPin</h1>
          <p class="text-xs text-slate-400 dark:text-slate-500">Quick Save · Easy Manage</p>
        </div>
      </div>
      <button
        @click="$emit('openSettings')"
        class="p-2.5 rounded-xl text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200 icon-btn"
        title="设置"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>

    <!-- Search -->
    <div 
      class="relative group"
      :class="{ 'scale-[1.02]': isFocused }"
      style="transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <!-- Glow effect -->
      <div 
        class="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        :class="{ 'opacity-30': isFocused }"
      ></div>
      
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索书签..."
          class="w-full pl-11 pr-4 py-3 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 text-slate-700 dark:text-slate-200 placeholder-slate-400 shadow-sm"
          @input="onSearch"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
        <div class="absolute left-3.5 top-1/2 -translate-y-1/2">
          <svg 
            class="w-5 h-5 transition-all duration-300"
            :class="isFocused ? 'text-violet-500 scale-110' : 'text-slate-400'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <!-- Clear button -->
        <button
          v-if="searchQuery"
          @click="searchQuery = ''; onSearch()"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
