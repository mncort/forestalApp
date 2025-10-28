'use client'
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook genérico para manejar lógica de modales de formulario CRUD
 *
 * @param {Object} config - Configuración del hook
 * @param {Object} config.entity - Entidad a editar (null para crear)
 * @param {Object} config.initialFormData - Estado inicial del formulario
 * @param {Function} config.onSave - Función para guardar (create o update)
 * @param {Function} config.validate - Función de validación (retorna { valid, errors })
 * @param {Function} config.transformData - Transforma formData antes de guardar (opcional)
 * @param {Function} config.onSuccess - Callback después de guardar exitosamente
 * @param {Object} config.messages - Mensajes personalizados (opcional)
 *
 * @returns {Object} Estado y funciones del formulario
 */
export function useFormModal({
  entity,
  initialFormData,
  onSave,
  validate,
  transformData = (data) => data,
  onSuccess,
  messages = {}
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!entity;

  // Mensajes por defecto
  const defaultMessages = {
    creating: 'Creando...',
    updating: 'Actualizando...',
    created: 'Creado exitosamente',
    updated: 'Actualizado exitosamente',
    error: 'Error al guardar'
  };

  const msgs = { ...defaultMessages, ...messages };

  // Reset form cuando cambia la entidad
  useEffect(() => {
    if (entity) {
      // Asegurar que todos los campos tengan valores definidos
      const entityData = entity.fields || entity;
      const normalizedData = {};

      // Normalizar datos para evitar undefined
      Object.keys(initialFormData).forEach(key => {
        normalizedData[key] = entityData[key] !== undefined && entityData[key] !== null
          ? entityData[key]
          : initialFormData[key];
      });

      setFormData(normalizedData);
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [entity]);

  // Actualizar un campo
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error de ese campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Actualizar múltiples campos
  const updateFields = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  // Guardar
  const handleSave = async () => {
    // 1. Validar
    if (validate) {
      const validation = validate(formData);
      if (!validation.valid) {
        setErrors(validation.errors || {});

        // Mostrar primer error
        const firstError = Object.values(validation.errors)[0];
        if (firstError) {
          toast.error(firstError);
        }
        return false;
      }
    }

    // 2. Guardar
    setSaving(true);
    try {
      // Transformar datos si es necesario
      const dataToSave = transformData(formData);

      // Llamar a la función de guardado
      await onSave(dataToSave, isEditMode, entity?.id);

      // Mensaje de éxito
      toast.success(isEditMode ? msgs.updated : msgs.created);

      // Callback de éxito
      if (onSuccess) {
        await onSuccess();
      }

      // Reset form
      resetForm();

      return true;
    } catch (err) {
      console.error('Error guardando:', err);
      toast.error(err.message || msgs.error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    handleSave,
    saving,
    errors,
    isEditMode
  };
}
