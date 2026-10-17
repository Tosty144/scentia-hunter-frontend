import { describe, it, expect, vi, afterEach } from 'vitest'
import { esenciasApi, inventarioApi, ventasApi, analisisApi } from '../services/api'

function simularFetch(cuerpo = {}, { ok = true, status = 200 } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(cuerpo),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function urlLlamada(fetchMock) {
  return fetchMock.mock.calls[0][0]
}

function opcionesLlamada(fetchMock) {
  return fetchMock.mock.calls[0][1]
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request (cliente base)', () => {
  it('envía el header JSON y devuelve el cuerpo de la respuesta', async () => {
    const fetchMock = simularFetch([{ nombre: 'Khamra' }])
    const data = await esenciasApi.listar()
    expect(data).toEqual([{ nombre: 'Khamra' }])
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias$/)
    expect(opcionesLlamada(fetchMock).headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('lanza el mensaje de error que envía el backend', async () => {
    simularFetch({ error: 'Esencia no encontrada' }, { ok: false, status: 404 })
    await expect(esenciasApi.obtener('e1')).rejects.toThrow('Esencia no encontrada')
  })

  it('lanza un mensaje genérico si la respuesta de error no trae JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('no es json')),
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(analisisApi.dashboard()).rejects.toThrow('Error 502 al llamar /api/dashboard')
  })

  it('devuelve null si una respuesta exitosa no trae JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject(new Error('vacío')) })
    )
    await expect(esenciasApi.listar()).resolves.toBeNull()
  })

  it('propaga el error si falla la red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
    await expect(esenciasApi.listar()).rejects.toThrow('Failed to fetch')
  })
})

describe('esenciasApi', () => {
  it('obtener pide una esencia por id', async () => {
    const fetchMock = simularFetch({})
    await esenciasApi.obtener('e1')
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/e1$/)
  })

  it('crear envía POST con el cuerpo en JSON', async () => {
    const fetchMock = simularFetch({})
    const payload = { nombre: 'Khamra', variantes: [] }
    await esenciasApi.crear(payload)
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'POST', body: JSON.stringify(payload) })
  })

  it('actualizar envía PUT', async () => {
    const fetchMock = simularFetch({})
    await esenciasApi.actualizar('e1', { nombre: 'Nuevo' })
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/e1$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'PUT', body: JSON.stringify({ nombre: 'Nuevo' }) })
  })

  it('eliminar envía DELETE', async () => {
    const fetchMock = simularFetch({})
    await esenciasApi.eliminar('e1')
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/e1$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'DELETE' })
  })

  it('agregarVariante envía POST a la ruta de variantes', async () => {
    const fetchMock = simularFetch({})
    await esenciasApi.agregarVariante('e1', { presentacion: '100ml' })
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/e1\/variantes$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'POST' })
  })

  it('actualizarVariante envía PUT a la variante indicada', async () => {
    const fetchMock = simularFetch({})
    await esenciasApi.actualizarVariante('e1', 'v1', { stock: 3 })
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/e1\/variantes\/v1$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'PUT', body: JSON.stringify({ stock: 3 }) })
  })

  it('probadores agrega el estado como query cuando se indica', async () => {
    const fetchMock = simularFetch([])
    await esenciasApi.probadores('disponibles')
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/probadores\?estado=disponibles$/)
  })

  it('probadores sin estado no agrega query', async () => {
    const fetchMock = simularFetch([])
    await esenciasApi.probadores()
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/esencias\/probadores$/)
  })
})

describe('inventarioApi', () => {
  const payload = { esenciaId: 'e1', varianteId: 'v1', cantidad: 2, motivo: 'compra' }

  it('registrarEntrada envía POST a /entradas', async () => {
    const fetchMock = simularFetch({})
    await inventarioApi.registrarEntrada(payload)
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/inventario\/entradas$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'POST', body: JSON.stringify(payload) })
  })

  it('registrarSalida envía POST a /salidas', async () => {
    const fetchMock = simularFetch({})
    await inventarioApi.registrarSalida(payload)
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/inventario\/salidas$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'POST' })
  })

  it.each([
    ['movimientos', /\/api\/inventario\/movimientos$/],
    ['bajoStock', /\/api\/inventario\/bajo-stock$/],
    ['inversion', /\/api\/inventario\/inversion$/],
  ])('%s consulta la ruta correcta', async (metodo, patron) => {
    const fetchMock = simularFetch({})
    await inventarioApi[metodo]()
    expect(urlLlamada(fetchMock)).toMatch(patron)
  })
})

describe('ventasApi', () => {
  it('registrar envía POST con la venta', async () => {
    const fetchMock = simularFetch({})
    const payload = { esenciaId: 'e1', varianteId: 'v1', cantidad: 1 }
    await ventasApi.registrar(payload)
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/ventas$/)
    expect(opcionesLlamada(fetchMock)).toMatchObject({ method: 'POST', body: JSON.stringify(payload) })
  })

  it('listar sin fechas no agrega query', async () => {
    const fetchMock = simularFetch([])
    await ventasApi.listar()
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/ventas$/)
  })

  it('listar agrega desde y hasta como query', async () => {
    const fetchMock = simularFetch([])
    await ventasApi.listar('2026-01-01', '2026-01-31')
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/ventas\?desde=2026-01-01&hasta=2026-01-31$/)
  })

  it('listar acepta solo una de las fechas', async () => {
    const fetchMock = simularFetch([])
    await ventasApi.listar(undefined, '2026-01-31')
    expect(urlLlamada(fetchMock)).toMatch(/\/api\/ventas\?hasta=2026-01-31$/)
  })
})

describe('analisisApi', () => {
  it.each([
    ['dashboard', /\/api\/dashboard$/],
    ['ranking', /\/api\/analisis\/ranking$/],
    ['sinMovimiento', /\/api\/analisis\/sin-movimiento$/],
    ['rentabilidad', /\/api\/analisis\/rentabilidad$/],
  ])('%s consulta la ruta correcta', async (metodo, patron) => {
    const fetchMock = simularFetch({})
    await analisisApi[metodo]()
    expect(urlLlamada(fetchMock)).toMatch(patron)
  })
})
