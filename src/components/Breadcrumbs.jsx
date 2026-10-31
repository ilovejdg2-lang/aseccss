import { Link } from 'react-router-dom'

export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Migas de pan">
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`}>
              {last || !item.to && !item.href ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              ) : item.href ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
