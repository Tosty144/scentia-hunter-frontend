import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Analisis from '../pages/Analisis/Analisis'
import { analisisApi } from '../services/api'
import { cop } from './helpers/formato'

vi.mock('../services/api', () => ({
  analisisApi: { ranking: vi.fn(), rentabilidad: vi.fn(), sinMovimiento: vi.fn() },
}))
vi.mock('../components/ui/DataTable', () => import('./helpers/DataTable.mock.jsx'))
vi.mock('../components/ui/Badge', () => import('./helpers/Badge.mock.jsx'))
vi.mock('../components/ui/AsyncState', () => import('./helpers/AsyncState.mock.jsx'))

function prepararApi({ ranking = [], rentabilidad = [], sinMovimiento = [] } = {}) {
  analisisApi.ranking.mockResolvedValue(ranking)
  analisisApi.rentabilidad.mockResolvedValue(rentabilidad)
  analisisApi.sinMovimiento.mockResolvedValue(sinMovimiento)
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('Analisis', () => {
  it('muestra el estado de carga', () => {
    analisisApi.ranking.mockReturnValue(new Promise(() => {}))
    analisisApi.rentabilidad.mockReturnValue(new Promise(() => {}))
    analisisApi.sinMovimiento.mockReturnValue(new Promise(() => {}))
    render(<Analisis />)
    expect(screen.getByText('Calculando estadísticas…')).toBeInTheDocument()
  })

  it('muestra el ranking, la rentabilidad y las esencias sin movimiento', async () => {
    prepararApi({
      ranking: [{ nombreProducto: 'Dior Sauvage', nombreVariante: '100ml', cantidad: 7 }],
      rentabilidad: [{ producto: 'Khamra', variante: '30ml', ganancia: 45000 }],
      sinMovimiento: [{ nombre: 'Aventus', familia: 'Amaderada' }],
    })
    render(<Analisis />)

    expect(await screen.findByText('Ranking por unidades vendidas')).toBeInTheDocument()
    expect(screen.getByText('Dior Sauvage')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Khamra')).toBeInTheDocument()
    expect(screen.getByText(cop(45000))).toBeInTheDocument()
    expect(screen.getByText('Aventus')).toBeInTheDocument()
    expect(screen.getByText('Amaderada')).toBeInTheDocument()
    expect(screen.getByText('Sin ventas registradas')).toHaveAttribute('data-tone', 'danger')
  })

  it('muestra los mensajes de tabla vacía cuando no hay datos', async () => {
    prepararApi()
    render(<Analisis />)

    expect(await screen.findByText('Ranking por unidades vendidas')).toBeInTheDocument()
    expect(screen.getAllByText('Aún no hay ventas registradas.')).toHaveLength(2)
    expect(
      screen.getByText('Todas las esencias tuvieron ventas en el periodo seleccionado.')
    ).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', async () => {
    analisisApi.ranking.mockRejectedValueOnce(new Error('Error al obtener ranking'))
    analisisApi.rentabilidad.mockResolvedValue([])
    analisisApi.sinMovimiento.mockResolvedValue([])
    render(<Analisis />)

    expect(await screen.findByText('Error al obtener ranking')).toBeInTheDocument()

    analisisApi.ranking.mockResolvedValue([])
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Ranking por unidades vendidas')).toBeInTheDocument()
    expect(analisisApi.ranking).toHaveBeenCalledTimes(2)
  })
})
