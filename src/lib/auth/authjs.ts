import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { z } from 'zod';
import { createUser, getUserByEmail, markUserVerifiedByEmail } from '@/lib/db/users';
import { getAuthSecret } from '@/lib/auth/config';
import { firebaseLookupByIdToken, firebaseSignInWithPassword } from '@/lib/auth/firebaseAuth';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  providers: [
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

        let user = getUserByEmail(firebaseUser.email);
        if (!user) {
          const placeholderHash = `firebase:${crypto.randomBytes(24).toString('hex')}`;
          user = createUser(
            firebaseUser.email,
            placeholderHash,
            firebaseUser.displayName?.trim() || email.split('@')[0] || 'User',
            undefined,
          );
        }

        if (Number(user.is_verified) !== 1) {
          markUserVerifiedByEmail(user.email);
          user = getUserByEmail(user.email) ?? user;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id);
        token.role = (user as { role?: string }).role ?? 'user';
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
