import { NextResponse } from 'next/server';
import { createUsuario, getUsuarios } from '@/services/usuarios';

/**
 * Ruta temporal para crear el primer usuario administrador
 * Solo funciona si no hay usuarios en el sistema
 * Acceder a: http://localhost:3000/api/setup
 */
export async function GET(request) {
  try {
    // Verificar si ya existen usuarios
    const usuarios = await getUsuarios({ limit: 1 });

    if (usuarios.length > 0) {
      return NextResponse.json(
        { error: 'Ya existen usuarios en el sistema. Esta ruta está deshabilitada por seguridad.' },
        { status: 403 }
      );
    }

    // Crear usuario administrador
    const adminData = {
      Email: 'admin@forestal.com',
      Username: 'admin',
      Password: 'admin123',
      Nombre: 'Administrador',
      Apellido: 'Sistema',
      Rol: 'admin',
      activo: true
    };

    await createUsuario(adminData);

    return NextResponse.json({
      message: '✅ Usuario administrador creado exitosamente!',
      credenciales: {
        email: adminData.Email,
        username: adminData.Username,
        password: adminData.Password,
        importante: 'Cambia la contraseña después del primer login'
      }
    });
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario', details: error.message },
      { status: 500 }
    );
  }
}
