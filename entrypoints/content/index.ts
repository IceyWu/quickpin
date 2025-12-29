import { createApp } from "vue";
import App from "./App.vue";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "bookmark-manager-widget",
      position: "inline",
      anchor: "body",
      append: "last",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        wrapper.id = "bookmark-widget-root";
        container.append(wrapper);

        const app = createApp(App);
        app.mount(wrapper);
        return { app, wrapper };
      },
      onRemove: (elements) => {
        elements?.app.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
