import { defineStore } from 'pinia';

export const useColoresStore = defineStore('colores', {
    state: () => ({
        colores: [],
        isLoading: false,
        error: null,
        subscription: null
    }),

    getters: {
        getColores: (state) => state.colores,
        // Getter útil para selector múltiple de colores (ordenado por posición)
        getColoresAsOptions: (state) => state.colores.map(color => ({
            value: color.id,
            label: color.nombre,
            hex: color.codigo_hex,
            posicion: color.posicion
        })).sort((a, b) => a.posicion - b.posicion)
    },

    actions: {
        async fetchColores() {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('colores')
                    .select('*')
                    .order('posicion'); // Ordenamos por posición en lugar de nombre

                if (error) throw error;

                this.colores = data || [];
                return data;
            } catch (error) {
                console.error('Error al obtener colores:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchColorById(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('colores')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                return data;
            } catch (error) {
                console.error(`Error al obtener color con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async createColor(color) {
            this.isLoading = true;
            this.error = null;

            try {
                // Asegurar que el nuevo color tenga una posición
                if (!color.posicion && color.posicion !== 0) {
                    // Asignar una posición alta por defecto (aparecerá al final)
                    color.posicion = 99;
                }

                const { data, error } = await useSupabaseClient()
                    .from('colores')
                    .insert(color)
                    .select()
                    .single();

                if (error) throw error;

                // Añadimos el nuevo color al state y lo ordenamos por posición
                this.colores = [...this.colores, data].sort((a, b) =>
                    a.posicion - b.posicion
                );

                return data;
            } catch (error) {
                console.error('Error al crear color:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateColor(id, updates) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('colores')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                // Actualizamos el color en el state y reordenamos
                const index = this.colores.findIndex(color => color.id === id);
                if (index !== -1) {
                    this.colores[index] = data;
                    this.colores = [...this.colores].sort((a, b) =>
                        a.posicion - b.posicion
                    );
                }

                return data;
            } catch (error) {
                console.error(`Error al actualizar color con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteColor(id) {
            this.isLoading = true;
            this.error = null;

            try {
                const { error } = await useSupabaseClient()
                    .from('colores')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                this.colores = this.colores.filter(color => color.id !== id);
                return true;
            } catch (error) {
                console.error(`Error al eliminar color con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        // Métodos para manejar la relación muchos a muchos con inspiraciones

        async getColoresByInspiracionId(inspiracionId) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones_colores')
                    .select(`
                        color_id,
                        colores:color_id(id, nombre, codigo_hex, posicion)
                    `)
                    .eq('inspiracion_id', inspiracionId)
                    .order('colores(posicion)'); // Ordenar por posición

                if (error) throw error;

                // Transformamos la respuesta para obtener solo los datos de colores
                return data.map(item => item.colores);
            } catch (error) {
                console.error(`Error al obtener colores de la inspiración ${inspiracionId}:`, error);
                this.error = error;
                return [];
            } finally {
                this.isLoading = false;
            }
        },

        async saveInspiracionColores(inspiracionId, coloresIds) {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient();

                // Primero eliminamos todas las relaciones existentes para esta inspiración
                const { error: deleteError } = await supabase
                    .from('inspiraciones_colores')
                    .delete()
                    .eq('inspiracion_id', inspiracionId);

                if (deleteError) throw deleteError;

                // Si no hay colores que agregar, terminamos aquí
                if (!coloresIds || coloresIds.length === 0) return { success: true };

                // Preparamos los registros para insertar
                const registrosParaInsertar = coloresIds.map(colorId => ({
                    inspiracion_id: inspiracionId,
                    color_id: colorId
                }));

                // Insertamos las nuevas relaciones
                const { data, error } = await supabase
                    .from('inspiraciones_colores')
                    .insert(registrosParaInsertar)
                    .select();

                if (error) throw error;

                return { success: true, data };
            } catch (error) {
                console.error(`Error al guardar colores de la inspiración ${inspiracionId}:`, error);
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
                .channel('colores-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'colores'
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Añadimos el nuevo color y ordenamos la lista por posición
                        this.colores = [...this.colores, payload.new].sort((a, b) =>
                            a.posicion - b.posicion
                        );
                    } else if (payload.eventType === 'UPDATE') {
                        const index = this.colores.findIndex(color => color.id === payload.new.id);
                        if (index !== -1) {
                            this.colores[index] = payload.new;
                            // Reordenamos después de actualizar
                            this.colores = [...this.colores].sort((a, b) =>
                                a.posicion - b.posicion
                            );
                        }
                    } else if (payload.eventType === 'DELETE') {
                        this.colores = this.colores.filter(color => color.id !== payload.old.id);
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