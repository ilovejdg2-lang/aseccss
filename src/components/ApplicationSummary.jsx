import { Link } from 'react-router-dom'
import { creditFieldLabel } from '../data/creditForms.js'
import { jobOptions, maritalOptions, optionLabel, tenureOptions } from '../data/formConfig.js'
import { externalLinks } from '../data/site.js'
import { FILE_STATUS, formatColones, wizardPath } from '../lib/domain.js'

function formatCreditValue(field, value) {
  if (!value) return '—'
  if (field?.type === 'money') return formatColones(value)
  if (field?.type === 'select') {
    return field.options?.find((option) => option.value === value)?.label || value
  }
  if (field?.type === 'url') {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        Abrir en Google Maps
      </a>
    )
  }
  return value
}

function Block({ title, to, children }) {
  return (
    <section className="summary-block">
      <div className="summary-head">
        <h2>{title}</h2>
        {to ? <Link to={to}>Editar</Link> : null}
      </div>
      {children}
    </section>
  )
}

export function ApplicationSummary({ application, product, accepted, acceptError, onAccept }) {
  const pending = product.documents.filter((doc) => application.documents[doc.id]?.status !== 'seleccionado_local')
  return (
    <div className="summary">
      <Block title="Crédito seleccionado" to={`/creditos/${product.id}`}>
        <p>
          <strong>{product.name}</strong>
        </p>
        <p>{product.categoryName}</p>
      </Block>
      <Block title="Datos personales" to={wizardPath(product.id, 1)}>
        <dl>
          <div>
            <dt>Nombre</dt>
            <dd>{application.personal.fullName || '—'}</dd>
          </div>
          <div>
            <dt>Identificación</dt>
            <dd>{application.personal.identification || '—'}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{application.personal.email || '—'}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{application.personal.phone || '—'}</dd>
          </div>
          <div>
            <dt>Nacimiento</dt>
            <dd>{application.personal.birthDate || 'No indicado'}</dd>
          </div>
          <div>
            <dt>Estado civil</dt>
            <dd>{optionLabel(maritalOptions, application.personal.maritalStatus)}</dd>
          </div>
        </dl>
      </Block>
      <Block title="Información laboral" to={wizardPath(product.id, 2)}>
        <dl>
          <div>
            <dt>Tipo de trabajo</dt>
            <dd>{optionLabel(jobOptions, application.employment.jobType)}</dd>
          </div>
          <div>
            <dt>Empresa o patrono</dt>
            <dd>{application.employment.employer || '—'}</dd>
          </div>
          <div>
            <dt>Puesto</dt>
            <dd>{application.employment.position || '—'}</dd>
          </div>
          <div>
            <dt>Antigüedad</dt>
            <dd>{optionLabel(tenureOptions, application.employment.tenure)}</dd>
          </div>
          <div>
            <dt>Ingresos mensuales</dt>
            <dd>{formatColones(application.employment.income)}</dd>
          </div>
          {product.formFields?.otherIncome ? (
            <div>
              <dt>Otros ingresos</dt>
              <dd>{application.employment.otherIncome ? formatColones(application.employment.otherIncome) : 'No indicado'}</dd>
            </div>
          ) : null}
        </dl>
      </Block>
      <Block title="Datos del crédito" to={wizardPath(product.id, 3)}>
        <dl>
          {(product.creditForm || []).map((field) => (
            <div key={field.id}>
              <dt>{creditFieldLabel(product.id, field.id)}</dt>
              <dd>{formatCreditValue(field, application.creditData?.[field.id])}</dd>
            </div>
          ))}
        </dl>
      </Block>
      <Block title="Documentos seleccionados" to={wizardPath(product.id, 4)}>
        <ul className="plain-list">
          {product.documents.map((doc) => {
            const file = application.documents[doc.id]
            return (
              <li key={doc.id}>
                <strong>{doc.name}: </strong>
                {file ? `${file.fileName} · ${FILE_STATUS[file.status] || file.status}` : 'Pendiente'}
              </li>
            )
          })}
        </ul>
        {pending.length ? (
          <>
            <h3>Documentos pendientes</h3>
            <ul className="plain-list">
              {pending.map((doc) => (
                <li key={doc.id}>
                  {doc.name}
                  {doc.required ? ' (obligatorio en el prototipo)' : ' (opcional)'}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Los documentos obligatorios del prototipo están seleccionados en este dispositivo.</p>
        )}
      </Block>
      <section className="summary-block">
        <h2>Confirmación de la demostración</h2>
        <label className="check">
          <input type="checkbox" checked={accepted} onChange={(event) => onAccept(event.target.checked)} />
          <span>
            Entiendo que esta pregestión se guarda solo en el prototipo, que no fue enviada a ASECCSS y que no sustituye el análisis ni la aprobación del crédito. La política de privacidad institucional está en{' '}
            <a href={externalLinks.privacidad} target="_blank" rel="noopener noreferrer">
              aseccss.com/privacidad
            </a>
            . Este texto es de la demostración y no es un contrato.
          </span>
        </label>
        {acceptError ? <p className="field-error">{acceptError}</p> : null}
      </section>
    </div>
  )
}
