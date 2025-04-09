<template>
    <DefaultTitleH1>Editar Obra</DefaultTitleH1>
    <div v-if="isLoading" class="w-full flex justify-center mt-8">
        <div class="flex items-center gap-2">
            <i class="pi pi-spinner pi-spin text-lg"></i>
            <span>Cargando obra...</span>
        </div>
    </div>
    <div v-else-if="!obra" class="text-center mt-8">
        <p>No se encontró la obra solicitada.</p>
        <NuxtLink :to="{ name: ROUTE_NAMES.OBRAS }" class="mt-4 inline-block primaryButton">
            Volver a la lista
        </NuxtLink>
    </div>
    <FormObra v-else :initial-data="obra" :is-editing="true" :is-loading="isSaving" @submit="handleSubmit" />
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();
const router = useRouter();
const route = useRoute();

const obra = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);

onMounted(async () => {
    try {
        if (obrasStore.obras.length === 0) {
            await obrasStore.fetchObras();
        }

        const obraEncontrada = obrasStore.getObraById(route.params.id);

        if (!obraEncontrada) {
            $toast.error('Obra no encontrada');
            return;
        }

        obra.value = obraEncontrada;
    } catch (error) {
        console.error('Error al cargar la obra:', error);
        $toast.error('No se pudo cargar la información de la obra');
    } finally {
        isLoading.value = false;
    }
});

const handleSubmit = async (formData) => {
    isSaving.value = true;

    try {
        $toast.info('Actualizando la obra...');

        const imageUrls = [...(obra.value.imagenes || [])];
        const imagenDestacada = obra.value.imagen_url;

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
            imagen_url: imageUrls[formData.imagen_destacada_index] || imagenDestacada,
            imagenes: imageUrls,
            imagen_destacada_index: formData.imagen_destacada_index || 0
        };

        await obrasStore.updateObra(route.params.id, obraData);

        $toast.success('Obra actualizada correctamente');

        await navigateTo({ name: ROUTE_NAMES.OBRAS });

    } catch (error) {
        console.error('Error al actualizar la obra:', error);
        $toast.error('Ocurrió un error al actualizar la obra. Inténtalo de nuevo.');
    } finally {
        isSaving.value = false;
    }
};
</script>