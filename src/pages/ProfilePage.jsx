import { Link } from 'react-router-dom'
import { demoPerson, externalLinks } from '../data/site.js'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { useDemo } from '../context/DemoStore.jsx'
import { FILE_STATUS, formatDate } from '../lib/domain.js'
import { usePageTitle } from '../lib/usePageTitle.js'

export function ProfilePage() {
  usePageTitle('Mi perfil')
  const { applications, getAnyProduct } = useDemo()
  const files = applications.flatMap((application) =>
    Object.entries(application.documents).map(([docId, file]) => ({
      application,
      docId,
      file,
      product: getAnyProduct(application.productId),
    })),
  )

  return (
    <section className="page">
      <div className="wrap narrow">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: 'Mi perfil' },
          ]}
        />
        <div className="page-head">
          <p className="eyebrow">Sesión de demostración</p>
          <h1>Mi perfil</h1>
          <p>{demoPerson.notice}</p>
        </div>
        <section className="block">
          <h2>Información básica</h2>
          <dl>
            <div>
              <dt>Nombre</dt>
              <dd>{demoPerson.name}</dd>
            </div>
            <div>
              <dt>Identificador ficticio</dt>
              <dd>{demoPerson.identifier}</dd>
            </div>
            <div>
              <dt>Correo de contacto</dt>
              <dd>{demoPerson.email}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{demoPerson.phone}</dd>
            </div>
          </dl>
        </section>
        <section className="block">
          <h2>Historial de pregestiones</h2>
          {applications.length ? (
            <ul className="plain-list">
              {applications.map((application) => (
                <li key={application.ref}>
                  <Link to={`/mis-creditos/${application.ref}`}>
                    {application.ref} · {getAnyProduct(application.productId)?.name || 'Línea'} · {formatDate(application.createdAt)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Todavía no hay pregestiones en la base de demostración.</p>
          )}
        </section>
        <section className="block">
          <h2>Documentos de demostración</h2>
          {files.length ? (
            <ul className="plain-list">
              {files.map((item) => (
                <li key={`${item.application.ref}-${item.docId}`}>
                  {item.application.ref}: {item.file.fileName} · {FILE_STATUS[item.file.status] || item.file.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay archivos seleccionados. El prototipo no conserva documentos reales.</p>
          )}
        </section>
        <Link className="btn btn-secondary" to="/mis-creditos">
          Volver a mis créditos
        </Link>
      </div>
    </section>
  )
}
