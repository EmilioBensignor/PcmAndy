<template>
    <DefaultTitleH1>Index</DefaultTitleH1>
    <div>
        <NuxtLink :to="ROUTE_NAMES.WORKS">Obras</NuxtLink>
        <NuxtLink :to="ROUTE_NAMES.INSPIRATION">Inspiraciones</NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

</script>