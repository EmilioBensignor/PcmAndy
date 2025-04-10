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

        setupRealtimeUpdates() {
            const { subscribeToTable } = useRealtimeSubscription();

            return subscribeToTable('categorias', (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newCategoria = payload.new;
                    this.categorias = [...this.categorias, newCategoria].sort((a, b) =>
                        a.nombre.localeCompare(b.nombre)
                    );

                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('categorias_data');
                    if (cachedData) {
                        saveToCache('categorias_data',
                            [...cachedData, newCategoria].sort((a, b) =>
                                a.nombre.localeCompare(b.nombre)
                            ),
                            60
                        );
                    }
                }
                else if (payload.eventType === 'UPDATE') {
                    const updatedCategoria = payload.new;
                    this.categorias = this.categorias
                        .map(item => item.id === updatedCategoria.id ? updatedCategoria : item)
                        .sort((a, b) => a.nombre.localeCompare(b.nombre));

                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('categorias_data');
                    if (cachedData) {
                        saveToCache('categorias_data',
                            cachedData
                                .map(item => item.id === updatedCategoria.id ? updatedCategoria : item)
                                .sort((a, b) => a.nombre.localeCompare(b.nombre)),
                            60
                        );
                    }
                }
                else if (payload.eventType === 'DELETE') {
                    const deletedId = payload.old.id;
                    this.categorias = this.categorias.filter(item => item.id !== deletedId);

                    const { getFromCache, saveToCache } = useSupabaseCache();
                    const cachedData = getFromCache('categorias_data');
                    if (cachedData) {
                        saveToCache('categorias_data',
                            cachedData.filter(item => item.id !== deletedId),
                            60
                        );
                    }
                }
            });
        }
    }
});