<template>
    <DefaultTitleH1>Nueva Inspiración</DefaultTitleH1>
    <InspiracionForm :initial-data="{}" :is-loading="isLoading" @submit="handleSubmit" />
</template>

<script setup>
import { useInspiracionesStore } from '~/store/inspiraciones';
import { useInspiracionService } from '~/composables/useInspiracionService';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const inspiracionesStore = useInspiracionesStore();
const { $toast } = useNuxtApp();
const router = useRouter();

const isLoading = ref(false);
const inspiracionService = useInspiracionService();

const handleSubmit = async (formData) => {
    isLoading.value = true;

    try {
        const nuevaInspiracion = await inspiracionesStore.createInspiracion({});

        if (!nuevaInspiracion || !nuevaInspiracion.id) {
            throw new Error('No se pudo crear la inspiración');
        }

        if (formData.imagen) {
            await inspiracionService.uploadImage(
                formData.imagen,
                nuevaInspiracion.id
            );
        } else {
            $toast.warn('No se subió imagen para esta inspiración');
        }

        if (formData.coloresIds && formData.coloresIds.length > 0) {
            await inspiracionService.saveColores(nuevaInspiracion.id, formData.coloresIds);
        } else {
            $toast.warn('No se seleccionaron colores para esta inspiración');
        }

        $toast.success('Inspiración creada correctamente');
        await navigateTo(ROUTE_NAMES.INSPIRATION);

    } catch (error) {
        console.error('Error al guardar la inspiración:', error);
        $toast.error(`Ocurrió un error al guardar la inspiración: ${error.message || 'Error desconocido'}`);
    } finally {
        isLoading.value = false;
    }
};
</script>