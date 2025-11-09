'use client'
import { useState, useRef, useEffect } from 'react';
import { Plus, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useProductSearch } from '../hooks/useProductSearch';
import { useCatalog } from '@/context/CatalogContext';
import { calcularPrecioProducto } from '@/lib/calculations/presupuestos';
import toast from 'react-hot-toast';

/**
 * Modal para buscar y agregar productos al presupuesto
 * Con input + dropdown desplegable estilo autocomplete
 */
export default function ProductSearchModal({ show, onClose, onAddProduct }) {
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { categorias, subcategorias, costos } = useCatalog();

  const {
    searchTerm,
    setSearchTerm,
    productos,
    loadingProductos,
    totalProductos
  } = useProductSearch(show);

  // Cerrar dropdown cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setShowDropdown(false);
    }
  }, [show]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      // No cerrar si el click es dentro del input o del dropdown
      if (inputRef.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;

      // Cerrar el dropdown
      setShowDropdown(false);
    };

    // Pequeño delay para evitar cerrar inmediatamente al abrir
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto.id);
    setSearchTerm(producto.fields.Nombre || '');
    setShowDropdown(false);
  };

  const handleAgregar = () => {
    if (!selectedProducto || cantidad <= 0) {
      toast.error('Selecciona un producto y una cantidad válida');
      return;
    }

    const productoId = typeof selectedProducto === 'string' ? parseInt(selectedProducto) : selectedProducto;
    const producto = productos.find(p => p.id == productoId);

    if (!producto) {
      toast.error('Producto no encontrado');
      return;
    }

    const success = onAddProduct(producto, cantidad, productos);

    if (success) {
      // Limpiar y cerrar
      setSelectedProducto('');
      setCantidad(1);
      setSearchTerm('');
      setShowDropdown(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedProducto('');
    setCantidad(1);
    setSearchTerm('');
    setShowDropdown(false);
    onClose();
  };

  // Calcular info del producto seleccionado
  const productoSeleccionado = selectedProducto
    ? productos.find(p => p.id == selectedProducto)
    : null;

  const precioInfo = productoSeleccionado
    ? (() => {
        const subcategoria = subcategorias.find(s => s.id == productoSeleccionado.fields?.Subcategoria?.id);
        const categoria = subcategoria ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id) : null;
        return calcularPrecioProducto(productoSeleccionado, subcategoria, categoria, costos);
      })()
    : null;

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={24} />
            Agregar Producto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input de búsqueda con dropdown */}
          <div className="space-y-2">
            <Label htmlFor="product-search">
              Buscar producto
              <span className="ml-2 text-xs text-muted-foreground">
                {loadingProductos ? (
                  <Loader2 className="inline-block h-3 w-3 animate-spin" />
                ) : (
                  `(${totalProductos} ${searchTerm ? 'encontrados' : 'disponibles'})`
                )}
              </span>
            </Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="product-search"
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (productos.length > 0 && !showDropdown) {
                    setShowDropdown(true);
                  }
                  setSelectedProducto(''); // Limpiar selección al cambiar búsqueda
                }}
                onFocus={() => {
                  // Mostrar dropdown si hay productos disponibles
                  if (productos.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onClick={() => {
                  // También mostrar al hacer click
                  if (productos.length > 0) {
                    setShowDropdown(true);
                  }
                }}
              />

              {/* Dropdown de productos */}
              {showDropdown && productos.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50"
                >
                  {productos.map(prod => {
                    const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria?.id);
                    const categoria = subcategoria ? categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id) : null;
                    const precioCalc = calcularPrecioProducto(prod, subcategoria, categoria, costos);

                    return (
                      <Button
                        key={prod.id}
                        variant="ghost"
                        onClick={() => handleSelectProducto(prod)}
                        className="w-full justify-between h-auto px-3 py-2 text-sm border-b border-border last:border-b-0 rounded-none"
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{prod.fields.SKU} - {prod.fields.Nombre}</div>
                          {prod.fields.Descripcion && (
                            <div className="text-xs text-muted-foreground mt-0.5">{prod.fields.Descripcion}</div>
                          )}
                        </div>
                        <div className="ml-2 text-right shrink-0">
                          {precioCalc.tieneCosto ? (
                            <span className="text-xs font-semibold text-green-600">
                              ${precioCalc.precioVenta.toFixed(2)} {precioCalc.moneda}
                            </span>
                          ) : (
                            <Badge variant="secondary">Sin costo</Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Campo de cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Información del producto seleccionado */}
          {productoSeleccionado && (
            <div className={`border rounded-lg p-4 ${precioInfo?.tieneCosto ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex flex-col gap-1 text-sm w-full">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-semibold block">
                      {productoSeleccionado.fields.Nombre}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      SKU: {productoSeleccionado.fields.SKU}
                    </span>
                    {productoSeleccionado.fields.Descripcion && (
                      <span className="text-xs text-muted-foreground block mt-1">
                        {productoSeleccionado.fields.Descripcion}
                      </span>
                    )}
                  </div>
                  {precioInfo && (
                    <div className="text-right ml-4">
                      {precioInfo.tieneCosto ? (
                        <>
                          <div className="font-bold text-lg">
                            ${precioInfo.precioVenta.toFixed(2)} {precioInfo.moneda}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Markup: {precioInfo.markup}%
                          </div>
                        </>
                      ) : (
                        <div className="text-xs font-semibold">
                          Este producto no tiene un costo asignado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleAgregar} disabled={!selectedProducto || cantidad <= 0} className="gap-2">
            <Plus size={18} />
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
