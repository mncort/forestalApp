'use client'
import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, FileText, CheckCircle2, Send, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getResumenSemanal } from '@/services/dashboard';

export default function DashboardResumen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const resumen = await getResumenSemanal();
        setData(resumen);
      } catch (error) {
        console.error('Error cargando resumen:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const tarjetas = [
    {
      title: 'Presupuestos creados',
      helper: 'Últimos 7 días',
      value: formatNumber(data?.presupuestosSemana),
      icon: <FileText size={22} />,
      variant: 'primary'
    },
    {
      title: 'Monto presupuestado',
      helper: 'Últimos 7 días',
      value: formatCurrency(data?.montoSemana),
      icon: <DollarSign size={22} />,
      variant: 'accent'
    },
    {
      title: 'Ticket promedio',
      helper: 'Últimos 7 días',
      value: formatCurrency(data?.promedioSemana),
      icon: <TrendingUp size={22} />,
      variant: 'muted'
    },
    {
      title: 'Aprobados en la semana',
      helper: `${formatNumber(data?.aprobadosSemana)} aprobados`,
      value: `${formatPercent(data?.conversionSemana)} conversión`,
      icon: <CheckCircle2 size={22} />,
      variant: 'success'
    },
    {
      title: 'Presupuestos enviados',
      helper: 'Últimos 7 días',
      value: formatNumber(data?.enviadosSemana),
      icon: <Send size={22} />,
      variant: 'primary'
    },
    {
      title: 'Monto pendiente de respuesta',
      helper: 'Estados "Enviado" activos',
      value: formatCurrency(data?.montoPendiente),
      icon: <Wallet size={22} />,
      variant: 'warning'
    },
    {
      title: 'Monto aprobado del mes',
      helper: 'Desde el 1° del mes',
      value: formatCurrency(data?.montoAprobadoMes),
      icon: <DollarSign size={22} />,
      variant: 'accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-4">
      {(loading ? Array.from({ length: 4 }) : tarjetas).map((item, index) => (
        <KPICard
          key={index}
          loading={loading}
          title={item?.title}
          helper={item?.helper}
          value={item?.value}
          icon={item?.icon}
          variant={item?.variant}
        />
      ))}
    </div>
  );
}

const variantStyles = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  muted: 'bg-muted text-foreground'
};

function KPICard({ title, value, helper, icon, variant = 'primary', loading }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:border-border">
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-7 w-1/2 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
              {helper && <p className="text-xs text-muted-foreground/80">{helper}</p>}
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${variantStyles[variant]}`}>
              {icon}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-AR').format(number);
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: number < 1000 ? 2 : 0
  }).format(number);
}

function formatPercent(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) {
    return '0%';
  }
  return `${number.toFixed(0)}%`;
}
