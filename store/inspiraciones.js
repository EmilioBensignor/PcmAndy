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

        async createInspiracion(inspiracion) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones')
                    .insert(inspiracion)
                    .select()
                    .single();

                if (error) throw error;

                this.inspiraciones.unshift(data); // Añadir al principio del array
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

                // Actualizar la inspiración en el state
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
                const { error } = await useSupabaseClient()
                    .from('inspiraciones')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // Eliminar la inspiración del state
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
            // Desuscribirse de cualquier suscripción previa
            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            const supabase = useSupabaseClient();

            // Crear nueva suscripción
            this.subscription = supabase
                .channel('inspiraciones-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'inspiraciones'
                }, (payload) => {
                    // Manejar los diferentes eventos
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

            // Retornar función para desuscribirse
            return () => {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    this.subscription = null;
                }
            };
        }
    }
});