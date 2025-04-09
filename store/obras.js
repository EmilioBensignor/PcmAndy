import { defineStore } from 'pinia';
import { imageOptimization } from '~/services/imageOptimization';

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
                // Obtener obras con sus datos relacionados
                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .select(`
                        *,
                        categorias(id, nombre),
                        obras_imagenes(id, url, posicion, es_principal)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Procesar los datos para manejar las relaciones
                const processedData = data.map(obra => {
                    // Extraer URLs de imágenes
                    const imagenes = obra.obras_imagenes ? obra.obras_imagenes.map(img => img.url) : [];

                    // Encontrar la imagen principal
                    const imagenPrincipal = obra.obras_imagenes ?
                        obra.obras_imagenes.find(img => img.es_principal)?.url : null;

                    return {
                        ...obra,
                        imagenes,
                        imagen_url: imagenPrincipal || (imagenes.length > 0 ? imagenes[0] : null),
                        categoria: obra.categorias ? obra.categorias.nombre : null,
                        categoria_id: obra.categoria_id || (obra.categorias ? obra.categorias.id : null)
                    };
                });

                this.obras = processedData || [];
                return processedData;
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
                    .select(`
                        *,
                        categorias(id, nombre),
                        obras_imagenes(id, url, posicion, es_principal)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Extraer URLs de imágenes
                const imagenes = data.obras_imagenes ? data.obras_imagenes.map(img => img.url) : [];

                // Encontrar la imagen principal
                const imagenPrincipal = data.obras_imagenes ?
                    data.obras_imagenes.find(img => img.es_principal)?.url : null;

                // Procesar los datos para manejar las relaciones
                const processedData = {
                    ...data,
                    imagenes,
                    imagen_url: imagenPrincipal || (imagenes.length > 0 ? imagenes[0] : null),
                    categoria: data.categorias ? data.categorias.nombre : null,
                    categoria_id: data.categoria_id || (data.categorias ? data.categorias.id : null)
                };

                return processedData;
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
                // Asegurarnos de que estamos enviando datos válidos para la tabla obras
                const obraData = {
                    titulo: obra.titulo,
                    descripcion: obra.descripcion,
                    anio: obra.anio,
                    ancho: obra.ancho,
                    alto: obra.alto,
                    categoria_id: obra.categoria_id,
                    destacado: obra.destacado
                };

                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .insert(obraData)
                    .select()
                    .single();

                if (error) throw error;

                // Añadir el nuevo elemento al state
                const nuevaObra = {
                    ...data,
                    imagenes: [],
                    imagen_url: null,
                    categoria: null,
                    categoria_id: data.categoria_id
                };

                // Cargar la información de categoría si está disponible
                if (data.categoria_id) {
                    try {
                        const { data: categoriaData } = await useSupabaseClient()
                            .from('categorias')
                            .select('nombre')
                            .eq('id', data.categoria_id)
                            .single();

                        if (categoriaData) {
                            nuevaObra.categoria = categoriaData.nombre;
                        }
                    } catch (categoriaError) {
                        console.warn('No se pudo cargar el nombre de la categoría:', categoriaError);
                    }
                }

                this.obras.unshift(nuevaObra);
                return nuevaObra;
            } catch (error) {
                console.error('Error al crear obra:', error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async createObraImagen(imagenData) {
            try {
                const { error } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .insert({
                        obra_id: imagenData.obra_id,
                        url: imagenData.url,
                        posicion: imagenData.posicion || 0,
                        es_principal: imagenData.es_principal || false
                    });

                if (error) throw error;

                // Actualizar el state si la obra está en el store
                const obraIndex = this.obras.findIndex(obra => obra.id === imagenData.obra_id);
                if (obraIndex !== -1) {
                    // Añadir la URL a las imágenes de la obra
                    if (!this.obras[obraIndex].imagenes) {
                        this.obras[obraIndex].imagenes = [];
                    }
                    this.obras[obraIndex].imagenes.push(imagenData.url);

                    // Si es la imagen principal o no hay imagen principal, actualizar imagen_url
                    if (imagenData.es_principal || !this.obras[obraIndex].imagen_url) {
                        this.obras[obraIndex].imagen_url = imagenData.url;
                    }
                }

                return true;
            } catch (error) {
                console.error('Error al crear imagen de obra:', error);
                throw error;
            }
        },

        async updateObra(id, updates) {
            this.isLoading = true;
            this.error = null;

            try {
                // Datos a actualizar en Supabase
                const updateData = {
                    titulo: updates.titulo,
                    descripcion: updates.descripcion,
                    anio: updates.anio,
                    ancho: updates.ancho,
                    alto: updates.alto,
                    categoria_id: updates.categoria_id,
                    destacado: updates.destacado
                };

                const { data, error } = await useSupabaseClient()
                    .from('obras')
                    .update(updateData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                // Obtener las imágenes asociadas a esta obra
                const { data: imagenesData } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .select('id, url, posicion, es_principal')
                    .eq('obra_id', id);

                const imagenes = imagenesData ? imagenesData.map(img => img.url) : [];
                const imagenPrincipal = imagenesData ?
                    imagenesData.find(img => img.es_principal)?.url :
                    (imagenes.length > 0 ? imagenes[0] : null);

                // Procesar datos para el state
                const updatedObra = {
                    ...data,
                    imagenes,
                    imagen_url: imagenPrincipal,
                    categoria: null,
                    categoria_id: data.categoria_id
                };

                // Cargar la información de categoría si está disponible
                if (data.categoria_id) {
                    try {
                        const { data: categoriaData } = await useSupabaseClient()
                            .from('categorias')
                            .select('nombre')
                            .eq('id', data.categoria_id)
                            .single();

                        if (categoriaData) {
                            updatedObra.categoria = categoriaData.nombre;
                        }
                    } catch (categoriaError) {
                        console.warn('No se pudo cargar el nombre de la categoría:', categoriaError);
                    }
                }

                // Actualizar la obra en el state
                const index = this.obras.findIndex(obra => obra.id === id);
                if (index !== -1) {
                    this.obras[index] = updatedObra;
                }

                return updatedObra;
            } catch (error) {
                console.error(`Error al actualizar obra con ID ${id}:`, error);
                this.error = error;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateObraImagen(id, updates) {
            try {
                const { error } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .update({
                        url: updates.url,
                        posicion: updates.posicion,
                        es_principal: updates.es_principal
                    })
                    .eq('id', id);

                if (error) throw error;
                return true;
            } catch (error) {
                console.error(`Error al actualizar imagen de obra con ID ${id}:`, error);
                throw error;
            }
        },

        async deleteObraImagen(id) {
            try {
                // Primero obtener la imagen para conocer la URL
                const { data, error: fetchError } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .select('url, obra_id')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                // Eliminar el registro de la tabla
                const { error: deleteError } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;

                // Intentar eliminar el archivo del storage
                if (data && data.url) {
                    try {
                        await imageOptimization.deleteImage(data.url, 'obras-imagenes');
                    } catch (storageError) {
                        console.warn(`No se pudo eliminar la imagen del storage:`, storageError);
                    }
                }

                // Actualizar el state si la obra está en el store
                if (data && data.obra_id) {
                    const obraIndex = this.obras.findIndex(obra => obra.id === data.obra_id);
                    if (obraIndex !== -1 && this.obras[obraIndex].imagenes) {
                        // Eliminar la URL de las imágenes de la obra
                        this.obras[obraIndex].imagenes = this.obras[obraIndex].imagenes.filter(url => url !== data.url);

                        // Si era la imagen principal, actualizar imagen_url con la primera disponible
                        if (this.obras[obraIndex].imagen_url === data.url) {
                            this.obras[obraIndex].imagen_url = this.obras[obraIndex].imagenes.length > 0 ?
                                this.obras[obraIndex].imagenes[0] : null;
                        }
                    }
                }

                return true;
            } catch (error) {
                console.error(`Error al eliminar imagen de obra con ID ${id}:`, error);
                throw error;
            }
        },

        async deleteObra(id) {
            this.isLoading = true;
            this.error = null;

            try {
                // Primero, obtener las imágenes asociadas a esta obra
                const { data: imagenesData, error: imgError } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .select('id, url')
                    .eq('obra_id', id);

                if (imgError) throw imgError;

                // Eliminar cada imagen de la tabla obras_imagenes y del storage
                if (imagenesData && imagenesData.length > 0) {
                    // Eliminar registros de la tabla
                    const { error: deleteImgError } = await useSupabaseClient()
                        .from('obras_imagenes')
                        .delete()
                        .eq('obra_id', id);

                    if (deleteImgError) throw deleteImgError;

                    // Eliminar archivos del storage
                    for (const imagen of imagenesData) {
                        try {
                            await imageOptimization.deleteImage(imagen.url, 'obras-imagenes');
                        } catch (storageError) {
                            console.warn(`No se pudo eliminar la imagen ${imagen.url}:`, storageError);
                        }
                    }
                }

                // Eliminar la obra de la tabla obras
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

            // Crear nueva suscripción para la tabla obras
            this.subscription = supabase
                .channel('obras-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'obras'
                }, (payload) => {
                    this.handleObraChanges(payload, supabase);
                })
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'obras_imagenes'
                }, (payload) => {
                    this.handleObraImagenChanges(payload, supabase);
                })
                .subscribe();

            // Retornar función para desuscribirse
            return () => {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    this.subscription = null;
                }
            };
        },

        async handleObraChanges(payload, supabase) {
            // Manejar los diferentes eventos en la tabla obras
            if (payload.eventType === 'INSERT') {
                // Obtener datos completos incluyendo relaciones
                try {
                    const { data } = await supabase
                        .from('obras')
                        .select(`
                            *,
                            categorias(id, nombre),
                            obras_imagenes(id, url, posicion, es_principal)
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        // Procesar los datos
                        const imagenes = data.obras_imagenes ? data.obras_imagenes.map(img => img.url) : [];
                        const imagenPrincipal = data.obras_imagenes ?
                            data.obras_imagenes.find(img => img.es_principal)?.url :
                            (imagenes.length > 0 ? imagenes[0] : null);

                        const nuevaObra = {
                            ...data,
                            imagenes,
                            imagen_url: imagenPrincipal,
                            categoria: data.categorias ? data.categorias.nombre : null,
                            categoria_id: data.categoria_id
                        };

                        this.obras.unshift(nuevaObra);
                    }
                } catch (error) {
                    console.warn('Error al procesar nueva obra:', error);
                }
            } else if (payload.eventType === 'UPDATE') {
                // Obtener datos completos incluyendo relaciones
                try {
                    const { data } = await supabase
                        .from('obras')
                        .select(`
                            *,
                            categorias(id, nombre),
                            obras_imagenes(id, url, posicion, es_principal)
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        // Procesar los datos
                        const imagenes = data.obras_imagenes ? data.obras_imagenes.map(img => img.url) : [];
                        const imagenPrincipal = data.obras_imagenes ?
                            data.obras_imagenes.find(img => img.es_principal)?.url :
                            (imagenes.length > 0 ? imagenes[0] : null);

                        const updatedObra = {
                            ...data,
                            imagenes,
                            imagen_url: imagenPrincipal,
                            categoria: data.categorias ? data.categorias.nombre : null,
                            categoria_id: data.categoria_id
                        };

                        const index = this.obras.findIndex(obra => obra.id === payload.new.id);
                        if (index !== -1) {
                            this.obras[index] = updatedObra;
                        }
                    }
                } catch (error) {
                    console.warn('Error al procesar actualización de obra:', error);
                }
            } else if (payload.eventType === 'DELETE') {
                this.obras = this.obras.filter(obra => obra.id !== payload.old.id);
            }
        },

        async handleObraImagenChanges(payload, supabase) {
            // Manejar los diferentes eventos en la tabla obras_imagenes
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                // Actualizar la obra correspondiente en el store
                const obraId = payload.new.obra_id;
                const index = this.obras.findIndex(obra => obra.id === obraId);

                if (index !== -1) {
                    try {
                        // Obtener todas las imágenes actualizadas para esta obra
                        const { data } = await supabase
                            .from('obras_imagenes')
                            .select('id, url, posicion, es_principal')
                            .eq('obra_id', obraId);

                        if (data) {
                            // Actualizar las imágenes en el store
                            const imagenes = data.map(img => img.url);
                            const imagenPrincipal = data.find(img => img.es_principal)?.url ||
                                (imagenes.length > 0 ? imagenes[0] : null);

                            this.obras[index].imagenes = imagenes;
                            this.obras[index].imagen_url = imagenPrincipal;
                        }
                    } catch (error) {
                        console.warn('Error al procesar cambio de imagen:', error);
                    }
                }
            } else if (payload.eventType === 'DELETE') {
                // Actualizar la obra correspondiente en el store
                const obraId = payload.old.obra_id;
                const index = this.obras.findIndex(obra => obra.id === obraId);

                if (index !== -1) {
                    // Eliminar la URL de las imágenes de la obra
                    if (this.obras[index].imagenes) {
                        this.obras[index].imagenes = this.obras[index].imagenes.filter(url => url !== payload.old.url);
                    }

                    // Si era la imagen principal, actualizar imagen_url
                    if (this.obras[index].imagen_url === payload.old.url) {
                        this.obras[index].imagen_url = this.obras[index].imagenes.length > 0 ?
                            this.obras[index].imagenes[0] : null;
                    }
                }
            }
        }
    }
});