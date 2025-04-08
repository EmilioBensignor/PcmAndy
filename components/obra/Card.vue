<template>
    <div v-if="obra" class="w-full relative bg-black shadow-lg rounded-[20px]">
        <div v-if="obra.destacado" class="absolute right-0 bg-terciary py-2 px-4 rounded-tr-[20px] rounded-bl-[20px]">
            <p class="text-white text-sm font-light">Destacada</p>
        </div>
        <div class="flex flex-col gap-3 p-5">
            <p class="text-white font-light">{{ obra.titulo }}</p>
            <div class="flex gap-3">
                <img :src="`/images/${obra.img}.png`" :alt="obra.titulo" class="w-[50%] object-cover">
                <div class="flex flex-col gap-3">
                    <p class="text-white font-light">Año: {{ obra.descripcion }}</p>
                    <p class="text-white font-light">Tamaño: {{ obra.ancho }} x {{ obra.alto }} cm</p>
                    <p class="text-white font-light">{{ obra.categoria }}</p>
                </div>
            </div>
        </div>
        <div class="flex items-center border-t border-gray">
            <div class="w-[50%] flex justify-center items-center border-r border-gray p-3">
                <NuxtLink :to="`${ROUTE_NAMES.WORKS_EDIT}/${obra.id}`">
                    <Icon name="tabler:edit" size="1.5rem" class="text-primary" />
                </NuxtLink>
            </div>
            <div class="w-[50%] flex justify-center items-center p-3">
                <Button>
                    <Icon name="tabler:trash" size="1.5rem" class="text-primary" />
                </Button>
            </div>
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
</script>