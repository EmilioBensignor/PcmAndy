export const useObraValidation = (form, errors, isEditing = false) => {
    const validateTitulo = () => {
        if (!form.titulo.trim()) {
            errors.titulo = 'El título es obligatorio';
            return false;
        }
        errors.titulo = '';
        return true;
    };

    const validateDescripcion = () => {
        if (!form.descripcion.trim()) {
            errors.descripcion = 'La descripción es obligatoria';
            return false;
        }
        errors.descripcion = '';
        return true;
    };

    const validateAnio = () => {
        if (!form.anio) {
            errors.anio = 'El año es obligatorio';
            return false;
        }

        const anioNum = parseInt(form.anio);
        if (isNaN(anioNum) || anioNum < 1800 || anioNum > 2100) {
            errors.anio = 'Ingrese un año válido entre 1800 y 2100';
            return false;
        }

        errors.anio = '';
        return true;
    };

    const validateAncho = () => {
        if (!form.ancho) {
            errors.ancho = 'El ancho es obligatorio';
            return false;
        }

        const anchoNum = parseFloat(form.ancho);
        if (isNaN(anchoNum) || anchoNum <= 0 || anchoNum > 1000) {
            errors.ancho = 'Ingrese un ancho válido entre 0 y 1000';
            return false;
        }

        errors.ancho = '';
        return true;
    };

    const validateAlto = () => {
        if (!form.alto) {
            errors.alto = 'El alto es obligatorio';
            return false;
        }

        const altoNum = parseFloat(form.alto);
        if (isNaN(altoNum) || altoNum <= 0 || altoNum > 1000) {
            errors.alto = 'Ingrese un alto válido entre 0 y 1000';
            return false;
        }

        errors.alto = '';
        return true;
    };

    const validateCategoria = () => {
        if (!form.categoria) {
            errors.categoria = 'La categoría es obligatoria';
            return false;
        }
        errors.categoria = '';
        return true;
    };

    const validateImagenes = (existingImages = []) => {
        if (isEditing && existingImages && existingImages.length > 0) {
            errors.imagenes = '';
            return true;
        }

        if (!form.imagenes || form.imagenes.length === 0) {
            errors.imagenes = 'Debes subir al menos una imagen';
            return false;
        }

        errors.imagenes = '';
        return true;
    };

    const clearErrors = () => {
        errors.titulo = '';
        errors.descripcion = '';
        errors.anio = '';
        errors.ancho = '';
        errors.alto = '';
        errors.categoria = '';
        errors.imagenes = '';
    };

    const validateForm = (existingImages = []) => {
        const validTitulo = validateTitulo();
        const validDescripcion = validateDescripcion();
        const validAnio = validateAnio();
        const validAncho = validateAncho();
        const validAlto = validateAlto();
        const validCategoria = validateCategoria();
        const validImagenes = validateImagenes(existingImages);

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