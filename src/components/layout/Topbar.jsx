import './Topbar.css'

function Topbar({ title, breadcrumb }) {
  return (
    <header className="sh-topbar">
      <div>
        <p className="sh-topbar__breadcrumb">{breadcrumb}</p>
        <h1 className="sh-topbar__title">{title}</h1>
      </div>

      <div className="sh-topbar__actions">
        <div className="sh-topbar__search">
          <span>⌕</span>
          <input type="text" placeholder="Buscar esencia, variante o venta…" />
        </div>
        <button className="sh-topbar__bell" aria-label="Notificaciones">
          <span>♢</span>
          <span className="sh-topbar__bell-dot" />
        </button>
      </div>
    </header>
  )
}

export default Topbar
