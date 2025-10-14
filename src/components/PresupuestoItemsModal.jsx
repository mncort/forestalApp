'use client'
import { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Info } from 'lucide-react';
import {
  getItemsByPresupuesto,
  crearPresupuestoItem,
  actualizarPresupuestoItem,
  eliminarPresupuestoItem,
  actualizarPresupuesto,
  calcularPrecioProducto,
  getProductos,
  countProductos,
  getCategorias,
  getSubcategorias,
  getCostos
} from '@/lib/api/index';

export default function PresupuestoItemsModal({ show, presupuesto, onClose, onSaved }) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Estados para cargar datos solo cuando se abre el modal
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [costos, setCostos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [totalProductos, setTotalProductos] = useState(0);
  const [tipoFactura, setTipoFactura] = useState(presupuesto?.fields?.TipoFactura || 'con_factura');

  // Cargar todos los datos cuando se abre el modal
  useEffect(() => {
    if (show && presupuesto) {
      cargarDatos();
      cargarItems();
      setTipoFactura(presupuesto?.fields?.TipoFactura || 'con_factura');
    }
  }, [show, presupuesto]);

  // Actualizar tipo de factura en el presupuesto cuando cambia
  useEffect(() => {
    if (presupuesto && tipoFactura) {
      actualizarPresupuesto(presupuesto.id, { TipoFactura: tipoFactura }).catch(error => {
        console.error('Error actualizando tipo de factura:', error);
      });
    }
  }, [tipoFactura, presupuesto]);

  // Buscar productos cuando cambia el término de búsqueda (con debounce)
  useEffect(() => {
    if (!show) return;

    const timeoutId = setTimeout(() => {
      buscarProductos(searchTerm);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [searchTerm, show]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [catsData, subcatsData, costosData] = await Promise.all([
        getCategorias(),
        getSubcategorias(),
        getCostos()
      ]);
      setCategorias(catsData);
      setSubcategorias(subcatsData);
      setCostos(costosData);
      // Cargar productos iniciales (primeros 25)
      await buscarProductos('');
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAgregarProducto = async () => {
    if (!selectedProducto || cantidad <= 0) return;

    setSaving(true);
    try {
      // Convertir a número por si acaso viene como string
      const productoId = typeof selectedProducto === 'string' ? parseInt(selectedProducto) : selectedProducto;
      const producto = productos.find(p => p.id == productoId); // usar == para comparación flexible

      if (!producto) {
        console.error('Producto no encontrado:', { selectedProducto, productoId, todosLosProductos: productos.map(p => p.id) });
        alert('Error: No se encontró el producto seleccionado.');
        setSaving(false);
        return;
      }

      const subcategoria = subcategorias.find(s => s.id == producto.fields?.Subcategoria?.id);
      const categoria = subcategoria ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id) : null;

      // Calcular precio con markup
      const precioCalc = calcularPrecioProducto(producto, subcategoria, categoria, costos);

      if (!precioCalc.tieneCosto) {
        alert('Este producto no tiene un costo asignado. Por favor, asigna un costo antes de agregarlo al presupuesto.');
        setSaving(false);
        return;
      }

      // Crear item
      await crearPresupuestoItem({
        nc_1g29___Presupuestos_id: presupuesto.id,
        nc_1g29__Productos_id: selectedProducto,
        Cantidad: cantidad,
        PrecioUnitario: precioCalc.precioVenta,
        Markup: precioCalc.markup,
        Moneda: precioCalc.moneda
      });

      // Recargar items y limpiar formulario
      await cargarItems();
      setSelectedProducto('');
      setCantidad(1);
      setSearchTerm('');
      onSaved();
    } catch (error) {
      console.error('Error agregando producto:', error);
      alert('Error al agregar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarItem = async (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;

    try {
      await eliminarPresupuestoItem(itemId);
      await cargarItems();
      onSaved();
    } catch (error) {
      console.error('Error eliminando item:', error);
      alert('Error al eliminar el item');
    }
  };

  const handleCantidadChange = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;

    try {
      await actualizarPresupuestoItem(itemId, {
        Cantidad: nuevaCantidad
      });
      await cargarItems();
      onSaved();
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      alert('Error al actualizar la cantidad');
    }
  };

  // Calcular precios de items para mostrar
  const itemsConPrecios = items.map(item => {
    const producto = productos.find(p => p.id === item.fields.Productos?.id);
    const precioUnitario = parseFloat(item.fields.PrecioUnitario) || 0;
    const cantidad = parseFloat(item.fields.Cantidad) || 0;
    const subtotal = precioUnitario * cantidad;

    return {
      ...item,
      producto,
      precioUnitario,
      cantidad,
      subtotal
    };
  });

  // Calcular total del presupuesto
  const subtotal = itemsConPrecios.reduce((sum, item) => sum + item.subtotal, 0);
  const moneda = itemsConPrecios.length > 0 ? itemsConPrecios[0].fields?.Moneda : 'ARS';

  // Calcular impuesto según tipo de factura
  const porcentajeImpuesto = tipoFactura === 'con_factura' ? 21 : 10.5;
  const impuesto = subtotal * (porcentajeImpuesto / 100);
  const total = subtotal + impuesto;

  if (!show) return null;

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-5xl max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">Items del Presupuesto #{String(presupuesto?.id || '').substring(0, 8)}</h3>
              <p className="text-sm text-base-content/70">Cliente: {presupuesto?.fields.Cliente}</p>
            </div>
            <div className="flex items-center gap-2">
              <fieldset className="fieldset mb-0">
                <legend className="label-legend">Tipo de Factura</legend>
                <select
                  value={tipoFactura}
                  onChange={(e) => setTipoFactura(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  <option value="con_factura">Con Factura (21% IVA)</option>
                  <option value="sin_factura">Sin Factura (10.5% IVA)</option>
                </select>
              </fieldset>
            </div>
          </div>

          {loading || loadingItems ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Formulario agregar producto */}
                <div className="card bg-base-200 border border-base-300">
                  <div className="card-body">
                    <h4 className="font-semibold mb-3">Agregar Producto</h4>
                    <div className="space-y-3">
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
                              type="text"
                              placeholder="Buscar por nombre o SKU..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onFocus={() => setShowDropdown(true)}
                              className="input input-bordered input-sm w-full"
                              disabled={saving}
                            />
                            {showDropdown && productos.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg overflow-auto top-full left-0 right-0">
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
                              </div>
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
                            placeholder='Ingresar cantidad'
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

                        // Solo evaluar si el producto existe
                        if (!producto) return null;

                        const subcategoria = subcategorias.find(s => s.id == producto?.fields?.Subcategoria?.id);
                        const categoria = subcategoria ? categorias.find(c => c.id == subcategoria.fields?.nc_1g29__Categorias_id) : null;
                        const precioCalc = calcularPrecioProducto(producto, subcategoria, categoria, costos);

                        // Solo mostrar alert si el producto NO tiene costo
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

                        // Si tiene costo, no mostrar nada
                        return null;
                      })()}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setShowAddProduct(false);
                            setSelectedProducto('');
                            setCantidad(1);
                            setSearchTerm('');
                          }}
                          className="btn btn-ghost btn-sm"
                          disabled={saving}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAgregarProducto}
                          className="btn btn-primary btn-sm"
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
                  </div>
                </div>
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
                      {console.log(itemsConPrecios)}
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
                                  <div className="font-medium">{item.fields?.Productos.fields.Nombre}</div>
                                  <div className="text-xs text-base-content/60">{item.producto?.fields.SKU}</div>
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

          <div className="modal-action">
            <button onClick={onClose} className="btn">
              Cerrar
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>
    </>
  );
}
