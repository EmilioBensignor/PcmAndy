<template>
    <DefaultTitleH1>Registrarse</DefaultTitleH1>
    <FormLayout @submit.prevent="signUp">
        <FormFieldsContainer>
            <FormEmailField id="email" label="Correo electrónico" placeholder="stevejobs@gmail.com" autocomplete="email"
                v-model="form.email" :error="errors.email" @input="validateEmail" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormPasswordField id="password" label="Contraseña" placeholder="********" autocomplete="new-password"
                v-model="form.password" :error="errors.password" @input="handlePasswordInput" type="password" />
            <FormPasswordField id="passwordConfirm" label="Confirmar contraseña" placeholder="********"
                autocomplete="new-password" v-model="form.passwordConfirm" :error="errors.passwordConfirm"
                @input="validatePasswordConfirm" type="password" />
        </FormFieldsContainer>
        <p class="text-sm lg:text-base">Si ya tienes una cuenta, <NuxtLink :to="ROUTE_NAMES.LOGIN"
                class="text-sm lg:text-base text-black underline">
                inicia sesión</NuxtLink>
        </p>
        <DefaultError v-if="errorMsg">
            {{ errorMsg }}
        </DefaultError>
        <Button :loading="loading" :class="{ active: isValid }" class="primaryButton loadingButton"
            :label="loading ? '' : 'Registrarse'" type="submit" />
    </FormLayout>
</template>


<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
import { useToast } from "primevue/usetoast";
import { useRouter } from 'vue-router';

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient();
const toast = useToast();
const router = useRouter();

const form = reactive({
    email: '',
    password: '',
    passwordConfirm: ''
});

const errors = reactive({
    email: null,
    password: null,
    passwordConfirm: null
});

const loading = ref(false);
const checkingPassword = ref(false);
const errorMsg = ref('');
const isPasswordCompromised = ref(false);
const passwordCheckCache = reactive(new Map());
const passwordCheckTimeout = ref(null);

const isValid = computed(() => {
    return !errors.email &&
        !errors.password &&
        !errors.passwordConfirm &&
        form.email &&
        form.password &&
        form.passwordConfirm &&
        !isPasswordCompromised.value;
});

const validateEmail = () => {
    if (!form.email) {
        errors.email = 'El email es requerido';
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
        errors.email = 'El email debe incluir un @ y un . (punto)';
        return false;
    }

    errors.email = null;
    return true;
};

const handlePasswordInput = () => {
    if (passwordCheckTimeout.value) {
        clearTimeout(passwordCheckTimeout.value);
    }

    validatePassword();

    if (!errors.password && form.password && form.password.length >= 8) {
        passwordCheckTimeout.value = setTimeout(async () => {
            await checkPasswordCompromise();
        }, 800);
    }
};

const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida';
        isPasswordCompromised.value = false;
        return false;
    }

    if (form.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
        isPasswordCompromised.value = false;
        return false;
    }

    if (!/[a-z]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos una minúscula';
        isPasswordCompromised.value = false;
        return false;
    }

    if (!/[A-Z]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos una mayúscula';
        isPasswordCompromised.value = false;
        return false;
    }

    if (!/[0-9]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos un número';
        isPasswordCompromised.value = false;
        return false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) {
        errors.password = 'La contraseña debe contener al menos un caracter especial';
        isPasswordCompromised.value = false;
        return false;
    }

    errors.password = null;

    if (form.passwordConfirm) {
        validatePasswordConfirm();
    }

    return true;
};

const checkPasswordCompromise = async () => {
    if (!form.password || form.password.length < 8) return;

    if (passwordCheckCache.has(form.password)) {
        isPasswordCompromised.value = passwordCheckCache.get(form.password);

        if (isPasswordCompromised.value) {
            errors.password = 'Esta contraseña ha aparecido en filtraciones de datos. Por favor, utiliza una contraseña única.';
        }

        return;
    }

    try {
        checkingPassword.value = true;
        isPasswordCompromised.value = await checkPasswordLeak(form.password);

        passwordCheckCache.set(form.password, isPasswordCompromised.value);

        if (isPasswordCompromised.value) {
            errors.password = 'Esta contraseña ha aparecido en filtraciones de datos. Por favor, utiliza una contraseña única.';
        }
    } catch (error) {
        console.error('Error al verificar contraseña:', error);
    } finally {
        checkingPassword.value = false;
    }
};

const validatePasswordConfirm = () => {
    if (!form.passwordConfirm) {
        errors.passwordConfirm = 'La confirmación de contraseña es requerida';
        return false;
    }

    if (form.passwordConfirm !== form.password) {
        errors.passwordConfirm = 'Las contraseñas no coinciden';
        return false;
    }

    errors.passwordConfirm = null;
    return true;
};

async function checkPasswordLeak(password) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5).toUpperCase();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'NuxtSupabaseApp'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn('Error al consultar API de contraseñas comprometidas');
            return false;
        }

        const text = await response.text();

        return text.split('\r\n').some(line => {
            const [hashSuffix] = line.split(':');
            return hashSuffix.toUpperCase() === suffix;
        });
    } catch (error) {
        console.error('Error al verificar contraseña:', error);
        return false;
    }
}

async function signUp() {
    loading.value = true;
    errorMsg.value = '';

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPasswordConfirmValid = validatePasswordConfirm();

    if (!isEmailValid || !isPasswordValid || !isPasswordConfirmValid) {
        loading.value = false;
        return;
    }

    try {
        sessionStorage.setItem('lastRegisteredEmail', form.email);

        const baseUrl = window.location.origin;
        const loginPath = ROUTE_NAMES.LOGIN;

        const { data, error } = await client.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                emailRedirectTo: `${baseUrl}${loginPath}`
            }
        });

        if (error) {
            errorMsg.value = handleSupabaseError(error);
        };

        form.email = '';
        form.password = '';
        form.passwordConfirm = '';

        toast.add({
            severity: 'success',
            summary: '¡Éxito!',
            detail: 'Tu cuenta se ha creado con éxito. Revisa tu correo electrónico para verificar tu cuenta. Esto puede tardar unos minutos.',
            life: 5000
        });

        setTimeout(() => {
            router.push(ROUTE_NAMES.LOGIN);
        }, 5000);

    } catch (error) {
        errorMsg.value = handleSupabaseError(error);
    } finally {
        loading.value = false;
    }
}

onUnmounted(() => {
    if (passwordCheckTimeout.value) {
        clearTimeout(passwordCheckTimeout.value);
    }
});
</script>