import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import router from '../router/AppRouter'

vi.mock('../components/layout/AppLayout', () => import('./helpers/AppLayout.mock.jsx'))
vi.mock('../pages/Login/Login', () => ({ default: () => 'Pantalla Login' }))
vi.mock('../pages/Dashboard/Dashboard', () => ({ default: () => 'Pantalla Dashboard' }))
vi.mock('../pages/Esencias/Esencias', () => ({ default: () => 'Pantalla Esencias' }))
vi.mock('../pages/Inventario/Inventario', () => ({ default: () => 'Pantalla Inventario' }))
vi.mock('../pages/Ventas/Ventas', () => ({ default: () => 'Pantalla Ventas' }))
vi.mock('../pages/Probadores/Probadores', () => ({ default: () => 'Pantalla Probadores' }))
vi.mock('../pages/Analisis/Analisis', () => ({ default: () => 'Pantalla Análisis' }))

function renderizarRuta(ruta) {
  const memoria = createMemoryRouter(router.routes, { initialEntries: [ruta] })
  return render(<RouterProvider router={memoria} />)
}

describe('AppRouter', () => {
  it.each([
    ['/', 'Pantalla Dashboard'],
    ['/esencias', 'Pantalla Esencias'],
    ['/inventario', 'Pantalla Inventario'],
    ['/ventas', 'Pantalla Ventas'],
    ['/probadores', 'Pantalla Probadores'],
    ['/analisis', 'Pantalla Análisis'],
  ])('la ruta %s se muestra dentro del layout', async (ruta, texto) => {
    renderizarRuta(ruta)
    expect(await screen.findByText(texto)).toBeInTheDocument()
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('la ruta /login se muestra sin layout', async () => {
    renderizarRuta('/login')
    expect(await screen.findByText('Pantalla Login')).toBeInTheDocument()
    expect(screen.queryByTestId('layout')).not.toBeInTheDocument()
  })

  it('cada pantalla del panel define título y breadcrumb', () => {
    const hijas = router.routes.find((r) => r.path === '/').children
    expect(hijas).toHaveLength(6)
    hijas.forEach((ruta) => {
      expect(ruta.handle.title).toBeTruthy()
      expect(ruta.handle.breadcrumb).toBeTruthy()
    })
  })
})
