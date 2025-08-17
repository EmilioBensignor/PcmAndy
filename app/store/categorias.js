import { defineStore } from 'pinia';
import { useSupabaseCache } from '~/composables/useSupabaseCache';

export const useCategoriasStore = defineStore('categorias', {
    state: () => ({
        categorias: [],
        loading: false,
        error: null
    }),

    getters: {
        getCategorias: (state) => state.categorias,
        isLoading: (state) => state.loading,
    },

    actions: {
        async fetchCategorias() {
            const { getFromCache, saveToCache } = useSupabaseCache();
            const cacheKey = 'categorias_data';

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                this.categorias = cachedData;
                this.refreshCategoriasInBackground();
                return;
            }

            this.loading = true;
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('categorias')
                    .select('id, nombre')
                    .order('nombre');

                if (error) throw error;

                this.categorias = data;
                saveToCache(cacheKey, data, 60);
            } catch (error) {
                this.error = error.message;
                console.error('Error al cargar categorías:', error);
            } finally {
                this.loading = false;
            }
        },

        async refreshCategoriasInBackground() {
            try {
                const supabase = useSupabaseClient();
                const { data, error } = await supabase
                    .from('categorias')
                    .select('id, nombre')
                    .order('nombre');

                if (error) throw error;

                const { saveToCache } = useSupabaseCache();
                this.categorias = data;
                saveToCache('categorias_data', data, 60);
            } catch (error) {
                console.error('Error en actualización en segundo plano:', error);
            }
        },

    }
});