/**
 * Construye la cláusula WHERE para filtrar presupuestos en NocoDB
 * @param {Object} filters - Objeto con los filtros activos
 * @param {string} filters.searchText - Texto para buscar en nombre de cliente o CUIT
 * @param {string} filters.tipoPago - 'todos' | 'efectivo' | 'tarjeta'
 * @param {string} filters.fechaDesde - Fecha desde en formato YYYY-MM-DD
 * @param {string} filters.fechaHasta - Fecha hasta en formato YYYY-MM-DD
 * @param {Array} clientes - Array de todos los clientes (para filtrar por nombre/CUIT)
 * @returns {string} Cláusula WHERE para NocoDB o string vacío
 */
export const buildPresupuestosWhereClause = (filters, clientes = []) => {
  const conditions = [];

  // Filtro por búsqueda de cliente (nombre o CUIT)
  if (filters.searchText && filters.searchText.trim() !== '') {
    const searchText = filters.searchText.trim().toLowerCase();

    // Filtrar clientes que coincidan con el nombre o CUIT
    const clientesCoincidentes = clientes.filter(cliente => {
      const nombre = (cliente.fields?.Nombre || '').toLowerCase();
      const cuit = (cliente.fields?.CUIT || '').toLowerCase();
      return nombre.includes(searchText) || cuit.includes(searchText);
    });

    // Si hay clientes coincidentes, crear condición OR para cada uno
    if (clientesCoincidentes.length > 0) {
      const clienteConditions = clientesCoincidentes
        .map(cliente => `(nc_1g29__Clientes_id,eq,${cliente.id})`)
        .join('~or');

      conditions.push(`(${clienteConditions})`);
    } else {
      // Si no hay coincidencias, agregar condición imposible para no mostrar nada
      conditions.push('(nc_1g29__Clientes_id,eq,__NO_MATCH__)');
    }
  }

  // Filtro por tipo de pago
  if (filters.tipoPago && filters.tipoPago !== 'todos') {
    // NocoDB puede usar diferentes formatos: true/false, 1/0, checked/unchecked
    // Intentar con el formato booleano directo (sin comillas)
    const efectivoValue = filters.tipoPago === 'efectivo' ? 1 : 0;
    conditions.push(`(efectivo,eq,${efectivoValue})`);
  }

  // Filtro por fecha desde
  // NocoDB requiere el formato: (DateField,gte,exactDate,YYYY-MM-DD)
  // Incluir desde el inicio del día seleccionado
  if (filters.fechaDesde && filters.fechaDesde.trim() !== '') {
    conditions.push(`(CreatedAt,gte,exactDate,${filters.fechaDesde})`);
  }

  // Filtro por fecha hasta
  // Para incluir todo el día seleccionado, agregamos un día y usamos lt (less than)
  // en lugar de lte, o usamos lte con el día siguiente
  if (filters.fechaHasta && filters.fechaHasta.trim() !== '') {
    // Calcular el día siguiente para incluir todo el día seleccionado
    const fechaHasta = new Date(filters.fechaHasta + 'T00:00:00');
    fechaHasta.setDate(fechaHasta.getDate() + 1);
    const fechaHastaInclusive = fechaHasta.toISOString().split('T')[0];
    conditions.push(`(CreatedAt,lt,exactDate,${fechaHastaInclusive})`);
  }

  // Unir todas las condiciones con AND
  if (conditions.length === 0) {
    return '';
  }

  return conditions.join('~and');
};

/**
 * Valida que el rango de fechas sea correcto
 * @param {string} fechaDesde - Fecha desde
 * @param {string} fechaHasta - Fecha hasta
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateDateRange = (fechaDesde, fechaHasta) => {
  if (!fechaDesde || !fechaHasta) {
    return { valid: true, error: '' };
  }

  const desde = new Date(fechaDesde);
  const hasta = new Date(fechaHasta);

  if (desde > hasta) {
    return {
      valid: false,
      error: 'La fecha desde no puede ser posterior a la fecha hasta'
    };
  }

  return { valid: true, error: '' };
};
