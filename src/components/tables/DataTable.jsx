'use client'
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

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
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              key={column.key || index}
              className={column.headerClassName || ''}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="text-center py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            // Si se proporciona renderRow personalizado, usarlo
            if (renderRow) {
              return (
                <TableRow key={getRowKey(item)}>
                  {renderRow(item)}
                </TableRow>
              );
            }

            // Si no, renderizar usando columns
            return (
              <TableRow key={getRowKey(item)}>
                {columns.map((column, index) => (
                  <TableCell
                    key={column.key || index}
                    className={column.className || ''}
                  >
                    {column.render
                      ? column.render(item)
                      : item.fields?.[column.key] || item[column.key] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
