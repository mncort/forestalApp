'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier: formData.identifier,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        toast.error('Credenciales incorrectas');
      } else if (result?.ok) {
        toast.success('Inicio de sesión exitoso');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col items-center mb-4">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-20">
                <LogIn size={40} />
              </div>
            </div>
            <h2 className="card-title text-2xl">Gestión Forestal</h2>
            <p className="text-sm text-base-content/60">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email o Usuario</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-base-content/40" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Ingresa tu email o usuario"
                  className="input input-bordered w-full pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-base-content/40" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className="input input-bordered w-full pl-10"
                  required
                />
              </div>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
