<template>
    <div class="w-full flex flex-col gap-2">
        <p class="font-light">{{ label }}</p>
        <label class="w-14 h-7 inline-block relative cursor-pointer">
            <input type="checkbox" :id="id" :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)" class="w-0 h-0 opacity-0" />
            <div class="switchCircle flex items-center absolute top-0 left-0 right-0 bottom-0 bg-midGray rounded-full transition-colors duration-400"
                :class="{
                    'bg-terciary': modelValue,
                    'bg-gray': !modelValue
                }">
                <!-- <span class="w-full text-center text-base text-black transition-colors duration-400">
                    {{ modelValue ? dataOn : dataOff }}
                </span> -->
            </div>
        </label>
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
.switchCircle::before {
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

input:checked+.switchCircle::before {
    transform: translateX(1.775rem);
}
</style>