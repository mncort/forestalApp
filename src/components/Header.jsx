import Link from 'next/link';

export default function Header() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition">
            🌲 Gestión Forestal
          </Link>
        </div>
      </div>
    </div>
  );
}
