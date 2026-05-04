import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const S = {
  bg: '#060d1a', card: '#0a1628', border: '#0f2035', borderL: '#1a3554',
  text: '#b8ccdf', muted: '#4a7096', dim: '#2e4a63', white: '#ffffff',
  accent: '#3b82f6', green: '#00d28c', red: '#ef4444', yellow: '#f59e0b',
}

const typeLabel = { PRODUCT: 'Producto', PACK: 'Pack', COURSE: 'Curso', SUBSCRIPTION: 'Suscripción' }
const typeColor = { PRODUCT: S.accent, PACK: S.green, COURSE: S.yellow, SUBSCRIPTION: '#a78bfa' }

export default function MiCuenta() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('productos')
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })
  const [savingPass, setSavingPass] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/user/products').then((r) => r.json()),
    ]).then(([meData, prodData]) => {
      if (!meData.user) { router.push('/login?next=/mi-cuenta'); return }
      setUser(meData.user)
      setProducts(prodData.products || [])
    }).finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleChangePass = async (e) => {
    e.preventDefault()
    setPassMsg({ type: '', text: '' })
    if (passForm.newPassword !== passForm.confirm) return setPassMsg({ type: 'error', text: 'Las contraseñas no coinciden' })
    setSavingPass(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) return setPassMsg({ type: 'error', text: data.error })
      setPassMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' })
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch {
      setPassMsg({ type: 'error', text: 'Error de conexión.' })
    } finally {
      setSavingPass(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <>
      <Head>
        <title>Mi cuenta — Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${S.bg}; }
        input:focus { outline: none; border-color: ${S.accent} !important; }
        .tab-btn:hover { color: ${S.text} !important; }
        .prod-card:hover { border-color: ${S.accent} !important; transform: translateY(-2px); }
        .btn-outline:hover { background: rgba(59,130,246,0.1) !important; }
        a { color: ${S.accent}; text-decoration: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans', sans-serif", color: S.text }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${S.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 700, color: S.white }}>
            SIEMBRA<span style={{ color: S.accent }}> A FUTURO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ fontSize: '13px', color: S.muted }}>📊 MarketPulse</Link>
            <span style={{ fontSize: '13px', color: S.muted }}>Hola, <strong style={{ color: S.text }}>{user?.name}</strong></span>
            <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
              Salir
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

          {/* Greeting */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: S.white, marginBottom: '4px' }}>Mi cuenta 🌱</div>
            <div style={{ fontSize: '14px', color: S.muted }}>{user?.email}</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: `1px solid ${S.border}`, paddingBottom: '0' }}>
            {[
              { key: 'productos', label: 'Mis productos' },
              { key: 'seguridad', label: 'Seguridad' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="tab-btn"
                style={{
                  background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  color: tab === key ? S.accent : S.muted,
                  borderBottom: tab === key ? `2px solid ${S.accent}` : '2px solid transparent',
                  marginBottom: '-1px', transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Productos */}
          {tab === 'productos' && (
            <div>
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: S.muted }}>
                  <div style={{ fontSize: '40px', marginBottom: '14px', opacity: 0.5 }}>📦</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: S.muted }}>Todavía no tenés productos</div>
                  <div style={{ fontSize: '13px', color: S.dim, lineHeight: 1.7 }}>
                    Cuando adquieras un producto o pack de Siembra a Futuro,<br />aparecerá acá para que puedas acceder.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="prod-card"
                      style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '12px', padding: '22px', transition: 'all 0.2s', cursor: 'default' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: typeColor[p.type] || S.accent, background: `${typeColor[p.type] || S.accent}18`, padding: '3px 8px', borderRadius: '4px' }}>
                          {typeLabel[p.type] || p.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: S.white, marginBottom: '8px' }}>{p.name}</div>
                      {p.description && (
                        <div style={{ fontSize: '13px', color: S.muted, lineHeight: 1.6, marginBottom: '16px' }}>{p.description}</div>
                      )}
                      {p.accessUrl && (
                        <a
                          href={p.accessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: S.accent, color: S.white, padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Acceder →
                        </a>
                      )}
                      <div style={{ fontSize: '11px', color: S.dim, marginTop: '12px' }}>
                        Activo desde {new Date(p.purchasedAt).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Seguridad */}
          {tab === 'seguridad' && (
            <div style={{ maxWidth: '420px' }}>
              <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '12px', padding: '28px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: S.white, marginBottom: '20px' }}>Cambiar contraseña</div>
                <form onSubmit={handleChangePass}>
                  {[
                    { key: 'currentPassword', label: 'Contraseña actual', placeholder: 'Tu contraseña actual' },
                    { key: 'newPassword', label: 'Nueva contraseña', placeholder: 'Mínimo 8 caracteres' },
                    { key: 'confirm', label: 'Confirmá la nueva contraseña', placeholder: 'Repetí la nueva contraseña' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: S.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>
                      <input
                        type="password"
                        value={passForm[key]}
                        onChange={(e) => setPassForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required
                        style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '8px', padding: '11px 14px', color: S.text, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                      />
                    </div>
                  ))}
                  {passMsg.text && (
                    <div style={{ background: passMsg.type === 'ok' ? 'rgba(0,210,140,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${passMsg.type === 'ok' ? 'rgba(0,210,140,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: '8px', padding: '10px 14px', color: passMsg.type === 'ok' ? S.green : '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                      {passMsg.type === 'ok' ? '✓ ' : '⚠ '}{passMsg.text}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={savingPass}
                    style={{ background: S.accent, color: S.white, border: 'none', borderRadius: '8px', padding: '11px 22px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif', opacity: savingPass ? 0.6 : 1" }}
                  >
                    {savingPass ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
