import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  
  build: {
    outDir: 'dist/js',
    emptyOutDir: false,
    lib: {
      entry: 'src/main.jsx',
      name: 'MoovinLeads',
      fileName: () => 'shadow-plugin.js',
      formats: ['iife']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: false
  },
  
  server: {
    port: 3000,
    host: true
  }
});

// For CSS build
export const cssConfig = defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist/css',
    emptyOutDir: false,
    lib: {
      entry: 'src/styles/main.css',
      name: 'TailwindCSS',
      fileName: () => 'main.css',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        assetFileNames: '[name][extname]'
      }
    }
  }
});