<template>
    <DefaultTitleH1>Obras</DefaultTitleH1>
    <div class="w-full flex justify-center items-center flex-wrap gap-8">
        <NuxtLink :to="ROUTE_NAMES.WORKS_CREATE"
            class="bg-secondary rounded-[0.625rem] shadow-md text-white py-3 px-12">
            Agregar nueva
        </NuxtLink>
        // REVISAR
        <div class="relative">
            <input v-model="searchTerm" type="text" placeholder="Busca una obra"
                class="w-full pl-10 pr-4 py-3 border rounded-[0.625rem] shadow-md focus:outline-none focus:ring-2 focus:ring-secondary" />
            <Icon name="tabler:search" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
    </div>
    <div v-if="filteredObras.length === 0" class="text-center mt-4">
        <p>No hay obras disponibles.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <ObraCard v-for="obra in filteredObras" :key="obra.id" :obra="obra" />
    </div>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { ref, computed } from 'vue';

const searchTerm = ref('');

const obras = [{
    id: 1,
    title: 'Obra 1',
    description: 'Descripción de la obra 1',
}, {
    id: 2,
    title: 'Obra 2',
    description: 'Descripción de la obra 2',
}, {
    id: 3,
    title: 'Obra 3',
    description: 'Descripción de la obra 3',
}];

const filteredObras = computed(() => {
    if (!searchTerm.value) return obras;

    const term = searchTerm.value.toLowerCase();
    return obras.filter(obra =>
        obra.title.toLowerCase().includes(term) ||
        obra.description.toLowerCase().includes(term)
    );
});
</script>