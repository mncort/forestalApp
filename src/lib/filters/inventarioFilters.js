/**
 * Construye la cláusula WHERE para filtrar productos en la vista de inventario
 * @param {Object} filters - Objeto con los filtros activos
 * @param {string} filters.search - Texto para buscar en nombre de producto o SKU
 * @param {Array} filters.categorias - Array de IDs de categorías seleccionadas
 * @param {Array} filters.subcategorias - Array de IDs de subcategorías seleccionadas
 * @param {Array} subcategorias - Array de todas las subcategorías (para relacionar con categorías)
 * @returns {string} Cláusula WHERE para NocoDB o string vacío
 */
export const buildInventarioWhereClause = (filters, subcategorias = []) => {
  const conditions = [];

  // Filtro por búsqueda de producto (nombre o SKU)
  if (filters.search && filters.search.trim() !== '') {
    const searchText = filters.search.trim();
    // Crear condición OR para buscar en Nombre o SKU
    const searchCondition = `((Nombre,like,%${searchText}%)~or(SKU,like,%${searchText}%))`;
    conditions.push(searchCondition);
  }

  // Filtro por categorías
  if (filters.categorias.length > 0) {
    // Encontrar subcategorías que pertenecen a las categorías seleccionadas
    const subcategoriasDeCategoriasSeleccionadas = subcategorias.filter(sub =>
      filters.categorias.includes(sub.fields.nc_1g29__Categorias_id)
    );

    if (subcategoriasDeCategoriasSeleccionadas.length > 0) {
      const subcategoriaConditions = subcategoriasDeCategoriasSeleccionadas
        .map(sub => `(nc_1g29__Subcategorias_id,eq,${sub.id})`)
        .join('~or');

      conditions.push(`(${subcategoriaConditions})`);
    } else {
      // Si no hay subcategorías para esas categorías, no mostrar nada
      conditions.push('(nc_1g29__Subcategorias_id,eq,__NO_MATCH__)');
    }
  }

  // Filtro por subcategorías
  if (filters.subcategorias.length > 0) {
    const subcategoriaConditions = filters.subcategorias
      .map(subId => `(nc_1g29__Subcategorias_id,eq,${subId})`)
      .join('~or');

    conditions.push(`(${subcategoriaConditions})`);
  }

  // Unir todas las condiciones con AND
  if (conditions.length === 0) {
    return '';
  }

  return conditions.join('~and');
};
