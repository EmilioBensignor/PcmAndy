<template>
    <DefaultTitleH1>Editar Obra</DefaultTitleH1>
    <div v-if="isLoading" class="flex justify-center items-center h-40">
        <p>Cargando información de la obra...</p>
    </div>
    <ObraForm v-else :initial-data="obraData" :is-editing="true" :is-loading="isSubmitting" @submit="handleSubmit" />
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { useObraService } from '~/composables/useObraService';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const route = useRoute();
const router = useRouter();
const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();

const obraId = computed(() => route.params.id);
const obraData = ref({});
const isLoading = ref(true);
const isSubmitting = ref(false);
const obraService = useObraService();

onMounted(async () => {
    try {
        const obra = await obrasStore.fetchObraById(obraId.value);
        obraData.value = {
            id: obra.id,
            titulo: obra.titulo || '',
            descripcion: obra.descripcion || '',
            anio: obra.anio || '',
            ancho: obra.ancho || '',
            alto: obra.alto || '',
            categoria_id: obra.categoria_id || null,
            categorias: obra.categorias || null,
            destacado: obra.destacado || false,
            imagenes: obra.imagenes || [],
            imagen_url: obra.imagen_url || null
        };
    } catch (error) {
        console.error('Error al cargar la obra:', error);
        $toast.error('No se pudo cargar la información de la obra');
        router.push(ROUTE_NAMES.WORKS);
    } finally {
        isLoading.value = false;
    }
});

const handleSubmit = async (formData) => {
    isSubmitting.value = true;

    try {
        $toast.info('Actualizando la obra...');

        const imagenesToDelete = [];
        if (obraData.value.imagenes && formData.existingImages) {
            obraData.value.imagenes.forEach(imageUrl => {
                if (!formData.existingImages.includes(imageUrl)) {
                    imagenesToDelete.push(imageUrl);
                }
            });
        }

        const obraUpdateData = obraService.prepareObraData(formData);
        await obrasStore.updateObra(obraId.value, obraUpdateData);

        if (formData.imagenes && formData.imagenes.length > 0) {
            await obraService.uploadImages(
                formData.imagenes,
                formData.titulo,
                obraId.value,
                formData.existingImages?.length || 0,
                formData.imagen_destacada_index
            );
        }

        await obraService.updateFeaturedImage(
            obraId.value,
            formData.existingImages,
            formData.imagen_destacada_index
        );

        await obraService.deleteImages(obraId.value, imagenesToDelete);

        await obraService.updateImagesOrder(obraId.value, formData.existingImages);

        $toast.success('Obra actualizada correctamente');
        router.push(ROUTE_NAMES.WORKS);

    } catch (error) {
        console.error('Error al actualizar la obra:', error);
        $toast.error(`Ocurrió un error al actualizar la obra: ${error.message || 'Error desconocido'}`);
    } finally {
        isSubmitting.value = false;
    }
};
</script>