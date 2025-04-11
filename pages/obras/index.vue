<template>
    <DefaultTitleH1>Obras</DefaultTitleH1>
    <div class="w-full flex justify-center items-center flex-wrap gap-6">
        <NuxtLink :to="ROUTE_NAMES.WORKS_CREATE"
            class="bg-secondary rounded-[0.625rem] shadow-md text-white py-3 px-12">
            Agregar nueva
        </NuxtLink>
        <div class="relative">
            <input v-model="searchTerm" type="text" id="search" placeholder="Busca una obra"
                class="w-full bg-white border rounded-[0.625rem] shadow-md focus:outline-none pl-10 pr-3 py-3" />
            <Icon name="tabler:search" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
    </div>

    <ClientOnly v-if="isLoading">
        <div class="w-full flex justify-center">
            <div class="flex items-center">
                <p>Cargando obras...</p>
            </div>
        </div>
    </ClientOnly>

    <ClientOnly v-else-if="filteredObras.length === 0">
        <div class="text-center">
            <p>No hay obras disponibles.</p>
        </div>
    </ClientOnly>

    <ClientOnly v-else>
        <div class="grid grid-cols-1 justify-items-center md:grid-cols-2 xl:grid-cols-3 gap-8">
            <ObraCard v-for="obra in filteredObras" :key="obra.id" :obra="obra" @delete="confirmDelete" />
        </div>
    </ClientOnly>

    <div v-if="showDeleteModal" class="flex items-center justify-center fixed z-50 inset-0">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="w-full max-w-sm flex flex-col gap-5 relative bg-white rounded-3xl pt-10 p-6 z-10">
            <button @click="showDeleteModal = false" class="absolute top-4 right-4">
                <Icon name="tabler:plus" size="1.5rem" class="rotate-45" />
            </button>
            <h2 class="text-2xl text-center">¿Estás seguro de que deseas eliminar la obra "{{ obraToDelete?.titulo }}"?
            </h2>
            <p class="text-center text-light">Esta acción es irreversible</p>
            <div class="flex justify-center gap-4">
                <ButtonPrimary @click="showDeleteModal = false">
                    Cancel
                </ButtonPrimary>
                <ButtonSecondary @click="deleteObra">
                    Eliminar
                </ButtonSecondary>
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