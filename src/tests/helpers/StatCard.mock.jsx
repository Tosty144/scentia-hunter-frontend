export default function StatCard({ label, value, suffix, delta, deltaTone }) {
  return (
    <div>
      <span>{label}</span>
      <span>{value}</span>
      {suffix && <span>{suffix}</span>}
      {delta && <span data-tone={deltaTone}>{delta}</span>}
    </div>
  )
}
