import { ref, onUnmounted } from 'vue';

/**
 * Crea una función con debounce
 * @param {Function} fn - Función a ejecutar con debounce
 * @param {Number} delay - Retraso en milisegundos
 * @returns {Function} - Función con debounce
 */
export function useDebounceFn(fn, delay = 300) {
    const timeoutRef = ref(null);

    const debouncedFn = (...args) => {
        clearTimeout(timeoutRef.value);
        timeoutRef.value = setTimeout(() => {
            fn(...args);
        }, delay);
    };

    onUnmounted(() => {
        clearTimeout(timeoutRef.value);
    });

    return debouncedFn;
}