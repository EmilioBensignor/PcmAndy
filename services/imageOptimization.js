export const imageOptimization = {
    // Configuración de buckets disponibles
    BUCKETS: {
        productos: 'productos',
        obras: 'obras',
        inspiraciones: 'inspiraciones'
    },

    // Configuración por defecto para imágenes
    DEFAULT_IMAGE_CONFIG: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxWidth: 1200,
        quality: 0.8,
        outputFormat: 'webp'
    },

    // Configuraciones específicas por bucket (sobreescriben los valores por defecto)
    BUCKET_CONFIGS: {
        obras: {
            maxWidth: 1500, // Las obras de arte pueden necesitar mayor resolución
            quality: 0.9  // Mayor calidad para obras de arte
        },
        inspiraciones: {
            maxWidth: 1000 // Menor resolución para inspiraciones
        }
    },

    // Obtener configuración para un bucket específico
    getConfigForBucket(bucket) {
        const bucketName = this.BUCKETS[bucket] || this.BUCKETS.productos;
        return {
            ...this.DEFAULT_IMAGE_CONFIG,
            ...(this.BUCKET_CONFIGS[bucketName] || {})
        };
    },

    // Comprimir imagen antes de subir
    async compressImage(file, bucket = 'productos') {
        const config = this.getConfigForBucket(bucket);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar si excede el ancho máximo
                    if (width > config.maxWidth) {
                        const ratio = config.maxWidth / width;
                        width = config.maxWidth;
                        height = height * ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        blob => {
                            const optimizedFile = new File(
                                [blob],
                                `${file.name.split('.')[0]}.${config.outputFormat}`,
                                { type: `image/${config.outputFormat}` }
                            );
                            resolve(optimizedFile);
                        },
                        `image/${config.outputFormat}`,
                        config.quality
                    );
                };
                img.onerror = () => reject(new Error('Error al cargar la imagen'));
            };
            reader.onerror = error => reject(error);
        });
    },

    // Generar nombre único para la imagen basado en el tipo de contenido
    generateImageName(title = '', bucket = 'productos') {
        // Definir el prefijo según el bucket
        let baseTitle = '';

        if (bucket === this.BUCKETS.obras) {
            baseTitle = title || 'obra';
        } else if (bucket === this.BUCKETS.inspiraciones) {
            baseTitle = title || 'inspiracion';
        } else {
            baseTitle = title || 'producto';
        }

        // Limpiar y normalizar el título
        const cleanTitle = baseTitle
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales por guiones
            .replace(/^-+|-+$/g, '')         // Eliminar guiones al inicio y final
            .substring(0, 30);               // Limitar longitud

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const config = this.getConfigForBucket(bucket);

        return `${cleanTitle}-${timestamp}-${randomString}.${config.outputFormat}`;
    },

    // Subir imagen con optimización
    async uploadImage(file, options = {}) {
        try {
            const bucketName = options.bucket || 'productos';
            const config = this.getConfigForBucket(bucketName);
            const supabase = useSupabaseClient();

            // Validar tipo de archivo
            if (!config.allowedTypes.includes(file.type)) {
                throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${config.allowedTypes.join(', ')}`);
            }

            // Validar tamaño
            if (file.size > config.maxSize) {
                throw new Error(`El archivo excede el tamaño máximo permitido (${config.maxSize / (1024 * 1024)}MB)`);
            }

            // Comprimir imagen si no es un GIF (los GIFs pierden la animación al comprimirse)
            let fileToUpload = file;
            if (file.type !== 'image/gif') {
                fileToUpload = await this.compressImage(file, bucketName);
            }

            // Generar nombre único
            const fileName = this.generateImageName(options.title, bucketName);

            // Subir a Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, fileToUpload);

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error(`Error al subir imagen a ${options.bucket || 'productos'}:`, error);
            throw error;
        }
    },

    // Eliminar imagen
    async deleteImage(imageUrl, bucket = 'productos') {
        try {
            if (!imageUrl) return true; // Si no hay URL, no hay nada que eliminar

            const supabase = useSupabaseClient();

            // Extraer nombre del archivo de la URL
            let fileName;
            if (imageUrl.includes('/')) {
                fileName = imageUrl.split('/').pop();
            } else {
                fileName = imageUrl; // Si ya es solo el nombre del archivo
            }

            const { error } = await supabase.storage
                .from(bucket)
                .remove([fileName]);

            if (error) {
                console.warn(`Error al intentar eliminar ${fileName} del bucket ${bucket}:`, error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error(`Error al eliminar imagen de ${bucket}:`, error);
            throw error;
        }
    }
};