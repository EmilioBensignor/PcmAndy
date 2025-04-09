import { ROUTE_NAMES } from "~/constants/ROUTE_NAMES";

export default defineNuxtRouteMiddleware(() => {
    const user = useSupabaseUser();
    if (!user.value) {
        return navigateTo(ROUTE_NAMES.LOGIN);
    }
});