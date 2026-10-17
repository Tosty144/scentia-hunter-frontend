import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Ventas from '../pages/Ventas/Ventas'
import { esenciasApi, ventasApi } from '../services/api'
import { cop, fecha } from './helpers/formato'

vi.mock('../services/api', () => ({
  esenciasApi: { listar: vi.fn() },
  ventasApi: { listar: vi.fn(), registrar: vi.fn() },
}))
vi.mock('../components/ui/DataTable', () => import('./helpers/DataTable.mock.jsx'))
vi.mock('../components/ui/AsyncState', () => import('./helpers/AsyncState.mock.jsx'))

const catalogo = [
  {
    _id: 'e1',
    nombre: 'Dior Sauvage',
    variantes: [
      { _id: 'v1', tipo: 'Genérico', presentacion: '30ml', costo: 20000, precio: 45000, stock: 4 },
      { _id: 'v2', tipo: 'Original', presentacion: '100ml', costo: 110000, precio: 180000, stock: 2 },
    ],
  },
  {
    _id: 'e2',
    nombre: 'Khamra',
    variantes: [{ _id: 'v3', tipo: 'Genérico', presentacion: '100ml', costo: 35000, precio: 60000, stock: 5 }],
  },
]

const historial = [
  {
    fecha: '2026-10-01T12:00:00.000Z',
    nombreProducto: 'Khamra',
    nombreVariante: 'Genérico 100ml',
    cantidad: 1,
    ingreso: 150000,
    ganancia: 50000,
  },
  {
    fecha: '2026-10-02T12:00:00.000Z',
    nombreProducto: 'Dior Sauvage',
    nombreVariante: 'Original 100ml',
    cantidad: 1,
    ingreso: 90000,
    ganancia: 30000,
  },
]

async function cargarPagina() {
  render(<Ventas />)
  await screen.findByText('Historial de ventas')
}

function enviarVenta() {
  fireEvent.submit(screen.getByText('Confirmar venta').closest('form'))
}

beforeEach(() => {
  vi.resetAllMocks()
  ventasApi.listar.mockResolvedValue(historial)
  esenciasApi.listar.mockResolvedValue(catalogo)
})

describe('Ventas: historial', () => {
  it('muestra el estado de carga', () => {
    ventasApi.listar.mockReturnValue(new Promise(() => {}))
    render(<Ventas />)
    expect(screen.getByText('Cargando ventas…')).toBeInTheDocument()
  })

  it('lista las ventas con fecha, ingreso y ganancia', async () => {
    await cargarPagina()

    expect(screen.getByText(fecha('2026-10-01T12:00:00.000Z'))).toBeInTheDocument()
    expect(screen.getByText('Genérico 100ml')).toBeInTheDocument()
    expect(screen.getByText(cop(150000))).toBeInTheDocument()
    expect(screen.getByText(cop(30000))).toBeInTheDocument()
  })

  it('suma el ingreso total y la ganancia total', async () => {
    await cargarPagina()

    expect(screen.getByText(cop(240000))).toBeInTheDocument()
    expect(screen.getByText(cop(80000))).toBeInTheDocument()
  })

  it('muestra el mensaje de tabla vacía sin ventas', async () => {
    ventasApi.listar.mockResolvedValue([])
    await cargarPagina()

    expect(screen.getByText('Aún no hay ventas registradas.')).toBeInTheDocument()
  })

  it('muestra el error de carga y permite reintentar', async () => {
    ventasApi.listar.mockRejectedValueOnce(new Error('Error al listar ventas'))
    render(<Ventas />)

    expect(await screen.findByText('Error al listar ventas')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Historial de ventas')).toBeInTheDocument()
    expect(ventasApi.listar).toHaveBeenCalledTimes(2)
  })
})

describe('Ventas: formulario', () => {
  it('pide registrar primero una esencia si el catálogo está vacío', async () => {
    esenciasApi.listar.mockResolvedValue([])
    await cargarPagina()

    expect(screen.getByText('Registra primero una esencia en el catálogo para poder vender.')).toBeInTheDocument()
    expect(screen.queryByText('Confirmar venta')).not.toBeInTheDocument()
  })

  it('calcula el ingreso y la ganancia estimados de la primera variante', async () => {
    await cargarPagina()

    expect(screen.getByText(cop(45000))).toBeInTheDocument()
    expect(screen.getByText(cop(25000))).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Genérico — 30ml (4 und.)' })).toBeInTheDocument()
  })

  it('recalcula la estimación al cambiar la cantidad', async () => {
    await cargarPagina()

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } })

    expect(screen.getByText(cop(135000))).toBeInTheDocument()
    expect(screen.getByText(cop(75000))).toBeInTheDocument()
  })

  it('muestra cero si la cantidad queda vacía', async () => {
    await cargarPagina()

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } })

    expect(screen.getAllByText(cop(0))).toHaveLength(2)
  })

  it('recalcula la estimación al cambiar de variante', async () => {
    await cargarPagina()

    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'v2' } })

    expect(screen.getByText(cop(180000))).toBeInTheDocument()
    expect(screen.getByText(cop(70000))).toBeInTheDocument()
  })

  it('al cambiar de esencia selecciona su primera variante', async () => {
    await cargarPagina()

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'e2' } })

    expect(screen.getByRole('option', { name: 'Genérico — 100ml (5 und.)' })).toBeInTheDocument()
    expect(screen.getByText(cop(60000))).toBeInTheDocument()
    expect(screen.getByText(cop(25000))).toBeInTheDocument()
  })

  it('rechaza la venta si la cantidad supera el stock', async () => {
    await cargarPagina()

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } })
    enviarVenta()

    expect(await screen.findByText('Stock insuficiente. Disponible: 4 unidades.')).toBeInTheDocument()
    expect(ventasApi.registrar).not.toHaveBeenCalled()
  })

  it('rechaza la venta si la esencia no tiene variantes', async () => {
    esenciasApi.listar.mockResolvedValue([{ _id: 'e9', nombre: 'Sin variantes', variantes: [] }])
    await cargarPagina()

    enviarVenta()

    expect(await screen.findByText('Selecciona una esencia y variante válidas.')).toBeInTheDocument()
    expect(ventasApi.registrar).not.toHaveBeenCalled()
  })

  it('registra la venta, avisa y recarga los datos', async () => {
    ventasApi.registrar.mockResolvedValue({})
    await cargarPagina()

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } })
    enviarVenta()

    expect(await screen.findByText('Venta registrada correctamente.')).toBeInTheDocument()
    expect(ventasApi.registrar).toHaveBeenCalledWith({ esenciaId: 'e1', varianteId: 'v1', cantidad: 2 })
    expect(ventasApi.listar).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('spinbutton')).toHaveValue(1)
  })

  it('muestra el error del servidor al registrar', async () => {
    ventasApi.registrar.mockRejectedValue(new Error('Error al registrar venta'))
    await cargarPagina()

    enviarVenta()

    expect(await screen.findByText('Error al registrar venta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar venta' })).toBeEnabled()
  })

  it('deshabilita el botón mientras registra', async () => {
    ventasApi.registrar.mockReturnValue(new Promise(() => {}))
    await cargarPagina()

    enviarVenta()

    expect(await screen.findByRole('button', { name: 'Registrando…' })).toBeDisabled()
  })
})
