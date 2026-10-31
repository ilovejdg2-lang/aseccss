import { Link } from 'react-router-dom'
import { continuePath, formatDate, isEditable, nextStepLabel, progressPercent } from '../lib/domain.js'
import { ApplicationStatusBadge } from './ApplicationStatusBadge.jsx'

export function MyCreditsTable({ rows }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Número de referencia</th>
            <th>Tipo de crédito</th>
            <th>Fecha de creación</th>
            <th>Estado</th>
            <th>Progreso</th>
            <th>Próximo paso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ application, product }) => (
            <tr key={application.ref}>
              <td data-label="Referencia">{application.ref}</td>
              <td data-label="Tipo de crédito">{product?.name || application.creditName || 'Línea no disponible'}</td>
              <td data-label="Fecha">{formatDate(application.createdAt)}</td>
              <td data-label="Estado">
                <ApplicationStatusBadge status={application.status} />
              </td>
              <td data-label="Progreso">
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${product ? progressPercent(application, product) : 0}%` }} />
                </span>
                <span>{product ? progressPercent(application, product) : 0}%</span>
              </td>
              <td data-label="Próximo paso">{product ? nextStepLabel(application, product) : application.nextAction || '—'}</td>
              <td data-label="Acciones" className="actions">
                <Link to={`/mis-creditos/${application.ref}`}>Ver detalle</Link>
                {product && isEditable(application.status) ? (
                  <Link to={continuePath(application, product)}>Continuar pregestión</Link>
                ) : null}
                {product && isEditable(application.status) ? (
                  <Link to={`/creditos/solicitud/${product.id}/documentos`}>Revisar documentos</Link>
                ) : (
                  <Link to={`/mis-creditos/${application.ref}#documentos`}>Revisar documentos</Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
