<template>
    <DefaultTitleH1>Obras</DefaultTitleH1>
    <div class="flex">
        <ButtonSecondary :to="ROUTE_NAMES.WORKS_CREATE">
            Agregar nueva
        </ButtonSecondary>
    </div>
    <div class="w-full flex justify-center items-center flex-wrap gap-6 lg:gap-9">
        <div class="w-full max-w-[320px] relative">
            <input v-model="searchTerm" type="text" id="search" placeholder="Busca una obra"
                class="w-full bg-white border rounded-[0.625rem] shadow-md focus:outline-none pl-10 pr-3 py-2" />
            <Icon name="tabler:search" size="1.125rem" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <button v-if="searchTerm" @click="searchTerm = ''"
                class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Icon name="tabler:x" size="1.125rem" />
            </button>
        </div>
        <Select id="categoria" v-model="selectedCategory" :options="categoriasWithAll" optionLabel="nombre"
            optionValue="id" placeholder="Categoría" class="max-w-[320px] md:max-w-[210px]" />
        <Select id="ordenar" v-model="sortOption" :options="sortOptions" optionLabel="nombre" optionValue="value"
            placeholder="Ordenar por" class="max-w-[320px] md:max-w-[250px]" />
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
        <div class="flex flex-wrap justify-center gap-8">
            <ObraCard v-for="obra in filteredObras" :key="obra.id" :obra="obra" @delete="confirmDelete" />
        </div>
    </ClientOnly>

    <div v-if="showDeleteModal" class="flex items-center justify-center fixed z-50 inset-0 p-3">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div
            class="w-full max-w-[480px] lg:max-w-4xl flex flex-col gap-5 lg:gap-6 relative bg-white rounded-3xl pt-10 p-6 z-10">
            <button @click="showDeleteModal = false" class="absolute top-4 right-4">
                <Icon name="tabler:plus" size="1.5rem" class="rotate-45" />
            </button>
            <h2 class="text-xl lg:text-2xl text-center">¿Estás seguro de que deseas eliminar la obra "{{
                obraToDelete?.titulo }}"?
            </h2>
            <p class="text-center lg:text-xl text-light">Esta acción es irreversible</p>
            <div class="w-full flex justify-center flex-wrap gap-4 lg:gap-5">
                <div class="w-full max-w-[180px]">
                    <ButtonPrimary @click="showDeleteModal = false">
                        Cancel
                    </ButtonPrimary>
                </div>
                <div class="w-full max-w-[180px]">
                    <ButtonSecondary @click="deleteObra">
                        Eliminar
                    </ButtonSecondary>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useObrasStore } from '~/store/obras';
import { useCategoriasStore } from '~/store/categorias';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const obrasStore = useObrasStore();
const categoriasStore = useCategoriasStore();
const { $toast } = useNuxtApp();

const searchTerm = ref('');
const selectedCategory = ref(null);
const sortOption = ref(null);
const isLoading = ref(false);
const showDeleteModal = ref(false);
const obraToDelete = ref(null);

const sortOptions = [
    { nombre: 'Recientes', value: 'recent' },
    { nombre: 'Más viejo a más nuevo', value: 'oldest' },
    { nombre: 'Año', value: 'year' }
];

const categorias = computed(() => categoriasStore.getCategorias);

const categoriasWithAll = computed(() => [
    { nombre: 'Todas las categorías', id: null },
    ...categorias.value
]);

onMounted(async () => {
    isLoading.value = true;
    try {
        await Promise.all([
            obrasStore.fetchObras(),
            categoriasStore.fetchCategorias()
        ]);
    } catch (error) {
        $toast.error('No se pudieron cargar los datos');
    } finally {
        isLoading.value = false;
    }
});

const filteredObras = computed(() => {
    // Empezamos con todas las obras
    let result = obrasStore.getObras;

    // Aplicar filtro por término de búsqueda si existe
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        result = result.filter(obra =>
            (obra.titulo?.toLowerCase().includes(term)) ||
            (obra.descripcion?.toLowerCase().includes(term)) ||
            (obra.categoria?.toLowerCase().includes(term))
        );
    }

    // Aplicar filtro por categoría si está seleccionada
    if (selectedCategory.value) {
        result = result.filter(obra => obra.categoria_id === selectedCategory.value);
    }

    // Aplicar el ordenamiento según la opción seleccionada
    if (sortOption.value) {
        switch (sortOption.value) {
            case 'recent':
                // Por defecto ya están ordenados por más recientes primero
                break;
            case 'oldest':
                // Invertimos el orden actual (suponiendo que por defecto es más reciente primero)
                result = [...result].reverse();
                break;
            case 'year':
                // Ordenar por año (de más reciente a más antiguo)
                result = [...result].sort((a, b) => {
                    const yearA = a.anio ? parseInt(a.anio) : 0;
                    const yearB = b.anio ? parseInt(b.anio) : 0;
                    return yearB - yearA;
                });
                break;
        }
    }

    return result;
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