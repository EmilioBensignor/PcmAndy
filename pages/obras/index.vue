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
    <div v-if="filteredObras.length === 0" class="text-center mt-4">
        <p>No hay obras disponibles.</p>
    </div>
    <div v-else class="grid grid-cols-1 justify-items-center md:grid-cols-2 xl:grid-cols-3 gap-8 mt-2">
        <ObraCard v-for="obra in filteredObras" :key="obra.id" :obra="obra" />
    </div>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const searchTerm = ref('');

const obras = [
    {
        id: 1,
        titulo: 'Obra 1',
        img: 'Obra',
        descripcion: 'Descripción de la obra 1',
        anio: '2020',
        ancho: '23',
        alto: '12',
        categoria: 1,
        destacado: true,
    },
    {
        id: 2,
        titulo: 'Obra 2',
        img: 'Obra',
        descripcion: 'Descripción de la obra 2',
        anio: '2021',
        ancho: '45',
        alto: '30',
        categoria: 1,
        destacado: false,
    },
    {
        id: 3,
        titulo: 'Obra 3',
        img: 'Obra',
        descripcion: 'Descripción de la obra 3',
        anio: '2022',
        ancho: '100',
        alto: '50',
        categoria: 2,
        destacado: true,
    },
];


// REVISAR
const filteredObras = computed(() => {
    if (!searchTerm.value) return obras;

    const term = searchTerm.value.toLowerCase();
    return obras.filter(obra =>
        obra.titulo.toLowerCase().includes(term) ||
        obra.descripcion.toLowerCase().includes(term)
    );
});
</script>