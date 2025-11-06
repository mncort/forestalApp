'use client'
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDatosGraficos } from '@/services/dashboard';

const COLORS = ['#570DF8', '#F000B8', '#37CDBE', '#FBBD23', '#FF5722'];

export default function DashboardGraficos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const graficos = await getDatosGraficos();
        setData(graficos);
      } catch (error) {
        console.error('Error cargando gráficos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card bg-base-100 shadow-md animate-pulse">
            <div className="card-body">
              <div className="h-4 bg-base-300 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-base-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sinDatos = !data || (
    data.porSemana?.length === 0 &&
    data.porCategoria?.length === 0 &&
    data.topClientes?.length === 0
  );

  if (sinDatos) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body text-center py-12">
          <p className="text-base-content/60">No hay datos suficientes para mostrar gráficos</p>
          <p className="text-sm text-base-content/40">Crea algunos presupuestos para ver las estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico de líneas - Presupuestos por semana */}
      {data.porSemana && data.porSemana.length > 0 && (
        <div className="card bg-base-100 shadow-md border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-base mb-4">Presupuestos por semana</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.porSemana}>
                <XAxis
                  dataKey="semana"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  style={{ fontSize: '12px' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(var(--b1))',
                    border: '1px solid oklch(var(--bc) / 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="oklch(var(--p))"
                  strokeWidth={3}
                  dot={{ fill: 'oklch(var(--p))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico de pastel - Distribución por categoría */}
      {data.porCategoria && data.porCategoria.length > 0 && (
        <div className="card bg-base-100 shadow-md border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-base mb-4">Monto vendido por categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.porCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  cx="50%"
                  cy="45%"
                  outerRadius={70}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.porCategoria.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']}
                  contentStyle={{
                    backgroundColor: 'oklch(var(--b1))',
                    border: '1px solid oklch(var(--bc) / 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => `${value}: $${entry.payload.valor.toFixed(0)}`}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico de barras - Top 5 clientes */}
      {data.topClientes && data.topClientes.length > 0 && (
        <div className="card bg-base-100 shadow-md border border-base-300 md:col-span-2">
          <div className="card-body">
            <h3 className="card-title text-base mb-4">Top 5 clientes por monto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topClientes}>
                <XAxis
                  dataKey="cliente"
                  style={{ fontSize: '12px' }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Total']}
                  contentStyle={{
                    backgroundColor: 'oklch(var(--b1))',
                    border: '1px solid oklch(var(--bc) / 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="oklch(var(--su))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
