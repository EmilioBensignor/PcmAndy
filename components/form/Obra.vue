<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField id="titulo" label="Título*" placeholder="Escribe el título de la obra" v-model="form.titulo"
                :error="errors.titulo" @input="validateTitulo" />
            <FormMultiImageField id="imagenes" :label="isEditing ? 'Imágenes' : 'Imágenes*'" v-model="form.imagenes"
                :error="errors.imagenes" :existing-images="existingImages" @update:destacada="updateImagenDestacada"
                @update:order="updateImagenOrder" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField id="descripcion" label="Descripción*" placeholder="Escribe una descripción de la obra"
                v-model="form.descripcion" :error="errors.descripcion" @input="validateDescripcion" />
            <FormTextField id="anio" label="Año*" placeholder="2025" v-model="form.anio" :error="errors.anio"
                @input="validateAnio" />
            <div class="flex items-center gap-2">
                <FormTextField id="ancho" label="Ancho*" placeholder="120" v-model="form.ancho"
                    :error="errors.ancho" @input="validateAncho" class="w-24" />
                <span class="text-lg self-end -translate-y-2">X</span>
                <FormTextField id="alto" label="Alto*" placeholder="88" v-model="form.alto" :error="errors.alto"
                    @input="validateAlto" class="w-24" />
                <span class="text-lg self-end -translate-y-2">cm</span>
            </div>
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField id="categoria" label="Categoría*" placeholder="Elige una categoría" v-model="form.categoria"
                :error="errors.categoria" @input="validateCategoria" />
            <FormSwitch id="destacado" label="Destacado" v-model="form.destacado" dataOn="Sí" dataOff="No" />
        </FormFieldsContainer>

        <div class="w-full flex flex-wrap justify-center gap-4">
            <NuxtLink :to="{ name: ROUTE_NAMES.OBRAS }" class="primaryButton">
                Cancelar
            </NuxtLink>
            <button type="submit" class="primaryButton active" :disabled="isLoading">
                <span v-if="isLoading">
                    <i class="pi pi-spinner pi-spin mr-2"></i>
                    {{ isEditing ? 'Actualizando...' : 'Guardando...' }}
                </span>
                <span v-else>
                    {{ isEditing ? 'Actualizar' : 'Crear' }}
                </span>
            </button>
        </div>
    </FormLayout>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useObraValidation } from '~/composables/useObraValidation';

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

const form = reactive({
    titulo: props.initialData?.titulo || '',
    descripcion: props.initialData?.descripcion || '',
    anio: props.initialData?.anio ? props.initialData.anio.toString() : new Date().getFullYear().toString(),
    ancho: props.initialData?.dimensiones?.ancho ? props.initialData.dimensiones.ancho.toString() : '',
    alto: props.initialData?.dimensiones?.alto ? props.initialData.dimensiones.alto.toString() : '',
    categoria: props.initialData?.categoria || '',
    destacado: props.initialData?.destacado || false,
    imagenes: [],
    imagen_destacada_index: props.initialData?.imagen_destacada_index || 0
});

const errors = reactive({
    titulo: '',
    descripcion: '',
    anio: '',
    ancho: '',
    alto: '',
    categoria: '',
    imagenes: ''
});

// Cargamos las imágenes existentes si estamos en modo edición
onMounted(() => {
    if (props.isEditing && props.initialData.imagenes) {
        existingImages.value = Array.isArray(props.initialData.imagenes)
            ? props.initialData.imagenes
            : [props.initialData.imagen_url].filter(Boolean);
    }
});

// Métodos para actualizar el índice de la imagen destacada y el orden
const updateImagenDestacada = (index) => {
    form.imagen_destacada_index = index;
};

const updateImagenOrder = (newOrder) => {
    // Este método se llamará desde el componente MultiImageField
    // cuando se reordenen las imágenes
    console.log('Nuevo orden de imágenes:', newOrder);
};

const {
    validateForm,
    validateTitulo,
    validateDescripcion,
    validateAnio,
    validateAncho,
    validateAlto,
    validateCategoria,
    validateImagenes,
    clearErrors
} = useObraValidation(form, errors, props.isEditing);

// Función para manejar el envío del formulario
const handleSubmit = () => {
    if (!validateForm()) {
        return;
    }

    // Preparamos los datos para enviar al componente padre
    const formData = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        anio: parseInt(form.anio),
        dimensiones: {
            ancho: parseFloat(form.ancho),
            alto: parseFloat(form.alto)
        },
        categoria: form.categoria,
        destacado: form.destacado,
        imagenes: form.imagenes,
        imagen_destacada_index: form.imagen_destacada_index,
        existingImages: existingImages.value
    };

    // Emitimos el evento con los datos del formulario
    emit('submit', formData);
};
</script>