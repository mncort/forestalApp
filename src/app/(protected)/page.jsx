import DashboardResumen from '@/components/dashboard/DashboardResumen';
import DashboardGraficos from '@/components/dashboard/DashboardGraficos';

export default function Page() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-base-content/70">Resumen de la actividad de tu negocio</p>
      </div>

      <DashboardResumen />
      <DashboardGraficos />
    </div>
  );
}
