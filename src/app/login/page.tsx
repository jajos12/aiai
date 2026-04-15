'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!result || !result.ok) {
        setError('Invalid credentials or email not verified in Firebase.');
        return;
      }

      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        setError('Signed in, but failed to load user profile.');
        return;
      }
      const me = await meRes.json();
      localStorage.setItem('user', JSON.stringify(me.user));

      router.push('/');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            margin: '0 0 1rem 0',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          Secure sign-in is powered by Auth.js.
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor='email'
              style={{
                display: 'block',
                marginBottom: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor='password'
              style={{
                display: 'block',
                marginBottom: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Link href='/forgot-password' style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link href='/signup' style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}