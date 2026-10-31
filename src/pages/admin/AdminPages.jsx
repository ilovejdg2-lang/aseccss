import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categories, createCustomProduct } from '../../data/catalog.js'
import { AdminApplicationsTable } from '../../components/AdminApplicationsTable.jsx'
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { useDemo } from '../../context/DemoStore.jsx'
import {
  ADMIN_STATUSES,
  FILE_STATUS,
  STATUS,
  formatDate,
  matchesApplicationFilter,
  summarizeApplications,
} from '../../lib/domain.js'
import { usePageTitle } from '../../lib/usePageTitle.js'

function rowsOf(applications, getAnyProduct, filter = 'todas') {
  return applications
    .filter((application) => matchesApplicationFilter(application, filter))
    .map((application) => ({ application, product: getAnyProduct(application.productId) }))
}

export function AdminDashboardPage() {
  usePageTitle('Panel de demostración')
  const { applications, getAnyProduct } = useDemo()
  const counts = summarizeApplications(applications)
  const cards = [
    ['Total de pregestiones', counts.total],
    ['Listas para revisión', counts.revision],
    ['Aceptadas (simulación)', counts.aceptadas || 0],
    ['Rechazadas (simulación)', counts.rechazadas || 0],
  ]
  return (
    <>
      <div className="page-head">
        <h1>Inicio del panel</h1>
        <p>Los indicadores salen de las pregestiones guardadas en la base de demostración. Este panel no aprueba préstamos.</p>
      </div>
      <div className="stat-grid">
        {cards.map(([label, value]) => (
          <article key={label} className="stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <h2>Pregestiones recientes</h2>
      <AdminApplicationsTable rows={rowsOf(applications, getAnyProduct).slice(0, 5)} />
    </>
  )
}

export function AdminApplicationsPage() {
  usePageTitle('Solicitudes de demostración')
  const { applications, getAnyProduct } = useDemo()
  const [filter, setFilter] = useState('todas')
  const [query, setQuery] = useState('')
  const rows = rowsOf(applications, getAnyProduct, filter).filter(({ application, product }) => {
    const haystack = `${application.ref} ${application.personal.identification} ${product?.name || ''}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })
  return (
    <>
      <div className="page-head">
        <h1>Solicitudes</h1>
        <p>Referencias ficticias de la simulación.</p>
      </div>
      <div className="toolbar">
        <label htmlFor="buscar-ref">Buscar</label>
        <input id="buscar-ref" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Referencia o línea" />
        <label htmlFor="estado-filtro">Estado</label>
        <select id="estado-filtro" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="todas">Todas</option>
          <option value="preparacion">En preparación</option>
          <option value="pendientes">Pendientes</option>
          <option value="revision">En revisión</option>
          <option value="aceptadas">Aceptadas</option>
          <option value="rechazadas">Rechazadas</option>
          <option value="finalizadas">Finalizadas</option>
        </select>
      </div>
      <AdminApplicationsTable rows={rows} />
    </>
  )
}

export function AdminApplicationDetailPage() {
  const { ref } = useParams()
  const demo = useDemo()
  const application = demo.getApplication(ref)
  const product = application ? demo.getAnyProduct(application.productId) : null
  const [note, setNote] = useState('')
  const [status, setStatus] = useState(application?.status || 'borrador')
  const [reason, setReason] = useState('')
  usePageTitle(ref || 'Detalle')

  if (!application || !product) {
    return <EmptyState title="La pregestión no está en la simulación" actionLabel="Volver" actionTo="/admin/creditos/solicitudes" />
  }

  const notes = demo.observations[application.ref] || []

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">{application.ref}</p>
        <h1>{product.name}</h1>
        <ApplicationStatusBadge status={application.status} />
        <p>
          Identificador ficticio: {application.personal.identification || 'sin dato'} · {formatDate(application.createdAt)}
        </p>
      </div>
      <section className="block" id="documentos">
        <h2>Documentos de la simulación</h2>
        <ul className="plain-list">
          {product.documents.map((doc) => {
            const file = application.documents[doc.id]
            return (
              <li key={doc.id}>
                {doc.name}: {file ? `${file.fileName} · ${FILE_STATUS[file.status]}` : 'Pendiente'}
              </li>
            )
          })}
        </ul>
      </section>
      <section className="block">
        <h2>Observación interna</h2>
        <p className="hint">La nota queda en el prototipo. No se envía a ASECCSS ni forma parte de un expediente real.</p>
        <ul className="plain-list">
          {notes.map((item) => (
            <li key={item.id}>
              {item.text} <span className="hint">{formatDate(item.at)}</span>
            </li>
          ))}
        </ul>
        <label htmlFor="nota">Nueva observación</label>
        <textarea id="nota" value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            if (!note.trim()) return
            demo.addObservation(application.ref, note)
            setNote('')
          }}
        >
          Registrar observación
        </button>
      </section>
      <section className="block">
        <h2>Simular aceptación o rechazo</h2>
        <p className="hint">
          Esta acción es solo para el prototipo universitario. No aprueba ni rechaza un crédito de ASECCSS.
        </p>
        {application.decision ? (
          <p>
            Última simulación: {application.decision.result}
            {application.decision.reason ? ` · ${application.decision.reason}` : ''}
          </p>
        ) : null}
        <label htmlFor="motivo-admin">Motivo simulado (opcional)</label>
        <textarea id="motivo-admin" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="form-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              demo.updateStatus(application.ref, 'aceptada_demo', reason)
              setStatus('aceptada_demo')
            }}
          >
            Simular aceptación
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              demo.updateStatus(application.ref, 'rechazada_demo', reason)
              setStatus('rechazada_demo')
            }}
          >
            Simular rechazo
          </button>
        </div>
      </section>
      <section className="block">
        <h2>Estado de demostración</h2>
        <p className="hint">El cambio solo reorganiza la simulación. Aceptada y rechazada no son decisiones oficiales.</p>
        <label htmlFor="nuevo-estado">Estado</label>
        <select id="nuevo-estado" value={status} onChange={(event) => setStatus(event.target.value)}>
          {ADMIN_STATUSES.map((item) => (
            <option key={item} value={item}>
              {STATUS[item].label}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => demo.updateStatus(application.ref, status, reason)}
        >
          Actualizar estado de demostración
        </button>
      </section>
      <Link to="/admin/creditos/solicitudes">Volver al listado</Link>
    </>
  )
}

export function AdminDocumentsPage() {
  usePageTitle('Documentos de demostración')
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
    <>
      <div className="page-head">
        <h1>Documentos</h1>
        <p>Solo se guardan los metadatos en la base de demostración. El archivo no se almacenó.</p>
      </div>
      {files.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Documento</th>
                <th>Archivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {files.map((item) => (
                <tr key={`${item.application.ref}-${item.docId}`}>
                  <td data-label="Referencia">{item.application.ref}</td>
                  <td data-label="Documento">{item.docId}</td>
                  <td data-label="Archivo">{item.file.fileName}</td>
                  <td data-label="Estado">{FILE_STATUS[item.file.status] || item.file.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No hay archivos seleccionados.</p>
      )}
    </>
  )
}

function ProductEditor({ initial, onClose }) {
  const demo = useDemo()
  const [form, setForm] = useState({
    ...initial,
    requirementsText: (initial.publishedRequirements || []).join('\n'),
    highlightsText: (initial.highlights || []).join('\n'),
  })
  const [error, setError] = useState('')

  function save(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.description.trim()) {
      setError('El nombre y la descripción son obligatorios.')
      return
    }
    demo.saveProduct({
      ...form,
      summary: form.summary || form.description,
      publishedRequirements: form.requirementsText.split('\n').map((line) => line.trim()).filter(Boolean),
      highlights: form.highlightsText.split('\n').map((line) => line.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <form className="editor" onSubmit={save}>
      <h2>{form.custom ? 'Nueva ficha de demostración' : `Editar ${initial.name}`}</h2>
      {error ? <p className="form-alert">{error}</p> : null}
      <label htmlFor="nombre-ficha">Nombre</label>
      <input id="nombre-ficha" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <label htmlFor="categoria-ficha">Categoría</label>
      <select id="categoria-ficha" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <label htmlFor="finalidad-ficha">Finalidad</label>
      <input id="finalidad-ficha" value={form.purposeLabel} onChange={(event) => setForm({ ...form, purposeLabel: event.target.value })} />
      <label htmlFor="descripcion-ficha">Descripción</label>
      <textarea id="descripcion-ficha" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      <label htmlFor="requisitos-ficha">Requisitos, uno por línea</label>
      <textarea id="requisitos-ficha" rows={4} value={form.requirementsText} onChange={(event) => setForm({ ...form, requirementsText: event.target.value })} />
      <label htmlFor="aportes-ficha">Notas adicionales, una por línea</label>
      <textarea id="aportes-ficha" rows={3} value={form.highlightsText} onChange={(event) => setForm({ ...form, highlightsText: event.target.value })} />
      <fieldset>
        <legend>Documentos de ejemplo</legend>
        {form.documents.map((doc, index) => (
          <div key={doc.id} className="doc-edit">
            <input
              aria-label={`Nombre del documento ${index + 1}`}
              value={doc.name}
              onChange={(event) => {
                const documents = form.documents.map((item) => (item.id === doc.id ? { ...item, name: event.target.value } : item))
                setForm({ ...form, documents })
              }}
            />
            <label>
              <input
                type="checkbox"
                checked={doc.required}
                onChange={(event) => {
                  const documents = form.documents.map((item) => (item.id === doc.id ? { ...item, required: event.target.checked } : item))
                  setForm({ ...form, documents })
                }}
              />
              Obligatorio
            </label>
            <button
              className="btn btn-ghost btn-small"
              type="button"
              onClick={() => setForm({ ...form, documents: form.documents.filter((item) => item.id !== doc.id) })}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          className="btn btn-secondary btn-small"
          type="button"
          onClick={() =>
            setForm({
              ...form,
              documents: [
                ...form.documents,
                {
                  id: `doc-${Date.now()}`,
                  name: 'Documento de ejemplo',
                  description: 'Agregado en la simulación.',
                  required: false,
                  origin: 'prototipo',
                  formats: ['PDF', 'JPG', 'PNG'],
                  maxMb: 5,
                },
              ],
            })
          }
        >
          Agregar documento
        </button>
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={form.published !== false} onChange={(event) => setForm({ ...form, published: event.target.checked })} />
        <span>Publicada en el catálogo de demostración</span>
      </label>
      {!form.custom && form.conditionsConfirmed ? (
        <p className="hint">Las tasas, montos y plazos publicados no se editan aquí. Si no hay cifra confirmada, la ficha pide consultar a ASECCSS.</p>
      ) : (
        <p className="hint">Esta ficha no incluye tasas ni montos inventados.</p>
      )}
      <div className="form-actions">
        <button className="btn btn-secondary" type="button" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit">
          Guardar ficha
        </button>
      </div>
    </form>
  )
}

export function AdminCatalogPage() {
  usePageTitle('Catálogo de demostración')
  const { allProducts, setPublished } = useDemo()
  const [editing, setEditing] = useState(null)
  return (
    <>
      <div className="page-head">
        <h1>Catálogo de créditos</h1>
        <p>Podés crear, editar o desactivar fichas de la simulación.</p>
        <button className="btn btn-primary" type="button" onClick={() => setEditing(createCustomProduct())}>
          Nueva ficha
        </button>
      </div>
      {editing ? <ProductEditor key={editing.id} initial={editing} onClose={() => setEditing(null)} /> : null}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {allProducts.map((product) => (
              <tr key={product.id}>
                <td data-label="Nombre">{product.name}</td>
                <td data-label="Categoría">{product.categoryName}</td>
                <td data-label="Publicación">
                  {product.handledOnline
                    ? 'Fuera del módulo: ASECCSS ya publica formulario digital'
                    : product.published === false
                      ? 'No publicada'
                      : 'Publicada'}
                </td>
                <td data-label="Acciones" className="actions">
                  <button type="button" onClick={() => setEditing(product)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => setPublished(product.id, product.published === false)}>
                    {product.published === false ? 'Activar' : 'Desactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AdminRequirementsPage() {
  usePageTitle('Requisitos de demostración')
  const { allProducts } = useDemo()
  return (
    <>
      <div className="page-head">
        <h1>Requisitos</h1>
        <p>Separados entre lo publicado en la página de referencia y los archivos de ejemplo del prototipo.</p>
      </div>
      <div className="stack">
        {allProducts.map((product) => (
          <article key={product.id} className="block">
            <h2>{product.name}</h2>
            {product.publishedRequirements.length ? (
              <ul>
                {product.publishedRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Sin requisitos numéricos o documentales publicados en la ficha de referencia.</p>
            )}
            <p className="hint">Documentos del prototipo: {product.documents.map((doc) => doc.name).join(', ') || 'ninguno'}.</p>
          </article>
        ))}
      </div>
    </>
  )
}

export function AdminReportsPage() {
  usePageTitle('Reportes de demostración')
  const { applications, getAnyProduct } = useDemo()
  const counts = summarizeApplications(applications)
  const byCategory = useMemo(() => {
    const map = new Map()
    applications.forEach((application) => {
      const name = getAnyProduct(application.productId)?.categoryName || 'Sin categoría'
      map.set(name, (map.get(name) || 0) + 1)
    })
    return [...map.entries()]
  }, [applications, getAnyProduct])
  const max = Math.max(1, ...byCategory.map(([, count]) => count))
  return (
    <>
      <div className="page-head">
        <h1>Reportes</h1>
        <p>Conteos calculados con las pregestiones de la base de demostración.</p>
      </div>
      <div className="stat-grid">
        <article className="stat-card">
          <span>Total</span>
          <strong>{counts.total}</strong>
        </article>
        <article className="stat-card">
          <span>En preparación</span>
          <strong>{counts.preparacion}</strong>
        </article>
        <article className="stat-card">
          <span>Pendientes</span>
          <strong>{counts.pendientes}</strong>
        </article>
        <article className="stat-card">
          <span>Finalizadas</span>
          <strong>{counts.finalizadas}</strong>
        </article>
      </div>
      <h2>Por categoría</h2>
      {byCategory.length ? (
        <ul className="bars">
          {byCategory.map(([name, count]) => (
            <li key={name}>
              <span>{name}</span>
              <span className="bar" style={{ '--size': `${(count / max) * 100}%` }} />
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay pregestiones para agrupar.</p>
      )}
    </>
  )
}

export function AdminSettingsPage() {
  usePageTitle('Configuración de demostración')
  const demo = useDemo()
  return (
    <>
      <div className="page-head">
        <h1>Configuración</h1>
        <p>
          Hay una API local y un archivo JSON como base de demostración. No hay inicio de sesión: esta ruta no identifica a una persona asociada y no es un control de seguridad. Para un sistema real hacen falta autenticación, autorización por usuario y una base de datos administrada. La identificación del formulario no sirve como acceso. La API vuelve a validar los datos, pero eso no sustituye el control de un servidor de producción.
        </p>
      </div>
      <section className="block">
        <h2>Base de demostración</h2>
        <p>Las pregestiones se consultan en /api/pregestiones y se guardan en server/data/db.json.</p>
        <div className="form-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              if (window.confirm('¿Querés quitar las pregestiones de la base de demostración?')) demo.clearApplications()
            }}
          >
            Vaciar pregestiones
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              if (window.confirm('¿Querés restaurar los datos de ejemplo?')) demo.resetDemo()
            }}
          >
            Restaurar demostración
          </button>
        </div>
      </section>
      <section className="block">
        <h2>Estado del catálogo</h2>
        <label className="check">
          <input type="checkbox" checked={demo.simulateCatalogError} onChange={(event) => demo.setCatalogError(event.target.checked)} />
          <span>Simular un error al cargar el catálogo público</span>
        </label>
      </section>
      <section className="block">
        <h2>Reglas de validación del prototipo</h2>
        <ul>
          <li>Identificación: DEMO-0001 o el formato 0-0000-0000.</li>
          <li>Teléfono: 8 dígitos.</li>
          <li>Correo: debe incluir un dominio.</li>
          <li>Archivos: PDF, JPG o PNG, hasta 5 MB, solo en el dispositivo.</li>
        </ul>
      </section>
    </>
  )
}
