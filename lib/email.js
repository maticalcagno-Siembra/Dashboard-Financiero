import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const baseStyle = `
  body { margin:0; padding:0; background:#060d1a; font-family:Arial,Helvetica,sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:40px 20px; }
  .logo { font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.01em; margin-bottom:32px; }
  .logo span { color:#3b82f6; }
  .card { background:#0a1628; border:1px solid #1a3554; border-radius:12px; padding:32px; }
  .title { font-size:22px; font-weight:700; color:#ffffff; margin:0 0 12px; }
  .text { font-size:15px; line-height:1.75; color:#6e8fa8; margin:0 0 16px; }
  .highlight { color:#c0d4e8; font-weight:600; }
  .btn { display:inline-block; background:#3b82f6; color:#ffffff !important; text-decoration:none; padding:13px 28px; border-radius:8px; font-weight:700; font-size:14px; margin:8px 0 20px; }
  .divider { border:none; border-top:1px solid #0f2035; margin:24px 0; }
  .footer { font-size:11px; color:#2e4a63; text-align:center; margin-top:24px; line-height:1.6; }
  .icon { font-size:36px; margin-bottom:18px; display:block; }
`

export async function sendWelcomeEmail(to, name) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com'
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyle}</style></head>
<body><div class="wrap">
  <div class="logo">SIEMBRA<span> A FUTURO</span></div>
  <div class="card">
    <span class="icon">🌱</span>
    <h1 class="title">Bienvenido/a, ${escapeHtml(name)}</h1>
    <p class="text">Tu cuenta fue creada exitosamente. <span class="highlight">Prepárate para sembrar las bases que te ayudarán a cosechar lo mejor mañana.</span></p>
    <p class="text">En Siembra a Futuro acompañamos cada paso de tu camino hacia la libertad financiera. Acá vas a encontrar todo lo que necesitás para tomar mejores decisiones hoy.</p>
    <a href="${appUrl}/login" class="btn">Ir a mi cuenta →</a>
    <hr class="divider">
    <p class="text" style="font-size:13px;margin:0;">Si tenés alguna duda, respondé este email y te ayudamos.</p>
  </div>
  <p class="footer">Siembra a Futuro · Este email fue enviado porque creaste una cuenta.<br>Si no fuiste vos, podés ignorar este mensaje.</p>
</div></body></html>`

  await createTransporter().sendMail({
    from: `"Siembra a Futuro" <${process.env.SMTP_FROM}>`,
    to,
    subject: '🌱 Bienvenido/a a Siembra a Futuro',
    html,
  })
}

export async function sendPasswordResetEmail(to, name, resetToken) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com'
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyle}</style></head>
<body><div class="wrap">
  <div class="logo">SIEMBRA<span> A FUTURO</span></div>
  <div class="card">
    <span class="icon">🔑</span>
    <h1 class="title">Restablecé tu contraseña</h1>
    <p class="text">Hola <span class="highlight">${escapeHtml(name)}</span>, recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
    <p class="text">Hacé clic en el botón para crear una nueva contraseña. Este enlace expira en <span class="highlight">1 hora</span>.</p>
    <a href="${resetUrl}" class="btn">Restablecer contraseña →</a>
    <hr class="divider">
    <p class="text" style="font-size:13px;margin:0;">Si no solicitaste este cambio, ignorá este email. Tu contraseña actual no cambiará.</p>
  </div>
  <p class="footer">Siembra a Futuro · Este enlace expira en 1 hora.</p>
</div></body></html>`

  await createTransporter().sendMail({
    from: `"Siembra a Futuro" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Restablecer contraseña — Siembra a Futuro',
    html,
  })
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
