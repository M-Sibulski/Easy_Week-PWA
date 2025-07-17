import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwind(), 
    VitePWA({
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: false,

      includeAssets: ['favicon.ico'],

      manifest: {
        name: 'EasyWeek',
        short_name: 'EasyWeek',
        description: 'Easy daily finance controll app',
        theme_color: '#ff3c3cff',
        id: '/',
        icons: [{
          src: '/favicon.ico',
          sizes: '256x256',
          type: 'image/ico',
          purpose: "maskable"
        }]
      },

      workbox: {

        globPatterns: ['**/*.{js,css,html,svg,png,ico}','index.html'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: "index.html",
        runtimeCaching: [
              {
                urlPattern: '/', // Cache same-origin requests
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'assets-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
        
      },

      devOptions: {
        enabled: true,
        navigateFallback: '/index.html',
        suppressWarnings: true,
        type: 'module',
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