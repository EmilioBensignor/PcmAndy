<template>
    <DefaultTitleH1>Editar Obra</DefaultTitleH1>
    <FormObra :initial-data="obraData" :is-editing="true" :is-loading="isSubmitting" @submit="handleSubmit" />
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { imageOptimization } from '~/services/imageOptimization';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const route = useRoute();
const router = useRouter();
const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();

const obraId = computed(() => route.params.id);
const obraData = ref({});
const isLoading = ref(true);
const isSubmitting = ref(false);

onMounted(async () => {
    try {
        const obra = await obrasStore.fetchObraById(obraId.value);
        obraData.value = obra;
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

        if (formData.imagenes && formData.imagenes.length > 0) {
            const bucketName = 'obras-imagenes';

            for (let i = 0; i < formData.imagenes.length; i++) {
                const imagen = formData.imagenes[i];
                try {
                    const imageUrl = await imageOptimization.uploadImage(imagen, {
                        bucket: bucketName,
                        title: formData.titulo
                    });

                    if (imageUrl) {
                        const isDestacada = formData.imagen_destacada_index === (formData.existingImages?.length || 0) + i;

                        await obrasStore.createObraImagen({
                            obra_id: obraId.value,
                            url: imageUrl,
                            posicion: (formData.existingImages?.length || 0) + i,
                            es_principal: isDestacada
                        });
                    }
                } catch (error) {
                    console.error('Error al subir imagen:', error);
                    $toast.error(`Error al subir una imagen: ${error.message || 'Error desconocido'}`);
                }
            }
        }

        const obraUpdateData = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            anio: parseInt(formData.anio),
            ancho: parseFloat(formData.ancho),
            alto: parseFloat(formData.alto),
            categoria_id: formData.categoria_id,
            destacado: formData.destacado
        };

        await obrasStore.updateObra(obraId.value, obraUpdateData);

        if (formData.existingImages && formData.existingImages.length > 0 &&
            formData.imagen_destacada_index < formData.existingImages.length) {

            try {
                const { data: imagenes } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .select('id, url, posicion')
                    .eq('obra_id', obraId.value)
                    .order('posicion', { ascending: true });

                if (imagenes && imagenes.length > 0) {
                    await useSupabaseClient()
                        .from('obras_imagenes')
                        .update({ es_principal: false })
                        .eq('obra_id', obraId.value);

                    const destacadaUrl = formData.existingImages[formData.imagen_destacada_index];
                    const imagenDestacada = imagenes.find(img => img.url === destacadaUrl);

                    if (imagenDestacada) {
                        await useSupabaseClient()
                            .from('obras_imagenes')
                            .update({ es_principal: true })
                            .eq('id', imagenDestacada.id);
                    }
                }
            } catch (error) {
                console.error('Error al actualizar imagen destacada:', error);
            }
        }

        for (const imageUrl of imagenesToDelete) {
            try {
                const { data: imagenData } = await useSupabaseClient()
                    .from('obras_imagenes')
                    .select('id')
                    .eq('url', imageUrl)
                    .eq('obra_id', obraId.value)
                    .single();

                if (imagenData) {
                    await obrasStore.deleteObraImagen(imagenData.id);
                }
            } catch (error) {
                console.error(`Error al eliminar imagen ${imageUrl}:`, error);
            }
        }

        $toast.success('Obra actualizada correctamente');
        router.push({ name: ROUTE_NAMES.OBRAS });

    } catch (error) {
        console.error('Error al actualizar la obra:', error);
        $toast.error(`Ocurrió un error al actualizar la obra: ${error.message || 'Error desconocido'}`);
    } finally {
        isSubmitting.value = false;
    }
};
</script>