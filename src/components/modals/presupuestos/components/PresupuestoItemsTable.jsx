'use client'
import { Trash2, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/formatting';

/**
 * Tabla de items del presupuesto con funcionalidad de edición inline
 */
export default function PresupuestoItemsTable({
  items,
  itemsConPrecios,
  onCantidadChange,
  onEliminarItem,
  loading,
  disabled = false
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No hay productos agregados</p>
        <p className="text-sm text-muted-foreground/70">
          Agrega productos para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="text-center">Cantidad</TableHead>
            <TableHead className="text-right">Precio Unit.</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemsConPrecios.map((item) => {
            const producto = item.fields.nc_1g29__Productos_id;
            const subtotal = item.precioUnitario * item.cantidad;

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {producto.SKU}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{producto.Nombre}</div>
                    {producto.Descripcion && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {producto.Descripcion}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      min="1"
                      className="w-20 text-center h-9"
                      value={item.cantidad}
                      onChange={(e) =>
                        onCantidadChange(item.id, parseInt(e.target.value) || 1)
                      }
                      disabled={disabled}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.precioUnitario)} {item.moneda}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(subtotal)} {item.moneda}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => onEliminarItem(item.id)}
                      variant="ghost"
                      size="icon"
                      title="Eliminar item"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      disabled={disabled}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
