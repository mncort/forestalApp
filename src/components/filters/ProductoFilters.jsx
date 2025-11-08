import { Search, X, Tag, Layers } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Componente de filtros para el listado de productos
 * @param {Object} props
 * @param {Object} props.filters - Estado actual de los filtros
 * @param {string} props.searchInput - Valor temporal del input de búsqueda
 * @param {Function} props.onFilterChange - Función para actualizar un filtro específico
 * @param {Function} props.onToggleCategoria - Función para toggle de categoría
 * @param {Function} props.onToggleSubcategoria - Función para toggle de subcategoría
 * @param {Function} props.onClearFilters - Función para limpiar todos los filtros
 * @param {boolean} props.hasActiveFilters - Indica si hay filtros activos
 * @param {Array} props.categorias - Array de todas las categorías disponibles
 * @param {Array} props.subcategorias - Array de todas las subcategorías disponibles
 */
export default function ProductoFilters({
  filters,
  searchInput,
  onFilterChange,
  onToggleCategoria,
  onToggleSubcategoria,
  onClearFilters,
  hasActiveFilters,
  categorias = [],
  subcategorias = []
}) {
  // Filtrar subcategorías según las categorías seleccionadas
  const subcategoriasDisponibles = useMemo(() => {
    if (filters.categorias.length === 0) {
      return subcategorias;
    }
    return subcategorias.filter(sub =>
      filters.categorias.includes(sub.fields.nc_1g29__Categorias_id)
    );
  }, [filters.categorias, subcategorias]);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-start">
          {/* Búsqueda por Producto o SKU */}
          <div className="flex-1 min-w-[250px]">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <Search className="w-3 h-3" />
              Producto o SKU
            </Label>
            <Input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              className="h-9"
              value={searchInput || ''}
              onChange={(e) => onFilterChange('searchText', e.target.value)}
            />
          </div>

          {/* Selector múltiple de Categorías */}
          <div className="w-64">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <Tag className="w-3 h-3" />
              Categorías
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-start text-left font-normal"
                >
                  <span className="truncate">
                    {filters.categorias.length === 0
                      ? 'Todas las categorías'
                      : `${filters.categorias.length} seleccionada${filters.categorias.length !== 1 ? 's' : ''}`
                    }
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {categorias.map(categoria => (
                    <label
                      key={categoria.id}
                      className="flex items-center gap-2 py-2 px-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.categorias.includes(categoria.id)}
                        onCheckedChange={() => onToggleCategoria(categoria.id)}
                      />
                      <span className="text-sm">{categoria.fields.Categoria}</span>
                    </label>
                  ))}
                  {categorias.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      No hay categorías disponibles
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selector múltiple de Subcategorías */}
          <div className="w-64">
            <Label className="text-xs font-medium flex items-center gap-1 mb-1.5">
              <Layers className="w-3 h-3" />
              Subcategorías
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-start text-left font-normal"
                >
                  <span className="truncate">
                    {filters.subcategorias.length === 0
                      ? 'Todas las subcategorías'
                      : `${filters.subcategorias.length} seleccionada${filters.subcategorias.length !== 1 ? 's' : ''}`
                    }
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {subcategoriasDisponibles.map(subcategoria => (
                    <label
                      key={subcategoria.id}
                      className="flex items-center gap-2 py-2 px-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.subcategorias.includes(subcategoria.id)}
                        onCheckedChange={() => onToggleSubcategoria(subcategoria.id)}
                      />
                      <span className="text-sm">{subcategoria.fields.Subcategoria}</span>
                    </label>
                  ))}
                  {subcategoriasDisponibles.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      {filters.categorias.length > 0
                        ? 'No hay subcategorías para las categorías seleccionadas'
                        : 'No hay subcategorías disponibles'
                      }
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <div className="self-end">
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

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {filters.categorias.map(catId => {
              const categoria = categorias.find(c => c.id === catId);
              return categoria ? (
                <Badge key={catId} variant="default" className="gap-1">
                  {categoria.fields.Categoria}
                  <button
                    onClick={() => onToggleCategoria(catId)}
                    className="ml-1 hover:bg-primary-foreground/20 rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              ) : null;
            })}
            {filters.subcategorias.map(subId => {
              const subcategoria = subcategorias.find(s => s.id === subId);
              return subcategoria ? (
                <Badge key={subId} variant="secondary" className="gap-1">
                  {subcategoria.fields.Subcategoria}
                  <button
                    onClick={() => onToggleSubcategoria(subId)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                  >
                    ×
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}

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
