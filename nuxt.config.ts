// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/image',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/supabase',
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
  ],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
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
  primevue: {
    components: {
      include: [
        'Toast', 'Button', 'Dialog', 'InputText', 'Password', 'ProgressSpinner', 'Drawer', 'FileUpload', 'Dropdown', 'InputSwitch', 'InputNumber', 'Textarea',
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

  // Optimizaciones de caché
  routeRules: {
    '/assets/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/': {
      prerender: true,
      cache: {
        maxAge: 60 * 60
      }
    }
  }
})