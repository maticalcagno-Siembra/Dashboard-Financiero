import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const S = {
  bg: '#060d1a', card: '#0a1628', border: '#0f2035', borderL: '#1a3554',
  text: '#b8ccdf', muted: '#4a7096', dim: '#2e4a63', white: '#ffffff',
  accent: '#3b82f6', green: '#00d28c',
}

export default function OlvidePassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Olvidé mi contraseña — Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${S.bg}; }
        input:focus { outline: none; border-color: ${S.accent} !important; }
        .btn-p:hover { background: #2563eb !important; }
        .btn-p:disabled { opacity: 0.5; cursor: not-allowed; }
        a { color: ${S.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: S.white }}>
              SIEMBRA<span style={{ color: S.accent }}> A FUTURO</span>
            </div>
          </div>

          <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '14px', padding: '32px 28px' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: S.white, marginBottom: '10px' }}>Revisá tu email</div>
                <div style={{ fontSize: '14px', color: S.muted, lineHeight: 1.7, marginBottom: '24px' }}>
                  Si existe una cuenta con ese email, te enviamos un enlace para restablecer tu contraseña. Puede tardar unos minutos.
                </div>
                <Link href="/login">← Volver al inicio de sesión</Link>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '22px', fontWeight: 700, color: S.white, marginBottom: '6px' }}>Olvidé mi contraseña 🔑</div>
                <div style={{ fontSize: '13px', color: S.muted, marginBottom: '24px', lineHeight: 1.6 }}>
                  Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Email</label>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      placeholder="tu@email.com"
                      style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '8px', padding: '11px 14px', color: S.text, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                    />
                  </div>
                  {error && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                      ⚠ {error}
                    </div>
                  )}
                  <button
                    type="submit" disabled={loading} className="btn-p"
                    style={{ width: '100%', background: S.accent, color: S.white, border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.18s' }}
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: S.muted }}>
                  <Link href="/login">← Volver al inicio de sesión</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
