import './StatCard.css'

function StatCard({ label, value, delta, deltaTone = 'neutral', suffix }) {
  return (
    <div className="sh-card sh-card--sealed sh-stat">
      <p className="sh-stat__label">{label}</p>
      <p className="sh-stat__value">
        {value}
        {suffix && <span className="sh-stat__suffix">{suffix}</span>}
      </p>
      {delta && (
        <p className={`sh-stat__delta sh-stat__delta--${deltaTone}`}>{delta}</p>
      )}
    </div>
  )
}

export default StatCard
