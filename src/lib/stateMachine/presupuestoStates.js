/**
 * Definición de estados de presupuesto
 * IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con NocoDB
 */
export const ESTADOS_PRESUPUESTO = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  ACEPTADO: 'Aprobado',  // En NocoDB es "Aprobado", no "Aceptado"
  RECHAZADO: 'Rechazado'
};

/**
 * Transiciones válidas entre estados
 * Cada estado mapea a un array de estados a los que puede transicionar
 */
const TRANSICIONES_VALIDAS = {
  [ESTADOS_PRESUPUESTO.BORRADOR]: [ESTADOS_PRESUPUESTO.ENVIADO],
  [ESTADOS_PRESUPUESTO.ENVIADO]: [
    ESTADOS_PRESUPUESTO.ACEPTADO,
    ESTADOS_PRESUPUESTO.RECHAZADO
  ],
  [ESTADOS_PRESUPUESTO.ACEPTADO]: [],
  [ESTADOS_PRESUPUESTO.RECHAZADO]: []
};

/**
 * Valida si una transición de estado es válida
 * @param {string} estadoActual - Estado actual del presupuesto
 * @param {string} nuevoEstado - Estado al que se quiere transicionar
 * @returns {boolean} true si la transición es válida, false en caso contrario
 */
export const puedeTransicionar = (estadoActual, nuevoEstado) => {
  // NO normalizar - usar valores exactos de NocoDB
  const estadosValidos = Object.values(ESTADOS_PRESUPUESTO);

  if (!estadosValidos.includes(estadoActual) || !estadosValidos.includes(nuevoEstado)) {
    return false;
  }

  // Verificar si la transición está permitida
  const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual] || [];
  return transicionesPermitidas.includes(nuevoEstado);
};

/**
 * Valida si un presupuesto es editable basándose en su estado
 * Solo los presupuestos en estado "Borrador" pueden ser editados
 * @param {string} estado - Estado actual del presupuesto
 * @returns {boolean} true si es editable, false en caso contrario
 */
export const esEditable = (estado) => {
  return estado === ESTADOS_PRESUPUESTO.BORRADOR;
};

/**
 * Obtiene los estados a los que puede transicionar desde un estado dado
 * @param {string} estadoActual - Estado actual del presupuesto
 * @returns {string[]} Array de estados válidos para transición
 */
export const getEstadosDisponibles = (estadoActual) => {
  return TRANSICIONES_VALIDAS[estadoActual] || [];
};

/**
 * Valida si un presupuesto requiere PDF guardado
 * @param {string} estado - Estado del presupuesto
 * @returns {boolean} true si requiere PDF guardado
 */
export const requierePDFGuardado = (estado) => {
  return [
    ESTADOS_PRESUPUESTO.ENVIADO,
    ESTADOS_PRESUPUESTO.ACEPTADO,
    ESTADOS_PRESUPUESTO.RECHAZADO
  ].includes(estado);
};
