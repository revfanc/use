import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue(), dts()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Vue3Composables",
      fileName: (format) => `vue3-composables.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
    cssCodeSplit: true,
  },
});
