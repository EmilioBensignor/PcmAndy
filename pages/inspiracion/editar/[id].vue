<template>
    <DefaultTitleH1>Editar Inspiración</DefaultTitleH1>
    <div v-if="isLoading" class="flex justify-center items-center h-40">
        <p>Cargando información de la inspiración...</p>
    </div>
    <InspiracionForm v-else :initial-data="inspiracionData" :is-editing="true" :is-loading="isSubmitting"
        @submit="handleSubmit" />
</template>

<script setup>
import { useInspiracionesStore } from '~/store/inspiraciones';
import { useInspiracionService } from '~/composables/useInspiracionService';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const route = useRoute();
const router = useRouter();
const inspiracionesStore = useInspiracionesStore();
const { $toast } = useNuxtApp();

const inspiracionId = computed(() => route.params.id);
const inspiracionData = ref({});
const isLoading = ref(true);
const isSubmitting = ref(false);
const inspiracionService = useInspiracionService();

onMounted(async () => {
    try {
        // Cargar la información de la inspiración
        const inspiracion = await inspiracionesStore.fetchInspiracionById(inspiracionId.value);

        inspiracionData.value = {
            id: inspiracion.id,
            imagen_url: inspiracion.imagen_url || null
        };
    } catch (error) {
        console.error('Error al cargar la inspiración:', error);
        $toast.error('No se pudo cargar la información de la inspiración');
        router.push(ROUTE_NAMES.INSPIRATION);
    } finally {
        isLoading.value = false;
    }
});

const handleSubmit = async (formData) => {
    isSubmitting.value = true;

    try {
        $toast.info('Actualizando la inspiración...');

        // Manejar la imagen directamente
        if (formData.imagen) {
            // Si hay una imagen nueva, la eliminamos si existía previamente
            if (inspiracionData.value.imagen_url) {
                await inspiracionService.deleteImage(inspiracionId.value, inspiracionData.value.imagen_url);
            }

            // Subimos la nueva imagen
            await inspiracionService.uploadImage(
                formData.imagen,
                inspiracionId.value
            );
        }

        // Actualizar la relación con los colores
        await inspiracionService.saveColores(inspiracionId.value, formData.coloresIds);

        $toast.success('Inspiración actualizada correctamente');
        router.push(ROUTE_NAMES.INSPIRATION);

    } catch (error) {
        console.error('Error al actualizar la inspiración:', error);
        $toast.error(`Ocurrió un error al actualizar la inspiración: ${error.message || 'Error desconocido'}`);
    } finally {
        isSubmitting.value = false;
    }
};
</script>