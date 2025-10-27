/**
 * Utilidades de validación para diferentes tipos de datos
 */

/**
 * Valida el formato de CUIT argentino (XX-XXXXXXXX-X)
 * @param {string} cuit - CUIT a validar
 * @param {boolean} required - Si el campo es requerido
 * @returns {boolean} true si es válido o vacío (cuando no es requerido)
 */
export const validarCUIT = (cuit, required = false) => {
  if (!cuit || cuit.trim() === '') {
    return !required; // Si no es requerido, vacío es válido
  }

  // Formato: 20-12345678-9
  const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
  if (!cuitRegex.test(cuit)) {
    return false;
  }

  // Validación adicional del dígito verificador
  const cuitNumeros = cuit.replace(/-/g, '');
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += parseInt(cuitNumeros[i]) * multiplicadores[i];
  }

  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return digitoVerificador === parseInt(cuitNumeros[10]);
};

/**
 * Valida el formato de email
 * @param {string} email - Email a validar
 * @param {boolean} required - Si el campo es requerido
 * @returns {boolean} true si es válido o vacío (cuando no es requerido)
 */
export const validarEmail = (email, required = false) => {
  if (!email || email.trim() === '') {
    return !required;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida el formato de teléfono argentino
 * @param {string} phone - Teléfono a validar
 * @param {boolean} required - Si el campo es requerido
 * @returns {boolean} true si es válido o vacío (cuando no es requerido)
 */
export const validarTelefono = (phone, required = false) => {
  if (!phone || phone.trim() === '') {
    return !required;
  }

  // Acepta diferentes formatos: +54911234567, 1112345678, etc.
  const phoneRegex = /^(\+?54)?(\d{10,13})$/;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleaned);
};

/**
 * Valida que un string no esté vacío
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima (default: 1)
 * @returns {boolean} true si es válido
 */
export const validarTextoRequerido = (value, minLength = 1) => {
  return value && value.trim().length >= minLength;
};

/**
 * Valida que un número esté dentro de un rango
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo (opcional)
 * @param {number} max - Valor máximo (opcional)
 * @returns {boolean} true si es válido
 */
export const validarRangoNumerico = (value, min = null, max = null) => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return false;
  }

  if (min !== null && num < min) {
    return false;
  }

  if (max !== null && num > max) {
    return false;
  }

  return true;
};

/**
 * Valida que un número sea positivo
 * @param {number} value - Valor a validar
 * @param {boolean} allowZero - Si se permite el valor 0
 * @returns {boolean} true si es válido
 */
export const validarNumeroPositivo = (value, allowZero = false) => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return false;
  }

  return allowZero ? num >= 0 : num > 0;
};

/**
 * Valida formato de SKU (código alfanumérico)
 * @param {string} sku - SKU a validar
 * @returns {boolean} true si es válido
 */
export const validarSKU = (sku) => {
  if (!sku || sku.trim() === '') {
    return false;
  }

  // Permite letras, números, guiones y guiones bajos
  const skuRegex = /^[A-Z0-9\-_]+$/i;
  return skuRegex.test(sku.trim());
};

/**
 * Valida que una fecha sea válida y opcionalmente que esté en un rango
 * @param {string|Date} date - Fecha a validar
 * @param {Date} minDate - Fecha mínima (opcional)
 * @param {Date} maxDate - Fecha máxima (opcional)
 * @returns {boolean} true si es válido
 */
export const validarFecha = (date, minDate = null, maxDate = null) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return false;
  }

  if (minDate && dateObj < minDate) {
    return false;
  }

  if (maxDate && dateObj > maxDate) {
    return false;
  }

  return true;
};

/**
 * Valida una dirección básica
 * @param {string} address - Dirección a validar
 * @param {boolean} required - Si el campo es requerido
 * @returns {boolean} true si es válido
 */
export const validarDireccion = (address, required = false) => {
  if (!address || address.trim() === '') {
    return !required;
  }

  // Debe tener al menos calle y número
  return address.trim().length >= 5;
};

/**
 * Conjunto de validadores para formulario de cliente
 */
export const validadoresCliente = {
  nombre: (value) => validarTextoRequerido(value, 2),
  cuit: (value) => validarCUIT(value, false),
  email: (value) => validarEmail(value, false),
  telefono: (value) => validarTelefono(value, false),
  direccion: (value) => validarDireccion(value, false)
};

/**
 * Conjunto de validadores para formulario de producto
 */
export const validadoresProducto = {
  nombre: (value) => validarTextoRequerido(value, 2),
  sku: (value) => validarSKU(value),
  costo: (value) => validarNumeroPositivo(value, false)
};
