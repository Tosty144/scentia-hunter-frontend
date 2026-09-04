import './Badge.css'

/**
 * tone: 'gold' | 'success' | 'danger' | 'neutral'
 */
function Badge({ tone = 'neutral', children }) {
  return <span className={`sh-badge sh-badge--${tone}`}>{children}</span>
}

export default Badge
