<template>
    <DefaultTitleH1>Obras</DefaultTitleH1>
    <div class="w-full flex justify-center items-center flex-wrap gap-8">
        <NuxtLink :to="ROUTE_NAMES.WORKS_CREATE"
            class="bg-secondary rounded-[0.625rem] shadow-md text-white py-3 px-12">
            Agregar nueva
        </NuxtLink>
        <div class="relative">
            <input v-model="searchTerm" type="text" placeholder="Busca una obra"
                class="w-full bg-white border rounded-[0.625rem] shadow-md focus:outline-none pl-10 pr-3 py-3" />
            <Icon name="tabler:search" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
    </div>

    <div v-if="isLoading" class="w-full flex justify-center mt-8">
        <div class="flex items-center gap-2">
            <i class="pi pi-spinner pi-spin text-lg"></i>
            <span>Cargando obras...</span>
        </div>
    </div>

    <div v-else-if="filteredObras.length === 0" class="text-center mt-8">
        <p>No hay obras disponibles.</p>
    </div>

    <div v-else class="grid grid-cols-1 justify-items-center md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
        <ObraCard v-for="obra in filteredObras" :key="obra.id" :obra="obra" @delete="confirmDelete" />
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="bg-white rounded-lg p-6 max-w-md w-full z-10">
            <h3 class="text-xl font-bold mb-4">Confirmar eliminación</h3>
            <p class="mb-6">¿Estás seguro de que deseas eliminar la obra "{{ obraToDelete?.titulo }}"? Esta acción no se
                puede deshacer.</p>
            <div class="flex justify-end gap-4">
                <button @click="showDeleteModal = false"
                    class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                    Cancelar
                </button>
                <button @click="deleteObra"
                    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                    Eliminar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const obrasStore = useObrasStore();
const { $toast } = useNuxtApp();

const searchTerm = ref('');
const isLoading = ref(false);
const showDeleteModal = ref(false);
const obraToDelete = ref(null);

onMounted(async () => {
    isLoading.value = true;
    try {
        await obrasStore.fetchObras();
    } catch (error) {
        $toast.error('No se pudieron cargar las obras');
    } finally {
        isLoading.value = false;
    }
});

const filteredObras = computed(() => {
    if (!searchTerm.value) return obrasStore.getObras;

    const term = searchTerm.value.toLowerCase();
    return obrasStore.getObras.filter(obra =>
        (obra.titulo?.toLowerCase().includes(term)) ||
        (obra.descripcion?.toLowerCase().includes(term)) ||
        (obra.categoria?.toLowerCase().includes(term))
    );
});

const confirmDelete = (obra) => {
    obraToDelete.value = obra;
    showDeleteModal.value = true;
};

const deleteObra = async () => {
    if (!obraToDelete.value) return;

    try {
        await obrasStore.deleteObra(obraToDelete.value.id);
        $toast.success('Obra eliminada correctamente');
        showDeleteModal.value = false;
        obraToDelete.value = null;
    } catch (error) {
        $toast.error('No se pudo eliminar la obra');
    }
};
</script>