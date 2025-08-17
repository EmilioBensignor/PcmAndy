export const useInspiracionValidation = (form, errors, isEditing = false) => {
    const validateImagen = () => {
        if (isEditing && form.imagen_url) {
            errors.imagen = '';
            return true;
        }

        if (!form.imagen) {
            errors.imagen = 'Debes subir una imagen';
            return false;
        }

        errors.imagen = '';
        return true;
    };

    const validateColores = () => {
        if (!form.colores || form.colores.length === 0) {
            errors.colores = 'Debes seleccionar al menos un color';
            return false;
        }

        errors.colores = '';
        return true;
    };

    const clearErrors = () => {
        errors.imagen = '';
        errors.colores = '';
    };

    const validateForm = () => {
        const validImagen = validateImagen();
        const validColores = validateColores();

        return validImagen && validColores;
    };

    return {
        validateForm,
        validateImagen,
        validateColores,
        clearErrors
    };
};