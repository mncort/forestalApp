'use client'
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { getCostoActual, getCostosArchivados } from '@/services/index';
import { formatDate } from '@/lib/utils/formatting';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HistoryModal({ show, product, costos, onClose }) {
  const [costosHistoricos, setCostosHistoricos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar costos históricos cuando se abre el modal
  useEffect(() => {
    if (!show || !product) return;

    const cargarHistoricos = async () => {
      setLoading(true);
      try {
        const historicos = await getCostosArchivados(product.id);
        setCostosHistoricos(historicos);
      } catch (error) {
        console.error('Error cargando históricos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarHistoricos();
  }, [show, product]);

  if (!show || !product) return null;

  // Obtener todos los costos del producto (NO filtrar por valor)
  const costosProd = costos.filter(
    c => c.fields.Productos.id === product.id
  );

  // Combinar costos actuales con históricos archivados
  const todosLosCostos = [...costosProd, ...costosHistoricos];

  // Obtener fecha actual
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  // Obtener el costo actual
  const costoActual = getCostoActual(costos, product.id);

  // Separar en anteriores (ya pasaron) y próximos (empiezan en el futuro)
  const costosAnteriores = todosLosCostos.filter(c => {
    if (c.id === costoActual?.id) return false; // Excluir el actual

    const fechaDesde = c.fields.FechaDesde;
    const fechaHasta = c.fields.FechaHasta;

    // Es anterior si:
    // 1. Tiene fecha_hasta y ya pasó (fechaHasta < hoy), O
    // 2. No ha empezado aún pero tampoco es futuro (esto captura históricos)
    if (fechaHasta && fechaHasta < fechaHoy) {
      return true; // Ya terminó
    }

    // También es anterior si no es vigente ni próximo
    const esProximo = fechaDesde && fechaDesde > fechaHoy;
    const esVigente = fechaDesde && fechaDesde <= fechaHoy && (!fechaHasta || fechaHasta >= fechaHoy);

    return !esProximo && !esVigente;
  });

  const costosProximos = costosProd.filter(c => {
    if (c.id === costoActual?.id) return false; // Excluir el actual
    const fechaDesde = c.fields.FechaDesde;
    return fechaDesde && fechaDesde > fechaHoy; // Empiezan en el futuro
  });

  // Ordenar anteriores: más reciente primero
  costosAnteriores.sort((a, b) =>
    (b.fields.FechaDesde || '').localeCompare(a.fields.FechaDesde || '')
  );

  // Ordenar próximos: más cercano primero
  costosProximos.sort((a, b) =>
    (a.fields.FechaDesde || '').localeCompare(b.fields.FechaDesde || '')
  );

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Histórico de Costos</DialogTitle>
          <DialogDescription>
            {product.fields.Nombre} (SKU: {product.fields.SKU})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="space-y-3 pr-4">
            {/* Costos Próximos */}
            {costosProximos.length > 0 && (
              <>
                {costosProximos.map((item) => (
                  <Card key={item.id} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="secondary">Próximo</Badge>
                          <p className="text-xl font-bold mt-2">
                            ${parseFloat(item.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.fields.Moneda}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p>Desde: {formatDate(item.fields.FechaDesde)}</p>
                          <p>Hasta: {item.fields.FechaHasta ? formatDate(item.fields.FechaHasta) : '∞'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Costo Actual */}
            {costoActual && (
              <>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge>Costo Actual</Badge>
                        <p className="text-2xl font-bold mt-2">
                          ${parseFloat(costoActual.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {costoActual.fields.Moneda}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Desde: {formatDate(costoActual.fields.FechaDesde)}</p>
                        <p>Hasta: {costoActual.fields.FechaHasta ? formatDate(costoActual.fields.FechaHasta) : '∞'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Costos Anteriores */}
            {costosAnteriores.length > 0 && (
              <>
                <div className="py-2 px-2 font-semibold text-sm text-muted-foreground border-t border-b">
                  Anteriores
                </div>
                {costosAnteriores.map((item) => (
                  <Card key={item.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline">Anterior</Badge>
                          <p className="text-xl font-bold mt-2">
                            ${parseFloat(item.fields.Costo).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {item.fields.Moneda}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Desde: {formatDate(item.fields.FechaDesde)}</p>
                          <p>Hasta: {item.fields.FechaHasta ? formatDate(item.fields.FechaHasta) : '∞'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {costosProd.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History size={48} className="mx-auto mb-3 opacity-50" />
                <p>No hay costos registrados</p>
              </div>
            )}

            {costosProd.length > 0 && !costoActual && costosAnteriores.length === 0 && costosProximos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Solo hay costos vigentes</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}