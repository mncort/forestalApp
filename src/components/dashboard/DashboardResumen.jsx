'use client'
import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, FileText } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <KPICard
        title="Presupuestos esta semana"
        value={data?.presupuetosSemana || 0}
        icon={<FileText size={24} />}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <KPICard
        title="Monto total presupuestado"
        value={`$${data?.montoTotal || 0}`}
        icon={<DollarSign size={24} />}
        iconBg="bg-green-500/10"
        iconColor="text-green-600"
      />
      <KPICard
        title="Promedio por presupuesto"
        value={`$${data?.promedio || 0}`}
        icon={<TrendingUp size={24} />}
        iconBg="bg-secondary/10"
        iconColor="text-secondary"
      />
    </div>
  );
}

function KPICard({ title, value, icon, iconBg, iconColor }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
