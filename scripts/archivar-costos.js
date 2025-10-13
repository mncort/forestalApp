/**
 * Script para archivar costos históricos automáticamente
 * Se ejecuta cada X horas configuradas en CRON_INTERVAL_HOURS
 *
 * Uso:
 *   node scripts/archivar-costos.js
 *
 * El script se mantendrá corriendo y ejecutará el archivado automáticamente.
 * Para ejecutar en background:
 *   - Windows: npm install -g pm2 && pm2 start scripts/archivar-costos.js --name "archivador-costos"
 *   - Ver logs: pm2 logs archivador-costos
 *   - Detener: pm2 stop archivador-costos
 */

// Cargar variables de entorno desde .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Validar que las variables de entorno existan
if (!process.env.NEXT_PUBLIC_NOCODB_URL) {
  console.error('❌ Error: NEXT_PUBLIC_NOCODB_URL no está definida en .env.local');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_NOCODB_TOKEN) {
  console.error('❌ Error: NEXT_PUBLIC_NOCODB_TOKEN no está definida en .env.local');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_NOCODB_BASE_ID) {
  console.error('❌ Error: NEXT_PUBLIC_NOCODB_BASE_ID no está definida en .env.local');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_TABLE_COSTOS) {
  console.error('❌ Error: NEXT_PUBLIC_TABLE_COSTOS no está definida en .env.local');
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_TABLE_COSTOS_HIST) {
  console.error('❌ Error: NEXT_PUBLIC_TABLE_COSTOS_HIST no está definida en .env.local');
  console.error('   Primero debes crear la tabla Costos_Hist en NocoDB y configurar su ID.');
  process.exit(1);
}

const NOCODB_URL = process.env.NEXT_PUBLIC_NOCODB_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_NOCODB_TOKEN;
const BASE_ID = process.env.NEXT_PUBLIC_NOCODB_BASE_ID;
const TABLE_COSTOS = process.env.NEXT_PUBLIC_TABLE_COSTOS;
const TABLE_COSTOS_HIST = process.env.NEXT_PUBLIC_TABLE_COSTOS_HIST;

// Intervalo en horas (configurable desde .env.local o por defecto 24 horas)
const CRON_INTERVAL_HOURS = parseInt(process.env.CRON_INTERVAL_HOURS || '24');

const HEADERS = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json',
  'xc-timezone': 'America/Argentina/Buenos_Aires'
};

async function fetchRecords(tableId, limit = 1000) {
  const url = `${NOCODB_URL}/api/v3/data/${BASE_ID}/${tableId}/records?limit=${limit}`;
  const response = await fetch(url, { headers: HEADERS });

  if (!response.ok) {
    throw new Error(`Error fetching records: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records || data.list || [];
}

async function createRecord(tableId, data) {
  const url = `${NOCODB_URL}/api/v2/tables/${tableId}/records`;
  const response = await fetch(url, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Error creating record: ${response.statusText}`);
  }

  return await response.json();
}

async function deleteRecord(tableId, recordId) {
  const url = `${NOCODB_URL}/api/v2/tables/${tableId}/records`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: HEADERS,
    body: JSON.stringify({ id: recordId })
  });

  if (!response.ok) {
    throw new Error(`Error deleting record: ${response.statusText}`);
  }
}

async function archivarCostosHistoricos() {
  console.log('========================================');
  console.log('INICIO: Archivado de costos históricos');
  console.log(`Fecha: ${new Date().toLocaleString('es-AR')}`);
  console.log('========================================\n');

  const resultado = {
    costosArchivados: 0,
    costosEliminados: 0,
    errores: []
  };

  try {
    // Validar que la tabla histórica esté configurada
    if (TABLE_COSTOS_HIST === 'PENDIENTE_CREAR_TABLA') {
      throw new Error('La tabla costos_hist no está configurada. Por favor, crea la tabla en NocoDB y actualiza el .env.local');
    }

    // Obtener la fecha de hoy
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    console.log(`Fecha de referencia: ${fechaHoy}\n`);

    // Obtener todos los costos
    console.log('Obteniendo costos de la tabla principal...');
    const todosCostos = await fetchRecords(TABLE_COSTOS);
    console.log(`Total de costos encontrados: ${todosCostos.length}\n`);

    // Filtrar costos que tienen FechaHasta < hoy
    const costosParaArchivar = todosCostos.filter(costo => {
      const fechaHasta = costo.fields.FechaHasta;
      if (!fechaHasta) return false;
      return fechaHasta < fechaHoy;
    });

    console.log(`Costos a archivar: ${costosParaArchivar.length}\n`);

    if (costosParaArchivar.length === 0) {
      console.log('✓ No hay costos para archivar.');
      return resultado;
    }

    // Procesar cada costo
    for (const costo of costosParaArchivar) {
      try {
        const productoInfo = costo.fields.Productos
          ? `Producto ID: ${costo.fields.Productos.id}`
          : 'Sin producto';

        console.log(`Procesando costo ID: ${costo.id} (${productoInfo})`);
        console.log(`  - Costo: ${costo.fields.Costo} ${costo.fields.Moneda}`);
        console.log(`  - Desde: ${costo.fields.FechaDesde}`);
        console.log(`  - Hasta: ${costo.fields.FechaHasta}`);

        // Crear en tabla histórica
        const datosHistorico = {
          Costo: costo.fields.Costo,
          Moneda: costo.fields.Moneda,
          FechaDesde: costo.fields.FechaDesde,
          FechaHasta: costo.fields.FechaHasta,
          nc_1g29__Productos_id: costo.fields.Productos?.id || null
        };

        await createRecord(TABLE_COSTOS_HIST, datosHistorico);
        resultado.costosArchivados++;
        console.log(`  ✓ Archivado en costos_hist`);

        // Eliminar de tabla principal
        await deleteRecord(TABLE_COSTOS, costo.id);
        resultado.costosEliminados++;
        console.log(`  ✓ Eliminado de costos principal\n`);

      } catch (error) {
        console.error(`  ✗ Error procesando costo ${costo.id}:`, error.message);
        resultado.errores.push({
          costoId: costo.id,
          error: error.message
        });
      }
    }

  } catch (error) {
    console.error('\n✗ Error general:', error.message);
    resultado.errores.push({
      tipo: 'general',
      error: error.message
    });
  }

  // Resumen final
  console.log('\n========================================');
  console.log('RESUMEN:');
  console.log(`  - Costos archivados: ${resultado.costosArchivados}`);
  console.log(`  - Costos eliminados: ${resultado.costosEliminados}`);
  console.log(`  - Errores: ${resultado.errores.length}`);
  console.log('========================================\n');

  return resultado;
}

// Contador de ejecuciones
let ejecucionesRealizadas = 0;
let ultimaEjecucion = null;

// Función principal que ejecuta y programa la siguiente ejecución
async function ejecutarYProgramar() {
  const ahora = new Date();
  ejecucionesRealizadas++;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🕐 Ejecución #${ejecucionesRealizadas}`);
  console.log(`⏰ Hora actual: ${ahora.toLocaleString('es-AR')}`);
  console.log(`${'='.repeat(60)}`);

  // Ejecutar el archivado
  try {
    await archivarCostosHistoricos();
    ultimaEjecucion = new Date();
  } catch (error) {
    console.error('❌ Error fatal:', error);
  }

  // Mostrar información de la próxima ejecución
  const proxima = new Date(Date.now() + CRON_INTERVAL_HOURS * 60 * 60 * 1000);
  console.log(`\n✅ El servicio sigue activo`);
  console.log(`📊 Ejecuciones realizadas: ${ejecucionesRealizadas}`);
  console.log(`⏰ Próxima ejecución: ${proxima.toLocaleString('es-AR')}`);
  console.log(`⏹️  Para detener: Ctrl+C\n`);

  // Programar la próxima ejecución
  setTimeout(ejecutarYProgramar, CRON_INTERVAL_HOURS * 60 * 60 * 1000);
}

// Mostrar estado cada 5 minutos
setInterval(() => {
  const ahora = new Date();
  console.log(`\n💚 [ESTADO] Servicio activo - ${ahora.toLocaleString('es-AR')}`);
  console.log(`   Ejecuciones completadas: ${ejecucionesRealizadas}`);
  if (ultimaEjecucion) {
    console.log(`   Última ejecución: ${ultimaEjecucion.toLocaleString('es-AR')}`);
  }
  const proxima = new Date(ultimaEjecucion ? ultimaEjecucion.getTime() + CRON_INTERVAL_HOURS * 60 * 60 * 1000 : Date.now() + CRON_INTERVAL_HOURS * 60 * 60 * 1000);
  console.log(`   Próxima ejecución: ${proxima.toLocaleString('es-AR')}\n`);
}, 5 * 60 * 1000); // Cada 5 minutos

// Iniciar el proceso
console.log('\n' + '='.repeat(60));
console.log('🚀 SERVICIO DE ARCHIVADO AUTOMÁTICO DE COSTOS');
console.log('='.repeat(60));
console.log(`📅 Fecha de inicio: ${new Date().toLocaleString('es-AR')}`);
console.log(`⏱️  Intervalo: cada ${CRON_INTERVAL_HOURS} hora(s)`);
console.log(`💚 Estado: cada 5 minutos verás un mensaje de estado`);
console.log(`⏹️  Para detener: Ctrl+C`);
console.log('='.repeat(60) + '\n');

ejecutarYProgramar();
