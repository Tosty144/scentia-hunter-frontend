import { Outlet, useMatches } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './AppLayout.css'

function AppLayout() {
  const matches = useMatches()
  const current = matches[matches.length - 1]?.handle || {}

  return (
    <div className="sh-shell">
      <Sidebar />
      <div className="sh-shell__main">
        <Topbar title={current.title || 'Scentia Hunter'} breadcrumb={current.breadcrumb || 'Panel'} />
        <div className="sh-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppLayout
