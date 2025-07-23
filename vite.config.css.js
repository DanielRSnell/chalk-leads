import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist/css',
    rollupOptions: {
      input: 'src/styles/main.css',
      output: {
        assetFileNames: 'main.css'
      }
    },
    minify: true,
    emptyOutDir: false
  }
})