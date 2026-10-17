import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Inventario from '../pages/Inventario/Inventario'
import { esenciasApi, inventarioApi } from '../services/api'
import { cop, fecha } from './helpers/formato'

vi.mock('../services/api', () => ({
  esenciasApi: { listar: vi.fn() },
  inventarioApi: {
    movimientos: vi.fn(),
    inversion: vi.fn(),
    bajoStock: vi.fn(),
    registrarEntrada: vi.fn(),
    registrarSalida: vi.fn(),
  },
}))
vi.mock('../components/ui/DataTable', () => import('./helpers/DataTable.mock.jsx'))
vi.mock('../components/ui/StatCard', () => import('./helpers/StatCard.mock.jsx'))
vi.mock('../components/ui/Badge', () => import('./helpers/Badge.mock.jsx'))
vi.mock('../components/ui/AsyncState', () => import('./helpers/AsyncState.mock.jsx'))

const catalogo = [
  {
    _id: 'e1',
    nombre: 'Dior Sauvage',
    variantes: [
      { _id: 'v1', tipo: 'Original', presentacion: '100ml', stock: 0 },
      { _id: 'v2', tipo: 'Genérico', presentacion: '30ml', stock: 10 },
    ],
  },
  {
    _id: 'e2',
    nombre: 'Khamra',
    variantes: [{ _id: 'v4', tipo: 'Genérico', presentacion: '100ml', stock: 7 }],
  },
]

const movimientos = [
  {
    fecha: '2026-10-01T12:00:00.000Z',
    tipo: 'entrada',
    nombreProducto: 'Khamra',
    nombreVariante: 'Genérico 100ml',
    cantidad: 5,
    motivo: 'Compra a proveedor',
  },
  {
    fecha: '2026-10-02T12:00:00.000Z',
    tipo: 'salida',
    nombreProducto: 'Dior Sauvage',
    nombreVariante: 'Original 100ml',
    cantidad: 2,
    motivo: 'Pérdida o daño',
  },
]

function prepararApi({ esencias = catalogo, alertas = [{}, {}] } = {}) {
  esenciasApi.listar.mockResolvedValue(esencias)
  inventarioApi.movimientos.mockResolvedValue(movimientos)
  inventarioApi.inversion.mockResolvedValue({ unidadesTotales: 17, inversionTotal: 490000 })
  inventarioApi.bajoStock.mockResolvedValue({ alertas })
}

async function cargarPagina() {
  render(<Inventario />)
  await screen.findByText('Unidades en stock')
}

beforeEach(() => {
  vi.resetAllMocks()
  prepararApi()
})

describe('Inventario: resumen y movimientos', () => {
  it('muestra el estado de carga', () => {
    esenciasApi.listar.mockReturnValue(new Promise(() => {}))
    render(<Inventario />)
    expect(screen.getByText('Cargando inventario…')).toBeInTheDocument()
  })

  it('muestra unidades, inversión y variantes en bajo stock', async () => {
    await cargarPagina()

    expect(screen.getByText('17')).toBeInTheDocument()
    expect(screen.getByText(cop(490000))).toBeInTheDocument()
    expect(screen.getByText('Variantes en bajo stock')).toBeInTheDocument()
    expect(screen.getByText('Revisar reposición')).toHaveAttribute('data-tone', 'down')
  })

  it('indica que todo está en orden si no hay alertas', async () => {
    prepararApi({ alertas: [] })
    await cargarPagina()

    expect(screen.getByText('Todo en orden')).toHaveAttribute('data-tone', 'up')
  })

  it('lista los movimientos con su tipo, fecha y motivo', async () => {
    await cargarPagina()

    expect(screen.getByText('Entrada')).toHaveAttribute('data-tone', 'success')
    expect(screen.getByText('Salida')).toHaveAttribute('data-tone', 'danger')
    expect(screen.getByText(fecha('2026-10-01T12:00:00.000Z'))).toBeInTheDocument()
    expect(screen.getByText('Genérico 100ml')).toBeInTheDocument()
    expect(screen.getByText('Pérdida o daño')).toBeInTheDocument()
  })

  it('muestra el mensaje de tabla vacía sin movimientos', async () => {
    inventarioApi.movimientos.mockResolvedValue([])
    await cargarPagina()

    expect(screen.getByText('Aún no hay movimientos registrados.')).toBeInTheDocument()
  })

  it('muestra el error de carga y permite reintentar', async () => {
    inventarioApi.inversion.mockRejectedValueOnce(new Error('Error al calcular inversión'))
    render(<Inventario />)

    expect(await screen.findByText('Error al calcular inversión')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Unidades en stock')).toBeInTheDocument()
    expect(esenciasApi.listar).toHaveBeenCalledTimes(2)
  })
})

describe('Inventario: formulario de movimientos', () => {
  it('abre y cierra el formulario de entrada con el mismo botón', async () => {
    await cargarPagina()

    fireEvent.click(screen.getByText('↑ Registrar entrada'))
    expect(screen.getByRole('heading', { name: 'Registrar entrada' })).toBeInTheDocument()

    fireEvent.click(screen.getByText('↑ Registrar entrada'))
    expect(screen.queryByRole('heading', { name: 'Registrar entrada' })).not.toBeInTheDocument()
  })

  it('propone un motivo distinto para la entrada y para la salida', async () => {
    await cargarPagina()

    fireEvent.click(screen.getByText('↑ Registrar entrada'))
    expect(screen.getByDisplayValue('Compra a proveedor')).toBeInTheDocument()

    fireEvent.click(screen.getByText('↑ Registrar entrada')) // cerrar
    fireEvent.click(screen.getByText('↓ Registrar salida'))
    expect(screen.getByRole('heading', { name: 'Registrar salida' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pérdida o daño')).toBeInTheDocument()
  })

  it('cambia el título al pasar de entrada a salida sin cerrar el formulario', async () => {
    await cargarPagina()

    fireEvent.click(screen.getByText('↑ Registrar entrada'))
    fireEvent.click(screen.getByText('↓ Registrar salida'))

    expect(screen.getByRole('heading', { name: 'Registrar salida' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Registrar entrada' })).not.toBeInTheDocument()
  })

  it('no muestra el formulario si no hay esencias', async () => {
    prepararApi({ esencias: [] })
    await cargarPagina()

    fireEvent.click(screen.getByText('↑ Registrar entrada'))
    expect(screen.queryByRole('heading', { name: 'Registrar entrada' })).not.toBeInTheDocument()
  })

  it('el botón Cancelar cierra el formulario', async () => {
    await cargarPagina()
    fireEvent.click(screen.getByText('↑ Registrar entrada'))

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('heading', { name: 'Registrar entrada' })).not.toBeInTheDocument()
  })

  it('registra una entrada con la cantidad y el motivo indicados', async () => {
    inventarioApi.registrarEntrada.mockResolvedValue({})
    await cargarPagina()
    fireEvent.click(screen.getByText('↑ Registrar entrada'))

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } })
    fireEvent.change(screen.getByDisplayValue('Compra a proveedor'), { target: { value: 'Reposición' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(inventarioApi.registrarEntrada).toHaveBeenCalledTimes(1))
    expect(inventarioApi.registrarEntrada).toHaveBeenCalledWith({
      esenciaId: 'e1',
      varianteId: 'v1',
      cantidad: 5,
      motivo: 'Reposición',
    })
    expect(inventarioApi.registrarSalida).not.toHaveBeenCalled()
    // al guardar se cierra el formulario y se recarga la información
    await waitFor(() => expect(esenciasApi.listar).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole('heading', { name: 'Registrar entrada' })).not.toBeInTheDocument()
  })

  it('registra una salida usando la esencia y variante elegidas', async () => {
    inventarioApi.registrarSalida.mockResolvedValue({})
    await cargarPagina()
    fireEvent.click(screen.getByText('↓ Registrar salida'))

    const [selectEsencia, selectVariante] = screen.getAllByRole('combobox')
    fireEvent.change(selectEsencia, { target: { value: 'e2' } })
    expect(screen.getByRole('option', { name: 'Genérico — 100ml (7 und.)' })).toBeInTheDocument()
    expect(selectVariante).toHaveValue('v4')

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(inventarioApi.registrarSalida).toHaveBeenCalledTimes(1))
    expect(inventarioApi.registrarSalida).toHaveBeenCalledWith({
      esenciaId: 'e2',
      varianteId: 'v4',
      cantidad: 1,
      motivo: 'Pérdida o daño',
    })
  })

  it('permite cambiar de variante dentro de la misma esencia', async () => {
    inventarioApi.registrarEntrada.mockResolvedValue({})
    await cargarPagina()
    fireEvent.click(screen.getByText('↑ Registrar entrada'))

    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'v2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(inventarioApi.registrarEntrada).toHaveBeenCalled())
    expect(inventarioApi.registrarEntrada.mock.calls[0][0]).toMatchObject({ esenciaId: 'e1', varianteId: 'v2' })
  })

  it('muestra el error del servidor y mantiene el formulario abierto', async () => {
    inventarioApi.registrarEntrada.mockRejectedValue(new Error('Error al registrar entrada de inventario'))
    await cargarPagina()
    fireEvent.click(screen.getByText('↑ Registrar entrada'))

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByText('Error al registrar entrada de inventario')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Registrar entrada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled()
  })

  it('deshabilita el botón mientras guarda', async () => {
    inventarioApi.registrarEntrada.mockReturnValue(new Promise(() => {}))
    await cargarPagina()
    fireEvent.click(screen.getByText('↑ Registrar entrada'))

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled()
  })
})
