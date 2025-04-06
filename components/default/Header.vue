<template>
    <header class="flex flex-col justify-center items-center relative bg-primary py-6 px-5">
        <button class="flex flex-col justify-center items-center absolute left-5" @click="toggleDrawer" aria-label="Open or close menu">
            <Icon size="1.5rem" name="tabler:menu-2" class="text-black" />
        </button>
        <NuxtLink :to="routes.HOME">
            <NuxtImg src="/images/Logo-Peripeteia-Blanco.svg" alt="Logo Andy Loisch" class="h-8" />
        </NuxtLink>
        <Drawer :visible="drawerMenu" :modal="true" :dismissable="true" :closeOnEscape="true" @hide="closeDrawer">
            <template #header>
                <p>Andy Loisch</p>
                <button @click="closeDrawer" class="closeButton flex flex-col justify-center items-center">
                    <Icon name="tabler:plus" size="1.5rem" weight="100" class="text-black rotate-45" />
                </button>
            </template>
            <nav class="flex flex-col">
                <NuxtLink :to="link.route" v-for="(link, index) in menu" :key="index" class="flex items-center gap-3 text-black text-sm p-3">
                    <Icon :name="`tabler:${link.icon}`" />
                    {{ link.label }}
                </NuxtLink>
            </nav>
            <button @click="signOut()" class="w-full flex items-center gap-3 text-sm font-light text-black p-3">
                <Icon :name="`tabler:logout`" class="text-black" />
                Cerrar sesión
            </button>
        </Drawer>
    </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const route = useRoute();
const router = useRouter();
const drawerMenu = ref(false);
const routes = ROUTE_NAMES;
const loggingOut = ref(false);

const menu = [
    {
        label: "Obras",
        route: ROUTE_NAMES.WORKS,
        icon: "brush"
    },
    {
        label: "Inspiraciones",
        route: ROUTE_NAMES.INSPIRATION,
        icon: "camera-heart"
    },
];

const toggleDrawer = () => {
    drawerMenu.value = !drawerMenu.value;
};

const closeDrawer = () => {
    drawerMenu.value = false;
};

const handleKeyDown = (event) => {
    if (event.key === "Escape" && drawerMenu.value) {
        closeDrawer();
    }
};

const handleOutsideClick = (event) => {
    const drawer = document.querySelector(".p-drawer");
    const hamburger = document.querySelector("header > button");
    if (
        drawerMenu.value &&
        drawer &&
        !drawer.contains(event.target) &&
        event.target !== hamburger &&
        !hamburger.contains(event.target)
    ) {
        closeDrawer();
    }
};

onMounted(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleKeyDown);
});

watch(() => route.path, () => {
    closeDrawer();
});

async function signOut() {
    if (loggingOut.value) return;

    loggingOut.value = true;

    try {
        const supabase = useSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        localStorage.removeItem('lastLoginEmail');

        router.push(ROUTE_NAMES.LOGIN);
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    } finally {
        loggingOut.value = false;
    }
}
</script>