'use client'
import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Package, Info, Save, X, Printer } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  actualizarPresupuesto,
  calcularPrecioProducto,
  getProductos,
  countProductos
} from '@/lib/api/index';
import { generarPresupuestoPDF } from '@/lib/pdf/generarPresupuestoPDF';
import { useCatalog } from '@/context/CatalogContext';

export default function PresupuestoItemsModal({ show, presupuesto, onClose, onSaved }) {
  // Usar el contexto del catálogo
  const { categorias, subcategorias, costos, loading: loadingCatalog } = useCatalog();

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Estados para productos (estos sí cambian con la búsqueda)
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [totalProductos, setTotalProductos] = useState(0);
  const [tipoFactura, setTipoFactura] = useState(presupuesto?.fields?.TipoFactura || 'con_factura');

  // Estados para tracking de cambios y modal de agregar producto
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({
    tipoFactura: null,
    itemsToAdd: [],
    itemsToUpdate: [],
    itemsToDelete: []
  });

  // Refs y estado para posicionamiento del dropdown
  const inputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (show && presupuesto) {
      // Cargar items del presupuesto
      cargarItems();
      // NO cargamos productos aquí - solo cuando se abre el modal de agregar
      setTipoFactura(presupuesto?.fields?.TipoFactura || 'con_factura');
      // Reset pending changes when opening modal
      setPendingChanges({
        tipoFactura: null,
        itemsToAdd: [],
        itemsToUpdate: [],
        itemsToDelete: []
      });
      setHasUnsavedChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, presupuesto]);

  // Detectar cambio en tipo de factura
  useEffect(() => {
    if (presupuesto && tipoFactura !== presupuesto?.fields?.TipoFactura) {
      setPendingChanges(prev => ({ ...prev, tipoFactura }));
      setHasUnsavedChanges(true);
    }
  }, [tipoFactura, presupuesto]);

  // Cargar productos iniciales cuando se abre el modal de agregar
  useEffect(() => {
    if (showAddProductModal) {
      buscarProductos(''); // Cargar productos iniciales
    }
  }, [showAddProductModal]);

  // Buscar productos cuando cambia el término de búsqueda (con debounce)
  // SOLO cuando el modal de agregar está abierto
  useEffect(() => {
    if (!show || !showAddProductModal) return;

    const timeoutId = setTimeout(() => {
      buscarProductos(searchTerm);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [searchTerm, show, showAddProductModal]);

  // Actualizar posición del dropdown cuando se abre
  useEffect(() => {
    const updatePosition = () => {
      if (showDropdown && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updatePosition();

    if (showDropdown) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showDropdown]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && inputRef.current && !inputRef.current.contains(event.target)) {
        // Verificar si el clic fue en el dropdown
        const dropdown = document.getElementById('producto-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const buscarProductos = async (termino) => {
    setLoadingProductos(true);
    try {
      let opciones = { limit: 25 };

      if (termino && termino.trim() !== '') {
        // Buscar por nombre o SKU usando filtro de NocoDB
        // El formato de NocoDB para OR es: (Nombre,like,%termino%)~or(SKU,like,%termino%)
        const terminoBusqueda = termino.trim();
        opciones.where = `(Nombre,like,%${terminoBusqueda}%)~or(SKU,like,%${terminoBusqueda}%)`;
      }

      // Obtener productos y count en paralelo
      const [prods, count] = await Promise.all([
        getProductos(opciones),
        countProductos(opciones.where ? { where: opciones.where } : {})
      ]);

      setProductos(prods);
      setTotalProductos(count);
    } catch (error) {
      console.error('Error buscando productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  };

  const cargarItems = async () => {
    if (!presupuesto) return;

    setLoadingItems(true);
    try {
      const itemsData = await getItemsByPresupuesto(presupuesto.id);
      setItems(itemsData);
    } catch (error) {
      console.error('Error cargando items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAgregarProducto = () => {
    if (!selectedProducto || cantidad <= 0) return;

    // Convertir a número por si acaso viene como string
    const productoId = typeof selectedProducto === 'string' ? parseInt(selectedProducto) : selectedProducto;
    const producto = productos.find(p => p.id == productoId);

    if (!producto) {
      console.error('Producto no encontrado:', { selectedProducto, productoId, todosLosProductos: productos.map(p => p.id) });
      alert('Error: No se encontró el producto seleccionado.');
      return;
    }

    const subcategoria = subcategorias.find(s => s.id == producto.fields?.Subcategoria?.id);
    const categoria = subcategoria ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id) : null;

    // Calcular precio con markup
    const precioCalc = calcularPrecioProducto(producto, subcategoria, categoria, costos);

    if (!precioCalc.tieneCosto) {
      alert('Este producto no tiene un costo asignado. Por favor, asigna un costo antes de agregarlo al presupuesto.');
      return;
    }

    // Agregar a items locales con ID temporal
    // Importante: incluir nc_1g29__Productos_id con los datos del producto para que coincida
    // con el formato del nested query que trae getItemsByPresupuesto
    const nuevoItem = {
      id: `temp-${Date.now()}`,
      isNew: true,
      fields: {
        nc_1g29___Presupuestos_id: presupuesto.id,
        nc_1g29__Productos_id: {
          id: producto.id,
          Nombre: producto.fields.Nombre,
          SKU: producto.fields.SKU,
          Descripcion: producto.fields.Descripcion,
          Subcategoria: producto.fields.Subcategoria,
          Markup: producto.fields.Markup
        },
        Cantidad: cantidad,
        PrecioUnitario: precioCalc.precioVenta,
        Markup: precioCalc.markup,
        Moneda: precioCalc.moneda
      }
    };

    setItems(prev => [...prev, nuevoItem]);
    setPendingChanges(prev => ({
      ...prev,
      itemsToAdd: [...prev.itemsToAdd, nuevoItem]
    }));
    setHasUnsavedChanges(true);

    // Limpiar formulario y cerrar modal
    setSelectedProducto('');
    setCantidad(1);
    setSearchTerm('');
    setShowAddProductModal(false);
  };

  const handleEliminarItem = (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;

    const item = items.find(i => i.id === itemId);

    // Si es un item nuevo (temporal), solo lo removemos de los items locales
    if (item?.isNew) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      setPendingChanges(prev => ({
        ...prev,
        itemsToAdd: prev.itemsToAdd.filter(i => i.id !== itemId)
      }));
    } else {
      // Si es un item existente, lo marcamos para eliminar
      setItems(prev => prev.filter(i => i.id !== itemId));
      setPendingChanges(prev => ({
        ...prev,
        itemsToDelete: [...prev.itemsToDelete, itemId]
      }));
    }

    setHasUnsavedChanges(true);
  };

  const handleCantidadChange = (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;

    // Actualizar items locales
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          fields: {
            ...item.fields,
            Cantidad: nuevaCantidad
          }
        };
      }
      return item;
    }));

    // Agregar a cambios pendientes solo si no es un item nuevo
    const item = items.find(i => i.id === itemId);
    if (!item?.isNew) {
      setPendingChanges(prev => {
        const existingUpdate = prev.itemsToUpdate.find(i => i.id === itemId);
        if (existingUpdate) {
          return {
            ...prev,
            itemsToUpdate: prev.itemsToUpdate.map(i =>
              i.id === itemId ? { ...i, Cantidad: nuevaCantidad } : i
            )
          };
        } else {
          return {
            ...prev,
            itemsToUpdate: [...prev.itemsToUpdate, { id: itemId, Cantidad: nuevaCantidad }]
          };
        }
      });
    } else {
      // Si es nuevo, actualizar en itemsToAdd
      setPendingChanges(prev => ({
        ...prev,
        itemsToAdd: prev.itemsToAdd.map(i =>
          i.id === itemId ? {
            ...i,
            fields: { ...i.fields, Cantidad: nuevaCantidad }
          } : i
        )
      }));
    }

    setHasUnsavedChanges(true);
  };

  // Guardar todos los cambios pendientes
  const handleGuardarCambios = async () => {
    setSaving(true);
    try {
      // 1. Actualizar tipo de factura si cambió
      if (pendingChanges.tipoFactura !== null) {
        await actualizarPresupuesto(presupuesto.id, { TipoFactura: pendingChanges.tipoFactura });
      }

      // 2. Eliminar items marcados para eliminar
      for (const itemId of pendingChanges.itemsToDelete) {
        await eliminarPresupuestoItem(itemId);
      }

      // 3. Actualizar items modificados
      for (const update of pendingChanges.itemsToUpdate) {
        await actualizarPresupuestoItem(update.id, { Cantidad: update.Cantidad });
      }

      // 4. Crear items nuevos
      for (const item of pendingChanges.itemsToAdd) {
        await crearPresupuestoItem({
          nc_1g29___Presupuestos_id: item.fields.nc_1g29___Presupuestos_id,
          nc_1g29__Productos_id: item.fields.nc_1g29__Productos_id.id, // Solo enviar el ID
          Cantidad: item.fields.Cantidad,
          PrecioUnitario: item.fields.PrecioUnitario,
          Markup: item.fields.Markup,
          Moneda: item.fields.Moneda
        });
      }

      // Recargar items y resetear estado
      await cargarItems();
      setPendingChanges({
        tipoFactura: null,
        itemsToAdd: [],
        itemsToUpdate: [],
        itemsToDelete: []
      });
      setHasUnsavedChanges(false);
      onSaved();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // Calcular precios de items para mostrar (con useMemo para optimizar)
  const itemsConPrecios = useMemo(() => {
    return items.map(item => {
      // El producto viene SIEMPRE del nested query que trae getItemsByPresupuesto
      const productoNested = item.fields.nc_1g29__Productos_id;

      const precioUnitario = parseFloat(item.fields.PrecioUnitario) || 0;
      const cantidad = parseFloat(item.fields.Cantidad) || 0;
      const subtotal = precioUnitario * cantidad;

      return {
        ...item,
        productoNested, // Los datos completos del producto vienen del nested
        precioUnitario,
        cantidad,
        subtotal
      };
    });
  }, [items]); // Ya no dependemos del array productos

  // Calcular totales del presupuesto (con useMemo para optimizar)
  const totales = useMemo(() => {
    const subtotal = itemsConPrecios.reduce((sum, item) => sum + item.subtotal, 0);
    const moneda = itemsConPrecios.length > 0 ? itemsConPrecios[0].fields?.Moneda : 'ARS';
    const porcentajeImpuesto = tipoFactura === 'con_factura' ? 21 : 10.5;
    const impuesto = subtotal * (porcentajeImpuesto / 100);
    const total = subtotal + impuesto;

    return { subtotal, moneda, porcentajeImpuesto, impuesto, total };
  }, [itemsConPrecios, tipoFactura]);

  const { subtotal, moneda, porcentajeImpuesto, impuesto, total } = totales;

  // Generar PDF del presupuesto
  const handleGenerarPDF = () => {
    try {
      const { url } = generarPresupuestoPDF(presupuesto, itemsConPrecios, tipoFactura);
      setPdfUrl(url);
      setShowPDFModal(true);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(error.message);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-5xl max-h-[90vh]">
          {/* Menú horizontal con iconos */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-base-300">
            <div>
              <h3 className="font-bold text-lg">Items del Presupuesto #{String(presupuesto?.id || '').substring(0, 8)}</h3>
              <p className="text-sm text-base-content/70">Cliente: {presupuesto?.fields.Cliente}</p>
            </div>

            {/* Menú de acciones */}
            <div className="flex items-center gap-1">
              <div className="tooltip tooltip-bottom" data-tip="Agregar Producto">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={saving}
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="tooltip tooltip-bottom" data-tip={hasUnsavedChanges ? "Guardar Cambios" : "No hay cambios"}>
                <button
                  onClick={handleGuardarCambios}
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={!hasUnsavedChanges || saving}
                >
                  <Save size={20} className={hasUnsavedChanges ? 'text-primary' : ''} />
                </button>
              </div>

              <div className="tooltip tooltip-bottom" data-tip="Imprimir Presupuesto">
                <button
                  onClick={handleGenerarPDF}
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={saving || itemsConPrecios.length === 0}
                >
                  <Printer size={20} />
                </button>
              </div>

              <div className="tooltip tooltip-bottom" data-tip="Cerrar">
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Tipo de Factura */}
          <div className="mb-4">
            <fieldset className="fieldset mb-0">
              <legend className="label-legend">Tipo de Factura</legend>
              <select
                value={tipoFactura}
                onChange={(e) => setTipoFactura(e.target.value)}
                className="select select-bordered select-sm"
                disabled={saving}
              >
                <option value="con_factura">Con Factura (21% IVA)</option>
                <option value="sin_factura">Sin Factura (10.5% IVA)</option>
              </select>
            </fieldset>
          </div>

          {loadingCatalog || loadingItems ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lista de items */}
              <div className="card bg-base-100 border border-base-300">
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th className="text-left">Producto</th>
                        <th className="text-center" style={{width: '60px'}}>Cantidad</th>
                        <th className="text-right">Precio Unit.</th>
                        <th className="text-right">Subtotal</th>
                        <th className="text-center" style={{width: '60px'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsConPrecios.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-base-content/60">
                            No hay productos agregados al presupuesto
                          </td>
                        </tr>
                      ) : (
                        itemsConPrecios.map(item => (
                          <tr key={item.id} className="hover">
                            <td>
                              <div className="flex items-center gap-2">
                                <Package size={16} className="text-base-content/60" />
                                <div>
                                  <div className="font-medium">
                                    {item.productoNested?.Nombre || item.fields?.Productos?.fields?.Nombre || 'N/A'}
                                  </div>
                                  <div className="text-xs text-base-content/60">
                                    {item.productoNested?.SKU || item.fields?.Productos?.fields?.SKU || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.cantidad}
                                onChange={(e) => {
                                  const nuevaCantidad = parseFloat(e.target.value);
                                  if (nuevaCantidad > 0) {
                                    handleCantidadChange(item.id, nuevaCantidad);
                                  }
                                }}
                                className="input input-bordered input-xs w-16 text-center"
                              />
                            </td>
                            <td className="text-right">
                              ${item.precioUnitario.toFixed(2)} {item.fields.Moneda}
                            </td>
                            <td className="text-right font-semibold">
                              ${item.subtotal.toFixed(2)} {item.fields.Moneda}
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => handleEliminarItem(item.id)}
                                className="btn btn-ghost btn-xs btn-square text-error"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {itemsConPrecios.length > 0 && (
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-right">Subtotal:</td>
                          <td className="text-right">
                            ${subtotal.toFixed(2)} {moneda}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-right">IVA ({porcentajeImpuesto}%):</td>
                          <td className="text-right">
                            ${impuesto.toFixed(2)} {moneda}
                          </td>
                          <td></td>
                        </tr>
                        <tr className="font-bold">
                          <td colSpan="3" className="text-right">TOTAL:</td>
                          <td className="text-right text-lg">
                            ${total.toFixed(2)} {moneda}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>

      {/* Modal de Agregar Producto (se muestra por encima del modal principal) */}
      {showAddProductModal && (
        <div className="modal modal-open" style={{ zIndex: 1001 }}>
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Agregar Producto</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <fieldset className="fieldset">
                  <legend className="label-legend">
                    Buscar Producto
                    <span className="ml-2 text-xs text-base-content/60">
                      {loadingProductos ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        `(${totalProductos} encontrados)`
                      )}
                    </span>
                  </legend>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Buscar por nombre o SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      className="input input-bordered input-sm w-full"
                      disabled={saving}
                    />
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
                              onClick={() => {
                                setSelectedProducto(prod.id);
                                setSearchTerm(prod.fields.Nombre || '');
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-base-200 flex justify-between items-center text-sm"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{prod.fields.SKU} - {prod.fields.Nombre}</div>
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
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="label-legend">Cantidad</legend>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={cantidad}
                    placeholder="Ingresar cantidad"
                    onChange={(e) => setCantidad(parseFloat(e.target.value) || 1)}
                    className="input input-bordered input-sm w-full"
                    disabled={saving}
                  />
                </fieldset>
              </div>

              {/* Advertencia si el producto seleccionado no tiene costo */}
              {selectedProducto && (() => {
                const productoId = typeof selectedProducto === 'string' ? parseInt(selectedProducto) : selectedProducto;
                const producto = productos.find(p => p.id == productoId);

                if (!producto) return null;

                const subcategoria = subcategorias.find(s => s.id == producto?.fields?.Subcategoria?.id);
                const categoria = subcategoria ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id) : null;
                const precioCalc = calcularPrecioProducto(producto, subcategoria, categoria, costos);

                if (!precioCalc.tieneCosto) {
                  return (
                    <div className="alert alert-warning text-sm">
                      <Info size={18} />
                      <div>
                        <div className="font-semibold">Advertencia:</div>
                        <div>Este producto no tiene un costo asignado. Por favor, asigna un costo antes de agregarlo.</div>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setSelectedProducto('');
                  setCantidad(1);
                  setSearchTerm('');
                }}
                className="btn btn-ghost"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarProducto}
                className="btn btn-primary"
                disabled={!selectedProducto || cantidad <= 0 || saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Agregando...
                  </>
                ) : (
                  'Agregar'
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => {
            setShowAddProductModal(false);
            setSelectedProducto('');
            setCantidad(1);
            setSearchTerm('');
          }}></div>
        </div>
      )}

      {/* Modal de visualización de PDF */}
      {showPDFModal && pdfUrl && (
        <div className="modal modal-open" style={{ zIndex: 1002 }}>
          <div className="modal-box max-w-7xl h-[90vh] p-0 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-base-300">
              <h3 className="font-bold text-lg">Vista Previa del Presupuesto</h3>
              <button
                onClick={() => {
                  setShowPDFModal(false);
                  // Cleanup URL after modal closes
                  setTimeout(() => {
                    if (pdfUrl) {
                      URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(null);
                    }
                  }, 100);
                }}
                className="btn btn-ghost btn-sm btn-square"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              style={{ height: 'calc(90vh - 70px)' }}
              title="Presupuesto PDF"
            />
          </div>
          <div className="modal-backdrop" onClick={() => {
            setShowPDFModal(false);
            // Cleanup URL after modal closes
            setTimeout(() => {
              if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
              }
            }, 100);
          }}></div>
        </div>
      )}
    </>
  );
}
