import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import crypto from 'crypto';
import { z } from 'zod';
import { createUser, getUserByEmail, getUserById, markUserVerifiedByEmail } from '@/lib/db/users';
import { getAuthSecret } from '@/lib/auth/config';
import { firebaseLookupByIdToken, firebaseSignInWithPassword } from '@/lib/auth/firebaseAuth';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function ensureLocalUser(email: string, name?: string | null) {
  let user = getUserByEmail(email);
  if (!user) {
    const placeholderHash = `oauth:${crypto.randomBytes(24).toString('hex')}`;
    user = createUser(email, placeholderHash, name?.trim() || email.split('@')[0] || 'User', undefined);
  }
  if (Number(user.is_verified) !== 1) {
    markUserVerifiedByEmail(user.email);
    user = getUserByEmail(user.email) ?? user;
  }
  return user;
}

const providers: NonNullable<NextAuthOptions['providers']> = [
  Credentials({
    name: 'Email and Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      let signInResult;
      try {
        signInResult = await firebaseSignInWithPassword(email, password);
      } catch {
        return null;
      }

      const firebaseUser = await firebaseLookupByIdToken(signInResult.idToken);
      if (!firebaseUser || !firebaseUser.email || firebaseUser.emailVerified !== true) {
        return null;
      }

      const user = ensureLocalUser(firebaseUser.email, firebaseUser.displayName);

      return {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const localUser = ensureLocalUser(user.email, user.name);
        token.userId = Number(localUser.id);
        token.role = localUser.role ?? 'user';
        token.name = localUser.name;
      } else if (token.userId != null) {
        const uid = Number(token.userId);
        if (Number.isInteger(uid) && uid > 0) {
          const dbUser = getUserById(uid);
          if (dbUser) {
            token.role = dbUser.role ?? 'user';
            token.name = dbUser.name;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? token.sub ?? '');
        session.user.role = String(token.role ?? 'user');
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: getAuthSecret(),
};
