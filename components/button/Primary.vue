<template>
    <NuxtLink v-if="to" :to="to" class="w-full max-w-[480px] bg-primary text-center lg:text-xl  rounded-[0.625rem] shadow-1 py-3 px-12">
        <slot />
    </NuxtLink>
    <button v-else type="button" class="w-full max-w-[480px] bg-primary text-center lg:text-xl  rounded-[0.625rem] shadow-1 py-3 px-12">
        <slot />
    </button>
</template>

<script>
export default {
    props: {
        to: {
            type: [String, Object],
            default: null
        }
    }
}
</script>