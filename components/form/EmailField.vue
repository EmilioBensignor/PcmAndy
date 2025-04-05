<template>
    <div class="w-full flex flex-col gap-2">
        <FormLabel :for="id">{{ label }}</FormLabel>
        <InputText :id="id" type="email" :value="modelValue" class="w-full bg-transparent  border text-black rounded-[0.625rem] py-2 px-3"
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