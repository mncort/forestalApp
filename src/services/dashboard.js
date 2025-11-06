import { fetchRecords } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';

/**
 * Obtiene el resumen semanal de presupuestos
 * @returns {Promise<Object>} Objeto con KPIs semanales
 */
export const getResumenSemanal = async () => {
  try {
    // Calcular fecha de hace 7 días
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    // Obtener todos los presupuestos
    const todosPresupuestos = await fetchRecords(TABLES.presupuestos, { limit: 1000 });

    // Obtener todos los items de presupuesto para calcular totales
    const todosItems = await fetchRecords(TABLES.presupuestoItems, { limit: 5000 });

    // Filtrar presupuestos de la última semana
    const presupuestosSemana = todosPresupuestos.filter(p => {
      const fechaCreacion = new Date(
        p.CreatedAt || p.created_at || p.fields?.CreatedAt || p.fields?.Fecha
      );
      return fechaCreacion >= hace7Dias;
    });

    // Calcular monto total de presupuestos de esta semana
    let montoTotal = 0;
    presupuestosSemana.forEach(presupuesto => {
      // Filtrar items de este presupuesto
      const itemsPresupuesto = todosItems.filter(
        item => item.fields?.nc_1g29___Presupuestos_id === presupuesto.id
      );

      // Sumar total de items
      const totalPresupuesto = itemsPresupuesto.reduce((sum, item) => {
        const precio = parseFloat(item.fields?.PrecioUnitario) || 0;
        const cantidad = parseFloat(item.fields?.Cantidad) || 0;
        return sum + (precio * cantidad);
      }, 0);

      montoTotal += totalPresupuesto;
    });

    const cantidadPresupuestos = presupuestosSemana.length;
    const promedio = cantidadPresupuestos > 0 ? montoTotal / cantidadPresupuestos : 0;

    return {
      presupuestosSemana: cantidadPresupuestos,
      montoTotal: montoTotal.toFixed(2),
      promedio: promedio.toFixed(2)
    };
  } catch (error) {
    console.error('Error obteniendo resumen semanal:', error);
    return {
      presupuestosSemana: 0,
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
    // Obtener todos los presupuestos y items
    const [presupuestos, items, productos, categorias, subcategorias] = await Promise.all([
      fetchRecords(TABLES.presupuestos, { limit: 1000 }),
      fetchRecords(TABLES.presupuestoItems, { limit: 5000 }),
      fetchRecords(TABLES.productos, { limit: 1000 }),
      fetchRecords(TABLES.categorias, { limit: 100 }),
      fetchRecords(TABLES.subcategorias, { limit: 500 })
    ]);

    // 1. Agrupar presupuestos por semana (últimas 4 semanas)
    const porSemana = agruparPorSemana(presupuestos);

    // 2. Agrupar por categoría (basado en productos de los items)
    const porCategoria = agruparPorCategoria(presupuestos, items, productos, subcategorias, categorias);

    // 3. Top 5 clientes por monto
    const topClientes = calcularTop5Clientes(presupuestos, items);

    return {
      porSemana,
      porCategoria,
      topClientes
    };
  } catch (error) {
    console.error('Error obteniendo datos de gráficos:', error);
    return {
      porSemana: [],
      porCategoria: [],
      topClientes: []
    };
  }
};

/**
 * Agrupa presupuestos por semana (últimas 4 semanas laborales: lunes a domingo)
 */
function agruparPorSemana(presupuestos) {
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
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin)
    });
  }

  // Contar presupuestos por semana
  presupuestos.forEach(p => {
    const fechaCreacion = new Date(
      p.CreatedAt || p.created_at || p.fields?.CreatedAt || p.fields?.Fecha
    );

    semanas.forEach((sem, idx) => {
      if (fechaCreacion >= sem.fechaInicio && fechaCreacion <= sem.fechaFin) {
        semanas[idx].cantidad++;
      }
    });
  });

  // Retornar solo semana y cantidad
  return semanas.map(({ semana, cantidad }) => ({ semana, cantidad }));
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
function calcularTop5Clientes(presupuestos, items) {
  const clienteMap = new Map();

  // Calcular total por cliente
  presupuestos.forEach(presupuesto => {
    const cliente = presupuesto.fields?.Cliente || 'Sin cliente';

    // Filtrar items de este presupuesto
    const itemsPresupuesto = items.filter(
      item => item.fields?.nc_1g29___Presupuestos_id === presupuesto.id
    );

    // Calcular total
    const total = itemsPresupuesto.reduce((sum, item) => {
      const precio = parseFloat(item.fields?.PrecioUnitario) || 0;
      const cantidad = parseFloat(item.fields?.Cantidad) || 0;
      return sum + (precio * cantidad);
    }, 0);

    // Acumular por cliente
    if (clienteMap.has(cliente)) {
      clienteMap.set(cliente, clienteMap.get(cliente) + total);
    } else {
      clienteMap.set(cliente, total);
    }
  });

  // Convertir a array, ordenar y tomar top 5
  return Array.from(clienteMap.entries())
    .map(([cliente, total]) => ({
      cliente,
      total: parseFloat(total.toFixed(2))
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}
