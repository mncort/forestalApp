'use client'
import React from 'react';

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
    <div className="p-4 bg-base-200 border-t border-base-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Info y selector de cantidad */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-base-content/70">
            Mostrando {inicio + 1} - {Math.min(fin, totalItems)} de {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-base-content/70">Por página:</label>
            <select
              value={itemsPorPagina}
              onChange={(e) => cambiarItemsPorPagina(parseInt(e.target.value))}
              className="select select-bordered select-sm"
            >
              {opcionesItemsPorPagina.map(opcion => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="join">
          <button
            onClick={irAPrimeraPagina}
            disabled={!hayPaginaAnterior}
            className="join-item btn btn-sm"
            aria-label="Primera página"
          >
            ««
          </button>
          <button
            onClick={irAPaginaAnterior}
            disabled={!hayPaginaAnterior}
            className="join-item btn btn-sm"
            aria-label="Página anterior"
          >
            «
          </button>
          <button className="join-item btn btn-sm no-animation">
            Página {paginaActual} de {totalPaginas}
          </button>
          <button
            onClick={irAPaginaSiguiente}
            disabled={!hayPaginaSiguiente}
            className="join-item btn btn-sm"
            aria-label="Página siguiente"
          >
            »
          </button>
          <button
            onClick={irAUltimaPagina}
            disabled={!hayPaginaSiguiente}
            className="join-item btn btn-sm"
            aria-label="Última página"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  );
}
