import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'oneplusspark.ico',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'pwa-wide.png',
        'pwa-mobile.png',
      ],
      manifest: {
        id: '/',
        name: 'OnePlusSpark Paints',
        short_name: 'OnePlusSpark',
        description: 'OnePlusSpark CRM and sales management application',
        theme_color: '#ff6b00',
        background_color: '#ffffff',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/pwa-wide.png',
            sizes: '1600x900',
            type: 'image/png',
            form_factor: 'wide',
            label: 'OnePlusSpark CRM desktop login',
          },
          {
            src: '/pwa-mobile.png',
            sizes: '488x1055',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'OnePlusSpark CRM mobile login',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api(?:\/|$)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
