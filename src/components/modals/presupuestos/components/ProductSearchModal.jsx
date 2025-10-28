'use client'
import { useState, useRef, useEffect } from 'react';
import { Plus, Package, X } from 'lucide-react';
import { useProductSearch } from '../hooks/useProductSearch';
import { useCatalog } from '@/context/CatalogContext';
import { calcularPrecioProducto } from '@/lib/calculations/presupuestos';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

/**
 * Modal para buscar y agregar productos al presupuesto
 * Con input + dropdown desplegable estilo autocomplete
 */
export default function ProductSearchModal({ show, onClose, onAddProduct }) {
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef(null);
  const { categorias, subcategorias, costos } = useCatalog();

  const {
    searchTerm,
    setSearchTerm,
    productos,
    loadingProductos,
    totalProductos
  } = useProductSearch(show);

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (showDropdown && inputRef.current && typeof window !== 'undefined') {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showDropdown, searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        const dropdown = document.getElementById('producto-dropdown');
        if (dropdown && !dropdown.contains(e.target)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package size={24} />
            Agregar Producto
          </h3>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Input de búsqueda con dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Buscar producto
                {searchTerm && (
                  <span className="ml-2 text-xs text-base-content/60">
                    {loadingProductos ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      `(${totalProductos} encontrados)`
                    )}
                  </span>
                )}
              </span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por nombre o SKU..."
                className="input input-bordered w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  setSelectedProducto(''); // Limpiar selección al cambiar búsqueda
                }}
                onFocus={() => {
                  if (searchTerm && productos.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                autoFocus
              />

              {/* Dropdown de productos con createPortal */}
              {showDropdown && productos.length > 0 && typeof window !== 'undefined' && dropdownPosition.width > 0 && createPortal(
                <div
                  id="producto-dropdown"
                  className="bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-auto"
                  style={{
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                    zIndex: 9999
                  }}
                >
                  {productos.map(prod => {
                    const subcategoria = subcategorias.find(s => s.id === prod.fields.Subcategoria?.id);
                    const categoria = subcategoria ? categorias.find(c => c.id === subcategoria.fields.nc_1g29__Categorias_id) : null;
                    const precioCalc = calcularPrecioProducto(prod, subcategoria, categoria, costos);

                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProducto(prod)}
                        className="w-full text-left px-3 py-2 hover:bg-base-200 flex justify-between items-center text-sm border-b border-base-300 last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{prod.fields.SKU} - {prod.fields.Nombre}</div>
                          {prod.fields.Descripcion && (
                            <div className="text-xs text-base-content/60 mt-0.5">{prod.fields.Descripcion}</div>
                          )}
                        </div>
                        <div className="ml-2 text-right">
                          {precioCalc.tieneCosto ? (
                            <span className="text-xs font-semibold text-success">
                              ${precioCalc.precioVenta.toFixed(2)} {precioCalc.moneda}
                            </span>
                          ) : (
                            <span className="badge badge-warning badge-xs">Sin costo</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>,
                document.body
              )}
            </div>
          </div>

          {/* Campo de cantidad */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Cantidad</span>
            </label>
            <input
              type="number"
              min="1"
              className="input input-bordered w-full"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Información del producto seleccionado */}
          {productoSeleccionado && (
            <div className={`alert ${precioInfo?.tieneCosto ? 'alert-info' : 'alert-warning'}`}>
              <div className="flex flex-col gap-1 text-sm w-full">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-semibold block">
                      {productoSeleccionado.fields.Nombre}
                    </span>
                    <span className="text-xs opacity-80">
                      SKU: {productoSeleccionado.fields.SKU}
                    </span>
                    {productoSeleccionado.fields.Descripcion && (
                      <span className="text-xs opacity-80 block mt-1">
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
                          <div className="text-xs opacity-70">
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

        <div className="modal-action">
          <button
            onClick={handleClose}
            className="btn btn-ghost"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="btn btn-primary gap-2"
            disabled={!selectedProducto || cantidad <= 0}
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
