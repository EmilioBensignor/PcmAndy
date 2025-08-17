<template>
    <div class="w-full flex flex-col gap-2">
        <p class="font-light lg:text-xl">{{ label }}</p>

        <!-- Imagen existente -->
        <div v-if="existingImages && existingImages.length > 0 && !modelValue" class="mt-2">
            <div class="flex flex-col relative border rounded-md p-2">
                <img :src="existingImages[0]" alt="Imagen existente" class="h-40 object-contain" />
                <div class="flex justify-end mt-2">
                    <button type="button" class="text-sm bg-terciary text-white py-1 px-2 rounded"
                        @click="showFileUpload = true" v-if="!showFileUpload">
                        Cambiar imagen
                    </button>
                </div>
            </div>
        </div>

        <!-- Campo de carga de archivo -->
        <FileUpload v-if="!existingImages.length || showFileUpload || modelValue" :id="id" mode="basic" :accept="accept"
            :maxFileSize="maxFileSize" :chooseLabel="placeholder" @select="onSelect"
            :required="required && !existingImages.length" />

        <!-- Vista previa de nueva imagen -->
        <div v-if="modelValue && previewUrl" class="mt-2">
            <div class="flex flex-col relative border rounded-md p-2">
                <img :src="previewUrl" alt="Imagen seleccionada" class="h-40 object-contain" />
                <div class="flex justify-end mt-2">
                    <button type="button" class="text-sm bg-gray text-white py-1 px-2 rounded" @click="removeFile">
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
        type: [File, null],
        default: null
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
        default: 1000000
    },
    placeholder: {
        type: String,
        default: 'Seleccionar archivo'
    },
    required: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'select']);

const showFileUpload = ref(false);
const previewUrl = ref(null);

watch(() => props.modelValue, (newFile) => {
    if (newFile) {
        createPreviewUrl(newFile);
    } else {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
        }
        previewUrl.value = null;
    }
}, { immediate: true });

const onSelect = (event) => {
    const file = event.files[0];
    emit('update:modelValue', file);
    emit('select', event);
};

const removeFile = () => {
    emit('update:modelValue', null);
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = null;
    showFileUpload.value = false;
};

const createPreviewUrl = (file) => {
    if (file) {
        previewUrl.value = URL.createObjectURL(file);
    }
};

onBeforeUnmount(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
});
</script>