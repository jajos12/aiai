interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
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
  const cfg = getMailConfig();
  if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
    return { ok: false, reason: 'SMTP is not configured (missing SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM).' };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
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
