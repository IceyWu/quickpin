import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    name: "QuickPin",
    description:
      "A sleek floating bookmark manager - Save, organize and access your bookmarks instantly",
    permissions: ["storage", "activeTab", "tabs"],
    action: {
      default_title: "QuickPin",
      default_icon: "icon/icon.png",
    },
    icons: {
      16: "icon/icon.png",
      32: "icon/icon.png",
      48: "icon/icon.png",
      128: "icon/icon.png",
    },
  },
});
