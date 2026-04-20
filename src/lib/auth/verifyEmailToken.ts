/**
 * Deduplicates POST /api/auth/verify for the same token (e.g. React Strict Mode double-mount).
 * Without this, the first request clears verification_token in SQLite and the second returns 400,
 * overwriting the UI with "Verification failed" even though the account was verified.
 */
type VerifyResult = { ok: true } | { ok: false; error: string };

const inflightOrSettled = new Map<string, Promise<VerifyResult>>();

export function verifyEmailTokenOnce(token: string): Promise<VerifyResult> {
  const existing = inflightOrSettled.get(token);
  if (existing) return existing;

  const p = (async (): Promise<VerifyResult> => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        inflightOrSettled.delete(token);
        return { ok: false, error: data.error || 'Verification failed' };
      }
      return { ok: true };
    } catch {
      inflightOrSettled.delete(token);
      return { ok: false, error: 'An error occurred. Please try again.' };
    }
  })();

  inflightOrSettled.set(token, p);
  return p;
}
