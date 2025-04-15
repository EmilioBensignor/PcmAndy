<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormFileField id="imagen" :label="'Imágen*'" v-model="form.imagen" :error="errors.imagen"
                :existing-images="existingImages" accept="image/*" placeholder="Adjunte una imágen"
                :maxFileSize="5000000" :required="!isEditing" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <div class="w-full flex flex-col gap-2">
                <p class="font-light lg:text-xl">Colores*</p>
                <div class="w-full max-w-[420px] md:max-w-full flex flex-wrap gap-6 my-2">
                    <button v-for="color in ordenarColoresPorPosicion(coloresOptions)" :key="color.value" type="button"
                        class="w-10 h-10 lg:w-12 lg:h-12 rounded-md transition-all"
                        :class="isColorSelected(color.value) ? 'rotate-45' : ''" :style="{ backgroundColor: color.hex }"
                        @click="toggleColor(color)"></button>
                </div>
                <DefaultError v-if="errors.colores">{{ errors.colores }}</DefaultError>
            </div>
        </FormFieldsContainer>

        <div class="w-full flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-5 mt-4">
            <div class="w-full max-w-max flex">
                <ButtonSecondary type="submit" :disabled="isLoading">
                    <span v-if="isLoading">
                        {{ isEditing ? 'Actualizando...' : 'Guardando...' }}
                    </span>
                    <span v-else>
                        {{ isEditing ? 'Actualizar' : 'Crear' }}
                    </span>
                </ButtonSecondary>
            </div>
            <div class="w-full max-w-max flex">
                <ButtonPrimary :to="`${ROUTE_NAMES.INSPIRATION}`">
                    Cancelar
                </ButtonPrimary>
            </div>
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

const form = reactive({
    imagen: null,
    colores: [],
    imagen_url: props.initialData?.imagen_url || null
});

const errors = reactive({
    imagen: '',
    colores: ''
});

onMounted(async () => {
    if (coloresStore.colores.length === 0) {
        await coloresStore.fetchColores();
    }

    if (props.isEditing && props.initialData.imagen_url) {
        existingImages.value = [props.initialData.imagen_url];
    }

    if (props.isEditing && props.initialData?.id) {
        try {
            const coloresData = await coloresStore.getColoresByInspiracionId(props.initialData.id);
            if (coloresData && coloresData.length > 0) {
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

const ordenarColoresPorPosicion = (colores) => {
    return [...colores].sort((a, b) => a.posicion - b.posicion);
};

const isColorSelected = (colorId) => {
    return form.colores.some(color => color.value === colorId);
};

const toggleColor = (color) => {
    if (isColorSelected(color.value)) {
        form.colores = form.colores.filter(c => c.value !== color.value);
    } else {
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

    const coloresIds = form.colores.map(color => color.value);

    const formData = {
        imagen: form.imagen,
        coloresIds: coloresIds,
        imagen_url: props.isEditing && !form.imagen ? existingImages.value[0] : null
    };

    emit('submit', formData);
};
</script>