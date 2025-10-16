'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, User } from 'lucide-react';
import { getClientes, countClientes } from '@/lib/api/index';
import ClienteModal from '@/components/ClienteModal';

export default function ClientesPage() {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina, setClientesPorPagina] = useState(10);
  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Cargar clientes paginados desde el servidor
  useEffect(() => {
    const cargarClientes = async () => {
      setLoadingClientes(true);
      try {
        const offset = (paginaActual - 1) * clientesPorPagina;
        const [clientesData, count] = await Promise.all([
          getClientes({ limit: clientesPorPagina, offset }),
          countClientes()
        ]);
        setClientes(clientesData);
        setTotalClientes(count);
      } catch (err) {
        console.error('Error cargando clientes:', err);
      } finally {
        setLoadingClientes(false);
      }
    };

    cargarClientes();
  }, [paginaActual, clientesPorPagina]);

  // Calcular paginación
  const totalPaginas = Math.ceil(totalClientes / clientesPorPagina);
  const inicio = (paginaActual - 1) * clientesPorPagina;
  const fin = inicio + clientesPorPagina;

  // Resetear a página 1 cuando cambia el número de clientes por página
  const handleCambioClientesPorPagina = (nuevaCantidad) => {
    setClientesPorPagina(nuevaCantidad);
    setPaginaActual(1);
  };

  // Función reload completa
  const reload = async () => {
    setLoadingClientes(true);
    try {
      const offset = (paginaActual - 1) * clientesPorPagina;
      const [clientesData, count] = await Promise.all([
        getClientes({ limit: clientesPorPagina, offset }),
        countClientes()
      ]);
      setClientes(clientesData);
      setTotalClientes(count);
    } catch (err) {
      console.error('Error recargando clientes:', err);
    } finally {
      setLoadingClientes(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Clientes</h2>
            <p className="text-base-content/70 text-sm mt-1">{totalClientes} clientes registrados</p>
          </div>
          <button
            onClick={() => {
              setSelectedCliente(null);
              setShowClienteModal(true);
            }}
            className="btn btn-primary gap-2"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>CUIT</th>
                  <th>Condición IVA</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingClientes ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-base-content/60">
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : clientes.map(cliente => (
                  <tr key={cliente.id} className="hover">
                    <td>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-base-content/60" />
                        <span className="font-medium">{cliente.fields?.Nombre || '-'}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{cliente.fields?.CUIT || '-'}</td>
                    <td>
                      {cliente.fields?.CondicionIVA && (
                        <span className="badge badge-outline badge-sm">
                          {cliente.fields.CondicionIVA}
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-base-content/70">{cliente.fields?.Email || '-'}</td>
                    <td className="text-sm text-base-content/70">{cliente.fields?.Tel || '-'}</td>
                    <td className="text-sm text-base-content/70 max-w-xs truncate">
                      {cliente.fields?.Dirección || '-'}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCliente(cliente);
                            setShowClienteModal(true);
                          }}
                          className="btn btn-ghost btn-sm btn-square tooltip tooltip-top"
                          data-tip="Editar cliente"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          {totalClientes > 0 && (
            <div className="p-4 bg-base-200 border-t border-base-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Info y selector de cantidad */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-base-content/70">
                    Mostrando {inicio + 1} - {Math.min(fin, totalClientes)} de {totalClientes}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">Por página:</label>
                    <select
                      value={clientesPorPagina}
                      onChange={(e) => handleCambioClientesPorPagina(parseInt(e.target.value))}
                      className="select select-bordered select-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="join">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="join-item btn btn-sm"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="join-item btn btn-sm"
                  >
                    «
                  </button>
                  <button className="join-item btn btn-sm no-animation">
                    Página {paginaActual} de {totalPaginas}
                  </button>
                  <button
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="join-item btn btn-sm"
                  >
                    »
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="join-item btn btn-sm"
                  >
                    »»
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClienteModal
        show={showClienteModal}
        cliente={selectedCliente}
        onClose={() => setShowClienteModal(false)}
        onSaved={reload}
      />
    </div>
  );
}
