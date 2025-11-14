import { NextResponse } from 'next/server';

// Configuración de NocoDB (solo en servidor)
const NOCODB_URL = process.env.NOCODB_URL || 'http://192.168.0.102:7200';
const API_TOKEN = process.env.NOCODB_TOKEN;

if (!API_TOKEN) {
  throw new Error('NOCODB_TOKEN no está definida en .env.local');
}

const HEADERS = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json',
  'xc-timezone': 'America/Argentina/Buenos_Aires'
};

/**
 * Proxy genérico para todas las peticiones a NocoDB
 * Maneja GET, POST, PATCH, DELETE
 */
async function handler(request, context) {
  try {
    // En Next.js 15, params es una promesa que debe ser esperada
    const params = await context.params;

    // Obtener el path completo
    const { path } = params;
    const pathString = Array.isArray(path) ? path.join('/') : path;

    // Obtener query params
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Construir URL completa
    const url = `${NOCODB_URL}/${pathString}${queryString ? `?${queryString}` : ''}`;

    const timestamp = new Date().toLocaleString('es-AR', { hour12: false });
    console.log(`[${timestamp}] [CLIENT] ${request.method} ${url}`);

    // Preparar opciones del fetch
    const fetchOptions = {
      method: request.method,
      headers: HEADERS,
    };

    // Si tiene body, agregarlo
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch (e) {
        // No hay body o no es JSON válido
      }
    }

    // Hacer la petición a NocoDB
    const response = await fetch(url, fetchOptions);

    // Obtener el contenido de la respuesta
    const data = await response.json();

    // Si hay error, retornarlo con el status correcto
    if (!response.ok) {
      const errorTimestamp = new Date().toLocaleString('es-AR', { hour12: false });
      console.error(`[${errorTimestamp}] [CLIENT] Error ${response.status}:`, data);
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    const successTimestamp = new Date().toLocaleString('es-AR', { hour12: false });
    console.log(`[${successTimestamp}] [CLIENT] Success ${response.status}`);

    // Retornar la respuesta exitosa
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    const exceptionTimestamp = new Date().toLocaleString('es-AR', { hour12: false });
    console.error(`[${exceptionTimestamp}] [CLIENT] Exception:`, error);
    return NextResponse.json(
      {
        message: 'Error de conexión con NocoDB',
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Exportar handlers para cada método HTTP
export async function GET(request, context) {
  return handler(request, context);
}

export async function POST(request, context) {
  return handler(request, context);
}

export async function PATCH(request, context) {
  return handler(request, context);
}

export async function DELETE(request, context) {
  return handler(request, context);
}
