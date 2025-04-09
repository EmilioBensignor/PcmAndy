<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField id="titulo" label="Título*" placeholder="Escribe el título de la obra" v-model="form.titulo"
                :error="errors.titulo" @input="validateTitulo" />

            <FormMultiImageField id="imagenes" :label="isEditing ? 'Imágenes' : 'Imágenes*'" v-model="form.imagenes"
                :error="errors.imagenes" :existing-images="existingImages" @update:destacada="updateImagenDestacada"
                @update:order="updateImagenOrder" accept="image/*" placeholder="Adjunte una imágen"
                :maxFileSize="5000000" :required="!isEditing" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField id="descripcion" label="Descripción*" placeholder="Escribe una descripción de la obra"
                v-model="form.descripcion" :error="errors.descripcion" @input="validateDescripcion" />
            <FormTextField id="anio" label="Año*" placeholder="2025" v-model="form.anio" :error="errors.anio"
                @input="validateAnio" />
            <div class="flex items-center gap-2">
                <FormTextField id="ancho" label="Ancho*" placeholder="120" v-model="form.ancho" :error="errors.ancho"
                    @input="validateAncho" class="w-24" />
                <span class="text-lg self-end -translate-y-2">X</span>
                <FormTextField id="alto" label="Alto*" placeholder="88" v-model="form.alto" :error="errors.alto"
                    @input="validateAlto" class="w-24" />
                <span class="text-lg self-end -translate-y-2">cm</span>
            </div>
        </FormFieldsContainer>

        <FormFieldsContainer>
            <div class="w-full flex flex-col gap-2">
                <p class="font-light">Categoría*</p>
                <Select id="categoria" v-model="form.categoria" :options="categorias" optionLabel="nombre"
                    optionValue="id" placeholder="Seleccione una categoría" class="w-full"
                    @change="validateCategoria" />
                <div v-if="errors.categoria" class="text-red-500 text-sm mt-1">
                    {{ errors.categoria }}
                </div>
            </div>
            <FormSwitch id="destacado" label="Destacado" v-model="form.destacado" data-on="Activado" data-off="Desactivado" />
        </FormFieldsContainer>

        <div class="w-full flex flex-wrap justify-center gap-4">
            <ButtonPrimary :to="`${ROUTE_NAMES.WORKS}`">
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
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useObraValidation } from '~/composables/useObraValidation';
import { useCategoriasStore } from '~/store/categorias';

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
const categoriasStore = useCategoriasStore();

// Seguimos el índice de la imagen destacada internamente
const imagenDestacadaIndex = ref(0);

// Cargar las categorías al montar el componente
onMounted(async () => {
    if (categoriasStore.categorias.length === 0) {
        await categoriasStore.fetchCategorias();
    }

    // Cargamos las imágenes existentes si estamos en modo edición
    if (props.isEditing && props.initialData.imagenes) {
        existingImages.value = Array.isArray(props.initialData.imagenes)
            ? props.initialData.imagenes
            : [props.initialData.imagen_url].filter(Boolean);
    }
});

// Crear un computed para acceder a las categorías
const categorias = computed(() => categoriasStore.getCategorias);

const form = reactive({
    titulo: props.initialData?.titulo || '',
    descripcion: props.initialData?.descripcion || '',
    anio: props.initialData?.anio ? props.initialData.anio.toString() : '',
    ancho: props.initialData?.ancho ? props.initialData.ancho.toString() : '',
    alto: props.initialData?.alto ? props.initialData.alto.toString() : '',
    categoria: props.initialData?.categoria_id || null,
    destacado: props.initialData?.destacado || false,
    imagenes: []
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

// Métodos para actualizar el índice de la imagen destacada y el orden
const updateImagenDestacada = (index) => {
    imagenDestacadaIndex.value = index;
};

const updateImagenOrder = (newOrder) => {
    existingImages.value = newOrder;
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
        ancho: parseFloat(form.ancho),
        alto: parseFloat(form.alto),
        categoria_id: form.categoria,
        categoria: form.categoria ? categorias.value.find(c => c.id === form.categoria)?.nombre : null,
        destacado: form.destacado,
        imagenes: form.imagenes,
        imagen_destacada_index: imagenDestacadaIndex.value,
        existingImages: existingImages.value
    };

    // Emitimos el evento con los datos del formulario
    emit('submit', formData);
};
</script>