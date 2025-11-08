import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar notificaciones toast
 * Wrapper sobre react-hot-toast con API más simple y consistente
 *
 * @returns {Object} Métodos para mostrar diferentes tipos de toast
 */
export function useToast() {
  /**
   * Muestra un toast de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales de react-hot-toast
   */
  const success = (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      position: 'bottom-right',
      ...options
    });
  };

  /**
   * Muestra un toast de error
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales de react-hot-toast
   */
  const error = (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      position: 'bottom-right',
      ...options
    });
  };

  /**
   * Muestra un toast de información
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales de react-hot-toast
   */
  const info = (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      position: 'bottom-right',
      icon: 'ℹ️',
      ...options
    });
  };

  /**
   * Muestra un toast de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales de react-hot-toast
   */
  const warning = (message, options = {}) => {
    return toast(message, {
      duration: 3500,
      position: 'bottom-right',
      icon: '⚠️',
      ...options
    });
  };

  /**
   * Muestra un toast de carga (loading)
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales de react-hot-toast
   * @returns {string} ID del toast para actualizar después
   */
  const loading = (message, options = {}) => {
    return toast.loading(message, {
      position: 'bottom-right',
      ...options
    });
  };

  /**
   * Muestra un toast con promesa
   * @param {Promise} promise - Promesa a ejecutar
   * @param {Object} messages - Mensajes para cada estado { loading, success, error }
   * @param {Object} options - Opciones adicionales
   */
  const promise = (promiseToResolve, messages, options = {}) => {
    return toast.promise(
      promiseToResolve,
      {
        loading: messages.loading || 'Cargando...',
        success: messages.success || 'Completado',
        error: messages.error || 'Error'
      },
      {
        position: 'bottom-right',
        ...options
      }
    );
  };

  /**
   * Descarta un toast específico o todos
   * @param {string} toastId - ID del toast a descartar (opcional)
   */
  const dismiss = (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  /**
   * Muestra un toast de confirmación con acción
   * @param {string} message - Mensaje a mostrar
   * @param {Function} onConfirm - Callback cuando se confirma
   * @param {Object} options - Opciones adicionales
   */
  const confirm = (message, onConfirm, options = {}) => {
    return toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>{message}</span>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
        ...options
      }
    );
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    confirm
  };
}

/**
 * Mensajes predefinidos comunes
 */
export const toastMessages = {
  // CRUD operations
  created: (entidad) => `${entidad} creado exitosamente`,
  updated: (entidad) => `${entidad} actualizado exitosamente`,
  deleted: (entidad) => `${entidad} eliminado exitosamente`,

  // Errors
  createError: (entidad) => `Error al crear ${entidad}`,
  updateError: (entidad) => `Error al actualizar ${entidad}`,
  deleteError: (entidad) => `Error al eliminar ${entidad}`,
  loadError: (entidad) => `Error al cargar ${entidad}`,

  // Network
  networkError: 'Error de conexión con el servidor',
  serverError: 'Error del servidor. Por favor intenta nuevamente',

  // Validation
  validationError: 'Por favor corrige los errores en el formulario',
  requiredFields: 'Por favor completa todos los campos requeridos',

  // Generic
  success: 'Operación completada exitosamente',
  error: 'Ocurrió un error. Por favor intenta nuevamente',
  loading: 'Cargando...',
  saving: 'Guardando...',
  deleting: 'Eliminando...'
};
