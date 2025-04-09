<template>
    <div class="w-full flex flex-col gap-2">
        <FormLabel :for="id">{{ label }}</FormLabel>
        <div class="relative w-14 h-8">
            <input type="checkbox" :id="id" :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)" class="sr-only" />
            <div class="absolute inset-0 flex items-center rounded-full transition-colors duration-400" :class="{
                'bg-secondary-color': modelValue,
                'bg-mid-gray-color': !modelValue
            }">
                <span class="w-full text-center text-base text-black transition-colors duration-400">
                    {{ modelValue ? dataOn : dataOff }}
                </span>
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
    modelValue: {
        type: Boolean,
        default: false
    },
    dataOn: {
        type: String,
        default: 'On'
    },
    dataOff: {
        type: String,
        default: 'Off'
    }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Solo mantenemos los estilos que no pueden hacerse con Tailwind */
input:checked+div::before {
    transform: translateX(1.775rem);
}

input+div::before {
    position: absolute;
    content: "";
    height: 1.25rem;
    width: 1.25rem;
    left: 4px;
    top: 4px;
    border-radius: 9999px;
    background-color: white;
    transition: transform 0.4s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>