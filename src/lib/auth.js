import CredentialsProvider from 'next-auth/providers/credentials';
import { verificarCredenciales } from './api/usuarios';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: "Email o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            return null;
          }

          const usuario = await verificarCredenciales(
            credentials.identifier,
            credentials.password
          );

          if (!usuario) {
            return null;
          }

          return {
            id: usuario.id.toString(),
            email: usuario.fields.Email,
            name: `${usuario.fields.Nombre} ${usuario.fields.Apellido || ''}`.trim(),
            username: usuario.fields.Username,
            rol: usuario.fields.Rol
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.rol = user.rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.rol = token.rol;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};
