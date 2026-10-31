import { STATUS } from '../lib/domain.js'
import { Icon } from './Icons.jsx'

export function ApplicationStatusBadge({ status }) {
  const item = STATUS[status] || STATUS.borrador
  return (
    <span className={`badge tone-${item.tone}`}>
      <Icon name={item.icon} size={15} />
      {item.label}
    </span>
  )
}
