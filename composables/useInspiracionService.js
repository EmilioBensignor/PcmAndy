import { imageOptimization } from "~/services/imageOptimization";
import { useInspiracionesStore } from "~/store/inspiraciones";
import { useColoresStore } from "~/store/colores";

export const useInspiracionService = () => {
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const inspiracionesStore = useInspiracionesStore();
    const coloresStore = useColoresStore();

    const uploadImage = async (imagen, inspiracionId) => {
        if (!imagen) return null;

        try {
            const bucketName = 'inspiraciones-imagenes';

            const imageUrl = await imageOptimization.uploadImage(imagen, {
                bucket: bucketName,
                title: `inspiracion-${inspiracionId}`
            });

            if (imageUrl) {
                await inspiracionesStore.updateInspiracion(inspiracionId, {
                    imagen_url: imageUrl
                });

                return imageUrl;
            }

            return null;
        } catch (error) {
            console.error('Error al subir imagen de inspiración:', error);
            $toast.error(`Error al subir la imagen: ${error.message || 'Error desconocido'}`);
            return null;
        }
    };

    const deleteImage = async (inspiracionId, imageUrl) => {
        if (!imageUrl) return true;

        try {
            await imageOptimization.deleteImage(imageUrl, 'inspiraciones-imagenes');

            await inspiracionesStore.updateInspiracion(inspiracionId, {
                imagen_url: null
            });

            return true;
        } catch (error) {
            console.error(`Error al eliminar imagen ${imageUrl}:`, error);
            $toast.warn(`No se pudo eliminar la imagen: ${error.message}`);
            return false;
        }
    };

    const saveColores = async (inspiracionId, coloresIds) => {
        if (!inspiracionId) return false;

        try {
            await coloresStore.saveInspiracionColores(inspiracionId, coloresIds);
            return true;
        } catch (error) {
            console.error('Error al guardar colores de la inspiración:', error);
            $toast.error(`Error al asociar colores: ${error.message || 'Error desconocido'}`);
            return false;
        }
    };

    const getInspiracionColores = async (inspiracionId) => {
        if (!inspiracionId) return [];

        try {
            return await coloresStore.getColoresByInspiracionId(inspiracionId);
        } catch (error) {
            console.error('Error al obtener colores de la inspiración:', error);
            return [];
        }
    };

    const prepareInspiracionData = () => {
        return {};
    };

    return {
        uploadImage,
        deleteImage,
        saveColores,
        getInspiracionColores,
        prepareInspiracionData
    };
};