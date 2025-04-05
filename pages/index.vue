<template>
    <h1>Index PCM</h1>
    <button @click="signOut()" class="logOut text-black">
        <Icon :name="`tabler:logout`" class="text-black" />
        Cerrar sesión
    </button>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

const router = useRouter();
const loggingOut = ref(false);

async function signOut() {
    if (loggingOut.value) return;

    loggingOut.value = true;

    try {
        const supabase = useSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // localStorage.removeItem('lastLoginEmail');

        router.push(ROUTE_NAMES.LOGIN);
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    } finally {
        loggingOut.value = false;
    }
}
</script>