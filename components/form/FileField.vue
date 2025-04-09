<template>
    <div class="w-full flex flex-col gap-2">
        <p class="font-light">{{ label }}</p>
        <div v-if="existingFileUrl && !modelValue" class="w-full flex items-center flex-wrap gap-8 mt-4">
            <img :src="existingFileUrl" alt="Imagen existente" class="w-full mx-52 max-h-52 object-contain" />
            <button type="button" class="primaryButton" @click="showFileUpload = true" v-if="!showFileUpload">
                Cambiar imagen
            </button>
        </div>
        <FileUpload v-if="!existingFileUrl || showFileUpload || modelValue" :id="id" mode="basic" :accept="accept"
            :maxFileSize="maxFileSize" :chooseLabel="placeholder" @select="onSelect" />

        <div v-if="modelValue && previewUrl" class="w-full flex items-center flex-wrap gap-8 mt-4">
            <img :src="previewUrl" alt="Imagen seleccionada" class="w-full mx-52 max-h-52 object-contain" />
            <button type="button" class="primaryButton redButton" @click="removeFile">
                Eliminar
            </button>
        </div>
        <DefaultError v-if="error">
            {{ error }}
        </DefaultError>
    </div>
</template>

<script>
export default {
    props: {
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
        existingFileUrl: {
            type: String,
            default: null
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
        }
    },
    data() {
        return {
            showFileUpload: false,
            previewUrl: null
        }
    },
    watch: {
        modelValue(newFile) {
            if (newFile) {
                this.createPreviewUrl(newFile);
            } else {
                this.previewUrl = null;
            }
        }
    },
    emits: ['update:modelValue', 'select'],
    methods: {
        onSelect(event) {
            const file = event.files[0];
            this.$emit('update:modelValue', file);
            this.$emit('select', event);
        },
        removeFile() {
            this.$emit('update:modelValue', null);
            this.previewUrl = null;
            this.showFileUpload = false;
        },
        createPreviewUrl(file) {
            if (file) {
                this.previewUrl = URL.createObjectURL(file);
            }
        }
    },
    beforeUnmount() {
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
        }
    }
}
</script>