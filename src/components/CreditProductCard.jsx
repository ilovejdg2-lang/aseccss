import { Link } from 'react-router-dom'
import { Icon } from './Icons.jsx'

export function CreditProductCard({ product }) {
  const preview = product.conditionsConfirmed ? product.conditions.slice(0, 3) : []
  return (
    <article className="product-card">
      <span className="product-icon" aria-hidden="true">
        <Icon name="file" />
      </span>
      <div>
        <p className="eyebrow">{product.categoryName}</p>
        <h3>{product.name}</h3>
        <p>{product.summary}</p>
        {preview.length ? (
          <dl className="mini-conditions">
            {preview.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="consult-note">Consultá las condiciones vigentes con ASECCSS.</p>
        )}
        <p className="hint">
          {product.publishedRequirements.length
            ? `${product.publishedRequirements.length} requisitos publicados en la ficha.`
            : 'La lista oficial de requisitos debe confirmarse con ASECCSS.'}
        </p>
        <div className="card-actions">
          <Link className="btn btn-primary btn-small" to={`/creditos/${product.id}`}>
            Ver detalles
          </Link>
          <Link className="btn btn-secondary btn-small" to={`/creditos/${product.id}#requisitos`}>
            Consultar requisitos
          </Link>
        </div>
      </div>
    </article>
  )
}
