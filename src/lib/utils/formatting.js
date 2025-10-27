/**
 * Utilidades de formateo para fechas, monedas y números
 */

/**
 * Formatea una fecha en formato ISO a formato local argentino
 * @param {string} fecha - Fecha en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
 * @returns {string} Fecha formateada en formato local (DD/MM/YYYY)
 */
export const formatDate = (fecha) => {
  if (!fecha) return '';

  try {
    const partes = fecha.split('T')[0].split('-');
    const fecha_obj = new Date(
      parseInt(partes[0]),
      parseInt(partes[1]) - 1,
      parseInt(partes[2])
    );

    return fecha_obj.toLocaleDateString('es-AR');
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fecha;
  }
};

/**
 * Formatea un número como moneda argentina
 * @param {number} amount - Monto a formatear
 * @param {string} currency - Código de moneda (ARS, USD, etc.)
 * @param {boolean} showSymbol - Si mostrar el símbolo $ o no
 * @returns {string} Monto formateado
 */
export const formatCurrency = (amount, currency = 'ARS', showSymbol = true) => {
  if (amount === null || amount === undefined) return '-';

  const formatted = parseFloat(amount).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (showSymbol) {
    return `$${formatted}`;
  }

  return formatted;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @param {number} decimals - Cantidad de decimales (default: 0)
 * @returns {string} Número formateado
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '-';

  return parseFloat(num).toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear (0-1 o 0-100)
 * @param {boolean} isDecimal - Si el valor está en formato decimal (0-1) o porcentaje (0-100)
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined) return '-';

  const percentage = isDecimal ? value * 100 : value;
  return `${formatNumber(percentage, 2)}%`;
};

/**
 * Formatea un teléfono argentino
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Remover todo excepto números
  const cleaned = phone.replace(/\D/g, '');

  // Formato: +54 11 1234-5678
  if (cleaned.length >= 10) {
    const areaCode = cleaned.slice(-10, -8);
    const firstPart = cleaned.slice(-8, -4);
    const secondPart = cleaned.slice(-4);
    return `+549 ${areaCode} ${firstPart}-${secondPart}`;
  }

  return phone;
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar (default: '...')
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length) + suffix;
};
