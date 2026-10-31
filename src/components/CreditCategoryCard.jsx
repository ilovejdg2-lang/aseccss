import { Link } from 'react-router-dom'
import { Icon } from './Icons.jsx'

export function CreditCategoryCard({ category }) {
  return (
    <article className="category-card">
      <span className="category-icon">
        <Icon name={category.icon} />
      </span>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <Link to={`/creditos/catalogo?tipo=${category.id}`}>
        Ver opciones
        <Icon name="arrow" size={16} />
      </Link>
    </article>
  )
}
