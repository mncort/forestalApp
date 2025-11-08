import DashboardResumen from '@/components/dashboard/DashboardResumen';
import DashboardGraficos from '@/components/dashboard/DashboardGraficos';

export default function Page() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la actividad de tu negocio</p>
      </div>

      <DashboardResumen />
      <DashboardGraficos />
    </div>
  );
}
