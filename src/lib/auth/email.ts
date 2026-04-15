interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** True if signup should require email verification (either Resend or SMTP is configured). */
export function isEmailTransportConfigured(): boolean {
  if (process.env.RESEND_API_KEY?.trim()) {
    return true;
  }
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return !!(host && user && pass);
}

function getResendFrom(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    'onboarding@resend.dev'
  );
}

async function sendViaResend(options: MailOptions): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: 'RESEND_API_KEY is not set.' };
  }

  const from = getResendFrom();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, reason: `Resend HTTP ${res.status}: ${errText || res.statusText}` };
    }

    return { ok: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Resend request failed';
    return { ok: false, reason: msg };
  }
}

/** Reject obvious non-address defaults (e.g. Mailtrap Live uses auth user `api`). */
function smtpFromContainsEmailAddress(from: string | undefined): boolean {
  if (!from?.trim()) return false;
  const inner = from.includes('<') ? (from.match(/<([^>]+)>/)?.[1] ?? from) : from;
  return inner.trim().includes('@');
}

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  return { host, port, user, pass, from, secure };
}

export async function sendMail(options: MailOptions): Promise<{ ok: boolean; reason?: string }> {
  if (process.env.RESEND_API_KEY?.trim()) {
    return sendViaResend(options);
  }

  const cfg = getMailConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    return {
      ok: false,
      reason: 'No mail transport configured. Set RESEND_API_KEY or SMTP_HOST, SMTP_USER, and SMTP_PASS.',
    };
  }

  if (!cfg.from) {
    return { ok: false, reason: 'SMTP_FROM or SMTP_USER must be set for the sender address.' };
  }

  if (!smtpFromContainsEmailAddress(cfg.from)) {
    return {
      ok: false,
      reason:
        'SMTP_FROM must include @ (e.g. AI Tutor <noreply@yourdomain.com>). A bare hostname like <mysite.vercel.app> is not a valid mailbox. In Mailtrap, verify a sending domain and use an address on that domain. Mailtrap Live uses SMTP_USER=api and your Sending API token as SMTP_PASS.',
    };
  }

  try {
    const nodemailer = await import('nodemailer');
    // Mailtrap Email Sending / Live SMTP: host live.smtp.mailtrap.io, port 587, user "api", pass = API token.
    // Demo FROM (e.g. @demomailtrap.co) only sends to your Mailtrap account — verify your own domain for real users.
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      // Port 587 uses STARTTLS; requireTLS avoids silent failures on some hosts.
      ...(cfg.port === 587 && !cfg.secure ? { requireTLS: true } : {}),
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });

    await transporter.sendMail({
      from: cfg.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { ok: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown mailer error';
    return { ok: false, reason: msg };
  }
}

export async function sendVerificationEmail(to: string, verificationUrl: string): Promise<{ ok: boolean; reason?: string }> {
  const subject = 'Verify your account';
  const text = `Welcome! Verify your account by visiting this link:\n\n${verificationUrl}\n\nIf you did not create this account, ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <h2>Verify your account</h2>
      <p>Welcome! Click the button below to verify your email address.</p>
      <p>
        <a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    </div>
  `;
  return sendMail({ to, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<{ ok: boolean; reason?: string }> {
  const subject = 'Reset your password';
  const text = `Reset your password using this link:\n\n${resetUrl}\n\nThis link expires in 1 hour.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <h2>Reset your password</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
  `;
  return sendMail({ to, subject, html, text });
}
