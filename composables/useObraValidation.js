export const useObraValidation = (formData, errors, isEditing = false) => {
    const clearErrors = () => {
        Object.keys(errors).forEach(key => {
            errors[key] = '';
        });
    };

    const validateTitulo = () => {
        if (!formData.titulo) {
            errors.titulo = 'El título es obligatorio';
            return false;
        } else if (formData.titulo.length < 3) {
            errors.titulo = 'El título debe tener al menos 3 caracteres';
            return false;
        } else if (formData.titulo.length > 100) {
            errors.titulo = 'El título no puede exceder los 100 caracteres';
            return false;
        }

        errors.titulo = '';
        return true;
    };

    const validateImagenes = () => {
        if (isEditing && formData.existingImages && formData.existingImages.length > 0) {
            errors.imagenes = '';
            return true;
        }

        if (!formData.imagenes || formData.imagenes.length === 0) {
            errors.imagenes = 'Debes subir al menos una imagen';
            return false;
        }

        errors.imagenes = '';
        return true;
    };

    const validateDescripcion = () => {
        if (!formData.descripcion) {
            errors.descripcion = 'La descripción es obligatoria';
            return false;
        } else if (formData.descripcion.length < 10) {
            errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
            return false;
        } else if (formData.descripcion.length > 500) {
            errors.descripcion = 'La descripción no puede exceder los 500 caracteres';
            return false;
        }

        errors.descripcion = '';
        return true;
    };

    const validateAnio = () => {
        const currentYear = new Date().getFullYear();
        const yearPattern = /^\d{4}$/;

        if (!formData.anio) {
            errors.anio = 'El año es obligatorio';
            return false;
        } else if (!yearPattern.test(formData.anio)) {
            errors.anio = 'El año debe tener 4 dígitos';
            return false;
        } else if (parseInt(formData.anio) < 1800 || parseInt(formData.anio) > currentYear + 1) {
            errors.anio = `El año debe estar entre 1800 y ${currentYear + 1}`;
            return false;
        }

        errors.anio = '';
        return true;
    };

    const validateAncho = () => {
        if (!formData.ancho) {
            errors.ancho = 'El ancho es obligatorio';
            return false;
        } else if (isNaN(formData.ancho) || parseFloat(formData.ancho) <= 0) {
            errors.ancho = 'El ancho debe ser un número positivo';
            return false;
        } else if (parseFloat(formData.ancho) > 1000) {
            errors.ancho = 'El ancho no puede ser mayor a 1000 cm';
            return false;
        }

        errors.ancho = '';
        return true;
    };

    const validateAlto = () => {
        if (!formData.alto) {
            errors.alto = 'El alto es obligatorio';
            return false;
        } else if (isNaN(formData.alto) || parseFloat(formData.alto) <= 0) {
            errors.alto = 'El alto debe ser un número positivo';
            return false;
        } else if (parseFloat(formData.alto) > 1000) {
            errors.alto = 'El alto no puede ser mayor a 1000 cm';
            return false;
        }

        errors.alto = '';
        return true;
    };

    const validateCategoria = () => {
        if (!formData.categoria) {
            errors.categoria = 'La categoría es obligatoria';
            return false;
        }

        errors.categoria = '';
        return true;
    };

    const validateForm = () => {
        const validTitulo = validateTitulo();
        const validDescripcion = validateDescripcion();
        const validAnio = validateAnio();
        const validAncho = validateAncho();
        const validAlto = validateAlto();
        const validCategoria = validateCategoria();
        const validImagenes = validateImagenes();

        return validTitulo && validDescripcion && validAnio &&
            validAncho && validAlto && validCategoria && validImagenes;
    };

    return {
        validateForm,
        validateTitulo,
        validateDescripcion,
        validateAnio,
        validateAncho,
        validateAlto,
        validateCategoria,
        validateImagenes,
        clearErrors
    };
};