export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET environment variable must be set in production');
    }
    return 'dev-auth-secret-change-me';
  }

  return secret;
}
