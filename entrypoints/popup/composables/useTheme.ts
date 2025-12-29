import { onMounted, onUnmounted, ref } from "vue";

export function useTheme() {
  const isDark = ref(false);

  const updateTheme = () => {
    isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark.value);
  };

  onMounted(() => {
    updateTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);
  });

  onUnmounted(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.removeEventListener("change", updateTheme);
  });

  return { isDark };
}
