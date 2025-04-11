// FormFileField adaptado a partir de tu código original
<template>
    <div class="w-full flex flex-col gap-2">
        <p class="font-light">{{ label }} <span v-if="required" class="text-red-500">*</span></p>

        <!-- Imagen existente -->
        <div v-if="existingImages && existingImages.length > 0 && !modelValue" class="w-full mt-2">
            <div class="relative border rounded-md p-2">
                <img :src="existingImages[0]" alt="Imagen existente" class="w-full h-40 object-contain" />
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
        <div v-if="modelValue && previewUrl" class="w-full mt-2">
            <div class="relative border rounded-md p-2">
                <img :src="previewUrl" alt="Imagen seleccionada" class="w-full h-40 object-contain" />
                <div class="flex justify-end mt-2">
                    <button type="button" class="text-sm bg-gray text-white py-1 px-2 rounded" @click="removeFile">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>

        <!-- Mensaje de error -->
        <DefaultError v-if="error">
            {{ error }}
        </DefaultError>
    </div>
</template>

<script setup>
// Importaciones y setup
import { ref, watch, onBeforeUnmount, defineProps, defineEmits } from 'vue';

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

// Estado
const showFileUpload = ref(false);
const previewUrl = ref(null);

// Observar cambios en el archivo seleccionado
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

// Manejadores de eventos
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

// Limpiar recursos al desmontar
onBeforeUnmount(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
});
</script>