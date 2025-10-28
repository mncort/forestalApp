'use client'
import React from 'react';

/**
 * Componente genérico de tabla con estados de carga y vacío
 *
 * @param {Object} props
 * @param {Array} props.columns - Array de objetos de columna: [{ key, header, render?, className? }]
 * @param {Array} props.data - Array de datos a mostrar
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos (default: "No hay datos disponibles")
 * @param {Function} props.renderRow - Función para renderizar fila completa (opcional, sobrescribe columns)
 * @param {Function} props.getRowKey - Función para obtener key de la fila (default: (item) => item.id)
 * @param {string} props.className - Clases CSS adicionales para la tabla
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  renderRow,
  getRowKey = (item) => item.id,
  className = ''
}) {
  const colSpan = columns.length;

  return (
    <div className="overflow-x-auto">
      <table className={`table table-zebra ${className}`}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={column.headerClassName || ''}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="text-center py-8">
                <span className="loading loading-spinner loading-md text-primary"></span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="text-center py-8 text-base-content/60">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              // Si se proporciona renderRow personalizado, usarlo
              if (renderRow) {
                return (
                  <tr key={getRowKey(item)} className="hover">
                    {renderRow(item)}
                  </tr>
                );
              }

              // Si no, renderizar usando columns
              return (
                <tr key={getRowKey(item)} className="hover">
                  {columns.map((column, index) => (
                    <td
                      key={column.key || index}
                      className={column.className || ''}
                    >
                      {column.render
                        ? column.render(item)
                        : item.fields?.[column.key] || item[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
