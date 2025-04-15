<template>
    <div class="flex flex-wrap justify-center gap-14 py-14">
        <article v-for="(option, index) in options" :key="index" class="w-[120px] sm:w-[160px] relative rounded-[0.625rem] shadow-1">
            <NuxtImg :src="`/images/${option.img}.png`" :alt="option.title" class="w-full rounded-t-[0.625rem]" />

            <button @click="toggleDropdown(index)"
                class="w-full flex justify-center items-center gap-[0.625rem] bg-secondary rounded-b-[0.625rem] py-3"
                :class="{ 'rounded-b-none': activeDropdown === index && option.subOptions?.length }">
                <Icon :name="`tabler:${option.icon}`" class="text-white" />
                <p class="text-white lg:text-xl">{{ option.title }}</p>
            </button>

            <Transition enter-active-class="transition-all duration-300 ease-in-out"
                enter-from-class="max-h-0 opacity-0" enter-to-class="max-h-24 opacity-100"
                leave-active-class="transition-all duration-300 ease-in-out" leave-from-class="max-h-24 opacity-100"
                leave-to-class="max-h-0 opacity-0">
                <div v-if="activeDropdown === index && option.subOptions?.length"
                    class="w-full absolute z-10 overflow-hidden bg-terciary rounded-b-[0.625rem]">
                    <NuxtLink v-for="(subOption, subIndex) in option.subOptions" :key="subIndex" :to="subOption.url"
                        class="w-full flex justify-center items-center text-center py-3 px-1 text-white last-of-type:rounded-b-[0.625rem] last-of-type:border-t border-secondary">
                        {{ subOption.title }}
                    </NuxtLink>
                </div>
            </Transition>
        </article>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const activeDropdown = ref(null);

const toggleDropdown = (index) => {
    if (activeDropdown.value === index) {
        activeDropdown.value = null;
        return;
    }

    activeDropdown.value = index;
};

const options = [
    {
        url: ROUTE_NAMES.WORKS,
        title: "Obras",
        img: "Obras",
        icon: "brush",
        subOptions: [
            {
                title: "Agregar Obra",
                url: ROUTE_NAMES.WORKS_CREATE,
            },
            {
                title: "Ver Obras",
                url: ROUTE_NAMES.WORKS,
            }
        ]
    },
    {
        url: ROUTE_NAMES.INSPIRATION,
        title: "Inspiración",
        img: "Inspiraciones",
        icon: "camera-heart",
        subOptions: [
            {
                title: "Agregar Inspiración",
                url: ROUTE_NAMES.INSPIRATION_CREATE,
            },
            {
                title: "Ver Inspiraciones",
                url: ROUTE_NAMES.INSPIRATION,
            }
        ]
    },
];
</script>