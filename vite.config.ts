import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('@supabase')) {
            return 'supabase';
          }
          if (normalized.includes('dexie')) {
            return 'dexie';
          }
          if (
            normalized.includes('node_modules/react-dom') ||
            normalized.includes('node_modules/react/') ||
            normalized.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    tailwind(), 
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.ico'],
      manifestFilename: 'manifest.webmanifest',
      injectManifest: {
        globPatterns: ['**/*.{js,ts,css,html,svg,png,ico,webmanifest}'],
      },
      manifest: {
        name: 'EasyWeek',
        short_name: 'EasyWeek',
        description: 'Easy daily finance controll app',
        theme_color: '#ffffffff',
        id: '/',
        icons: [{
          src: '/favicon.ico',
          sizes: '256x256',
          type: 'image/ico',
          purpose: "maskable"
        }]
      },

      workbox: {
        cleanupOutdatedCaches: true,
        
        
      },

      devOptions: {
        enabled: true,
        suppressWarnings: true,
      }
  })],
  test: {
    environment: "jsdom",
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'dist',
        'node_modules',
        'scripts',
        '*.config.ts',
        '*.config.js',
        '*/vite-env.d.ts',
        '*/main.tsx',
        '.git',
        'dev-dist',
        'coverage'
      ],
    }
  },
})