<template>
    <DefaultTitleH1>Iniciar sesión</DefaultTitleH1>
    <FormLayout @submit.prevent="handleSignIn">
        <FormFieldsContainer>
            <FormEmailField id="email" label="Correo electrónico" placeholder="stevejobs@gmail.com" autocomplete="email"
                v-model="form.email" :error="errors.email" @input="validateEmail" />
            <FormPasswordField id="password" label="Contraseña" placeholder="********" autocomplete="current-password"
                v-model="form.password" :error="errors.password" @input="validatePassword" type="password" />
        </FormFieldsContainer>
        <NuxtLink :to="ROUTE_NAMES.FORGOT_PASSWORD" class="text-sm text-black underline">
            ¿Olvidaste tu contraseña?
        </NuxtLink>
        <p class="text-sm">Si todavía no tienes una cuenta, <NuxtLink :to="ROUTE_NAMES.REGISTER"
                class="text-sm text-black underline">
                registrate</NuxtLink>
        </p>
        <DefaultError v-if="errorMsg">
            {{ errorMsg }}
        </DefaultError>

        <Button :loading="loading" :class="{ active: isValid }" class="primaryButton loadingButton"
        :label="loading ? '' : 'Ingresar'" type="submit" />
    </FormLayout>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient();
const router = useRouter();
const route = useRoute();

const form = reactive({
    email: '',
    password: ''
});

const errors = reactive({
    email: null,
    password: null
});

const loading = ref(false);
const errorMsg = ref('');

const isValid = computed(() => {
    return !errors.email &&
        !errors.password &&
        form.email &&
        form.password;
});

onMounted(() => {
    const lastEmail = sessionStorage.getItem('lastRegisteredEmail');
    if (lastEmail) {
        form.email = lastEmail;
        sessionStorage.removeItem('lastRegisteredEmail');
    }

    if (route.hash) {
        if (route.hash.includes('type=recovery')) {
            const emailMatch = route.hash.match(/email=([^&]*)/);
            if (emailMatch && emailMatch[1]) {
                form.email = decodeURIComponent(emailMatch[1]);
            }

            toast.add({
                severity: 'info',
                summary: 'Restablecimiento de contraseña',
                detail: 'Puedes establecer una nueva contraseña ahora.',
                life: 5000
            });
        }

        if (route.hash.includes('type=signup') || route.hash.includes('type=email_change')) {
            toast.add({
                severity: 'success',
                summary: '¡Email verificado!',
                detail: 'Tu email ha sido verificado correctamente. Ahora puedes iniciar sesión.',
                life: 5000
            });

            const emailMatch = route.hash.match(/email=([^&]*)/);
            if (emailMatch && emailMatch[1]) {
                form.email = decodeURIComponent(emailMatch[1]);
            }
        }
    }
});

const validateEmail = () => {
    if (!form.email) {
        errors.email = 'El email es requerido';
        return false;
    }
    errors.email = null;
    return true;
};

const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida';
        return false;
    }
    errors.password = null;
    return true;
};

const handleSignIn = async () => {
    loading.value = true;
    errorMsg.value = '';

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
        loading.value = false;
        return;
    }

    try {
        localStorage.setItem('lastLoginEmail', form.email);
        errorMsg.value = '';
        const { error } = await client.auth.signInWithPassword({
            email: form.email,
            password: form.password,
            options: {
                staySignedIn: true
            }
        });

        if (error) {
            errorMsg.value = handleSupabaseError(error);
        }

        router.push(ROUTE_NAMES.HOME);
    } catch (error) {
        errorMsg.value = handleSupabaseError(error);
    } finally {
        loading.value = false;
    }
};
</script>