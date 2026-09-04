import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Login from '../pages/Login/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import Esencias from '../pages/Esencias/Esencias'
import Inventario from '../pages/Inventario/Inventario'
import Ventas from '../pages/Ventas/Ventas'
import Probadores from '../pages/Probadores/Probadores'
import Analisis from '../pages/Analisis/Analisis'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: { title: 'Dashboard', breadcrumb: 'Panel general' },
      },
      {
        path: 'esencias',
        element: <Esencias />,
        handle: { title: 'Esencias', breadcrumb: 'Catálogo' },
      },
      {
        path: 'inventario',
        element: <Inventario />,
        handle: { title: 'Inventario', breadcrumb: 'Stock e inversión' },
      },
      {
        path: 'ventas',
        element: <Ventas />,
        handle: { title: 'Ventas', breadcrumb: 'Registro e historial' },
      },
      {
        path: 'probadores',
        element: <Probadores />,
        handle: { title: 'Probadores', breadcrumb: 'Disponibilidad' },
      },
      {
        path: 'analisis',
        element: <Analisis />,
        handle: { title: 'Análisis', breadcrumb: 'Estadísticas de ventas' },
      },
    ],
  },
])

export default router
