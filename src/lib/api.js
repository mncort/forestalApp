import { NOCODB_URL, HEADERS, TABLES, BASE_ID } from './nocodb-config';

export const fetchCategorias = async () => {
  const response = await fetch(
    `${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.categorias}/records?limit=100`,
    { headers: HEADERS }
  );
  const data = await response.json();
  return data.records || data.list || [];
};

export const fetchSubcategorias = async () => {
  const response = await fetch(
    `${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.subcategorias}/records?limit=100`,
    { headers: HEADERS }
  );
  const data = await response.json();
  return data.records || data.list || [];
};

export const fetchProductos = async () => {
  const response = await fetch(
    `${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.productos}/records?limit=100`,
    { headers: HEADERS }
  );
  const data = await response.json();
  return data.records || data.list || [];
};

export const fetchCostos = async () => {
  const response = await fetch(
    `${NOCODB_URL}/api/v3/data/${BASE_ID}/${TABLES.costos}/records?limit=100`,
    { headers: HEADERS }
  );
  const data = await response.json();
  return data.records || data.list || [];
};

export const getCostoActual = (costos, productoId) => {
  const costosProd = costos.filter(c => c.fields.Productos.id === productoId);
  const hoy = new Date().toISOString().split('T')[0];
  const vigentes = costosProd.filter(c => !c.fields.FechaHasta || c.fields.FechaHasta >= hoy);
  vigentes.sort((a, b) => (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || ''));
  return vigentes[0];
};
