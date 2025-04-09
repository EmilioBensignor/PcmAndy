<template>
    <NuxtLink v-if="to" :to="to" class="bg-primary rounded-[0.625rem] shadow-1 py-3 px-12">
        <slot />
    </NuxtLink>
    <button v-else type="button" class="bg-primary rounded-[0.625rem] shadow-1 py-3 px-12">
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