// Cliente central de la API — toda llamada HTTP al backend pasa por aquí.
// La URL base viene de la variable de entorno VITE_API_URL (ver .env.example).

const BASE_URL = import.meta.env.VITE_API_URL || 'https://scentia-hunter-backend-bgw1.vercel.app'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const mensaje = data?.error || `Error ${res.status} al llamar ${path}`
    throw new Error(mensaje)
  }

  return data
}

// — Esencias (HU01-HU05, HU13-HU15) —
export const esenciasApi = {
  listar: () => request('/api/esencias'),
  obtener: (id) => request(`/api/esencias/${id}`),
  crear: (payload) => request('/api/esencias', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar: (id, payload) => request(`/api/esencias/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  eliminar: (id) => request(`/api/esencias/${id}`, { method: 'DELETE' }),
  agregarVariante: (id, payload) =>
    request(`/api/esencias/${id}/variantes`, { method: 'POST', body: JSON.stringify(payload) }),
  actualizarVariante: (id, varianteId, payload) =>
    request(`/api/esencias/${id}/variantes/${varianteId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  probadores: (estado) => request(`/api/esencias/probadores${estado ? `?estado=${estado}` : ''}`),
}

// — Inventario (HU06-HU09) —
export const inventarioApi = {
  registrarEntrada: (payload) =>
    request('/api/inventario/entradas', { method: 'POST', body: JSON.stringify(payload) }),
  registrarSalida: (payload) =>
    request('/api/inventario/salidas', { method: 'POST', body: JSON.stringify(payload) }),
  movimientos: () => request('/api/inventario/movimientos'),
  bajoStock: () => request('/api/inventario/bajo-stock'),
  inversion: () => request('/api/inventario/inversion'),
}

// — Ventas (HU10-HU12) —
export const ventasApi = {
  registrar: (payload) => request('/api/ventas', { method: 'POST', body: JSON.stringify(payload) }),
  listar: (desde, hasta) => {
    const params = new URLSearchParams()
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    const query = params.toString()
    return request(`/api/ventas${query ? `?${query}` : ''}`)
  },
}

// — Dashboard y Análisis (HU16-HU19) —
export const analisisApi = {
  dashboard: () => request('/api/dashboard'),
  ranking: () => request('/api/analisis/ranking'),
  sinMovimiento: () => request('/api/analisis/sin-movimiento'),
  rentabilidad: () => request('/api/analisis/rentabilidad'),
}
