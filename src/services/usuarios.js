import { fetchRecords, createRecord, updateRecord } from '@/models/nocodbRepository';
import { TABLES } from '@/models/nocodbConfig';
import bcrypt from 'bcryptjs';

/**
 * Obtener todos los usuarios
 */
export const getUsuarios = async (options = {}) => {
  return await fetchRecords(TABLES.usuarios, {
    ...options,
    sort: '-Created time'
  });
};

/**
 * Obtener un usuario por email
 */
export const getUsuarioByEmail = async (email) => {
  const usuarios = await fetchRecords(TABLES.usuarios, {
    where: `(Email,eq,${email})`,
    limit: 1
  });
  return usuarios.length > 0 ? usuarios[0] : null;
};

/**
 * Obtener un usuario por username
 */
export const getUsuarioByUsername = async (username) => {
  const usuarios = await fetchRecords(TABLES.usuarios, {
    where: `(Username,eq,${username})`,
    limit: 1
  });
  return usuarios.length > 0 ? usuarios[0] : null;
};

/**
 * Crear un nuevo usuario
 */
export const createUsuario = async (data) => {
  // Hashear la contraseña antes de guardar
  const hashedPassword = await bcrypt.hash(data.Password, 10);

  const usuarioData = {
    Email: data.Email,
    Username: data.Username,
    Password: hashedPassword,
    Nombre: data.Nombre,
    Apellido: data.Apellido || '',
    Rol: data.Rol || 'usuario',
    activo: data.activo !== undefined ? data.activo : true
  };

  return await createRecord(TABLES.usuarios, usuarioData);
};

/**
 * Actualizar un usuario
 */
export const updateUsuario = async (id, data) => {
  // Si se está actualizando la contraseña, hashearla
  if (data.Password) {
    data.Password = await bcrypt.hash(data.Password, 10);
  }

  return await updateRecord(TABLES.usuarios, id, data);
};

/**
 * Verificar credenciales de usuario
 */
export const verificarCredenciales = async (identifier, password) => {
  // Buscar por email o username
  let usuario = await getUsuarioByEmail(identifier);
  if (!usuario) {
    usuario = await getUsuarioByUsername(identifier);
  }

  if (!usuario) {
    return null;
  }

  // Verificar si el usuario está activo
  if (!usuario.fields.activo == 1) {
    throw new Error('Usuario inactivo');
  }

  // Verificar contraseña
  const passwordMatch = await bcrypt.compare(password, usuario.fields.Password);

  if (!passwordMatch) {
    return null;
  }

  // No retornar la contraseña
  const { Password, ...usuarioSinPassword } = usuario;
  return usuarioSinPassword;
};
