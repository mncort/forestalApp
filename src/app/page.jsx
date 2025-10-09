import Link from 'next/link';
import { Folder, Package } from 'lucide-react';

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Bienvenido al Sistema de Gestión</h2>
          <p className="text-gray-600">Selecciona una sección para comenzar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/categorias"
            className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl hover:border-blue-300 transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-6 rounded-full mb-4 group-hover:bg-blue-200 transition">
                <Folder className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Categorías & Subcategorías</h3>
              <p className="text-gray-600">Gestiona las categorías y subcategorías de productos</p>
            </div>
          </Link>

          <Link
            href="/productos"
            className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-xl hover:border-green-300 transition-all group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-6 rounded-full mb-4 group-hover:bg-green-200 transition">
                <Package className="text-green-600" size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Productos</h3>
              <p className="text-gray-600">Administra productos y sus costos históricos</p>
            </div>
          </Link>
        </div>
    </div>
  );
}
