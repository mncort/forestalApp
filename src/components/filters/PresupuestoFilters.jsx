import { Search, X, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';

/**
 * Componente de filtros para el listado de presupuestos
 * @param {Object} props
 * @param {Object} props.filters - Estado actual de los filtros
 * @param {string} props.searchInput - Valor temporal del input de búsqueda
 * @param {Function} props.onFilterChange - Función para actualizar un filtro específico
 * @param {Function} props.onClearFilters - Función para limpiar todos los filtros
 * @param {boolean} props.hasActiveFilters - Indica si hay filtros activos
 */
export default function PresupuestoFilters({
  filters,
  searchInput,
  onFilterChange,
  onClearFilters,
  hasActiveFilters
}) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Búsqueda por Cliente o CUIT */}
          <div className="flex-1 min-w-[250px]">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <Search className="w-3 h-3" />
              Cliente o CUIT
            </Label>
            <Input
              type="text"
              placeholder="Buscar por nombre o CUIT..."
              className="h-9"
              value={searchInput || ''}
              onChange={(e) => onFilterChange('searchText', e.target.value)}
            />
          </div>

          {/* Filtro por Tipo de Pago */}
          <div className="w-40">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <CreditCard className="w-3 h-3" />
              Tipo de Pago
            </Label>
            <Select
              value={filters.tipoPago}
              onValueChange={(value) => onFilterChange('tipoPago', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Fecha Desde */}
          <div className="w-44">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <Calendar className="w-3 h-3" />
              Fecha Desde
            </Label>
            <DatePicker
              date={filters.fechaDesde ? parseISO(filters.fechaDesde) : undefined}
              onDateChange={(date) => onFilterChange('fechaDesde', date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="Desde..."
              className="h-9"
            />
          </div>

          {/* Filtro por Fecha Hasta */}
          <div className="w-44">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <Calendar className="w-3 h-3" />
              Fecha Hasta
            </Label>
            <DatePicker
              date={filters.fechaHasta ? parseISO(filters.fechaHasta) : undefined}
              onDateChange={(date) => onFilterChange('fechaHasta', date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="Hasta..."
              className="h-9"
            />
          </div>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-1 h-9"
              >
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            </div>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-2 text-xs text-muted-foreground">
            Filtros activos - Mostrando resultados filtrados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
