import { defineStore } from 'pinia';

export const useInspiracionesStore = defineStore('inspiraciones', {
    state: () => ({
        inspiraciones: [],
        isLoading: false,
        error: null,
        subscription: null
    }),

    getters: {
        getInspiraciones: (state) => state.inspiraciones,
        getInspiracionById: (state) => (id) => state.inspiraciones.find(inspiracion => inspiracion.id === id)
    },

    actions: {
        async fetchInspiraciones() {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                this.inspiraciones = data || [];
                return data;
            } catch (error) {
                console.error('Error al obtener inspiraciones:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchInspiracionById(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                return data;
            } catch (error) {
                console.error(`Error al obtener inspiración con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async createInspiracion(inspiracion = {}) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones')
                    .insert(inspiracion)
                    .select()
                    .single();

                if (error) throw error;

                this.inspiraciones.unshift(data);
                return data;
            } catch (error) {
                console.error('Error al crear inspiración:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateInspiracion(id, updates) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                const index = this.inspiraciones.findIndex(inspiracion => inspiracion.id === id);
                if (index !== -1) {
                    this.inspiraciones[index] = data;
                }

                return data;
            } catch (error) {
                console.error(`Error al actualizar inspiración con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteInspiracion(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient();

                // 1. Primero eliminamos las relaciones en la tabla de inspiraciones_colores
                // Este paso es crítico para evitar el error de clave foránea
                const { error: deleteColoresError } = await supabase
                    .from('inspiraciones_colores')
                    .delete()
                    .eq('inspiracion_id', id);

                if (deleteColoresError) throw deleteColoresError;

                // 2. Obtenemos la inspiración para obtener la URL de la imagen
                const { data: inspiracion, error: fetchError } = await supabase
                    .from('inspiraciones')
                    .select('imagen_url')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                // 3. Si la inspiración tiene una imagen, la eliminamos del storage
                if (inspiracion && inspiracion.imagen_url) {
                    const { imageOptimization } = await import('~/services/imageOptimization');
                    await imageOptimization.deleteImage(inspiracion.imagen_url, 'inspiraciones-imagenes');
                }

                // 4. Ahora eliminamos la inspiración
                const { error } = await supabase
                    .from('inspiraciones')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                this.inspiraciones = this.inspiraciones.filter(inspiracion => inspiracion.id !== id);
                return true;
            } catch (error) {
                console.error(`Error al eliminar inspiración con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        setupRealtimeUpdates() {
            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            const supabase = useSupabaseClient();

            this.subscription = supabase
                .channel('inspiraciones-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'inspiraciones'
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        this.inspiraciones.unshift(payload.new);
                    } else if (payload.eventType === 'UPDATE') {
                        const index = this.inspiraciones.findIndex(inspiracion => inspiracion.id === payload.new.id);
                        if (index !== -1) {
                            this.inspiraciones[index] = payload.new;
                        }
                    } else if (payload.eventType === 'DELETE') {
                        this.inspiraciones = this.inspiraciones.filter(inspiracion => inspiracion.id !== payload.old.id);
                    }
                })
                .subscribe();

            return () => {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    this.subscription = null;
                }
            };
        }
    }
});