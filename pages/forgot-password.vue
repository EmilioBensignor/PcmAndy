<template>
    <NuxtLink :to="ROUTE_NAMES.LOGIN" class="flex items-center gap-2 self-start text-black text-xs no-underline">
        <Icon name="tabler:arrow-left" />
        Volver a Iniciar sesión
    </NuxtLink>
    <DefaultTitleH1>Restablecer contraseña</DefaultTitleH1>
    <p class="max-w-[480px]">
        Ingrese el correo electrónico de su cuenta para poder reestablecer su
        contraseña.
    </p>
    <FormLayout @submit.prevent="handleForgotPassword">
        <FormFieldsContainer>
            <FormEmailField id="email" label="Correo electrónico" placeholder="stevejobs@gmail.com" autocomplete="email"
                v-model="form.email" :error="errors.email" @input="validateEmail" />
        </FormFieldsContainer>
        <DefaultError v-if="errorMsg">
            {{ errorMsg }}
        </DefaultError>
        <Button :loading="loading" :class="{ active: isValid }" class="primaryButton loadingButton"
        :label="loading ? '' : 'Restablecer contraseña'" type="submit" />
    </FormLayout>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient();
const router = useRouter();

const form = reactive({
    email: ''
});

const errors = reactive({
    email: null
});

const loading = ref(false);
const errorMsg = ref('');
const emailRequestCache = ref(new Set());

const isValid = computed(() => {
    return !errors.email && form.email;
});

onMounted(() => {
    const lastEmail = localStorage.getItem('lastLoginEmail');
    if (lastEmail) {
        form.email = lastEmail;
    }
});

const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!form.email.trim()) {
        errors.email = 'Debes ingresar tu correo electrónico';
        return false;
    }
    if (!emailPattern.test(form.email)) {
        errors.email = 'El correo electrónico debe incluir un @ y . (punto)';
        return false;
    }

    errors.email = null;
    return true;
};

const handleForgotPassword = async () => {
    loading.value = true;
    errorMsg.value = '';

    const isEmailValid = validateEmail();
    if (!isEmailValid || !form.email.trim()) {
        loading.value = false;
        return;
    }

    const cleanEmail = form.email.trim();
    if (emailRequestCache.value.has(cleanEmail)) {
        loading.value = false;
        errorMsg.value = 'Ya se ha enviado un correo a esta dirección en los últimos minutos. Por favor, revisa tu bandeja de entrada';
        return;
    }

    try {
        const baseUrl = import.meta.env.PROD
            ? 'https://pcm.weglam.com.ar'
            : 'http://localhost:3000';

        const redirectUrl = `${baseUrl}${ROUTE_NAMES.RESET_PASSWORD}`;

        const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: redirectUrl
        });

        if (error) {
            errorMsg.value = handleSupabaseError(error);
        };

        emailRequestCache.value.add(cleanEmail);
        setTimeout(() => {
            emailRequestCache.value.delete(cleanEmail);
        }, 120000);

        router.push({
            path: ROUTE_NAMES.FORGOT_PASSWORD_CONFIRMATION,
            query: { email: cleanEmail }
        });

        resetForm();
    } catch (error) {
        errorMsg.value = handleSupabaseError(error) || 'Ha ocurrido un error al restablecer la contraseña';
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    form.email = '';
    errors.email = null;
    errorMsg.value = '';
};
</script>