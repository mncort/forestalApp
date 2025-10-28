import { useMemo } from 'react';

/**
 * Hook para calcular precios y totales del presupuesto
 *
 * @param {Array} items - Items del presupuesto
 * @param {boolean} efectivo - Si es pago en efectivo (true = 10.5% IVA, false = 21% IVA)
 */
export function usePresupuestoCalculations(items, efectivo) {
  // Calcular precios de items para mostrar
  const itemsConPrecios = useMemo(() => {
    return items.map(item => {
      const productoNested = item.fields.nc_1g29__Productos_id;
      const precioUnitario = parseFloat(item.fields.PrecioUnitario) || 0;
      const cantidad = parseFloat(item.fields.Cantidad) || 0;
      const subtotal = precioUnitario * cantidad;
      const moneda = item.fields.Moneda || 'ARS';

      return {
        ...item,
        productoNested,
        precioUnitario,
        cantidad,
        subtotal,
        moneda
      };
    });
  }, [items]);

  // Calcular totales del presupuesto
  const totales = useMemo(() => {
    const subtotal = itemsConPrecios.reduce((sum, item) => sum + item.subtotal, 0);
    const moneda = itemsConPrecios.length > 0 ? itemsConPrecios[0].moneda : 'ARS';
    // Si efectivo = true → 10.5% IVA (medio IVA)
    // Si efectivo = false → 21% IVA (IVA completo)
    const porcentajeImpuesto = efectivo ? 10.5 : 21;
    const impuesto = subtotal * (porcentajeImpuesto / 100);
    const total = subtotal + impuesto;

    return {
      subtotal,
      moneda,
      porcentajeImpuesto,
      impuesto,
      total
    };
  }, [itemsConPrecios, efectivo]);

  return {
    itemsConPrecios,
    totales
  };
}
