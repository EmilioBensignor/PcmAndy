export const imageOptimization = {
    BUCKETS: {
        obras: 'obras-imagenes',
        inspiraciones: 'inspiraciones-imagenes'
    },

    DEFAULT_IMAGE_CONFIG: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxWidth: 1200,
        quality: 0.8,
        outputFormat: 'webp'
    },

    BUCKET_CONFIGS: {
        'obras-imagenes': {
            maxWidth: 1500,
            quality: 0.9
        },
        'inspiraciones-imagenes': {
            maxWidth: 1000
        }
    },

    getConfigForBucket(bucket) {
        const bucketName = this.BUCKETS[bucket] || bucket;
        return {
            ...this.DEFAULT_IMAGE_CONFIG,
            ...(this.BUCKET_CONFIGS[bucketName] || {})
        };
    },

    async compressImage(file, bucket = 'obras-imagenes') {
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

    generateImageName(title = '', bucket = 'obras-imagenes') {
        let baseTitle = '';

        if (bucket === this.BUCKETS.obras || bucket === 'obras-imagenes') {
            baseTitle = title || 'obra';
        } else if (bucket === this.BUCKETS.inspiraciones || bucket === 'inspiraciones-imagenes') {
            baseTitle = title || 'inspiracion';
        } else {
            baseTitle = title || 'archivo';
        }

        const cleanTitle = baseTitle
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 30);

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const config = this.getConfigForBucket(bucket);

        return `${cleanTitle}-${timestamp}-${randomString}.${config.outputFormat}`;
    },

    async uploadImage(file, options = {}) {
        try {
            const bucketName = options.bucket || 'obras-imagenes';
            const config = this.getConfigForBucket(bucketName);
            const supabase = useSupabaseClient();

            if (!config.allowedTypes.includes(file.type)) {
                throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${config.allowedTypes.join(', ')}`);
            }

            if (file.size > config.maxSize) {
                throw new Error(`El archivo excede el tamaño máximo permitido (${config.maxSize / (1024 * 1024)}MB)`);
            }

            let fileToUpload = file;
            if (file.type !== 'image/gif') {
                fileToUpload = await this.compressImage(file, bucketName);
            }

            const fileName = this.generateImageName(options.title, bucketName);

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, fileToUpload);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error(`Error al subir imagen a ${options.bucket || 'obras-imagenes'}:`, error);
            throw error;
        }
    },

    async deleteImage(imageUrl, bucket = 'obras-imagenes') {
        try {
            if (!imageUrl) return true;

            const supabase = useSupabaseClient();

            let fileName;
            if (imageUrl.includes('/')) {
                fileName = imageUrl.split('/').pop();
            } else {
                fileName = imageUrl;
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