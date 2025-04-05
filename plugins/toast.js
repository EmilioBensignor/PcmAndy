// plugins/toast.js
import { useToast } from 'primevue/usetoast'

export default defineNuxtPlugin(() => {
    const toast = useToast()

    return {
        provide: {
            toast: {
                success: (message, title = 'Éxito') => {
                    toast.add({
                        severity: 'success',
                        summary: title,
                        detail: message,
                        life: 4000
                    })
                },
                error: (message, title = 'Error') => {
                    toast.add({
                        severity: 'error',
                        summary: title,
                        detail: message,
                        life: 4000
                    })
                },
                info: (message, title = 'Info') => {
                    toast.add({
                        severity: 'info',
                        summary: title,
                        detail: message,
                        life: 4000
                    })
                },
                warn: (message, title = 'Advertencia') => {
                    toast.add({
                        severity: 'warn',
                        summary: title,
                        detail: message,
                        life: 4000
                    })
                }
            }
        }
    }
})