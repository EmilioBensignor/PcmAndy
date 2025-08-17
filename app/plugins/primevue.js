import PrimeVue from 'primevue/config'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import Drawer from 'primevue/drawer'
import FileUpload from 'primevue/fileupload'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import ToastService from 'primevue/toastservice'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(PrimeVue)
    nuxtApp.vueApp.use(ToastService)

    nuxtApp.vueApp.component('Toast', Toast)
    nuxtApp.vueApp.component('Button', Button)
    nuxtApp.vueApp.component('Dialog', Dialog)
    nuxtApp.vueApp.component('InputText', InputText)
    nuxtApp.vueApp.component('Password', Password)
    nuxtApp.vueApp.component('ProgressSpinner', ProgressSpinner)
    nuxtApp.vueApp.component('Drawer', Drawer)
    nuxtApp.vueApp.component('FileUpload', FileUpload)
    nuxtApp.vueApp.component('Select', Select)
    nuxtApp.vueApp.component('InputNumber', InputNumber)
    nuxtApp.vueApp.component('Textarea', Textarea)
})