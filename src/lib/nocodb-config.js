// Validar que las variables de entorno existan
if (!process.env.NEXT_PUBLIC_NOCODB_URL) {
  throw new Error('NEXT_PUBLIC_NOCODB_URL no está definida en .env.local');
}
if (!process.env.NEXT_PUBLIC_NOCODB_TOKEN) {
  throw new Error('NEXT_PUBLIC_NOCODB_TOKEN no está definida en .env.local');
}
if (!process.env.NEXT_PUBLIC_NOCODB_BASE_ID) {
  throw new Error('NEXT_PUBLIC_NOCODB_BASE_ID no está definida en .env.local');
}

export const NOCODB_URL = process.env.NEXT_PUBLIC_NOCODB_URL;
export const API_TOKEN = process.env.NEXT_PUBLIC_NOCODB_TOKEN;
export const BASE_ID = process.env.NEXT_PUBLIC_NOCODB_BASE_ID;

export const HEADERS = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json',
  'xc-timezone': 'America/Argentina/Buenos_Aires'
};

export const TABLES = {
  usuarios: process.env.NEXT_PUBLIC_TABLE_USUARIOS,
  categorias: process.env.NEXT_PUBLIC_TABLE_CATEGORIAS,
  subcategorias: process.env.NEXT_PUBLIC_TABLE_SUBCATEGORIAS,
  productos: process.env.NEXT_PUBLIC_TABLE_PRODUCTOS,
  costos: process.env.NEXT_PUBLIC_TABLE_COSTOS,
  costosHist: process.env.NEXT_PUBLIC_TABLE_COSTOS_HIST,
  presupuestos: process.env.NEXT_PUBLIC_TABLE_PRESUPUESTOS,
  presupuestoItems: process.env.NEXT_PUBLIC_TABLE_PRESUPUESTO_ITEMS,
  clientes: process.env.NEXT_PUBLIC_TABLE_CLIENTES
};
