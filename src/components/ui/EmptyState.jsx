import './EmptyState.css'

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="sh-empty">
      <div className="sh-empty__mark" />
      <h3 className="sh-empty__title">{title}</h3>
      <p className="sh-empty__desc">{description}</p>
      {actionLabel && (
        <button className="sh-btn sh-btn--gold" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
