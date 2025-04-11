export const useInspiracionValidation = (form, errors, isEditing = false) => {
    const validateImagen = () => {
        // Si estamos editando y ya hay una imagen existente, no es necesario validar
        if (isEditing && form.imagen_url) {
            errors.imagen = '';
            return true;
        }

        // Si no estamos editando o no hay imagen existente, debe haber una imagen nueva
        if (!form.imagen) {
            errors.imagen = 'Debes subir una imagen';
            return false;
        }

        errors.imagen = '';
        return true;
    };

    const validateColores = () => {
        // Validar que se haya seleccionado al menos un color
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