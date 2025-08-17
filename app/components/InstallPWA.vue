<template>
    <button v-if="!isStandalone && showInstallButton" @click="showInstructions"
        class="w-full flex items-center gap-3 hover:bg-primaryHover rounded-[0.625rem] text-black text-sm lg:text-base font-light transition duration-300 p-3">
        <Icon name="tabler:download" size="1.125rem" class="text-black" />
        Instalar en iPhone
    </button>

    <!-- Instrucciones para iOS -->
    <Dialog v-model:visible="showIOSHelp" modal header="Instalar en tu iPhone" :dismissableMask="true">
        <div class="p-4">
            <p class="mb-3">Para instalar esta aplicación en el iPhone:</p>
            <ol class="list-decimal pl-5 mb-4">
                <li class="mb-2">Toca el botón
                    <Icon name="tabler:share" size="1rem" class="inline" /> en la parte inferior de Safari
                </li>
                <li class="mb-2">Desplaza hacia abajo y toca "Añadir a pantalla de inicio"</li>
                <li class="mb-2">Toca "Añadir" en la parte superior derecha</li>
            </ol>
            <p>¡Listo! Ahora tendrás un acceso directo en tu pantalla de inicio.</p>

            <div class="mt-4 text-center">
                <Button label="Entendido" @click="showIOSHelp = false" />
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Estados
const showInstallButton = ref(false);
const showIOSHelp = ref(false);
const isIOS = ref(false);
const isStandalone = ref(false);

// Comprobar si es iOS
onMounted(() => {
    // Verificar si ya está en modo standalone
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator.standalone === true);

    // Verificar si es un dispositivo iOS
    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Solo mostrar en iOS y Safari
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    // Mostrar botón solo en iOS + Safari y cuando no está ya instalada
    showInstallButton.value = isIOS.value && isSafari && !isStandalone.value;
});

// Mostrar instrucciones para iOS
const showInstructions = () => {
    showIOSHelp.value = true;
};
</script>