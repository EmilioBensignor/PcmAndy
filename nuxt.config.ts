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
  primevue: {
    components: {
      include: []
    },
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
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  },
  icon: {
    size: '1rem',
    class: 'tablerIcon',
    serverBundle: {
      collections: ['tabler'],
    }
  },
})