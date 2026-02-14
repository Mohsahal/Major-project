// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";

// // https://vitejs.dev/config/
// export default defineConfig({
//   server: {
//     host: process.env.VITE_DEV_HOST || "::",
//     port: Number(process.env.VITE_DEV_PORT || 8080),
//   },
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   build: {
//     rollupOptions: {
//       external: []
//     }
//   },
// });



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/", // 🔥 REQUIRED for Render + SPA routing

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "::",
    port: 8080,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
