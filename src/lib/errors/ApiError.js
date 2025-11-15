/**
 * Clase personalizada para errores de API
 * Proporciona manejo centralizado de errores con status HTTP y datos adicionales
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Mensaje de error
   * @param {number} status - Código de estado HTTP (400, 404, 500, etc.)
   * @param {Object} data - Datos adicionales del error
   */
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;

    // Mantiene el stack trace correcto en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convierte el error a un objeto JSON para respuesta HTTP
   */
  toJSON() {
    return {
      error: this.message,
      status: this.status,
      ...(this.data && { data: this.data })
    };
  }

  /**
   * Crea un ApiError de validación (400)
   */
  static badRequest(message, data = null) {
    return new ApiError(message, 400, data);
  }

  /**
   * Crea un ApiError de autenticación (401)
   */
  static unauthorized(message = 'No autorizado') {
    return new ApiError(message, 401);
  }

  /**
   * Crea un ApiError de permisos (403)
   */
  static forbidden(message = 'Acceso denegado', data = null) {
    return new ApiError(message, 403, data);
  }

  /**
   * Crea un ApiError de recurso no encontrado (404)
   */
  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(message, 404);
  }

  /**
   * Crea un ApiError de conflicto (409)
   */
  static conflict(message, data = null) {
    return new ApiError(message, 409, data);
  }

  /**
   * Crea un ApiError de servidor (500)
   */
  static internal(message = 'Error interno del servidor') {
    return new ApiError(message, 500);
  }
}
