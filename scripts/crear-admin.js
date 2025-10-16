/**
 * Script para crear el primer usuario administrador
 * Ejecutar: node scripts/crear-admin.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const NOCODB_URL = process.env.NEXT_PUBLIC_NOCODB_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_NOCODB_TOKEN;
const TABLE_USUARIOS = process.env.NEXT_PUBLIC_TABLE_USUARIOS;

async function crearAdmin() {
  console.log('🔧 Creando usuario administrador...\n');

  const adminData = {
    Email: 'admin@forestal.com',
    Username: 'admin',
    Password: 'admin123', // Cambiar después del primer login
    Nombre: 'Administrador',
    Apellido: 'Sistema',
    Rol: 'admin',
    activo: true
  };

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(adminData.Password, 10);

    // Crear usuario directamente con fetch
    const url = `${NOCODB_URL}/api/v2/tables/${TABLE_USUARIOS}/records`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xc-token': API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: adminData.Email,
        Username: adminData.Username,
        Password: hashedPassword,
        Nombre: adminData.Nombre,
        Apellido: adminData.Apellido,
        Rol: adminData.Rol,
        activo: adminData.activo
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.statusText}`);
    }

    const usuario = await response.json();

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📧 Email:', adminData.Email);
    console.log('👤 Username:', adminData.Username);
    console.log('🔑 Password:', adminData.Password);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!\n');
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  }
}

crearAdmin();
