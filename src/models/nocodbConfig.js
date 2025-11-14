// Determinar si estamos en cliente o servidor
const isClient = typeof window !== 'undefined';

// En el cliente, usamos el proxy local de Next.js
// En el servidor, usamos la URL directa de NocoDB
export const NOCODB_URL = isClient
  ? '/api/nocodb'
  : (process.env.NOCODB_URL || process.env.NEXT_PUBLIC_NOCODB_URL);

// El token solo está disponible en el servidor
export const API_TOKEN = isClient ? null : process.env.NOCODB_TOKEN;

// BASE_ID sigue siendo necesario en el cliente para construir URLs
if (!process.env.NEXT_PUBLIC_NOCODB_BASE_ID) {
  throw new Error('NEXT_PUBLIC_NOCODB_BASE_ID no está definida en .env.local');
}
export const BASE_ID = process.env.NEXT_PUBLIC_NOCODB_BASE_ID;

// Headers: en el cliente sin token (el proxy lo agrega), en el servidor con token
export const HEADERS = isClient
  ? {
      'Content-Type': 'application/json'
    }
  : {
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
  clientes: process.env.NEXT_PUBLIC_TABLE_CLIENTES,
  stockMovimientos: process.env.NEXT_PUBLIC_TABLE_STOCK_MOVIMIENTOS
};
