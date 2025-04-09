<template>
    <div class="w-full flex flex-col gap-2">
        <FormLabel :for="id">{{ label }}</FormLabel>

        <FileUpload :id="id" mode="advanced" :multiple="true" accept="image/*" :maxFileSize="5000000"
            :showCancelButton="true" :chooseLabel="'Adjunte una imágen'" :uploadLabel="'Subir todas'"
            :cancelLabel="'Cancelar'" @select="onSelect" @remove="onRemove" class="w-full" />

        <DefaultError v-if="error">
            {{ error }}
        </DefaultError>

        <!-- Imágenes existentes -->
        <div v-if="combinedImages.length > 0" class="w-full mt-4">
            <h4 class="text-base font-semibold mb-2">Imágenes ({{ combinedImages.length }})</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="(imagen, index) in combinedImages" :key="index"
                    class="relative border rounded-lg overflow-hidden">
                    <div class="relative group">
                        <img :src="getImageUrl(imagen)" :alt="`Imagen ${index + 1}`" class="w-full h-48 object-cover" />

                        <div
                            class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div class="flex justify-between">
                                <button type="button" @click="setDestacada(index)"
                                    class="w-8 h-8 rounded-full flex items-center justify-center"
                                    :class="[isDestacada(index) ? 'bg-yellow-500' : 'bg-gray-700 bg-opacity-70 hover:bg-yellow-500']">
                                    <i class="pi pi-star-fill"
                                        :class="[isDestacada(index) ? 'text-white' : 'text-gray-200']"></i>
                                </button>

                                <button type="button" @click="removeImage(index)"
                                    class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <i class="pi pi-trash text-white"></i>
                                </button>
                            </div>

                            <div class="flex justify-between">
                                <button type="button" @click="moveImage(index, -1)" :disabled="index === 0"
                                    class="w-8 h-8 bg-gray-700 bg-opacity-70 rounded-full flex items-center justify-center disabled:opacity-50">
                                    <i class="pi pi-arrow-left text-white"></i>
                                </button>

                                <button type="button" @click="moveImage(index, 1)"
                                    :disabled="index === combinedImages.length - 1"
                                    class="w-8 h-8 bg-gray-700 bg-opacity-70 rounded-full flex items-center justify-center disabled:opacity-50">
                                    <i class="pi pi-arrow-right text-white"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="absolute top-0 left-0 p-1">
                        <span v-if="isDestacada(index)" class="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                            Destacada
                        </span>
                        <span v-if="isNewImage(index)" class="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Nueva
                        </span>
                    </div>

                    <div class="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1">
                        {{ index + 1 }}
                    </div>
                </div>
            </div>
        </div>
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
    }
});

const emit = defineEmits(['update:modelValue', 'update:destacada', 'update:order']);

const destacadaIndex = ref(0);
const deletedExistingIndices = ref([]);
const newImages = ref([...props.modelValue]);

// Imágenes combinadas (existentes + nuevas)
const combinedImages = computed(() => {
    const existingImagesFiltered = props.existingImages
        .filter((_, i) => !deletedExistingIndices.value.includes(i))
        .map(img => ({ type: 'existing', url: img }));
    // Combinamos con las nuevas imágenes
    const newImagesFormatted = newImages.value.map(img => ({ type: 'new', file: img }));

    return [...existingImagesFiltered, ...newImagesFormatted];
});

watch(destacadaIndex, (newIndex) => {
    emit('update:destacada', newIndex);
});

const isDestacada = (index) => {
    return index === destacadaIndex.value;
};

const setDestacada = (index) => {
    destacadaIndex.value = index;
};

const isNewImage = (index) => {
    const existingCount = props.existingImages.length - deletedExistingIndices.value.length;
    return index >= existingCount;
};

const getImageUrl = (imagen) => {
    if (imagen.type === 'existing') {
        return imagen.url;
    } else if (imagen.type === 'new') {
        return URL.createObjectURL(imagen.file);
    }
    return '';
};

// Manejar la selección de nuevas imágenes
const onSelect = (event) => {
    const selectedFiles = event.files;

    selectedFiles.forEach(file => {
        if (!newImages.value.some(f => f.name === file.name && f.size === file.size)) {
            newImages.value.push(file);
        }
    });

    emit('update:modelValue', newImages.value);
};

// Manejar la eliminación de imágenes desde el control de FileUpload
const onRemove = (event) => {
    const removedFile = event.file;

    newImages.value = newImages.value.filter(
        file => !(file.name === removedFile.name && file.size === removedFile.size)
    );

    emit('update:modelValue', newImages.value);
};

// Eliminar una imagen (nueva o existente)
const removeImage = (index) => {
    const existingCount = props.existingImages.length - deletedExistingIndices.value.length;

    if (index < existingCount) {
        const originalIndex = props.existingImages.findIndex(
            (_, i) => !deletedExistingIndices.value.includes(i)
        );

        if (originalIndex !== -1) {
            deletedExistingIndices.value.push(originalIndex);
        }
    } else {
        const newIndex = index - existingCount;
        newImages.value.splice(newIndex, 1);
        emit('update:modelValue', newImages.value);
    }

    if (destacadaIndex.value === index) {
        destacadaIndex.value = 0;
    } else if (destacadaIndex.value > index) {
        destacadaIndex.value--;
    }

    emit('update:order', combinedImages.value);
};

// Mover una imagen en el orden
const moveImage = (index, direction) => {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= combinedImages.value.length) {
        return;
    }

    const updatedImages = [...combinedImages.value];

    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];

    if (destacadaIndex.value === index) {
        destacadaIndex.value = newIndex;
    } else if (destacadaIndex.value === newIndex) {
        destacadaIndex.value = index;
    }

    const existingCount = props.existingImages.length - deletedExistingIndices.value.length;

    const updatedExistingImages = [];
    const updatedNewImages = [];
    const updatedDeletedIndices = [];

    updatedImages.forEach(img => {
        if (img.type === 'existing') {
            updatedExistingImages.push(img.url);
        } else {
            updatedNewImages.push(img.file);
        }
    });

    newImages.value = updatedNewImages;
    emit('update:modelValue', newImages.value);

    emit('update:order', updatedImages);
}
</script>