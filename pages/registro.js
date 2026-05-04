import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const S = {
  bg: '#060d1a',
  card: '#0a1628',
  border: '#0f2035',
  borderL: '#1a3554',
  text: '#b8ccdf',
  muted: '#4a7096',
  dim: '#2e4a63',
  white: '#ffffff',
  accent: '#3b82f6',
  green: '#00d28c',
  red: '#ef4444',
}

export default function Registro() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Error al crear la cuenta')
      router.push('/mi-cuenta')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Crear cuenta — Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${S.bg}; }
        input { outline: none; }
        input:focus { border-color: ${S.accent} !important; }
        .btn-primary:hover { background: #2563eb !important; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        a { color: ${S.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: S.bg, backgroundImage: 'radial-gradient(ellipse 60% 40% at 20% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: S.white, letterSpacing: '-0.01em' }}>
              SIEMBRA<span style={{ color: S.accent }}> A FUTURO</span>
            </div>
            <div style={{ fontSize: '11px', color: S.dim, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: '4px' }}>Creá tu cuenta</div>
          </div>

          {/* Card */}
          <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '14px', padding: '32px 28px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: S.white, marginBottom: '6px' }}>Bienvenido/a 🌱</div>
            <div style={{ fontSize: '13px', color: S.muted, marginBottom: '24px', lineHeight: 1.6 }}>
              Completá tus datos para empezar a sembrar.
            </div>

            <form onSubmit={handleSubmit}>
              {[
                { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', required: true },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', required: true },
                { key: 'phone', label: 'Teléfono (opcional)', type: 'tel', placeholder: '+54 9 11 1234-5678', required: false },
                { key: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 8 caracteres', required: true },
                { key: 'confirm', label: 'Confirmá tu contraseña', type: 'password', placeholder: 'Repetí la contraseña', required: true },
              ].map(({ key, label, type, placeholder, required }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    required={required}
                    style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '8px', padding: '11px 14px', color: S.text, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                  />
                </div>
              ))}

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', background: S.accent, color: S.white, border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s', marginTop: '4px' }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: S.muted }}>
              ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
