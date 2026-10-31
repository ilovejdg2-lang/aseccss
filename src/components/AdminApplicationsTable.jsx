import { Link } from 'react-router-dom'
import { formatDate } from '../lib/domain.js'
import { ApplicationStatusBadge } from './ApplicationStatusBadge.jsx'

export function AdminApplicationsTable({ rows }) {
  if (!rows.length) return <p>No hay pregestiones para este filtro.</p>
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Referencia</th>
            <th>Identificador ficticio</th>
            <th>Tipo de crédito</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ application, product }) => (
            <tr key={application.ref}>
              <td data-label="Referencia">{application.ref}</td>
              <td data-label="Identificador">{application.personal.identification || 'DEMO'}</td>
              <td data-label="Tipo">{product?.name || 'Línea no disponible'}</td>
              <td data-label="Fecha">{formatDate(application.createdAt)}</td>
              <td data-label="Estado">
                <ApplicationStatusBadge status={application.status} />
              </td>
              <td data-label="Acciones" className="actions">
                <Link to={`/admin/creditos/solicitudes/${application.ref}`}>Ver detalle</Link>
                <Link to={`/admin/creditos/solicitudes/${application.ref}#documentos`}>Consultar documentos</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
