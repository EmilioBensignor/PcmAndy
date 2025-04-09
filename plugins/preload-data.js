import { useObrasStore } from "~/store/obras";
import { useInspiracionesStore } from "~/store/inspiraciones";

export default defineNuxtPlugin(async (nuxtApp) => {
    const obrasStore = useObrasStore();
    const inspiracionesStore = useInspiracionesStore();
    const user = useSupabaseUser();

    if (user.value) {
        try {
            await Promise.all([
                obrasStore.fetchObras(),
                inspiracionesStore.fetchInspiraciones()
            ]);

            const unsubscribeObras = obrasStore.setupRealtimeUpdates();
            const unsubscribeInspiraciones = inspiracionesStore.setupRealtimeUpdates();

            nuxtApp.hook('app:beforeDestroy', () => {
                unsubscribeObras && unsubscribeObras();
                unsubscribeInspiraciones && unsubscribeInspiraciones();
            });

            console.log('🚀 Datos precargados correctamente');
        } catch (error) {
            console.error('❌ Error al precargar datos:', error);
        }
    }
});