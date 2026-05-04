import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-THIS-IN-PRODUCTION'
const COOKIE_NAME = 'sf_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
  )
}

export function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  )
}

export function getTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

export function requireAuth(handler) {
  return async (req, res) => {
    const token = getTokenFromRequest(req)
    if (!token) return res.status(401).json({ error: 'No autenticado' })
    const user = verifyToken(token)
    if (!user) return res.status(401).json({ error: 'Sesión expirada' })
    req.user = user
    return handler(req, res)
  }
}

export function requireAdmin(handler) {
  return async (req, res) => {
    const token = getTokenFromRequest(req)
    if (!token) return res.status(401).json({ error: 'No autenticado' })
    const user = verifyToken(token)
    if (!user) return res.status(401).json({ error: 'Sesión expirada' })
    if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Acceso denegado' })
    req.user = user
    return handler(req, res)
  }
}
