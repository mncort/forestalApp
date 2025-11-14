'use client'
import React, { useState, useEffect } from 'react';
import { getMovimientosByProducto } from '@/services/index';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistorialMovimientosModal({ show, producto, onClose }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && producto) {
      cargarMovimientos();
    }
  }, [show, producto]);

  const cargarMovimientos = async () => {
    if (!producto || !producto.id) {
      setError('Producto no válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getMovimientosByProducto(producto.id, { limit: 100 });
      setMovimientos(data);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
      setError(`Error al cargar el historial: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es });
    } catch (error) {
      return '-';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Entrada':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'Salida':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'Consolidado':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTipoBadgeVariant = (tipo) => {
    switch (tipo) {
      case 'Entrada':
        return 'default';
      case 'Salida':
        return 'destructive';
      case 'Consolidado':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCantidadColor = (cantidad) => {
    const num = parseFloat(cantidad);
    if (num > 0) return 'text-green-600 font-semibold';
    if (num < 0) return 'text-red-600 font-semibold';
    return 'text-muted-foreground';
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historial de Movimientos</DialogTitle>
          <DialogDescription>
            Visualizá todos los movimientos de stock del producto
          </DialogDescription>
          {producto && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{producto.fields?.SKU}</Badge>
                <span className="font-medium">{producto.fields?.Nombre}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Stock actual: <span className="font-semibold">{producto.fields?.Stock || 0}</span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(80vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current text-destructive" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay movimientos registrados para este producto
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((movimiento) => (
                  <TableRow key={movimiento.id}>
                    <TableCell className="text-sm">
                      {formatearFecha(movimiento.fields?.CreatedAt || movimiento.CreatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(movimiento.fields?.Tipo)}
                        <Badge variant={getTipoBadgeVariant(movimiento.fields?.Tipo)}>
                          {movimiento.fields?.Tipo}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {movimiento.fields?.Motivo || '-'}
                    </TableCell>
                    <TableCell className={`text-right ${getCantidadColor(movimiento.fields?.Cantidad)}`}>
                      {movimiento.fields?.Cantidad > 0 ? '+' : ''}{movimiento.fields?.Cantidad || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {movimiento.fields?.Detalle || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
