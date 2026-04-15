const FIREBASE_AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';

type FirebaseErrorResponse = {
  error?: {
    message?: string;
  };
};

function firebaseApiKey(): string {
  const key = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (!key) {
    throw new Error('FIREBASE_WEB_API_KEY is not configured');
  }
  return key;
}

async function postFirebase<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const key = firebaseApiKey();
  const res = await fetch(`${FIREBASE_AUTH_BASE}/${path}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as FirebaseErrorResponse;
    const message = data.error?.message || `Firebase request failed (${res.status})`;
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export type FirebaseSignInResult = {
  idToken: string;
  email: string;
  localId: string;
};

type FirebaseLookupResponse = {
  users?: FirebaseLookupUser[];
};

export type FirebaseLookupUser = {
  localId: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
};

export async function firebaseSignInWithPassword(email: string, password: string): Promise<FirebaseSignInResult> {
  return postFirebase<FirebaseSignInResult>('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });
}

export async function firebaseSignUp(email: string, password: string): Promise<FirebaseSignInResult> {
  return postFirebase<FirebaseSignInResult>('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });
}

export async function firebaseLookupByIdToken(idToken: string): Promise<FirebaseLookupUser | null> {
  const data = await postFirebase<FirebaseLookupResponse>('accounts:lookup', { idToken });
  const user = data.users?.[0];
  return user ?? null;
}

export async function firebaseSendVerificationEmail(idToken: string): Promise<void> {
  await postFirebase('accounts:sendOobCode', {
    requestType: 'VERIFY_EMAIL',
    idToken,
  });
}

export async function firebaseSendPasswordResetEmail(email: string): Promise<void> {
  await postFirebase('accounts:sendOobCode', {
    requestType: 'PASSWORD_RESET',
    email,
  });
}

export async function firebaseConfirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  await postFirebase('accounts:resetPassword', {
    oobCode,
    newPassword,
  });
}
