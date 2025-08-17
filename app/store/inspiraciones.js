import { defineStore } from 'pinia';

export const useInspiracionesStore = defineStore('inspiraciones', {
    state: () => ({
        inspiraciones: [],
        isLoading: false,
        error: null
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

        async fetchInspiracionesPorColor(colorId) {
            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await useSupabaseClient()
                    .from('inspiraciones_colores')
                    .select(`
                        inspiracion_id,
                        inspiraciones:inspiracion_id(*)
                    `)
                    .eq('color_id', colorId);

                if (error) throw error;

                const inspiracionesData = data.map(item => item.inspiraciones);
                this.inspiraciones = inspiracionesData || [];
                return inspiracionesData;
            } catch (error) {
                console.error(`Error al obtener inspiraciones con color ID ${colorId}:`, error);
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

                // 1. Primero, obtén los datos de la inspiración para tener la URL de la imagen
                // Esto evita tener que hacer dos consultas separadas
                const { data: inspiracion, error: fetchError } = await supabase
                    .from('inspiraciones')
                    .select('imagen_url')
                    .eq('id', id)
                    .single();

                if (fetchError) {
                    console.error('Error al obtener datos de la inspiración:', fetchError);
                    throw fetchError;
                }

                // 2. Elimina las relaciones en la tabla de inspiraciones_colores
                console.log('Eliminando relaciones de colores para inspiración:', id);
                const { error: deleteColoresError } = await supabase
                    .from('inspiraciones_colores')
                    .delete()
                    .eq('inspiracion_id', id);

                if (deleteColoresError) {
                    console.error('Error al eliminar relaciones de colores:', deleteColoresError);
                    throw deleteColoresError;
                }

                // 3. Si hay una imagen, intenta eliminarla
                if (inspiracion && inspiracion.imagen_url) {
                    try {
                        console.log('Eliminando imagen:', inspiracion.imagen_url);
                        // Pre-importa el servicio para verificar que existe
                        const { imageOptimization } = await import('~/services/imageOptimization');
                        if (typeof imageOptimization.deleteImage !== 'function') {
                            console.error('La función deleteImage no está disponible en el servicio imageOptimization');
                        } else {
                            await imageOptimization.deleteImage(inspiracion.imagen_url, 'inspiraciones-imagenes');
                        }
                    } catch (imageError) {
                        // Solo registramos el error pero continuamos con la eliminación
                        console.error('Error al eliminar imagen, continuando con la eliminación del registro:', imageError);
                    }
                }

                // 4. Finalmente, elimina el registro de la inspiración
                console.log('Eliminando registro de inspiración:', id);
                const { error } = await supabase
                    .from('inspiraciones')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error al eliminar registro de inspiración:', error);
                    throw error;
                }

                // 5. Actualiza el estado local
                this.inspiraciones = this.inspiraciones.filter(item => item.id !== id);
                return true;
            } catch (error) {
                console.error(`Error al eliminar inspiración con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

    }
});