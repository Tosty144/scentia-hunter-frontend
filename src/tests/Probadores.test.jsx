import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Probadores from '../pages/Probadores/Probadores'
import { esenciasApi } from '../services/api'

vi.mock('../services/api', () => ({ esenciasApi: { probadores: vi.fn() } }))
vi.mock('../components/ui/Badge', () => import('./helpers/Badge.mock.jsx'))
vi.mock('../components/ui/AsyncState', () => import('./helpers/AsyncState.mock.jsx'))

const esencias = [
  { _id: 'e1', nombre: 'Dior Sauvage', familia: 'Amaderada', probador: true },
  { _id: 'e2', nombre: 'Khamra', familia: 'Oriental', probador: false },
]

beforeEach(() => {
  vi.resetAllMocks()
})

describe('Probadores', () => {
  it('muestra el estado de carga', () => {
    esenciasApi.probadores.mockReturnValue(new Promise(() => {}))
    render(<Probadores />)
    expect(screen.getByText('Cargando probadores…')).toBeInTheDocument()
  })

  it('carga todas las esencias al abrir, sin filtro', async () => {
    esenciasApi.probadores.mockResolvedValue(esencias)
    render(<Probadores />)

    expect(await screen.findByText('Dior Sauvage')).toBeInTheDocument()
    expect(esenciasApi.probadores).toHaveBeenCalledWith(undefined)
    expect(screen.getByText('Khamra')).toBeInTheDocument()
    expect(screen.getByText('Amaderada')).toBeInTheDocument()
  })

  it('distingue las esencias con y sin probador', async () => {
    esenciasApi.probadores.mockResolvedValue(esencias)
    render(<Probadores />)

    expect(await screen.findByText('Probador disponible')).toHaveAttribute('data-tone', 'gold')
    expect(screen.getByText('Falta probador')).toHaveAttribute('data-tone', 'danger')
  })

  it('el filtro "Disponibles" consulta con el estado disponibles', async () => {
    esenciasApi.probadores.mockResolvedValue(esencias)
    render(<Probadores />)
    await screen.findByText('Dior Sauvage')

    fireEvent.click(screen.getByRole('button', { name: 'Disponibles' }))

    await waitFor(() => expect(esenciasApi.probadores).toHaveBeenLastCalledWith('disponibles'))
    expect(screen.getByRole('button', { name: 'Disponibles' }).className).toContain('sh-testers__chip--active')
    expect(screen.getByRole('button', { name: 'Todos' }).className).not.toContain('sh-testers__chip--active')
  })

  it('el filtro "Sin probador" consulta con el estado faltantes', async () => {
    esenciasApi.probadores.mockResolvedValue(esencias)
    render(<Probadores />)
    await screen.findByText('Dior Sauvage')

    fireEvent.click(screen.getByRole('button', { name: 'Sin probador' }))

    await waitFor(() => expect(esenciasApi.probadores).toHaveBeenLastCalledWith('faltantes'))
  })

  it('avisa cuando el filtro no tiene esencias', async () => {
    esenciasApi.probadores.mockResolvedValue([])
    render(<Probadores />)
    expect(await screen.findByText('No hay esencias en este filtro.')).toBeInTheDocument()
  })

  it('muestra el error y reintenta con el filtro actual', async () => {
    esenciasApi.probadores
      .mockRejectedValueOnce(new Error('Error al obtener probadores'))
      .mockResolvedValueOnce(esencias)
    render(<Probadores />)

    expect(await screen.findByText('Error al obtener probadores')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Dior Sauvage')).toBeInTheDocument()
    expect(esenciasApi.probadores).toHaveBeenCalledTimes(2)
  })
})
