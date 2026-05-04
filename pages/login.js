import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const S = {
  bg: '#060d1a', card: '#0a1628', border: '#0f2035', borderL: '#1a3554',
  text: '#b8ccdf', muted: '#4a7096', dim: '#2e4a63', white: '#ffffff',
  accent: '#3b82f6', green: '#00d28c',
}

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Error al iniciar sesión')
      const dest = router.query.next || (data.user.role === 'ADMIN' ? '/admin' : '/mi-cuenta')
      router.push(dest)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Iniciar sesión — Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${S.bg}; }
        input { outline: none; }
        input:focus { border-color: ${S.accent} !important; }
        .btn-p:hover { background: #2563eb !important; }
        .btn-p:disabled { opacity: 0.5; cursor: not-allowed; }
        a { color: ${S.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: S.bg, backgroundImage: 'radial-gradient(ellipse 60% 40% at 20% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: S.white }}>
              SIEMBRA<span style={{ color: S.accent }}> A FUTURO</span>
            </div>
            <div style={{ fontSize: '11px', color: S.dim, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: '4px' }}>Panel de usuario</div>
          </div>

          <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '14px', padding: '32px 28px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: S.white, marginBottom: '6px' }}>Iniciá sesión</div>
            <div style={{ fontSize: '13px', color: S.muted, marginBottom: '24px' }}>Ingresá con tu email y contraseña.</div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Email</label>
                <input
                  type="email" value={form.email} onChange={set('email')} required
                  placeholder="tu@email.com"
                  style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '8px', padding: '11px 14px', color: S.text, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Contraseña</label>
                <input
                  type="password" value={form.password} onChange={set('password')} required
                  placeholder="Tu contraseña"
                  style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '8px', padding: '11px 14px', color: S.text, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                />
              </div>
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <Link href="/olvide-password" style={{ fontSize: '12px', color: S.muted }}>¿Olvidaste tu contraseña?</Link>
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
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: S.muted }}>
              ¿No tenés cuenta? <Link href="/registro">Registrate gratis</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
