import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { creditFieldLabel } from '../data/creditForms.js'
import { jobOptions, maritalOptions, optionLabel, tenureOptions } from '../data/formConfig.js'
import { externalLinks } from '../data/site.js'
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge.jsx'
import { Icon } from '../components/Icons.jsx'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useDemo } from '../context/DemoStore.jsx'
import {
  canSimulateDecision,
  completion,
  continuePath,
  downloadApplicationJson,
  FILE_STATUS,
  formatColones,
  formatDate,
  isEditable,
  nextStepLabel,
  progressPercent,
} from '../lib/domain.js'
import { usePageTitle } from '../lib/usePageTitle.js'

export function MyCreditDetailPage() {
  const { ref } = useParams()
  const { getApplication, getAnyProduct, observations, updateStatus } = useDemo()
  const application = getApplication(ref)
  const product = application ? getAnyProduct(application.productId) : null
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  usePageTitle(application ? `Pregestión ${application.ref}` : 'Pregestión')

  if (!application || !product) {
    return (
      <section className="page">
        <div className="wrap">
          <EmptyState title="No encontramos esa pregestión" text="La referencia no está guardada en la base de demostración." actionLabel="Volver a mis créditos" actionTo="/mis-creditos" />
        </div>
      </section>
    )
  }

  const progress = completion(application, product)
  const steps = [
    { label: 'Datos personales', done: progress.personalOk },
    { label: 'Información laboral', done: progress.employmentOk },
    { label: 'Datos del crédito', done: progress.creditOk },
    { label: 'Documentos', done: progress.docsOk },
    { label: 'Confirmación', done: Boolean(application.submittedAt) },
  ]
  const notes = observations[application.ref] || []

  return (
    <section className="page">
      <div className="wrap narrow">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: 'Mis créditos', to: '/mis-creditos' },
            { label: application.ref },
          ]}
        />
        <div className="page-head">
          <p className="eyebrow">{application.ref}</p>
          <h1>{product.name || application.creditName}</h1>
          <ApplicationStatusBadge status={application.status} />
          <p>
            Creada el {formatDate(application.createdAt)}. Progreso: {progressPercent(application, product)}%. {nextStepLabel(application, product)}
          </p>
          {isEditable(application.status) ? null : (
            <p className="hint">Esta pregestión ya se envió en el prototipo. El resumen queda visible y los datos ya no se modifican.</p>
          )}
        </div>
        {application.decision ? (
          <div className={`decision-box ${application.decision.result}`}>
            <h2>{application.decision.result === 'aceptada' ? 'Aceptada en la simulación' : 'Rechazada en la simulación'}</h2>
            <p>
              Esta decisión es solo del prototipo. No proviene de ASECCSS y no aprueba ni niega un crédito real.
            </p>
            {application.decision.reason ? <p>Motivo simulado: {application.decision.reason}</p> : null}
            <p className="hint">Registrada el {formatDate(application.decision.decidedAt)}.</p>
          </div>
        ) : null}
        {canSimulateDecision(application.status) ? (
          <section className="block">
            <h2>Simular revisión</h2>
            <p className="hint">
              Podés ensayar una aceptación o un rechazo. El resultado queda en la base de demostración y no representa un trámite oficial.
            </p>
            <label htmlFor="motivo-simulacion">Motivo de la simulación (opcional)</label>
            <textarea
              id="motivo-simulacion"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ejemplo: Documentación completa / Falta información de la garantía"
            />
            <div className="form-actions">
              <button
                className="btn btn-primary"
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    await updateStatus(application.ref, 'aceptada_demo', reason)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Simular aceptación
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  try {
                    await updateStatus(application.ref, 'rechazada_demo', reason)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Simular rechazo
              </button>
            </div>
          </section>
        ) : null}
        <ol className="progress-list">
          {steps.map((step) => (
            <li key={step.label}>
              <Icon name={step.done ? 'check' : 'clock'} size={16} />
              {step.label}: {step.done ? 'completo en el prototipo' : 'pendiente'}
            </li>
          ))}
        </ol>
        <section className="block">
          <h2>Información completada</h2>
          <dl>
            <div>
              <dt>Identificación de demostración</dt>
              <dd>{application.personal.identification || '—'}</dd>
            </div>
            <div>
              <dt>Nombre escrito en la pregestión</dt>
              <dd>{application.personal.fullName || '—'}</dd>
            </div>
            <div>
              <dt>Contacto</dt>
              <dd>
                {application.personal.email || '—'} · {application.personal.phone || '—'}
              </dd>
            </div>
            <div>
              <dt>Estado civil</dt>
              <dd>{optionLabel(maritalOptions, application.personal.maritalStatus)}</dd>
            </div>
            <div>
              <dt>Trabajo</dt>
              <dd>
                {optionLabel(jobOptions, application.employment.jobType)} · {application.employment.position || '—'} ·{' '}
                {optionLabel(tenureOptions, application.employment.tenure)}
              </dd>
            </div>
            <div>
              <dt>Ingreso de ejemplo</dt>
              <dd>{formatColones(application.employment.income)}</dd>
            </div>
            {product.formFields?.otherIncome ? (
              <div>
                <dt>Otros ingresos</dt>
                <dd>{application.employment.otherIncome ? formatColones(application.employment.otherIncome) : 'No indicado'}</dd>
              </div>
            ) : null}
          </dl>
        </section>
        <section className="block">
          <h2>Datos del crédito</h2>
          <dl>
            {(product.creditForm || []).map((field) => {
              const value = application.creditData?.[field.id]
              let display = value || '—'
              if (value && field.type === 'money') display = formatColones(value)
              if (value && field.type === 'select') {
                display = field.options?.find((option) => option.value === value)?.label || value
              }
              if (value && field.type === 'url') {
                display = (
                  <a href={value} target="_blank" rel="noopener noreferrer">
                    Abrir en Google Maps
                  </a>
                )
              }
              return (
                <div key={field.id}>
                  <dt>{creditFieldLabel(product.id, field.id)}</dt>
                  <dd>{display}</dd>
                </div>
              )
            })}
          </dl>
        </section>
        <section className="block" id="documentos">
          <h2>Documentos</h2>
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
          <h2>Historial</h2>
          {application.history?.length ? (
            <ul className="plain-list">
              {application.history.map((event) => (
                <li key={event.id}>
                  {event.text} <span className="hint">{formatDate(event.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Esta pregestión no tiene movimientos registrados.</p>
          )}
        </section>
        {notes.length ? (
          <section className="block">
            <h2>Observaciones de la simulación</h2>
            <ul className="plain-list">
              {notes.map((note) => (
                <li key={note.id}>
                  {note.text} <span className="hint">{formatDate(note.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className="form-actions">
          {isEditable(application.status) ? (
            <Link className="btn btn-primary" to={continuePath(application, product)}>
              {progress.docsOk ? 'Continuar pregestión' : 'Completar documentos'}
            </Link>
          ) : null}
          <button className="btn btn-secondary" type="button" onClick={() => downloadApplicationJson(application, product)}>
            Descargar JSON
          </button>
          <Link className="btn btn-secondary" to="/mis-creditos">
            Volver a mis créditos
          </Link>
        </div>
      </div>
    </section>
  )
}
