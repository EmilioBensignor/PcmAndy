<template>
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- <img :src="obra.imageUrl" alt="Obra Image" class="w-full h-48 object-cover"> -->
        <div class="p-4">
            <h2 class="text-xl font-bold mb-2">{{ obra.title }}</h2>
            <p class="text-gray-700 mb-4">{{ obra.description }}</p>
            <!-- <NuxtLink :to="`/obras/${obra.id}`" class="text-blue-500 hover:underline">Ver más</NuxtLink> -->
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    obra: {
        type: Object,
        required: true
    }
});
</script>