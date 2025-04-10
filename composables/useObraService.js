import { imageOptimization } from "~/services/imageOptimization";
import { useObrasStore } from "~/store/obras";

export const useObraService = () => {
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const obrasStore = useObrasStore();

    const uploadImages = async (imagenes, titulo, obraId, startPos = 0, indexDestacada = 0) => {
        const uploadedUrls = [];
        const bucketName = 'obras-imagenes';

        if (!imagenes || imagenes.length === 0) return uploadedUrls;

        for (let i = 0; i < imagenes.length; i++) {
            const imagen = imagenes[i];
            try {
                const imageUrl = await imageOptimization.uploadImage(imagen, {
                    bucket: bucketName,
                    title: titulo
                });

                if (imageUrl) {
                    const isDestacada = indexDestacada === startPos + i;

                    await obrasStore.createObraImagen({
                        obra_id: obraId,
                        url: imageUrl,
                        posicion: startPos + i,
                        es_principal: isDestacada
                    });

                    uploadedUrls.push(imageUrl);
                }
            } catch (error) {
                console.error('Error al subir imagen:', error);
                $toast.error(`Error al subir una imagen: ${error.message || 'Error desconocido'}`);
            }
        }

        return uploadedUrls;
    };

    const updateFeaturedImage = async (obraId, existingImages, indexDestacada) => {
        if (!existingImages || existingImages.length === 0 || indexDestacada < 0) return;

        try {
            await supabase
                .from('obras_imagenes')
                .update({ es_principal: false })
                .eq('obra_id', obraId);

            if (indexDestacada < existingImages.length) {
                const destacadaUrl = existingImages[indexDestacada];

                const { data: imagenData } = await supabase
                    .from('obras_imagenes')
                    .select('id')
                    .eq('url', destacadaUrl)
                    .eq('obra_id', obraId)
                    .single();

                if (imagenData) {
                    await supabase
                        .from('obras_imagenes')
                        .update({ es_principal: true })
                        .eq('id', imagenData.id);
                }
            }
        } catch (error) {
            console.error('Error al actualizar imagen destacada:', error);
            $toast.warn('No se pudo actualizar la imagen destacada');
        }
    };

    const updateImagesOrder = async (obraId, orderedImages) => {
        if (!orderedImages || orderedImages.length === 0) return;

        try {
            const { data: imagenes } = await supabase
                .from('obras_imagenes')
                .select('id, url')
                .eq('obra_id', obraId);

            if (imagenes && imagenes.length > 0) {
                for (let i = 0; i < orderedImages.length; i++) {
                    const url = orderedImages[i];
                    const imagen = imagenes.find(img => img.url === url);

                    if (imagen) {
                        await supabase
                            .from('obras_imagenes')
                            .update({ posicion: i })
                            .eq('id', imagen.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error al actualizar el orden de las imágenes:', error);
        }
    };

    const deleteImages = async (obraId, imageUrls) => {
        if (!imageUrls || imageUrls.length === 0) return;

        for (const imageUrl of imageUrls) {
            try {
                const { data: imagenData } = await supabase
                    .from('obras_imagenes')
                    .select('id')
                    .eq('url', imageUrl)
                    .eq('obra_id', obraId)
                    .single();

                if (imagenData) {
                    await obrasStore.deleteObraImagen(imagenData.id);
                }
            } catch (error) {
                console.error(`Error al eliminar imagen ${imageUrl}:`, error);
                $toast.warn(`No se pudo eliminar una imagen: ${error.message}`);
            }
        }
    };

    const prepareObraData = (formData) => {
        return {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            anio: parseInt(formData.anio),
            ancho: parseFloat(formData.ancho),
            alto: parseFloat(formData.alto),
            categoria_id: formData.categoria_id,
            destacado: formData.destacado
        };
    };

    return {
        uploadImages,
        updateFeaturedImage,
        updateImagesOrder,
        deleteImages,
        prepareObraData
    };
};