import './AsyncState.css'

export function Loading({ label = 'Cargando…' }) {
  return (
    <div className="sh-async sh-async--loading">
      <span className="sh-async__ring" />
      {label}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="sh-async sh-async--error">
      <p>No se pudo conectar con el servidor: {message}</p>
      {onRetry && (
        <button className="sh-btn sh-btn--ghost" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
