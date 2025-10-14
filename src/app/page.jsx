import Link from 'next/link';
import { Folder, Package, FileText } from 'lucide-react';

export default function Page() {
  return (
    <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Bienvenido al Sistema de Gestión</h2>
          <p className="text-base-content/70">Selecciona una sección para comenzar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link
            href="/categorias"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all group border border-base-300 hover:border-primary"
          >
            <div className="card-body items-center text-center">
              <div className="bg-primary/10 p-6 rounded-full mb-4 group-hover:bg-primary/20 transition">
                <Folder className="text-primary" size={48} />
              </div>
              <h3 className="card-title">Categorías & Subcategorías</h3>
              <p className="text-base-content/70">Gestiona las categorías y subcategorías de productos</p>
            </div>
          </Link>

          <Link
            href="/productos"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all group border border-base-300 hover:border-secondary"
          >
            <div className="card-body items-center text-center">
              <div className="bg-secondary/10 p-6 rounded-full mb-4 group-hover:bg-secondary/20 transition">
                <Package className="text-secondary" size={48} />
              </div>
              <h3 className="card-title">Productos</h3>
              <p className="text-base-content/70">Administra productos y sus costos históricos</p>
            </div>
          </Link>

          <Link
            href="/presupuestos"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all group border border-base-300 hover:border-accent"
          >
            <div className="card-body items-center text-center">
              <div className="bg-accent/10 p-6 rounded-full mb-4 group-hover:bg-accent/20 transition">
                <FileText className="text-accent" size={48} />
              </div>
              <h3 className="card-title">Presupuestos</h3>
              <p className="text-base-content/70">Crea y gestiona presupuestos con cálculo de precios</p>
            </div>
          </Link>
        </div>
    </div>
  );
}
