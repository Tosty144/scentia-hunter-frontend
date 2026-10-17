import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div data-testid="layout">
      <Outlet />
    </div>
  )
}
