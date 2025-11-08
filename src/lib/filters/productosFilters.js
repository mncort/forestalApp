/**
 * Construye la cláusula WHERE para filtrar productos en NocoDB
 * @param {Object} filters - Objeto con los filtros activos
 * @param {string} filters.searchText - Texto para buscar en nombre de producto o SKU
 * @param {Array} filters.categorias - Array de IDs de categorías seleccionadas
 * @param {Array} filters.subcategorias - Array de IDs de subcategorías seleccionadas
 * @param {Array} subcategorias - Array de todas las subcategorías (para relacionar con categorías)
 * @returns {string} Cláusula WHERE para NocoDB o string vacío
 */
export const buildProductosWhereClause = (filters, subcategorias = []) => {
  const conditions = [];

  // Filtro por búsqueda de producto (nombre o SKU)
  // Usamos los operadores 'like' de NocoDB para buscar directamente en los campos
  if (filters.searchText && filters.searchText.trim() !== '') {
    const searchText = filters.searchText.trim();

    // Crear condición OR para buscar en Nombre o SKU usando 'like'
    // NocoDB acepta: (Nombre,like,%searchText%)~or(SKU,like,%searchText%)
    const searchCondition = `((Nombre,like,%${searchText}%)~or(SKU,like,%${searchText}%))`;
    conditions.push(searchCondition);
  }

  // Filtro por categorías
  // Si hay categorías seleccionadas, necesitamos encontrar todas las subcategorías
  // que pertenecen a esas categorías y filtrar productos por esas subcategorías
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
  // Este filtro se suma al de categorías (si hay ambos, se hace un AND)
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

/**
 * Obtiene las subcategorías filtradas según las categorías seleccionadas
 * @param {Array} categorias - IDs de categorías seleccionadas
 * @param {Array} todasSubcategorias - Array de todas las subcategorías
 * @returns {Array} Array de subcategorías filtradas
 */
export const getSubcategoriasPorCategorias = (categorias, todasSubcategorias) => {
  if (categorias.length === 0) {
    return todasSubcategorias;
  }

  return todasSubcategorias.filter(sub =>
    categorias.includes(sub.fields.nc_1g29__Categorias_id)
  );
};
