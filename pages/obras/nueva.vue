<template>
    <DefaultTitleH1>Nueva Obra</DefaultTitleH1>
    <FormObra :initial-data="{}" :is-loading="isLoading" @submit="handleSubmit" />
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { imageOptimization } from '~/services/imageOptimization';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();
const router = useRouter();

const isLoading = ref(false);

const handleSubmit = async (formData) => {
    isLoading.value = true;

    try {
        $toast.info('Guardando la obra...');

        const obraData = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            anio: parseInt(formData.anio),
            ancho: parseFloat(formData.ancho),
            alto: parseFloat(formData.alto),
            categoria_id: formData.categoria_id,
            destacado: formData.destacado
        };

        const nuevaObra = await obrasStore.createObra(obraData);

        if (!nuevaObra || !nuevaObra.id) {
            throw new Error('No se pudo crear la obra');
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
                        await obrasStore.createObraImagen({
                            obra_id: nuevaObra.id,
                            url: imageUrl,
                            posicion: i,
                            es_principal: i === formData.imagen_destacada_index
                        });
                    }
                } catch (error) {
                    console.error('Error al subir imagen:', error);
                    $toast.error(`Error al subir una imagen: ${error.message || 'Error desconocido'}`);
                }
            }
        } else if (!formData.existingImages?.length) {
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