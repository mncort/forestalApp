'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente de paginación reutilizable para tablas
 *
 * @param {Object} props
 * @param {number} props.inicio - Índice inicial de los items mostrados
 * @param {number} props.fin - Índice final de los items mostrados
 * @param {number} props.totalItems - Total de items
 * @param {number} props.itemsPorPagina - Items por página actual
 * @param {number} props.paginaActual - Página actual
 * @param {number} props.totalPaginas - Total de páginas
 * @param {boolean} props.hayPaginaAnterior - Si hay página anterior
 * @param {boolean} props.hayPaginaSiguiente - Si hay página siguiente
 * @param {Function} props.irAPrimeraPagina - Ir a primera página
 * @param {Function} props.irAUltimaPagina - Ir a última página
 * @param {Function} props.irAPaginaAnterior - Ir a página anterior
 * @param {Function} props.irAPaginaSiguiente - Ir a página siguiente
 * @param {Function} props.cambiarItemsPorPagina - Cambiar items por página
 * @param {Array<number>} props.opcionesItemsPorPagina - Opciones de items por página (default: [10, 25, 50, 100])
 */
export default function TablePagination({
  inicio,
  fin,
  totalItems,
  itemsPorPagina,
  paginaActual,
  totalPaginas,
  hayPaginaAnterior,
  hayPaginaSiguiente,
  irAPrimeraPagina,
  irAUltimaPagina,
  irAPaginaAnterior,
  irAPaginaSiguiente,
  cambiarItemsPorPagina,
  opcionesItemsPorPagina = [10, 25, 50, 100]
}) {
  if (totalItems === 0) return null;

  return (
    <div className="p-4 bg-muted/30 border-t border-border/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Info y selector de cantidad */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {inicio + 1} - {Math.min(fin, totalItems)} de {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Por página:</label>
            <Select
              value={itemsPorPagina.toString()}
              onValueChange={(value) => cambiarItemsPorPagina(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcionesItemsPorPagina.map(opcion => (
                  <SelectItem key={opcion} value={opcion.toString()}>
                    {opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={irAPrimeraPagina}
            disabled={!hayPaginaAnterior}
            aria-label="Primera página"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={irAPaginaAnterior}
            disabled={!hayPaginaAnterior}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-3 py-1 text-sm font-medium">
            Página {paginaActual} de {totalPaginas}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={irAPaginaSiguiente}
            disabled={!hayPaginaSiguiente}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={irAUltimaPagina}
            disabled={!hayPaginaSiguiente}
            aria-label="Última página"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
