export const NOCODB_URL = process.env.NEXT_PUBLIC_NOCODB_URL || 'http://localhost:7200';
export const API_TOKEN = process.env.NEXT_PUBLIC_NOCODB_TOKEN || '';
export const BASE_ID = process.env.NEXT_PUBLIC_NOCODB_BASE_ID || 'pkd32qoz1fc1g4k';

export const HEADERS = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json'
};

export const TABLES = {
  categorias: process.env.NEXT_PUBLIC_TABLE_CATEGORIAS || 'mki28en6bedf5cu',
  subcategorias: process.env.NEXT_PUBLIC_TABLE_SUBCATEGORIAS || 'mmlg9mykn3x2wba',
  productos: process.env.NEXT_PUBLIC_TABLE_PRODUCTOS || 'mqs4c3qv5r4qkeu',
  costos: process.env.NEXT_PUBLIC_TABLE_COSTOS || 'mx17jsmdlsczskq'
};
