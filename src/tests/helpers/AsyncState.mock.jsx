export function Loading({ label }) {
  return <p role="status">{label}</p>
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert">
      <p>{message}</p>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  )
}
