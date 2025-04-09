<template>
    <DefaultTitleH1>Nueva Obra</DefaultTitleH1>
    <FormObra :initial-data="{}" :is-loading="isLoading" @submit="handleSubmit" />
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

definePageMeta({
    middleware: 'auth'
});

const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();
const router = useRouter();

const isLoading = ref(false);

const handleSubmit = async (formData) => {
    isLoading.value = true;

    try {
        $toast.info('Guardando la obra...');

        const imageUrls = [];

        if (formData.imagenes && formData.imagenes.length > 0) {
            for (const imagen of formData.imagenes) {
                try {
                    const imageUrl = await obrasStore.uploadImage(imagen, {
                        title: formData.titulo
                    });
                    if (imageUrl) {
                        imageUrls.push(imageUrl);
                    }
                } catch (error) {
                    console.error('Error al subir imagen:', error);
                }
            }
        }

        const obraData = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            anio: parseInt(formData.anio),
            dimensiones: {
                ancho: parseFloat(formData.ancho),
                alto: parseFloat(formData.alto)
            },
            categoria: formData.categoria,
            destacado: formData.destacado,
            imagen_url: imageUrls[formData.imagen_destacada_index] || null,
            imagenes: imageUrls,
            imagen_destacada_index: formData.imagen_destacada_index || 0,
            fecha_creacion: new Date().toISOString()
        };

        await obrasStore.createObra(obraData);

        $toast.success('Obra creada correctamente');

        await navigateTo({ name: ROUTE_NAMES.OBRAS });

    } catch (error) {
        console.error('Error al guardar la obra:', error);
        $toast.error('Ocurrió un error al guardar la obra. Inténtalo de nuevo.');
    } finally {
        isLoading.value = false;
    }
};
</script>