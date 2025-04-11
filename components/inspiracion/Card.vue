<template>
    <div class="w-full max-w-xs bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <!-- Imagen de la inspiración -->
        <div class="w-full h-48 overflow-hidden relative">
            <img v-if="inspiracion.imagen_url" :src="inspiracion.imagen_url" alt="Imagen de inspiración" 
                class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                <Icon name="tabler:photo-off" size="32" class="text-gray-400" />
            </div>
            
            <!-- Colores asociados -->
            <div class="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-2 bg-black bg-opacity-30">
                <div 
                    v-for="color in inspiracionColores" 
                    :key="color.id" 
                    :style="{ backgroundColor: color.codigo_hex || '#000000' }"
                    class="w-6 h-6 rounded-full border border-white"
                    :title="color.nombre"
                ></div>
            </div>
        </div>
        
        <!-- Acciones -->
        <div class="p-4 flex justify-between items-center">
            <div class="text-sm text-gray-500">
                {{ formatDate(inspiracion.created_at) }}
            </div>
            <div class="flex gap-2">
                <NuxtLink :to="`${ROUTE_NAMES.INSPIRATION_EDIT}/${inspiracion.id}`" class="text-blue-500 hover:text-blue-700">
                    <Icon name="tabler:edit" size="20" />
                </NuxtLink>
                <button @click="$emit('delete', inspiracion)" class="text-red-500 hover:text-red-700">
                    <Icon name="tabler:trash" size="20" />
                </button>
            </div>
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

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
</script>