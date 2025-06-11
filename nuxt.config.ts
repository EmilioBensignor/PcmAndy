// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/image', '@nuxt/icon', '@pinia/nuxt', '@nuxt/fonts', '@nuxtjs/supabase', '@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Andy Loisch' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/pwa-icons/apple-touch-icon.png' }
      ]
    }
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/callback',
      exclude: [
        '/login',
        '/register',
        '/forgot-password',
        '/forgot-password-confirmation',
        '/reset-password',
      ]
    },
    // Optimización de Supabase: reducir la tasa de sondeo para sesiones (menos peticiones Auth)
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === 'production'
    },
    clientOptions: {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globDirectory: '.output/public',
      globPatterns: ['**/*.{js,css,html}'],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7
            }
          }
        }
      ],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
      mode: 'production',
      clientsClaim: true,
      skipWaiting: true
    },
    manifest: {
      name: 'Andy Loisch',
      short_name: 'AndyLoisch',
      description: 'Galería de obras de Andy Loisch',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/pwa-icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    devOptions: {
      enabled: false,
      type: 'module',
      suppressWarnings: true
    }
  },
  primevue: {
    components: {
      include: [
        'Toast', 'Button', 'Dialog', 'InputText', 'Password', 'ProgressSpinner', 'Drawer', 'FileUpload', 'Dropdown', 'InputSwitch', 'InputNumber', 'Textarea'
      ]
    },
    options: {
      ripple: false,
      unstyled: false
    }
  },
  fonts: {
    defaults: {
      weights: [300, 400, 500, 700, 900],
    }
  },
  plugins: [
    { src: '~/plugins/preload-data.js', mode: 'client' }
  ],
  icon: {
    size: '1rem',
    class: 'tablerIcon',
    serverBundle: {
      collections: ['tabler'],
    }
  },
  vite: {
    optimizeDeps: {
      include: ['primeflex', 'pinia']
    },
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      fs: {
        strict: false
      }
    }
  },
  // Optimizaciones de rendimiento
  experimental: {
    payloadExtraction: true,
    crossOriginPrefetch: true,
    viewTransition: true,
    componentIslands: true
  },
})