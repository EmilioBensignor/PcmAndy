<template>
    <div class="w-full flex flex-col gap-2">
        <p class="font-light lg:text-xl">{{ label }}</p>

        <!-- Subida de archivos -->
        <FileUpload :id="id" mode="advanced" :accept="accept" :multiple="true" :maxFileSize="maxFileSize"
            :chooseLabel="placeholder" :auto="true" :customUpload="true" @uploader="onUpload" @select="onSelect"
            @remove="onRemove" />

        <!-- Imágenes existentes -->
        <div v-if="existingImages && existingImages.length > 0" class="flex flex-wrap gap-4 mt-2">
            <div v-for="(img, index) in existingImages" :key="`existing-${index}`"
                class="w-full flex flex-col relative border rounded-md p-2">
                <img :src="img" alt="Imagen existente" class="h-40 object-contain" />
                <div class="flex justify-between mt-2">
                    <button type="button"
                        :class="`text-sm ${index === imagenPrincipalIndex ? 'bg-secondary' : 'bg-terciary'} text-white py-1 px-2 rounded`"
                        @click="setPrincipal(index)">
                        {{ index === imagenPrincipalIndex ? 'Principal' : 'Hacer principal' }}
                    </button>
                    <button type="button" class="text-sm bg-gray text-white py-1 px-2 rounded"
                        @click="removeExistingImage(index)">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>

        <!-- Previsualización de imágenes nuevas -->
        <div v-if="previewUrls.length > 0" class="flex flex-wrap gap-4 mt-2">
            <div v-for="(url, index) in previewUrls" :key="`preview-${index}`"
                class="w-full flex flex-col relative border rounded-md p-2">
                <img :src="url" alt="Vista previa" class="h-40 object-contain" />
                <div class="flex justify-between mt-2">
                    <button type="button"
                        :class="`text-sm ${index === previewDestacadaIndex ? 'bg-secondary' : 'bg-terciary'} text-white py-1 px-2 rounded`"
                        @click="setPrincipalNew(index)">
                        {{ index === previewDestacadaIndex ? 'Principal' : 'Hacer principal' }}
                    </button>
                    <button type="button" class="text-sm bg-gray text-white py-1 px-2 rounded"
                        @click="removeNewImage(index)">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>

        <DefaultError v-if="error">
            {{ error }}
        </DefaultError>
    </div>
</template>

<script setup>
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    error: {
        type: String,
        default: null
    },
    modelValue: {
        type: Array,
        default: () => []
    },
    existingImages: {
        type: Array,
        default: () => []
    },
    accept: {
        type: String,
        default: 'image/*'
    },
    maxFileSize: {
        type: Number,
        default: 5000000 // 5MB
    },
    placeholder: {
        type: String,
        default: 'Seleccionar imágenes'
    },
    required: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'update:destacada', 'update:order']);

const previewUrls = ref([]);
const localExistingImages = ref([...props.existingImages]);
const previewDestacadaIndex = ref(0);
const imagenPrincipalIndex = ref(0);

watch(() => props.modelValue, (newFiles) => {
    if (newFiles && newFiles.length > 0) {
        createPreviewUrls(newFiles);
    } else {
        previewUrls.value.forEach(url => {
            URL.revokeObjectURL(url);
        });
        previewUrls.value = [];
    }
}, { deep: true });

watch(() => props.existingImages, (newImages) => {
    localExistingImages.value = [...newImages];
}, { deep: true });

const setPrincipal = (index) => {
    imagenPrincipalIndex.value = index;
    previewDestacadaIndex.value = null;
    emit('update:destacada', index);
};

// Función para definir la imagen destacada entre las nuevas
const setPrincipalNew = (index) => {
    previewDestacadaIndex.value = index;
    imagenPrincipalIndex.value = null;
    emit('update:destacada', localExistingImages.value.length + index);
};

// Función para eliminar una imagen existente
const removeExistingImage = (index) => {
    const updatedExisting = [...localExistingImages.value];
    updatedExisting.splice(index, 1);
    localExistingImages.value = updatedExisting;

    // Ajustar el índice destacado si es necesario
    if (imagenPrincipalIndex.value === index) {
        imagenPrincipalIndex.value = updatedExisting.length > 0 ? 0 : null;
        emit('update:destacada', imagenPrincipalIndex.value);
    } else if (imagenPrincipalIndex.value > index) {
        imagenPrincipalIndex.value--;
        emit('update:destacada', imagenPrincipalIndex.value);
    }

    emit('update:order', updatedExisting);
};

// Función para eliminar una imagen nueva
const removeNewImage = (index) => {
    const updatedFiles = [...props.modelValue];

    URL.revokeObjectURL(previewUrls.value[index]);

    updatedFiles.splice(index, 1);
    previewUrls.value.splice(index, 1);

    if (previewDestacadaIndex.value === index) {
        previewDestacadaIndex.value = previewUrls.value.length > 0 ? 0 : null;
    } else if (previewDestacadaIndex.value > index) {
        previewDestacadaIndex.value--;
    }

    emit('update:modelValue', updatedFiles);

    if (previewDestacadaIndex.value !== null) {
        emit('update:destacada', localExistingImages.value.length + previewDestacadaIndex.value);
    }
};

// Función para manejar la selección de archivos
const onSelect = (event) => {
    const files = event.files;
    const updatedFiles = [...props.modelValue];

    files.forEach(file => {
        updatedFiles.push(file);
    });

    emit('update:modelValue', updatedFiles);
    createPreviewUrls(updatedFiles);

    if (previewDestacadaIndex.value === null && imagenPrincipalIndex.value === null && previewUrls.value.length > 0) {
        previewDestacadaIndex.value = 0;
        emit('update:destacada', localExistingImages.value.length);
    }
};

// Función para crear URLs de previsualización
const createPreviewUrls = (files) => {
    previewUrls.value.forEach(url => {
        URL.revokeObjectURL(url);
    });

    previewUrls.value = files.map(file => URL.createObjectURL(file));
};

const onUpload = () => {
    console.log('Upload event triggered, but using custom upload.');
};

const onRemove = (event) => {
    const fileIndex = props.modelValue.findIndex(f => f.name === event.file.name);
    if (fileIndex !== -1) {
        removeNewImage(fileIndex);
    }
};

onBeforeUnmount(() => {
    previewUrls.value.forEach(url => {
        URL.revokeObjectURL(url);
    });
});
</script>