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

      includeAssets: ['favicon.svg', 'favicon.ico'],

      manifest: {
        name: 'vite-project',
        short_name: 'vite-project',
        description: 'vite-project',
        theme_color: '#FFEAEA',
        id: '/',
        icons: [{
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: "any"
        },{
          src: '/favicon.ico',
          sizes: '48x48',
          type: 'image/ico',
          purpose: "maskable"
        }]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}','index.html'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: "index.html",
        
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