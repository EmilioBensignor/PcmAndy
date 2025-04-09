import { defineStore } from 'pinia';

export const useObrasStore = defineStore('obras', {
    state: () => ({
        obras: [],
        isLoading: false,
        error: null,
        subscription: null
    }),

    getters: {
        getObras: (state) => state.obras,
        getObraById: (state) => (id) => state.obras.find(obra => obra.id === id)
    },

    actions: {
        async fetchObras() {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                this.obras = data || [];
                return data;
            } catch (error) {
                console.error('Error al obtener obras:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchObraById(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                return data;
            } catch (error) {
                console.error(`Error al obtener obra con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async createObra(obra) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .insert(obra)
                    .select()
                    .single();

                if (error) throw error;

                this.obras.unshift(data); // Añadir al principio del array
                return data;
            } catch (error) {
                console.error('Error al crear obra:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateObra(id, updates) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                // Actualizar la obra en el state
                const index = this.obras.findIndex(obra => obra.id === id);
                if (index !== -1) {
                    this.obras[index] = data;
                }

                return data;
            } catch (error) {
                console.error(`Error al actualizar obra con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteObra(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const { error } = await useSupabaseClient()
                    .from('obras')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // Eliminar la obra del state
                this.obras = this.obras.filter(obra => obra.id !== id);
                return true;
            } catch (error) {
                console.error(`Error al eliminar obra con ID ${id}:`, error);
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
                .channel('obras-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'obras'
                }, (payload) => {
                    // Manejar los diferentes eventos
                    if (payload.eventType === 'INSERT') {
                        this.obras.unshift(payload.new);
                    } else if (payload.eventType === 'UPDATE') {
                        const index = this.obras.findIndex(obra => obra.id === payload.new.id);
                        if (index !== -1) {
                            this.obras[index] = payload.new;
                        }
                    } else if (payload.eventType === 'DELETE') {
                        this.obras = this.obras.filter(obra => obra.id !== payload.old.id);
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