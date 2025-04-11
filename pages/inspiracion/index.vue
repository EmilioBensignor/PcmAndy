<template>
    <DefaultTitleH1>Inspiraciones</DefaultTitleH1>
    <div class="w-full flex justify-center items-center flex-wrap gap-6">
        <NuxtLink :to="ROUTE_NAMES.INSPIRATION_CREATE"
            class="bg-secondary rounded-[0.625rem] shadow-md text-white py-3 px-12">
            Agregar nueva
        </NuxtLink>
        <div class="w-full flex flex-col gap-3 my-4">
            <div class="w-full flex flex-wrap gap-6 my-2">
                <button v-for="color in ordenarColoresPorPosicion(coloresOptions)" :key="color.value" type="button"
                    class="w-10 h-10 rounded-md transition-all relative" :style="{
                        backgroundColor: color.hex,
                        
                        transform: colorSeleccionado === color.value ? 'rotate(45deg)' : 'scale(1)'
                    }" @click="filtrarPorColor(color)">
                </button>
            </div>
            <button v-if="colorSeleccionado" @click="limpiarFiltro" class="self-start underline">
                Limpiar filtro
            </button>
        </div>
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

    <div v-if="showDeleteModal" class="flex items-center justify-center fixed z-50 inset-0 p-3">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="w-full max-w-[480px] flex flex-col items-center gap-5 relative bg-white rounded-3xl pt-10 p-6 z-10">
            <button @click="showDeleteModal = false" class="absolute top-4 right-4">
                <Icon name="tabler:plus" size="1.5rem" class="rotate-45" />
            </button>
            <h2 class="text-2xl text-center">¿Estás seguro de que deseas eliminar esta inspiración?</h2>
            <p class="text-center text-light">Esta acción es irreversible</p>
            <NuxtImg :src="inspiracionToDelete?.imagen_url" class="w-40 h-40 object-contain rounded-lg mt-4"
                v-if="inspiracionToDelete?.imagen_url" alt="Imagen de inspiración" />
            <div class="flex justify-center flex-wrap gap-4">
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
import { useColoresStore } from '~/store/colores';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const inspiracionesStore = useInspiracionesStore();
const coloresStore = useColoresStore();
const { $toast } = useNuxtApp();

const isLoading = ref(false);
const showDeleteModal = ref(false);
const inspiracionToDelete = ref(null);
const colorSeleccionado = ref(null);

onMounted(async () => {
    isLoading.value = true;
    try {
        await inspiracionesStore.fetchInspiraciones();
        if (coloresStore.colores.length === 0) {
            await coloresStore.fetchColores();
        }
    } catch (error) {
        $toast.error('No se pudieron cargar las inspiraciones');
    } finally {
        isLoading.value = false;
    }
});

const inspiraciones = computed(() => {
    return inspiracionesStore.getInspiraciones;
});

const coloresOptions = computed(() => {
    return coloresStore.getColoresAsOptions;
});

const ordenarColoresPorPosicion = (colores) => {
    return [...colores].sort((a, b) => a.posicion - b.posicion);
};

const filtrarPorColor = async (color) => {
    if (colorSeleccionado.value === color.value) {
        return limpiarFiltro();
    }

    isLoading.value = true;
    try {
        colorSeleccionado.value = color.value;
        await inspiracionesStore.fetchInspiracionesPorColor(color.value);
    } catch (error) {
        $toast.error(`Error al filtrar por color: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
};

const limpiarFiltro = async () => {
    isLoading.value = true;
    try {
        colorSeleccionado.value = null;
        await inspiracionesStore.fetchInspiraciones();
    } catch (error) {
        $toast.error(`Error al limpiar filtro: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
};

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