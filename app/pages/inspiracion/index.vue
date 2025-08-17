<template>
    <DefaultTitleH1>Inspiraciones</DefaultTitleH1>
    <div class="w-full flex flex-col justify-center items-center gap-6">
        <div class="w-full max-w-[235px] flex">
            <ButtonSecondary :to="ROUTE_NAMES.INSPIRATION_CREATE">
                Agregar nueva
            </ButtonSecondary>
        </div>
        <div class="w-full md:max-w-[780px] flex flex-col items-center gap-3 my-4">
            <div class="w-full max-w-[400px] md:max-w-full flex flex-wrap justify-center md:justify-between gap-6 my-2">
                <button v-for="color in ordenarColoresPorPosicion(coloresOptions)" :key="color.value" type="button"
                    class="w-10 h-10 lg:w-12 lg:h-12 rounded-md transition-all relative" :style="{
                        backgroundColor: color.hex,

                        transform: colorSeleccionado === color.value ? 'rotate(45deg)' : 'scale(1)'
                    }" @click="filtrarPorColor(color)">
                </button>
            </div>
            <button v-if="colorSeleccionado" @click="limpiarFiltro" class="md:self-start underline">
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
        <div class="w-full max-w-4xl flex flex-wrap justify-center gap-8">
            <InspiracionCard v-for="inspiracion in inspiraciones" :key="inspiracion.id" :inspiracion="inspiracion"
                @delete="confirmDelete" />
        </div>
    </ClientOnly>

    <div v-if="showDeleteModal" class="flex items-center justify-center fixed z-50 inset-0 p-3">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div
            class="w-full max-w-[480px] lg:max-w-4xl flex flex-col items-center gap-5 lg:gap-6 relative bg-white rounded-3xl pt-10 p-6 z-10">
            <button @click="showDeleteModal = false" class="absolute top-4 right-4">
                <Icon name="tabler:plus" size="1.5rem" class="rotate-45" />
            </button>
            <h2 class="text-2xl lg:text-2xl text-center">¿Estás seguro de que deseas eliminar esta inspiración?</h2>
            <p class="text-center lg:text-xl text-light">Esta acción es irreversible</p>
            <NuxtImg :src="inspiracionToDelete?.imagen_url" class="w-full h-40 object-contain rounded-lg mt-4"
                v-if="inspiracionToDelete?.imagen_url" alt="Imagen de inspiración" />
            <div class="w-full flex justify-center flex-wrap gap-4 lg:gap-5">
                <div class="w-full max-w-[180px]">
                    <ButtonSecondary @click="deleteInspiracion">
                        Eliminar
                    </ButtonSecondary>
                </div>
                <div class="w-full max-w-[180px]">
                    <ButtonPrimary @click="showDeleteModal = false">
                        Cancelar
                    </ButtonPrimary>
                </div>
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
        const promises = [
            inspiracionesStore.fetchInspiraciones()
        ];
        
        if (coloresStore.colores.length === 0) {
            promises.push(coloresStore.fetchColores());
        }
        
        await Promise.all(promises);
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