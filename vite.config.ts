import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ content: ["./index.html", "./src/**/*.{html,ts}"] })],
    },
  },
});
