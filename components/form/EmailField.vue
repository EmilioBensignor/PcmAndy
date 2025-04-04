<template>
    <div class="w-full flex flex-col gap-2">
        <label :for="id">{{ label }}</label>
        <InputText :id="id" type="email" :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)" :placeholder="placeholder" :autocomplete="id" />
        <DefaultError v-if="error">
            <p>{{ error }}</p>
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
        validateInput(event) {
            this.$emit('input', event.target.value);
        }
    }
}
</script>