import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const S = {
  bg: '#060d1a', card: '#0a1628', border: '#0f2035', borderL: '#1a3554',
  text: '#b8ccdf', muted: '#4a7096', dim: '#2e4a63', white: '#ffffff',
  accent: '#3b82f6', green: '#00d28c', red: '#ef4444', yellow: '#f59e0b',
}

const typeLabel = { PRODUCT: 'Producto', PACK: 'Pack', COURSE: 'Curso', SUBSCRIPTION: 'Suscripción' }

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontSize: '17px', fontWeight: 700, color: S.white }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: S.muted, fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: S.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '7px', padding: '10px 12px', color: S.text, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
        onFocus={(e) => e.target.style.borderColor = S.accent}
        onBlur={(e) => e.target.style.borderColor = S.border}
      />
    </div>
  )
}

export default function AdminUsuarios() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [modal, setModal] = useState(null) // 'view' | 'create' | 'product' | 'newproduct'
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Formulario nuevo usuario
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', role: 'USER' })
  // Formulario nuevo producto
  const [newProduct, setNewProduct] = useState({ name: '', slug: '', description: '', price: '', type: 'PRODUCT', accessUrl: '' })
  // Edición usuario
  const [editUser, setEditUser] = useState({ newPassword: '' })

  const loadData = useCallback(async () => {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    const [ud, pd] = await Promise.all([
      fetch(`/api/admin/users${q}`).then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ])
    setUsers(ud.users || [])
    setProducts(pd.products || [])
  }, [search])

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(({ user: u }) => {
      if (!u || u.role !== 'ADMIN') { router.push('/login'); return }
      setUser(u)
      loadData().finally(() => setLoading(false))
    })
  }, [router, loadData])

  const showMsg = (type, text, ms = 3000) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), ms)
  }

  const closeModal = () => { setModal(null); setSelectedUser(null); setMsg({ type: '', text: '' }) }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    const data = await res.json()
    if (!res.ok) return showMsg('error', data.error)
    setNewUser({ name: '', email: '', password: '', phone: '', role: 'USER' })
    await loadData()
    showMsg('ok', `Usuario "${data.user.name}" creado. Se envió email de bienvenida.`, 4000)
    closeModal()
  }

  const handleToggleActive = async (u) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active }),
    })
    await loadData()
  }

  const handleResetPassword = async (userId) => {
    if (!editUser.newPassword || editUser.newPassword.length < 8) return showMsg('error', 'La contraseña debe tener al menos 8 caracteres')
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: editUser.newPassword }),
    })
    if (!res.ok) return showMsg('error', 'Error al actualizar')
    setEditUser({ newPassword: '' })
    showMsg('ok', 'Contraseña actualizada')
  }

  const handleEnableProduct = async (userId, productId) => {
    const res = await fetch(`/api/admin/users/${userId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    if (!res.ok) return showMsg('error', 'Error al habilitar producto')
    await loadData()
    // Refresh selected user
    const u = users.find((u) => u.id === userId)
    if (u) setSelectedUser(await fetch(`/api/admin/users/${userId}`).then((r) => r.json()).then((d) => d.user))
    showMsg('ok', 'Producto habilitado')
  }

  const handleDisableProduct = async (userId, productId) => {
    await fetch(`/api/admin/users/${userId}/products`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    await loadData()
    const updated = await fetch(`/api/admin/users/${userId}`).then((r) => r.json()).then((d) => d.user)
    setSelectedUser(updated)
    showMsg('ok', 'Producto deshabilitado')
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price) || 0 }),
    })
    const data = await res.json()
    if (!res.ok) return showMsg('error', data.error)
    setNewProduct({ name: '', slug: '', description: '', price: '', type: 'PRODUCT', accessUrl: '' })
    await loadData()
    showMsg('ok', `Producto "${data.product.name}" creado`)
    closeModal()
  }

  const handleViewUser = async (u) => {
    const data = await fetch(`/api/admin/users/${u.id}`).then((r) => r.json())
    setSelectedUser(data.user)
    setModal('view')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted, fontFamily: "'DM Sans', sans-serif" }}>Cargando...</div>
  )

  const filteredUsers = users

  return (
    <>
      <Head>
        <title>Usuarios — Admin · Siembra a Futuro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${S.bg}; }
        a { color: ${S.accent}; text-decoration: none; }
        tr:hover td { background: #0c1e32; }
        .btn-sm:hover { opacity: 0.85; }
        .btn-sm:active { transform: scale(0.97); }
      `}</style>

      {/* Global message toast */}
      {msg.text && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 200, background: msg.type === 'ok' ? 'rgba(0,210,140,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${msg.type === 'ok' ? 'rgba(0,210,140,0.3)' : 'rgba(239,68,68,0.3)'}`, color: msg.type === 'ok' ? S.green : '#f87171', padding: '12px 18px', borderRadius: '8px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", maxWidth: '320px' }}>
          {msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}
        </div>
      )}

      <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans', sans-serif", color: S.text }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${S.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 700, color: S.white }}>
              SIEMBRA<span style={{ color: S.accent }}> A FUTURO</span>
              <span style={{ fontSize: '10px', color: S.dim, marginLeft: '8px', background: '#0d1f33', padding: '2px 8px', borderRadius: '3px' }}>ADMIN</span>
            </div>
            <nav style={{ display: 'flex', gap: '4px' }}>
              <Link href="/admin" style={{ fontSize: '13px', color: S.muted, padding: '5px 12px', borderRadius: '6px' }}>Dashboard</Link>
              <Link href="/admin/usuarios" style={{ fontSize: '13px', fontWeight: 600, color: S.accent, padding: '5px 12px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)' }}>Usuarios</Link>
            </nav>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.muted, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>Salir</button>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: S.white }}>Usuarios ({users.length})</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Buscar por nombre o email..."
                style={{ background: '#071020', border: `1px solid ${S.border}`, borderRadius: '7px', padding: '9px 14px', color: S.text, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", width: '240px', outline: 'none' }}
              />
              <button
                onClick={() => setModal('newproduct')}
                style={{ background: '#0a1628', border: `1px solid ${S.borderL}`, color: S.muted, padding: '9px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}
              >
                + Producto
              </button>
              <button
                onClick={() => setModal('create')}
                style={{ background: S.accent, border: 'none', color: S.white, padding: '9px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}
              >
                + Usuario
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: S.card, border: `1px solid ${S.borderL}`, borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                    {['Nombre', 'Email', 'Rol', 'Productos', 'Estado', 'Registro', 'Acciones'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: '10px', letterSpacing: '0.12em', color: S.dim, fontWeight: 400, textTransform: 'uppercase', textAlign: 'left', fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: S.dim, fontSize: '13px' }}>No hay usuarios</td></tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ padding: '10px 14px', fontSize: '13px', borderBottom: `1px solid ${S.border}`, color: S.text, fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', borderBottom: `1px solid ${S.border}`, color: S.muted, fontFamily: "'JetBrains Mono', monospace" }}>{u.email}</td>
                      <td style={{ padding: '10px 14px', fontSize: '10px', borderBottom: `1px solid ${S.border}` }}>
                        <span style={{ padding: '2px 8px', borderRadius: '3px', fontWeight: 700, letterSpacing: '0.06em', background: u.role === 'ADMIN' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.08)', color: u.role === 'ADMIN' ? S.yellow : S.accent }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', borderBottom: `1px solid ${S.border}`, color: S.muted }}>
                        {u.products?.filter((p) => p.active).length || 0}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', borderBottom: `1px solid ${S.border}` }}>
                        <span style={{ color: u.active ? S.green : S.red, fontWeight: 600 }}>{u.active ? '● Activo' : '● Inactivo'}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '11px', borderBottom: `1px solid ${S.border}`, color: S.dim, fontFamily: "'JetBrains Mono', monospace" }}>
                        {new Date(u.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${S.border}` }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-sm" onClick={() => handleViewUser(u)} style={{ background: 'rgba(59,130,246,0.1)', border: 'none', color: S.accent, padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                            Ver
                          </button>
                          <button className="btn-sm" onClick={() => handleToggleActive(u)} style={{ background: u.active ? 'rgba(239,68,68,0.1)' : 'rgba(0,210,140,0.1)', border: 'none', color: u.active ? S.red : S.green, padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                            {u.active ? 'Deshabilitar' : 'Habilitar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Ver usuario */}
      {modal === 'view' && selectedUser && (
        <Modal title={`Usuario: ${selectedUser.name}`} onClose={closeModal}>
          <div style={{ fontSize: '13px', color: S.muted, marginBottom: '20px', lineHeight: 1.8 }}>
            <div><strong style={{ color: S.text }}>Email:</strong> {selectedUser.email}</div>
            {selectedUser.phone && <div><strong style={{ color: S.text }}>Teléfono:</strong> {selectedUser.phone}</div>}
            <div><strong style={{ color: S.text }}>Rol:</strong> {selectedUser.role}</div>
            <div><strong style={{ color: S.text }}>Estado:</strong> <span style={{ color: selectedUser.active ? S.green : S.red }}>{selectedUser.active ? 'Activo' : 'Inactivo'}</span></div>
          </div>

          {/* Productos habilitados */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: S.white, marginBottom: '12px' }}>Productos habilitados</div>
            {selectedUser.products?.filter((p) => p.active).length === 0 ? (
              <div style={{ fontSize: '12px', color: S.dim, marginBottom: '12px' }}>Ninguno todavía.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {selectedUser.products.filter((p) => p.active).map((up) => (
                  <div key={up.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#071020', borderRadius: '6px', padding: '8px 12px' }}>
                    <span style={{ fontSize: '13px', color: S.text }}>{up.product.name}</span>
                    <button onClick={() => handleDisableProduct(selectedUser.id, up.productId)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: S.red, padding: '3px 9px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Habilitar producto */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: S.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Habilitar producto</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {products.filter((p) => p.active && !selectedUser.products?.find((up) => up.productId === p.id && up.active)).map((p) => (
                <button key={p.id} onClick={() => handleEnableProduct(selectedUser.id, p.id)} style={{ background: 'rgba(0,210,140,0.08)', border: '1px solid rgba(0,210,140,0.2)', color: S.green, padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                  + {p.name}
                </button>
              ))}
              {products.filter((p) => p.active && !selectedUser.products?.find((up) => up.productId === p.id && up.active)).length === 0 && (
                <div style={{ fontSize: '12px', color: S.dim }}>Todos los productos ya están habilitados o no hay productos en catálogo.</div>
              )}
            </div>
          </div>

          {msg.text && (
            <div style={{ background: msg.type === 'ok' ? 'rgba(0,210,140,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msg.type === 'ok' ? 'rgba(0,210,140,0.25)' : 'rgba(239,68,68,0.25)'}`, color: msg.type === 'ok' ? S.green : '#f87171', padding: '8px 12px', borderRadius: '7px', fontSize: '12px', marginBottom: '16px' }}>
              {msg.text}
            </div>
          )}

          {/* Reset password */}
          <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: S.white, marginBottom: '10px' }}>Restablecer contraseña</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={editUser.newPassword}
                onChange={(e) => setEditUser({ newPassword: e.target.value })}
                placeholder="Nueva contraseña (mín. 8 car.)"
                style={{ flex: 1, background: '#071020', border: `1px solid ${S.border}`, borderRadius: '7px', padding: '9px 12px', color: S.text, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
              />
              <button onClick={() => handleResetPassword(selectedUser.id)} style={{ background: S.accent, border: 'none', color: S.white, padding: '9px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Crear usuario */}
      {modal === 'create' && (
        <Modal title="Crear usuario" onClose={closeModal}>
          <form onSubmit={handleCreateUser}>
            <InputField label="Nombre completo" value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del usuario" required />
            <InputField label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" required />
            <InputField label="Contraseña inicial" type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} placeholder="Mínimo 8 caracteres" required />
            <InputField label="Teléfono (opcional)" type="tel" value={newUser.phone} onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))} placeholder="+54 9 11..." />
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: S.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Rol</label>
              <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))} style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '7px', padding: '10px 12px', color: S.text, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}>
                <option value="USER">Usuario</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {msg.text && <div style={{ color: msg.type === 'ok' ? S.green : '#f87171', fontSize: '12px', marginBottom: '12px' }}>{msg.text}</div>}
            <button type="submit" style={{ width: '100%', background: S.accent, color: S.white, border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Crear y enviar bienvenida
            </button>
          </form>
        </Modal>
      )}

      {/* Modal: Crear producto */}
      {modal === 'newproduct' && (
        <Modal title="Nuevo producto" onClose={closeModal}>
          <form onSubmit={handleCreateProduct}>
            <InputField label="Nombre" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del producto" required />
            <InputField label="Slug (identificador único)" value={newProduct.slug} onChange={(e) => setNewProduct((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="mi-producto" required />
            <InputField label="Descripción" value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} placeholder="Descripción breve..." />
            <InputField label="Precio (USD)" type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} placeholder="0.00" required />
            <InputField label="URL de acceso (link al contenido)" value={newProduct.accessUrl} onChange={(e) => setNewProduct((p) => ({ ...p, accessUrl: e.target.value }))} placeholder="https://..." />
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: S.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Tipo</label>
              <select value={newProduct.type} onChange={(e) => setNewProduct((p) => ({ ...p, type: e.target.value }))} style={{ width: '100%', background: '#071020', border: `1px solid ${S.border}`, borderRadius: '7px', padding: '10px 12px', color: S.text, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}>
                <option value="PRODUCT">Producto</option>
                <option value="PACK">Pack</option>
                <option value="COURSE">Curso</option>
                <option value="SUBSCRIPTION">Suscripción</option>
              </select>
            </div>
            {msg.text && <div style={{ color: msg.type === 'ok' ? S.green : '#f87171', fontSize: '12px', marginBottom: '12px' }}>{msg.text}</div>}
            <button type="submit" style={{ width: '100%', background: S.accent, color: S.white, border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Crear producto
            </button>
          </form>
        </Modal>
      )}
    </>
  )
}
