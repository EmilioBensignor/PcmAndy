<template>
    <div class="w-full flex flex-col gap-2">
        <FormLabel :for="id">{{ label }}</FormLabel>
        <Password :inputId="id" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)"
            toggleMask :feedback="false" :inputProps="{
                autocomplete: 'current-password',
                placeholder: placeholder
            }" />
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
            required: false
        },
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue', 'input'],
    methods: {
        validateInput(value) {
            this.$emit('input', value);
        }
    }
}
</script>