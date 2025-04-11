<template>
    <DefaultTitleH1>Inspiraciones</DefaultTitleH1>
    <div class="w-full flex justify-center items-center flex-wrap gap-6">
        <NuxtLink :to="ROUTE_NAMES.INSPIRATION_CREATE"
            class="bg-secondary rounded-[0.625rem] shadow-md text-white py-3 px-12">
            Agregar nueva
        </NuxtLink>
    </div>

    <ClientOnly v-if="isLoading">
        <div class="w-full flex justify-center">
            <div class="flex items-center">
                <p>Cargando inspiraciones...</p>
            </div>
        </div>
    </ClientOnly>

    <ClientOnly v-else-if="inspiraciones.length === 0">
        <div class="text-center">
            <p>No hay inspiraciones disponibles.</p>
        </div>
    </ClientOnly>

    <ClientOnly v-else>
        <div class="grid grid-cols-1 justify-items-center md:grid-cols-2 xl:grid-cols-3 gap-8">
            <InspiracionCard v-for="inspiracion in inspiraciones" :key="inspiracion.id" :inspiracion="inspiracion"
                @delete="confirmDelete" />
        </div>
    </ClientOnly>

    <div v-if="showDeleteModal" class="flex items-center justify-center fixed z-50 inset-0">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="w-full max-w-sm flex flex-col items-center gap-5 relative bg-white rounded-3xl pt-10 p-6 z-10">
            <button @click="showDeleteModal = false" class="absolute top-4 right-4">
                <Icon name="tabler:plus" size="1.5rem" class="rotate-45" />
            </button>
            <h2 class="text-2xl text-center">¿Estás seguro de que deseas eliminar esta inspiración?</h2>
            <p class="text-center text-light">Esta acción es irreversible</p>
            <NuxtImg :src="inspiracionToDelete?.imagen_url" class="w-40 h-40 object-contain rounded-lg mt-4"
                v-if="inspiracionToDelete?.imagen_url" alt="Imagen de inspiración" />
            <div class="flex justify-center gap-4">
                <ButtonPrimary @click="showDeleteModal = false">
                    Cancelar
                </ButtonPrimary>
                <ButtonSecondary @click="deleteInspiracion">
                    Eliminar
                </ButtonSecondary>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useInspiracionesStore } from '~/store/inspiraciones';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const inspiracionesStore = useInspiracionesStore();
const { $toast } = useNuxtApp();

const isLoading = ref(false);
const showDeleteModal = ref(false);
const inspiracionToDelete = ref(null);

onMounted(async () => {
    isLoading.value = true;
    try {
        await inspiracionesStore.fetchInspiraciones();
    } catch (error) {
        $toast.error('No se pudieron cargar las inspiraciones');
    } finally {
        isLoading.value = false;
    }
});

const inspiraciones = computed(() => {
    return inspiracionesStore.getInspiraciones;
});

const confirmDelete = (inspiracion) => {
    inspiracionToDelete.value = inspiracion;
    showDeleteModal.value = true;
};

const deleteInspiracion = async () => {
    if (!inspiracionToDelete.value) return;

    try {
        await inspiracionesStore.deleteInspiracion(inspiracionToDelete.value.id);
        $toast.success('Inspiración eliminada correctamente');
        showDeleteModal.value = false;
        inspiracionToDelete.value = null;
    } catch (error) {
        $toast.error('No se pudo eliminar la inspiración');
    }
};
</script>