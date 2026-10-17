import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../pages/Dashboard/Dashboard'
import { analisisApi } from '../services/api'
import { cop } from './helpers/formato'

vi.mock('../services/api', () => ({ analisisApi: { dashboard: vi.fn() } }))
vi.mock('../components/ui/DataTable', () => import('./helpers/DataTable.mock.jsx'))
vi.mock('../components/ui/StatCard', () => import('./helpers/StatCard.mock.jsx'))
vi.mock('../components/ui/Badge', () => import('./helpers/Badge.mock.jsx'))
vi.mock('../components/ui/AsyncState', () => import('./helpers/AsyncState.mock.jsx'))

const datos = {
  inventarioDisponible: 12,
  inversionTotal: 490000,
  ingresoTotal: 380000,
  gananciaTotal: 150000,
  totalVentas: 1,
  masVendidos: [{ producto: 'Dior Sauvage', variante: '100ml', cantidad: 2, ganancia: 100000 }],
  bajoStock: [
    { esencia: 'Dior Sauvage', tipo: 'Original', presentacion: '100ml', stock: 0 },
    { esencia: 'Khamra', tipo: 'Genérico', presentacion: '100ml', stock: 2 },
  ],
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('Dashboard', () => {
  it('muestra el estado de carga mientras espera al servidor', () => {
    analisisApi.dashboard.mockReturnValue(new Promise(() => {}))
    render(<Dashboard />)
    expect(screen.getByText('Cargando indicadores…')).toBeInTheDocument()
  })

  it('muestra los indicadores principales', async () => {
    analisisApi.dashboard.mockResolvedValue(datos)
    render(<Dashboard />)

    expect(await screen.findByText('Inventario disponible')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('unidades')).toBeInTheDocument()
    expect(screen.getByText(cop(490000))).toBeInTheDocument()
    expect(screen.getByText(cop(380000))).toBeInTheDocument()
    expect(screen.getByText(cop(150000))).toBeInTheDocument()
    expect(screen.getByText('1 ventas registradas')).toBeInTheDocument()
    expect(screen.getByText('Margen 39%')).toBeInTheDocument()
  })

  it('lista los productos más vendidos con su ganancia', async () => {
    analisisApi.dashboard.mockResolvedValue(datos)
    render(<Dashboard />)

    expect(await screen.findByText('Productos más vendidos')).toBeInTheDocument()
    expect(screen.getAllByText('Dior Sauvage').length).toBeGreaterThan(0)
    expect(screen.getByText(cop(100000))).toBeInTheDocument()
  })

  it('marca como agotado el stock en cero y muestra las unidades del resto', async () => {
    analisisApi.dashboard.mockResolvedValue(datos)
    render(<Dashboard />)

    const agotado = await screen.findByText('Agotado')
    expect(agotado).toHaveAttribute('data-tone', 'danger')
    expect(screen.getByText('2 und.')).toHaveAttribute('data-tone', 'gold')
    expect(screen.getByText('Original · 100ml')).toBeInTheDocument()
    expect(screen.getByText('Genérico · 100ml')).toBeInTheDocument()
  })

  it('sin ventas muestra los mensajes de tabla vacía y "Sin ventas aún"', async () => {
    analisisApi.dashboard.mockResolvedValue({
      ...datos,
      ingresoTotal: 0,
      gananciaTotal: 0,
      totalVentas: 0,
      masVendidos: [],
      bajoStock: [],
    })
    render(<Dashboard />)

    expect(await screen.findByText('Sin ventas aún')).toBeInTheDocument()
    expect(screen.getByText('Aún no hay ventas registradas.')).toBeInTheDocument()
    expect(screen.getByText('Ningún producto está por debajo del umbral de stock.')).toBeInTheDocument()
  })

  it('muestra el error del servidor y permite reintentar', async () => {
    analisisApi.dashboard
      .mockRejectedValueOnce(new Error('Error al obtener dashboard'))
      .mockResolvedValueOnce(datos)
    render(<Dashboard />)

    expect(await screen.findByText('Error al obtener dashboard')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Inventario disponible')).toBeInTheDocument()
    expect(screen.queryByText('Error al obtener dashboard')).not.toBeInTheDocument()
    expect(analisisApi.dashboard).toHaveBeenCalledTimes(2)
  })
})
