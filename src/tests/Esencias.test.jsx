import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Esencias from '../pages/Esencias/Esencias'
import { esenciasApi } from '../services/api'
import { cop } from './helpers/formato'

vi.mock('../services/api', () => ({ esenciasApi: { listar: vi.fn(), crear: vi.fn() } }))
vi.mock('../components/ui/Badge', () => import('./helpers/Badge.mock.jsx'))
vi.mock('../components/ui/AsyncState', () => import('./helpers/AsyncState.mock.jsx'))

const catalogo = [
  {
    _id: 'e1',
    nombre: 'Dior Sauvage',
    familia: 'Amaderada',
    probador: true,
    variantes: [
      { _id: 'v1', tipo: 'Original', presentacion: '100ml', costo: 100000, precio: 180000, stock: 0 },
      { _id: 'v2', tipo: 'Genérico', presentacion: '30ml', costo: 20000, precio: 45000, stock: 3 },
      { _id: 'v3', tipo: 'Triple A', presentacion: '100ml', costo: 40000, precio: 90000, stock: 10 },
    ],
  },
  {
    _id: 'e2',
    nombre: 'Khamra',
    familia: 'Oriental',
    probador: false,
    variantes: [{ _id: 'v4', tipo: 'Genérico', presentacion: '100ml', costo: 35000, precio: 60000, stock: 7 }],
  },
]

async function abrirFormulario() {
  render(<Esencias />)
  await screen.findByText('Dior Sauvage')
  fireEvent.click(screen.getByText('+ Registrar esencia'))
}

function escribir(placeholder, valor, indice = 0) {
  fireEvent.change(screen.getAllByPlaceholderText(placeholder)[indice], { target: { value: valor } })
}

function enviarFormulario() {
  fireEvent.submit(screen.getByText('Guardar esencia').closest('form'))
}

beforeEach(() => {
  vi.resetAllMocks()
  esenciasApi.listar.mockResolvedValue(catalogo)
})

describe('Esencias: catálogo', () => {
  it('muestra el estado de carga', () => {
    esenciasApi.listar.mockReturnValue(new Promise(() => {}))
    render(<Esencias />)
    expect(screen.getByText('Cargando catálogo…')).toBeInTheDocument()
  })

  it('lista las esencias con su familia, probador y número de variantes', async () => {
    render(<Esencias />)

    expect(await screen.findByText('Dior Sauvage')).toBeInTheDocument()
    expect(screen.getByText('Khamra')).toBeInTheDocument()
    expect(screen.getByText('Amaderada')).toBeInTheDocument()
    expect(screen.getByText('Con probador')).toHaveAttribute('data-tone', 'gold')
    expect(screen.getByText('Sin probador')).toHaveAttribute('data-tone', 'neutral')
    expect(screen.getByText('3 variantes')).toBeInTheDocument()
    expect(screen.getByText('1 variantes')).toBeInTheDocument()
  })

  it('abre la primera esencia y muestra costo y precio de cada variante', async () => {
    render(<Esencias />)

    expect(await screen.findByText(cop(100000))).toBeInTheDocument()
    expect(screen.getByText(cop(180000))).toBeInTheDocument()
    expect(screen.getByText('Triple A')).toBeInTheDocument()
    expect(screen.queryByText(cop(35000))).not.toBeInTheDocument()
  })

  it('colorea el stock: agotado, bajo y suficiente', async () => {
    render(<Esencias />)

    expect(await screen.findByText('0 und.')).toHaveAttribute('data-tone', 'danger')
    expect(screen.getByText('3 und.')).toHaveAttribute('data-tone', 'gold')
    expect(screen.getByText('10 und.')).toHaveAttribute('data-tone', 'success')
  })

  it('abre otra esencia al hacer clic y la cierra al volver a hacer clic', async () => {
    render(<Esencias />)
    await screen.findByText('Dior Sauvage')

    fireEvent.click(screen.getByText('Khamra'))
    expect(screen.getByText(cop(35000))).toBeInTheDocument()
    expect(screen.queryByText(cop(100000))).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Khamra'))
    expect(screen.queryByText(cop(35000))).not.toBeInTheDocument()
  })

  it('funciona cuando todavía no hay esencias registradas', async () => {
    esenciasApi.listar.mockResolvedValue([])
    render(<Esencias />)

    await waitFor(() => expect(screen.queryByText('Cargando catálogo…')).not.toBeInTheDocument())
    expect(screen.getByText('Catálogo de esencias')).toBeInTheDocument()
  })

  it('muestra el error de carga y permite reintentar', async () => {
    esenciasApi.listar.mockRejectedValueOnce(new Error('Error al listar esencias'))
    render(<Esencias />)

    expect(await screen.findByText('Error al listar esencias')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Dior Sauvage')).toBeInTheDocument()
    expect(esenciasApi.listar).toHaveBeenCalledTimes(2)
  })
})

describe('Esencias: formulario de registro', () => {
  it('muestra y oculta el formulario con el botón de la cabecera', async () => {
    await abrirFormulario()
    expect(screen.getByText('Nueva esencia')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText('Nueva esencia')).not.toBeInTheDocument()
    expect(screen.getByText('+ Registrar esencia')).toBeInTheDocument()
  })

  it('agrega una fila nueva de variante', async () => {
    await abrirFormulario()
    expect(screen.getAllByPlaceholderText('Costo')).toHaveLength(1)

    fireEvent.click(screen.getByText('+ Agregar variante'))
    expect(screen.getAllByPlaceholderText('Costo')).toHaveLength(2)
  })

  it('envía la esencia con los números convertidos y cierra el formulario', async () => {
    esenciasApi.crear.mockResolvedValue({})
    await abrirFormulario()

    escribir('Ej. Dior Sauvage', 'Aventus')
    escribir('Ej. Amaderada / Fresca', 'Frutal')
    fireEvent.click(screen.getByLabelText('Tiene probador'))
    fireEvent.change(screen.getByDisplayValue('Genérico'), { target: { value: 'Triple A' } })
    escribir('Presentación (ej. 100ml)', '50ml')
    escribir('Costo', '30000')
    escribir('Precio venta', '70000')
    escribir('Stock inicial', '5')
    enviarFormulario()

    await waitFor(() => expect(screen.queryByText('Nueva esencia')).not.toBeInTheDocument())
    expect(esenciasApi.crear).toHaveBeenCalledWith({
      nombre: 'Aventus',
      familia: 'Frutal',
      probador: true,
      variantes: [{ tipo: 'Triple A', presentacion: '50ml', costo: 30000, precio: 70000, stock: 5 }],
    })
    expect(esenciasApi.listar).toHaveBeenCalledTimes(2)
  })

  it('usa stock 0 si no se indica y descarta variantes incompletas', async () => {
    esenciasApi.crear.mockResolvedValue({})
    await abrirFormulario()

    escribir('Ej. Dior Sauvage', 'Aventus')
    escribir('Presentación (ej. 100ml)', '50ml')
    escribir('Costo', '30000')
    escribir('Precio venta', '70000')
    fireEvent.click(screen.getByText('+ Agregar variante'))
    escribir('Presentación (ej. 100ml)', '100ml', 1) // sin costo ni precio: se descarta
    enviarFormulario()

    await waitFor(() => expect(esenciasApi.crear).toHaveBeenCalledTimes(1))
    expect(esenciasApi.crear.mock.calls[0][0].variantes).toEqual([
      { tipo: 'Genérico', presentacion: '50ml', costo: 30000, precio: 70000, stock: 0 },
    ])
  })

  it('muestra el error del servidor y deja el formulario abierto', async () => {
    esenciasApi.crear.mockRejectedValue(new Error('Error al crear esencia'))
    await abrirFormulario()

    escribir('Ej. Dior Sauvage', 'Aventus')
    enviarFormulario()

    expect(await screen.findByText('Error al crear esencia')).toBeInTheDocument()
    expect(screen.getByText('Nueva esencia')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar esencia' })).toBeEnabled()
  })

  it('deshabilita el botón mientras guarda', async () => {
    esenciasApi.crear.mockReturnValue(new Promise(() => {}))
    await abrirFormulario()

    escribir('Ej. Dior Sauvage', 'Aventus')
    enviarFormulario()

    expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled()
  })
})
