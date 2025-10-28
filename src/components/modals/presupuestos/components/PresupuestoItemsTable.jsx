'use client'
import { Trash2, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';

/**
 * Tabla de items del presupuesto con funcionalidad de edición inline
 */
export default function PresupuestoItemsTable({
  items,
  itemsConPrecios,
  onCantidadChange,
  onEliminarItem,
  loading
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-base-content/30 mb-3" />
        <p className="text-base-content/50">No hay productos agregados</p>
        <p className="text-sm text-base-content/40">
          Agrega productos para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th className="text-center">Cantidad</th>
            <th className="text-right">Precio Unit.</th>
            <th className="text-right">Subtotal</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {itemsConPrecios.map((item) => {
            const producto = item.fields.nc_1g29__Productos_id;
            const subtotal = item.precioUnitario * item.cantidad;

            return (
              <tr key={item.id}>
                <td>
                  <span className="badge badge-outline font-mono text-xs">
                    {producto.SKU}
                  </span>
                </td>
                <td>
                  <div>
                    <div className="font-medium">{producto.Nombre}</div>
                    {producto.Descripcion && (
                      <div className="text-xs text-base-content/60 mt-0.5">
                        {producto.Descripcion}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min="1"
                      className="input input-sm input-bordered w-20 text-center"
                      value={item.cantidad}
                      onChange={(e) =>
                        onCantidadChange(item.id, parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                </td>
                <td className="text-right font-medium">
                  {formatCurrency(item.precioUnitario)} {item.moneda}
                </td>
                <td className="text-right font-semibold">
                  {formatCurrency(subtotal)} {item.moneda}
                </td>
                <td>
                  <div className="flex justify-center">
                    <button
                      onClick={() => onEliminarItem(item.id)}
                      className="btn btn-ghost btn-sm btn-circle text-error"
                      title="Eliminar item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
