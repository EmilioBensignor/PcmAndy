<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <!-- Usamos existingImages en lugar de existingFileUrl -->
            <FormFileField id="imagen" :label="'Imágen'" v-model="form.imagen" :error="errors.imagen"
                :existing-images="existingImages" accept="image/*" placeholder="Adjunte una imágen"
                :maxFileSize="5000000" :required="!isEditing" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <div class="w-full flex flex-col gap-2">
                <p class="font-light">Colores<span class="text-red-500">*</span></p>
                <!-- Selector de colores simplificado (ordenado por posición) -->
                <div class="flex flex-wrap gap-2 mt-2">
                    <button v-for="color in ordenarColoresPorPosicion(coloresOptions)" :key="color.value" type="button"
                        class="w-10 h-10 rounded transition-all border"
                        :class="isColorSelected(color.value) ? 'border-2 border-gray-800 scale-110' : 'border-gray-200'"
                        :style="{ backgroundColor: color.hex || '#000000' }" @click="toggleColor(color)"></button>
                </div>

                <DefaultError v-if="errors.colores">{{ errors.colores }}</DefaultError>
            </div>
        </FormFieldsContainer>

        <div class="w-full flex flex-wrap justify-center gap-4 mt-4">
            <ButtonPrimary :to="`${ROUTE_NAMES.INSPIRATION}`">
                Cancelar
            </ButtonPrimary>
            <ButtonSecondary type="submit" :disabled="isLoading">
                <span v-if="isLoading">
                    {{ isEditing ? 'Actualizando...' : 'Guardando...' }}
                </span>
                <span v-else>
                    {{ isEditing ? 'Actualizar' : 'Crear' }}
                </span>
            </ButtonSecondary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useInspiracionValidation } from '~/composables/useInspiracionValidation';
import { useColoresStore } from '~/store/colores';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({})
    },
    isEditing: {
        type: Boolean,
        default: false
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['submit']);
const existingImages = ref([]);
const coloresStore = useColoresStore();

// Iniciar con un estado limpio
const form = reactive({
    imagen: null,
    colores: [],
    imagen_url: props.initialData?.imagen_url || null
});

const errors = reactive({
    imagen: '',
    colores: ''
});

// Cargar colores y configurar el formulario al montar
onMounted(async () => {
    // Cargar los colores disponibles
    if (coloresStore.colores.length === 0) {
        await coloresStore.fetchColores();
    }

    // Si estamos editando y hay una URL de imagen, la agregamos a las imágenes existentes
    if (props.isEditing && props.initialData.imagen_url) {
        existingImages.value = [props.initialData.imagen_url];
    }

    // Si estamos en modo edición y tenemos un ID, cargar los colores asociados
    if (props.isEditing && props.initialData?.id) {
        try {
            const coloresData = await coloresStore.getColoresByInspiracionId(props.initialData.id);
            if (coloresData && coloresData.length > 0) {
                // Convertir los colores al formato esperado para el formulario
                form.colores = coloresData.map(color => ({
                    value: color.id,
                    label: color.nombre,
                    hex: color.codigo_hex,
                    posicion: color.posicion
                }));
            }
        } catch (error) {
            console.error('Error al cargar colores de la inspiración:', error);
        }
    }
});

const coloresOptions = computed(() => {
    return coloresStore.getColoresAsOptions;
});

// Función para ordenar los colores por posición
const ordenarColoresPorPosicion = (colores) => {
    return [...colores].sort((a, b) => a.posicion - b.posicion);
};

// Métodos para manejar la selección de colores
const isColorSelected = (colorId) => {
    return form.colores.some(color => color.value === colorId);
};

const toggleColor = (color) => {
    if (isColorSelected(color.value)) {
        // Si ya está seleccionado, lo eliminamos
        form.colores = form.colores.filter(c => c.value !== color.value);
    } else {
        // Si no está seleccionado, lo añadimos
        form.colores.push(color);
    }
    validateColores();
};

const {
    validateForm,
    validateImagen,
    validateColores
} = useInspiracionValidation(form, errors, props.isEditing);

const handleSubmit = () => {
    if (!validateForm()) {
        return;
    }

    // Extraer solo los IDs de los colores seleccionados
    const coloresIds = form.colores.map(color => color.value);

    const formData = {
        imagen: form.imagen,
        coloresIds: coloresIds,
        imagen_url: props.isEditing && !form.imagen ? existingImages.value[0] : null
    };

    emit('submit', formData);
};
</script>