'use client'
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDatosGraficos } from '@/services/dashboard';

// Horizon UI color palette - vibrant blues and purples
const COLORS = ['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(173, 58%, 39%)', 'hsl(43, 74%, 66%)', 'hsl(27, 87%, 67%)'];

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
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
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
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">No hay datos suficientes para mostrar gráficos</p>
          <p className="text-sm text-muted-foreground/70 mt-2">Crea algunos presupuestos para ver las estadísticas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico de líneas - Presupuestos por semana */}
      {data.porSemana && data.porSemana.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Presupuestos por semana</CardTitle>
          </CardHeader>
          <CardContent>
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
                    backgroundColor: 'oklch(var(--background))',
                    border: '1px solid oklch(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(221, 83%, 53%)', r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(262, 83%, 58%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de pastel - Distribución por categoría */}
      {data.porCategoria && data.porCategoria.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monto vendido por categoría</CardTitle>
          </CardHeader>
          <CardContent>
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
                    backgroundColor: 'oklch(var(--background))',
                    border: '1px solid oklch(var(--border))',
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
          </CardContent>
        </Card>
      )}

      {/* Gráfico de barras - Top 5 clientes */}
      {data.topClientes && data.topClientes.length > 0 && (
        <Card className="md:col-span-2 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top 5 clientes por monto</CardTitle>
          </CardHeader>
          <CardContent>
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
                    backgroundColor: 'oklch(var(--background))',
                    border: '1px solid oklch(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(221, 83%, 53%)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
