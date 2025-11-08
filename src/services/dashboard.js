import { fetchRecords } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';

/**
 * Obtiene el resumen semanal de presupuestos
 * @returns {Promise<Object>} Objeto con KPIs semanales
 */
export const getResumenSemanal = async () => {
  try {
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 7);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const todosPresupuestos = await fetchRecords(TABLES.presupuestos, { limit: 1000 });
    const todosItems = await fetchRecords(TABLES.presupuestoItems, { limit: 5000 });

    const totalesPorPresupuesto = construirTotalesPorPresupuesto(todosItems);

    const presupuestosSemana = todosPresupuestos.filter((presupuesto) => {
      const fechaCreacion = obtenerFechaPresupuesto(presupuesto);
      return fechaCreacion ? fechaCreacion >= hace7Dias : false;
    });

    const enviadosSemana = presupuestosSemana.filter((presupuesto) => obtenerEstado(presupuesto) === 'Enviado');
    const aprobadosSemana = presupuestosSemana.filter((presupuesto) => obtenerEstado(presupuesto) === 'Aprobado');

    const montoSemana = sumarMontos(presupuestosSemana, totalesPorPresupuesto);
    const promedioSemana = presupuestosSemana.length > 0 ? montoSemana / presupuestosSemana.length : 0;

    const aprobadosMes = todosPresupuestos.filter((presupuesto) => {
      const fechaCreacion = obtenerFechaPresupuesto(presupuesto);
      return fechaCreacion ? fechaCreacion >= inicioMes && obtenerEstado(presupuesto) === 'Aprobado' : false;
    });

    const pendientesRespuesta = todosPresupuestos.filter((presupuesto) => obtenerEstado(presupuesto) === 'Enviado');

    const montoAprobadoMes = sumarMontos(aprobadosMes, totalesPorPresupuesto);
    const montoPendiente = sumarMontos(pendientesRespuesta, totalesPorPresupuesto);

    const tasaConversionSemana = enviadosSemana.length > 0
      ? (aprobadosSemana.length / enviadosSemana.length) * 100
      : 0;

    return {
      presupuestosSemana: presupuestosSemana.length,
      montoSemana,
      promedioSemana,
      enviadosSemana: enviadosSemana.length,
      aprobadosSemana: aprobadosSemana.length,
      conversionSemana: tasaConversionSemana,
      montoAprobadoMes,
      montoPendiente,
      // Compatibilidad con la versión anterior del dashboard
      montoTotal: montoSemana,
      promedio: promedioSemana
    };
  } catch (error) {
    console.error('Error obteniendo resumen semanal:', error);
    return {
      presupuestosSemana: 0,
      montoSemana: 0,
      promedioSemana: 0,
      enviadosSemana: 0,
      aprobadosSemana: 0,
      conversionSemana: 0,
      montoAprobadoMes: 0,
      montoPendiente: 0,
      montoTotal: 0,
      promedio: 0
    };
  }
};

/**
 * Obtiene los datos para los gráficos del dashboard
 * @returns {Promise<Object>} Objeto con datos para los gráficos
 */
export const getDatosGraficos = async () => {
  try {
    const [presupuestos, items, productos, categorias, subcategorias] = await Promise.all([
      fetchRecords(TABLES.presupuestos, { limit: 1000 }),
      fetchRecords(TABLES.presupuestoItems, { limit: 5000 }),
      fetchRecords(TABLES.productos, { limit: 1000 }),
      fetchRecords(TABLES.categorias, { limit: 100 }),
      fetchRecords(TABLES.subcategorias, { limit: 500 })
    ]);

    const totalesPorPresupuesto = construirTotalesPorPresupuesto(items);

    const porSemana = agruparPorSemana(presupuestos, totalesPorPresupuesto);
    const porCategoria = agruparPorCategoria(presupuestos, items, productos, subcategorias, categorias);
    const topClientes = calcularTop5Clientes(presupuestos, totalesPorPresupuesto);
    const porEstado = agruparPorEstado(presupuestos, totalesPorPresupuesto);
    const medioPago = calcularMixMediosPago(presupuestos, totalesPorPresupuesto);
    const pendientes = calcularPendientesSeguimiento(presupuestos, totalesPorPresupuesto);

    return {
      porSemana,
      porCategoria,
      topClientes,
      porEstado,
      medioPago,
      pendientes
    };
  } catch (error) {
    console.error('Error obteniendo datos de gráficos:', error);
    return {
      porSemana: [],
      porCategoria: [],
      topClientes: [],
      porEstado: [],
      medioPago: [],
      pendientes: []
    };
  }
};

/**
 * Agrupa presupuestos por semana (últimas 4 semanas laborales: lunes a domingo)
 */
function agruparPorSemana(presupuestos, totalesPorPresupuesto) {
  const hoy = new Date();
  const semanas = [];

  // Obtener el lunes de la semana actual
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const diasDesdeInicioSemana = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, retroceder 6 días

  const lunesActual = new Date(hoy);
  lunesActual.setDate(hoy.getDate() - diasDesdeInicioSemana);
  lunesActual.setHours(0, 0, 0, 0);

  // Crear array de las últimas 4 semanas (de lunes a domingo)
  for (let i = 3; i >= 0; i--) {
    const fechaInicio = new Date(lunesActual);
    fechaInicio.setDate(lunesActual.getDate() - (i * 7));

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + 6); // Domingo
    fechaFin.setHours(23, 59, 59, 999);

    // Formatear fechas dd/MM
    const inicio = `${fechaInicio.getDate()}/${fechaInicio.getMonth() + 1}`;
    const fin = `${fechaFin.getDate()}/${fechaFin.getMonth() + 1}`;

    semanas.push({
      semana: `${inicio} - ${fin}`,
      cantidad: 0,
      monto: 0,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin)
    });
  }

  // Contar presupuestos por semana
  presupuestos.forEach((presupuesto) => {
    const fechaCreacion = obtenerFechaPresupuesto(presupuesto);

    if (!fechaCreacion) {
      return;
    }

    semanas.forEach((semana, idx) => {
      if (fechaCreacion >= semana.fechaInicio && fechaCreacion <= semana.fechaFin) {
        semanas[idx].cantidad++;
        semanas[idx].monto += totalesPorPresupuesto.get(presupuesto.id) || 0;
      }
    });
  });

  // Retornar solo semana y cantidad
  return semanas.map(({ semana, cantidad, monto }) => ({
    semana,
    cantidad,
    monto: Number(monto.toFixed(2))
  }));
}

/**
 * Agrupa el monto total por categoría
 */
function agruparPorCategoria(presupuestos, items, productos, subcategorias, categorias) {
  const categoriaMap = new Map();

  // Inicializar todas las categorías con 0
  categorias.forEach(cat => {
    const nombreCat = cat.fields?.Categoria || cat.fields?.Nombre || cat.Categoria || cat.Nombre || 'Sin nombre';
    categoriaMap.set(cat.id, {
      nombre: nombreCat,
      valor: 0
    });
  });

  // Recorrer todos los items y sumar por categoría
  items.forEach(item => {
    const productoId = item.fields?.nc_1g29__Productos_id;
    const producto = productos.find(p => p.id === productoId);

    if (producto) {
      const subcategoriaId = producto.fields?.Subcategoria?.id;
      const subcategoria = subcategorias.find(s => s.id === subcategoriaId);

      if (subcategoria) {
        const categoriaId = subcategoria.fields?.nc_1g29__Categorias_id;
        const precio = parseFloat(item.fields?.PrecioUnitario) || 0;
        const cantidad = parseFloat(item.fields?.Cantidad) || 0;
        const total = precio * cantidad;

        if (categoriaMap.has(categoriaId)) {
          const cat = categoriaMap.get(categoriaId);
          cat.valor += total;
        }
      }
    }
  });

  // Convertir a array y filtrar categorías sin valor
  return Array.from(categoriaMap.values())
    .filter(cat => cat.valor > 0)
    .map(cat => ({
      categoria: cat.nombre,
      valor: parseFloat(cat.valor.toFixed(2))
    }));
}

/**
 * Calcula top 5 clientes por monto total
 */
function calcularTop5Clientes(presupuestos, totalesPorPresupuesto) {
  const clienteMap = new Map();

  presupuestos.forEach((presupuesto) => {
    const cliente = presupuesto.fields?.Cliente || 'Sin cliente';
    const total = totalesPorPresupuesto.get(presupuesto.id) || 0;

    if (!clienteMap.has(cliente)) {
      clienteMap.set(cliente, { total: 0, cantidad: 0 });
    }

    const info = clienteMap.get(cliente);
    info.total += total;
    info.cantidad += 1;
  });

  return Array.from(clienteMap.entries())
    .map(([cliente, info]) => ({
      cliente,
      total: Number(info.total.toFixed(2)),
      cantidad: info.cantidad
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function agruparPorEstado(presupuestos, totalesPorPresupuesto) {
  const resumenPorEstado = new Map();

  presupuestos.forEach((presupuesto) => {
    const estado = obtenerEstado(presupuesto);
    if (!resumenPorEstado.has(estado)) {
      resumenPorEstado.set(estado, { cantidad: 0, monto: 0 });
    }

    const datos = resumenPorEstado.get(estado);
    datos.cantidad += 1;
    datos.monto += totalesPorPresupuesto.get(presupuesto.id) || 0;
  });

  return Array.from(resumenPorEstado.entries()).map(([estado, datos]) => ({
    estado,
    cantidad: datos.cantidad,
    monto: Number(datos.monto.toFixed(2))
  }));
}

function calcularMixMediosPago(presupuestos, totalesPorPresupuesto) {
  let totalEfectivo = 0;
  let totalDigital = 0;

  presupuestos.forEach((presupuesto) => {
    const total = totalesPorPresupuesto.get(presupuesto.id) || 0;
    const esEfectivo = presupuesto.fields?.efectivo !== undefined
      ? Boolean(presupuesto.fields?.efectivo)
      : false;

    if (esEfectivo) {
      totalEfectivo += total;
    } else {
      totalDigital += total;
    }
  });

  const totalGeneral = totalEfectivo + totalDigital;

  if (totalGeneral === 0) {
    return [];
  }

  return [
    {
      tipo: 'Efectivo',
      valor: Number(totalEfectivo.toFixed(2))
    },
    {
      tipo: 'Tarjeta / Transferencia',
      valor: Number(totalDigital.toFixed(2))
    }
  ];
}

function calcularPendientesSeguimiento(presupuestos, totalesPorPresupuesto) {
  const hoy = new Date();

  return presupuestos
    .map((presupuesto) => {
      const estado = obtenerEstado(presupuesto);
      const fecha = obtenerFechaPresupuesto(presupuesto);
      const dias = fecha ? Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24)) : null;

      return {
        id: presupuesto.id,
        cliente: presupuesto.fields?.Cliente || 'Sin cliente',
        descripcion: presupuesto.fields?.Descripcion || 'Sin descripción',
        estado,
        fecha,
        dias,
        monto: Number((totalesPorPresupuesto.get(presupuesto.id) || 0).toFixed(2))
      };
    })
    .filter((registro) => {
      if (!registro.fecha || registro.dias === null) {
        return false;
      }

      if (registro.estado === 'Enviado') {
        return registro.dias >= 7;
      }

      if (registro.estado === 'Borrador') {
        return registro.dias >= 3;
      }

      return false;
    })
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 6);
}

function construirTotalesPorPresupuesto(items) {
  const totales = new Map();

  items.forEach((item) => {
    const presupuestoId = item.fields?.nc_1g29___Presupuestos_id;
    if (!presupuestoId) {
      return;
    }

    const precio = parseFloat(item.fields?.PrecioUnitario) || 0;
    const cantidad = parseFloat(item.fields?.Cantidad) || 0;
    const subtotal = precio * cantidad;

    const acumulado = totales.get(presupuestoId) || 0;
    totales.set(presupuestoId, acumulado + subtotal);
  });

  return totales;
}

function sumarMontos(presupuestos, totalesPorPresupuesto) {
  return presupuestos.reduce((acumulado, presupuesto) => {
    return acumulado + (totalesPorPresupuesto.get(presupuesto.id) || 0);
  }, 0);
}

function obtenerFechaPresupuesto(presupuesto) {
  const fecha = presupuesto.fields?.Fecha
    || presupuesto.fields?.CreatedAt
    || presupuesto.CreatedAt
    || presupuesto.created_at;

  return fecha ? new Date(fecha) : null;
}

function obtenerEstado(presupuesto) {
  return presupuesto.fields?.Estado || 'Borrador';
}
