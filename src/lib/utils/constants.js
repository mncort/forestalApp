/**
 * Constantes globales de la aplicación
 */

/**
 * Estados de condición de IVA para clientes
 */
export const CONDICIONES_IVA = {
  RESPONSABLE_INSCRIPTO: 'Responsable Inscripto',
  CONSUMIDOR_FINAL: 'Consumidor Final',
  MONOTRIBUTO: 'Monotributo',
  EXENTO: 'Exento'
};

/**
 * Lista de condiciones IVA como array para selects
 */
export const CONDICIONES_IVA_ARRAY = Object.values(CONDICIONES_IVA);

/**
 * Porcentajes de IVA por tipo
 */
export const IVA_PORCENTAJES = {
  [CONDICIONES_IVA.RESPONSABLE_INSCRIPTO]: 21,
  [CONDICIONES_IVA.CONSUMIDOR_FINAL]: 21,
  [CONDICIONES_IVA.MONOTRIBUTO]: 21,
  [CONDICIONES_IVA.EXENTO]: 0
};

/**
 * Estados de presupuesto
 */
export const ESTADOS_PRESUPUESTO = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  FACTURADO: 'Facturado'
};

/**
 * Lista de estados de presupuesto como array
 */
export const ESTADOS_PRESUPUESTO_ARRAY = Object.values(ESTADOS_PRESUPUESTO);

/**
 * Colores para badges de estado de presupuesto (DaisyUI)
 */
export const COLORES_ESTADO_PRESUPUESTO = {
  [ESTADOS_PRESUPUESTO.BORRADOR]: 'badge-ghost',
  [ESTADOS_PRESUPUESTO.ENVIADO]: 'badge-info',
  [ESTADOS_PRESUPUESTO.APROBADO]: 'badge-success',
  [ESTADOS_PRESUPUESTO.RECHAZADO]: 'badge-error',
  [ESTADOS_PRESUPUESTO.FACTURADO]: 'badge-primary'
};

/**
 * Monedas soportadas
 */
export const MONEDAS = {
  ARS: 'ARS',
  USD: 'USD',
  EUR: 'EUR'
};

/**
 * Lista de monedas como array
 */
export const MONEDAS_ARRAY = Object.values(MONEDAS);

/**
 * Símbolos de moneda
 */
export const SIMBOLOS_MONEDA = {
  [MONEDAS.ARS]: '$',
  [MONEDAS.USD]: 'US$',
  [MONEDAS.EUR]: '€'
};

/**
 * Opciones de paginación por defecto
 */
export const PAGINACION = {
  ITEMS_POR_PAGINA_DEFAULT: 10,
  OPCIONES_ITEMS_POR_PAGINA: [10, 25, 50, 100]
};

/**
 * Formatos de fecha
 */
export const FORMATOS_FECHA = {
  CORTO: 'DD/MM/YYYY',
  LARGO: 'DD de MMMM de YYYY',
  CON_HORA: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
};

/**
 * Mensajes de error comunes
 */
export const MENSAJES_ERROR = {
  CAMPO_REQUERIDO: 'Este campo es requerido',
  EMAIL_INVALIDO: 'El email no es válido',
  CUIT_INVALIDO: 'El CUIT no tiene un formato válido (XX-XXXXXXXX-X)',
  TELEFONO_INVALIDO: 'El teléfono no es válido',
  NUMERO_POSITIVO: 'El número debe ser positivo',
  FECHA_INVALIDA: 'La fecha no es válida',
  ERROR_SERVIDOR: 'Error al conectar con el servidor',
  ERROR_GUARDAR: 'Error al guardar los datos',
  ERROR_ELIMINAR: 'Error al eliminar el registro',
  ERROR_CARGAR: 'Error al cargar los datos'
};

/**
 * Mensajes de éxito comunes
 */
export const MENSAJES_EXITO = {
  GUARDADO: 'Datos guardados correctamente',
  ACTUALIZADO: 'Datos actualizados correctamente',
  ELIMINADO: 'Registro eliminado correctamente',
  CREADO: 'Registro creado correctamente'
};

/**
 * Roles de usuario
 */
export const ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  VIEWER: 'viewer'
};

/**
 * Permisos por rol
 */
export const PERMISOS = {
  [ROLES.ADMIN]: {
    leer: true,
    crear: true,
    editar: true,
    eliminar: true,
    exportar: true,
    configuracion: true
  },
  [ROLES.VENDEDOR]: {
    leer: true,
    crear: true,
    editar: true,
    eliminar: false,
    exportar: true,
    configuracion: false
  },
  [ROLES.VIEWER]: {
    leer: true,
    crear: false,
    editar: false,
    eliminar: false,
    exportar: true,
    configuracion: false
  }
};

/**
 * Configuración de validación
 */
export const VALIDACION = {
  NOMBRE_MIN_LENGTH: 2,
  NOMBRE_MAX_LENGTH: 100,
  DESCRIPCION_MAX_LENGTH: 500,
  SKU_MAX_LENGTH: 50,
  TELEFONO_MIN_LENGTH: 10,
  DIRECCION_MIN_LENGTH: 5
};

/**
 * Límites de la aplicación
 */
export const LIMITES = {
  MAX_ITEMS_PRESUPUESTO: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_UPLOAD_FILES: 10
};
