import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const S = {
  bg: '#060d1a', card: '#0a1628', border: '#0f2035', borderL: '#1a3554',
  text: '#b8ccdf', muted: '#4a7096', dim: '#2e4a63', white: '#ffffff',
  accent: '#3b82f6', green: '#00d28c', red: '#ef4444', yellow: '#f59e0b',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(({ user: u }) => {
      if (!u || u.role !== 'ADMIN') { router.push('/login'); return }
      setUser(u)
      Promise.all([
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/admin/products').then((r) => r.json()),
      ]).then(([ud, pd]) => {
        setUsers(ud.users || [])
        setProducts(pd.products || [])
      }).finally(() => setLoading(false))
    })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted, fontFamily: "'DM Sans', sans-serif" }}>Cargando...</div>
  )

  const activeUsers = users.filter((u) => u.active).length
  const totalPurchases = users.reduce((acc, u) => acc + (u.products?.filter((p) => p.active).length || 0), 0)
  const activeProducts = products.filter((p) => p.active).length
  const recentUsers = [...users].slice(0, 5)

  const statCards = [
    { label: 'Usuarios activos', value: activeUsers, icon: '👥', color: S.accent },
    { label: 'Total registrados', value: users.length, icon: '📋', color: S.muted },
    { label: 'Productos habilitados', value: totalPurchases, icon: '📦', color: S.green },
    { label: 'Productos en catálogo', value: activeProducts, icon: '🏷️', color: S.yellow },
  ]

  return (
    <>
      <Head>
        <title>Admin — Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${S.bg}; }
        a { color: ${S.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .nav-link:hover { color: ${S.text} !important; }
        .stat-card:hover { border-color: #254d74 !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans', sans-serif", color: S.text }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${S.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 700, color: S.white }}>
              SIEMBRA<span style={{ color: S.accent }}> A FUTURO</span>
              <span style={{ fontSize: '10px', color: S.dim, marginLeft: '8px', background: '#0d1f33', padding: '2px 8px', borderRadius: '3px' }}>ADMIN</span>
            </div>
            <nav style={{ display: 'flex', gap: '4px' }}>
              <Link href="/admin" style={{ fontSize: '13px', fontWeight: 600, color: S.accent, padding: '5px 12px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)' }}>Dashboard</Link>
              <Link href="/admin/usuarios" className="nav-link" style={{ fontSize: '13px', color: S.muted, padding: '5px 12px', borderRadius: '6px' }}>Usuarios</Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ fontSize: '12px', color: S.dim }}>📊 MarketPulse</Link>
            <span style={{ fontSize: '13px', color: S.muted }}>{user?.name}</span>
            <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>Salir</button>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: S.white, marginBottom: '24px' }}>Dashboard</div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {statCards.map(({ label, value, icon, color }) => (
              <div key={label} className="stat-card" style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '10px', padding: '20px', transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '12px', color: S.muted }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Recent users */}
            <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '10px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: S.white }}>Últimos registros</div>
                <Link href="/admin/usuarios" style={{ fontSize: '12px' }}>Ver todos →</Link>
              </div>
              {recentUsers.length === 0 ? (
                <div style={{ fontSize: '13px', color: S.dim, textAlign: 'center', padding: '20px 0' }}>No hay usuarios aún</div>
              ) : recentUsers.map((u) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${S.border}` }}>
                  <div>
                    <div style={{ fontSize: '13px', color: S.text, fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: S.dim }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: u.active ? S.green : S.red }}>{u.active ? '●' : '●'}</span>
                    <span style={{ fontSize: '11px', color: S.dim }}>{new Date(u.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Products */}
            <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '10px', padding: '22px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: S.white, marginBottom: '16px' }}>Catálogo de productos</div>
              {products.length === 0 ? (
                <div style={{ fontSize: '13px', color: S.dim, textAlign: 'center', padding: '20px 0' }}>
                  No hay productos.<br />Creá el primero desde <Link href="/admin/usuarios">Usuarios</Link>.
                </div>
              ) : products.slice(0, 6).map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${S.border}` }}>
                  <div>
                    <div style={{ fontSize: '13px', color: S.text, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: S.dim, fontFamily: "'JetBrains Mono', monospace" }}>{p.slug}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: p.active ? S.green : S.red, fontWeight: 700 }}>
                    {p.active ? 'ACTIVO' : 'INACTIVO'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
