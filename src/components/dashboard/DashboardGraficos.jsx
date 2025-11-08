'use client'

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Line,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDatosGraficos } from '@/services/dashboard';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const ESTADO_ORDER = ['Borrador', 'Enviado', 'Aprobado', 'Rechazado'];

const ESTADO_BADGE_CLASS = {
  Borrador: 'border-border/40 bg-muted text-muted-foreground',
  Enviado: 'border-primary/20 bg-primary/10 text-primary',
  Aprobado: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  Rechazado: 'border-destructive/20 bg-destructive/10 text-destructive'
};

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

  const estadosOrdenados = useMemo(() => ordenarEstados(data?.porEstado), [data?.porEstado]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/50 bg-card/80">
            <CardContent className="pt-6">
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-64 rounded-xl bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sinDatos = !data || (
    (data.porSemana?.length ?? 0) === 0 &&
    (data.porCategoria?.length ?? 0) === 0 &&
    (data.topClientes?.length ?? 0) === 0 &&
    (data.medioPago?.length ?? 0) === 0 &&
    (data.porEstado?.length ?? 0) === 0
  );

  if (sinDatos) {
    return (
      <Card className="border-border/50 bg-card/80">
        <CardContent className="py-16 text-center">
          <p className="text-lg font-medium text-foreground">Todavía no hay datos para mostrar</p>
          <p className="mt-2 text-sm text-muted-foreground">Genera presupuestos y vuelve a revisar el panel.</p>
        </CardContent>
      </Card>
    );
  }

  const pendientes = data?.pendientes ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {data?.porSemana?.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Evolución semanal</CardTitle>
            <CardDescription>Comparación de presupuestos generados vs. monto estimado</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.porSemana} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border),0.6)" />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrencyAxis(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => {
                    if (name === 'monto') {
                      return [formatCurrency(value), 'Monto'];
                    }
                    return [formatNumber(value), 'Cantidad'];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => (value === 'monto' ? 'Monto total' : 'Presupuestos')}
                />
                <Bar dataKey="monto" yAxisId="left" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cantidad"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {estadosOrdenados?.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Embudo de presupuestos</CardTitle>
            <CardDescription>Estado actual por volumen y cantidad</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadosOrdenados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border),0.6)" />
                <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrencyAxis(value)} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label, payload) => {
                    if (!payload?.length) return label;
                    const { cantidad } = payload[0].payload;
                    return `${label} • ${formatNumber(cantidad)} presupuestos`;
                  }}
                  formatter={(value) => [formatCurrency(value), 'Monto']}
                />
                <Bar dataKey="monto" radius={[6, 6, 0, 0]} fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {estadosOrdenados.map((estado) => (
                <div key={estado.estado} className="rounded-lg border border-border/40 bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={ESTADO_BADGE_CLASS[estado.estado] || 'bg-muted text-muted-foreground'}>
                      {estado.estado}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatNumber(estado.cantidad)} casos</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatCurrency(estado.monto)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data?.porCategoria?.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Mix de categorías</CardTitle>
            <CardDescription>Participación de ingresos por categoría</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.porCategoria}
                  dataKey="valor"
                  nameKey="categoria"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                >
                  {data.porCategoria.map((entry, index) => (
                    <Cell key={`categoria-${entry.categoria}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name, payload) => [formatCurrency(value), payload?.payload?.categoria || 'Categoría']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value, entry) => `${value} • ${formatCurrency(entry.payload.valor)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data?.medioPago?.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Medios de cobro</CardTitle>
            <CardDescription>Distribución de montos por tipo de pago</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.medioPago}
                  dataKey="valor"
                  nameKey="tipo"
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={90}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                >
                  {data.medioPago.map((entry, index) => (
                    <Cell key={`medio-${entry.tipo}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatCurrency(value), name]} />
                <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data?.topClientes?.length > 0 && (
        <Card className="border-border/50 bg-card/80 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Clientes que más compran</CardTitle>
            <CardDescription>Top 5 por monto y recurrencia</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topClientes} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border),0.6)" />
                <XAxis dataKey="cliente" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrencyAxis(value)} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name, payload) => {
                    if (name === 'total') {
                      return [formatCurrency(value), 'Monto total'];
                    }
                    return [formatNumber(value), 'Presupuestos'];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => (value === 'total' ? 'Monto total' : 'Presupuestos creados')}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="cantidad" stroke="hsl(var(--accent))" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {pendientes.length > 0 && (
        <Card className="border-border/50 bg-card/80 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Seguimiento prioritario</CardTitle>
            <CardDescription>Presupuestos que necesitan contacto para no perder la oportunidad</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Días sin movimiento</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendientes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.cliente}</span>
                        <span className="text-xs text-muted-foreground">{item.descripcion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ESTADO_BADGE_CLASS[item.estado] || 'bg-muted text-muted-foreground'}>
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatNumber(item.dias)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.monto)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatDate(item.fecha)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: 'oklch(var(--background))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '0.75rem',
  boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.08)'
};

function ordenarEstados(estados = []) {
  if (!estados.length) {
    return [];
  }
  return estados
    .slice()
    .sort((a, b) => {
      const indexA = ESTADO_ORDER.indexOf(a.estado);
      const indexB = ESTADO_ORDER.indexOf(b.estado);
      return (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) - (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB);
    });
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: number < 1000 ? 2 : 0
  }).format(number);
}

function formatCurrencyAxis(value) {
  const number = Number(value || 0);
  if (Math.abs(number) >= 1_000_000) {
    return `$${(number / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`;
  }
  if (Math.abs(number) >= 1_000) {
    return `$${(number / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}k`;
  }
  return formatCurrency(number);
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-AR').format(number);
}

function formatDate(value) {
  if (!value) {
    return '-';
  }
  const fecha = value instanceof Date ? value : new Date(value);
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit'
  });
}
