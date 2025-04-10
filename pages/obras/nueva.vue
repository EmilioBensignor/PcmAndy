<template>
    <DefaultTitleH1>Nueva Obra</DefaultTitleH1>
    <FormObra :initial-data="{}" :is-loading="isLoading" @submit="handleSubmit" />
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { useObraService } from '~/composables/useObraService';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();
const router = useRouter();

const isLoading = ref(false);
const obraService = useObraService();

const handleSubmit = async (formData) => {
    isLoading.value = true;

    try {
        $toast.info('Guardando la obra...');

        const obraData = obraService.prepareObraData(formData);

        const nuevaObra = await obrasStore.createObra(obraData);

        if (!nuevaObra || !nuevaObra.id) {
            throw new Error('No se pudo crear la obra');
        }

        if (formData.imagenes && formData.imagenes.length > 0) {
            await obraService.uploadImages(
                formData.imagenes,
                formData.titulo,
                nuevaObra.id,
                0,
                formData.imagen_destacada_index
            );
        } else {
            $toast.warn('No se subieron imágenes para esta obra');
        }

        $toast.success('Obra creada correctamente');
        await navigateTo(ROUTE_NAMES.WORKS);

    } catch (error) {
        console.error('Error al guardar la obra:', error);
        $toast.error(`Ocurrió un error al guardar la obra: ${error.message || 'Error desconocido'}`);
    } finally {
        isLoading.value = false;
    }
};
</script>