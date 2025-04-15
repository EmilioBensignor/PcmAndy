<template>
    <div v-if="obra" class="w-full max-w-[354px] flex flex-col justify-between relative bg-black shadow-lg rounded-[20px]">
        <div v-if="obra.destacado" class="absolute right-0 bg-terciary py-2 px-4 rounded-tr-[20px] rounded-bl-[20px]">
            <p class="text-white text-sm font-light">Destacada</p>
        </div>
        <div class="flex flex-col gap-3 p-5">
            <p class="text-white font-light lg:text-xl">{{ obra.titulo }}</p>
            <div class="flex gap-3">
                <img :src="obra.imagen_url" :alt="obra.titulo" class="w-1/2 object-cover">
                <div class="flex flex-col gap-3">
                    <p class="text-white font-light">Año: {{ obra.anio }}</p>
                    <p class="text-white font-light">Tamaño: {{ obra.ancho }} x {{ obra.alto
                    }} cm</p>
                    <p class="text-white font-light">{{ obra.categoria }}</p>
                </div>
            </div>
        </div>
        <div class="flex justify-between items-center border-t border-gray">
            <NuxtLink :to="`${ROUTE_NAMES.WORKS_EDIT}/${obra.id}`"
                class="w-1/2 flex justify-center items-center border-r border-gray p-3">
                <Icon name="tabler:edit" size="1.5rem" class="text-primary" />
            </NuxtLink>
            <button @click="$emit('delete', obra)" class="w-1/2 flex justify-center items-center p-3">
                <Icon name="tabler:trash" size="1.5rem" class="text-primary" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const props = defineProps({
    obra: {
        type: Object,
        required: true
    }
});

defineEmits(['delete']);
</script>