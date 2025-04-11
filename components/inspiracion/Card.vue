<template>
    <div class="w-full max-w-[200px] flex flex-col justify-between bg-black rounded-[20px] overflow-hidden shadow-md">
        <!-- Imagen de la inspiración -->
        <div class="w-full h-full flex flex-col justify-between gap-3 overflow-hidden pb-3 p-5">
            <img v-if="inspiracion.imagen_url" :src="inspiracion.imagen_url" alt="Imagen de inspiración"
                class="w-full h-full object-cover" />
            <!-- Colores asociados -->
            <div class="flex flex-wrap justify-center gap-2">
                <div v-for="color in inspiracionColores" :key="color.id" :style="{ backgroundColor: color.codigo_hex }"
                    class="w-7 h-7 rounded-md" :title="color.nombre"></div>
            </div>
        </div>
        <!-- Acciones -->
        <div class="flex justify-between items-center border-t border-gray">
            <NuxtLink :to="`${ROUTE_NAMES.INSPIRATION_EDIT}/${inspiracion.id}`"
                class="w-1/2 flex justify-center items-center p-3 border-r border-gray">
                <Icon name="tabler:edit" size="1.25rem" class="text-primary" />
            </NuxtLink>
            <button @click="$emit('delete', inspiracion)"
                class="w-1/2 flex justify-center items-center p-3 border-r border-gray">
                <Icon name="tabler:trash" size="1.25rem" class="text-primary" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useColoresStore } from '~/store/colores';

const props = defineProps({
    inspiracion: {
        type: Object,
        required: true
    }
});

defineEmits(['delete']);
const coloresStore = useColoresStore();
const inspiracionColores = ref([]);

onMounted(async () => {
    if (props.inspiracion.id) {
        try {
            const colores = await coloresStore.getColoresByInspiracionId(props.inspiracion.id);
            inspiracionColores.value = colores;
        } catch (error) {
            console.error('Error al cargar colores de la inspiración:', error);
        }
    }
});
</script>