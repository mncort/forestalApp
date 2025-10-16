import { NextResponse } from 'next/server';
import { createUsuario, getUsuarioByEmail, getUsuarioByUsername } from '@/lib/api/usuarios';

export async function POST(request) {
  try {
    const data = await request.json();

    // Validar campos requeridos
    if (!data.Email || !data.Username || !data.Password || !data.Nombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingEmail = await getUsuarioByEmail(data.Email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe
    const existingUsername = await getUsuarioByUsername(data.Username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 400 }
      );
    }

    // Crear usuario
    const usuario = await createUsuario(data);

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', usuario: { id: usuario.Id } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
