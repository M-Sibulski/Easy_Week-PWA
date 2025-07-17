import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwind(), 
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.ico'],

      manifest: {
        name: 'EasyWeek',
        short_name: 'EasyWeek',
        description: 'Easy daily finance controll app',
        theme_color: '#4882ffff',
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