import { Link } from 'react-router-dom'
import { Icon } from './Icons.jsx'

export function EmptyState({ icon = 'folder', title, text, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionTo ? (
        <Link className="btn btn-primary" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
      {onAction ? (
        <button className="btn btn-primary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
