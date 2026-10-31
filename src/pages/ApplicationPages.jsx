import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { externalLinks } from '../data/site.js'
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge.jsx'
import { ApplicationStepper } from '../components/ApplicationStepper.jsx'
import { ApplicationSummary } from '../components/ApplicationSummary.jsx'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { CreditInformationForm } from '../components/CreditInformationForm.jsx'
import { DocumentUploadList } from '../components/DocumentUploadList.jsx'
import { EmploymentInformationForm } from '../components/EmploymentInformationForm.jsx'
import { PersonalInformationForm } from '../components/PersonalInformationForm.jsx'
import { useDemo } from '../context/DemoStore.jsx'
import {
  completion,
  downloadApplicationJson,
  isEditable,
  validateCreditData,
  validateEmployment,
  validatePersonal,
  wizardPath,
} from '../lib/domain.js'
import { usePageTitle } from '../lib/usePageTitle.js'

function useWizard(step) {
  const { id } = useParams()
  const navigate = useNavigate()
  const demo = useDemo()
  const product = demo.getAnyProduct(id)
  const application = demo.getWizardApplication(id)

  useEffect(() => {
    if (!product) {
      navigate('/creditos/catalogo', { replace: true })
      return
    }
    if (!application) {
      const alreadySent = demo.applications.some((item) => item.productId === id && !isEditable(item.status))
      if (!(alreadySent && step === 5)) navigate(`/creditos/${id}`, { replace: true })
      return
    }
    const progress = completion(application, product)
    if (step > 1 && !progress.personalOk) navigate(wizardPath(product.id, 1), { replace: true })
    else if (step > 2 && !progress.employmentOk) navigate(wizardPath(product.id, 2), { replace: true })
    else if (step > 3 && !progress.creditOk) navigate(wizardPath(product.id, 3), { replace: true })
  }, [application, demo.applications, id, navigate, product, step])

  return { product, application, demo, navigate }
}

function Frame({ step, product, application, title, lead, children, actions }) {
  const progress = completion(application, product)
  const unlocked = !progress.personalOk
    ? 1
    : !progress.employmentOk
      ? 2
      : !progress.creditOk
        ? 3
        : !progress.docsOk
          ? 4
          : 5
  return (
    <section className="page">
      <div className="wrap narrow">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: product.name, to: `/creditos/${product.id}` },
            { label: 'Solicitar crédito' },
          ]}
        />
        <p className="eyebrow">
          Paso {step} de 5 · {application.ref}
        </p>
        <ApplicationStepper productId={product.id} current={step} unlocked={unlocked} />
        <div className="page-head">
          <h1>{title}</h1>
          {lead ? <p>{lead}</p> : null}
        </div>
        {children}
        <div className="form-actions">{actions}</div>
      </div>
    </section>
  )
}

function cancelTo(productId) {
  const leave = window.confirm('¿Querés salir? El borrador se conserva en la base de demostración.')
  return leave ? `/creditos/${productId}` : null
}

export function PersonalStepPage() {
  const { product, application, demo, navigate } = useWizard(1)
  const [values, setValues] = useState(application?.personal)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  usePageTitle('Datos personales')

  useEffect(() => {
    if (application) setValues(application.personal)
  }, [application?.ref])

  if (!product || !application || !values) return null

  function onChange(next) {
    setValues(next)
    if (attempted) setErrors(validatePersonal(next))
    demo.updatePersonal(application.ref, next)
  }

  async function next() {
    const nextErrors = validatePersonal(values)
    setAttempted(true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      await demo.updatePersonal(application.ref, values, true)
    } catch {
      return
    }
    navigate(wizardPath(product.id, 2))
  }

  return (
    <Frame
      step={1}
      product={product}
      application={application}
      title="Datos personales"
      lead="Completá la información de la demostración. No envíes datos reales."
      actions={
        <>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              const to = cancelTo(product.id)
              if (to) navigate(to)
            }}
          >
            Cancelar
          </button>
          <button className="btn btn-primary" type="button" onClick={next}>
            Guardar y continuar
          </button>
        </>
      }
    >
      {Object.keys(errors).length ? (
        <p className="form-alert" role="alert">
          Revisá los campos marcados antes de continuar.
        </p>
      ) : null}
      <PersonalInformationForm values={values} errors={errors} onChange={onChange} />
    </Frame>
  )
}

export function EmploymentStepPage() {
  const { product, application, demo, navigate } = useWizard(2)
  const [values, setValues] = useState(application?.employment)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  usePageTitle('Información laboral')

  useEffect(() => {
    if (application) setValues(application.employment)
  }, [application?.ref])

  if (!product || !application || !values) return null

  function onChange(next) {
    setValues(next)
    if (attempted) setErrors(validateEmployment(next))
    demo.updateEmployment(application.ref, next)
  }

  async function next() {
    const nextErrors = validateEmployment(values)
    setAttempted(true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      await demo.updateEmployment(application.ref, values, true)
    } catch {
      return
    }
    navigate(wizardPath(product.id, 3))
  }

  return (
    <Frame
      step={2}
      product={product}
      application={application}
      title="Información laboral"
      lead="Estos campos pertenecen al prototipo y están pendientes de confirmación con ASECCSS. No se pide la dirección porque ese requisito no está confirmado."
      actions={
        <>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(wizardPath(product.id, 1))}>
            Anterior
          </button>
          <button className="btn btn-primary" type="button" onClick={next}>
            Guardar y continuar
          </button>
        </>
      }
    >
      {Object.keys(errors).length ? (
        <p className="form-alert" role="alert">
          Revisá los campos marcados antes de continuar.
        </p>
      ) : null}
      <EmploymentInformationForm
        values={values}
        errors={errors}
        onChange={onChange}
        showOtherIncome={Boolean(product.formFields?.otherIncome)}
      />
    </Frame>
  )
}

export function CreditDataStepPage() {
  const { product, application, demo, navigate } = useWizard(3)
  const [values, setValues] = useState(application?.creditData)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  usePageTitle('Datos del crédito')

  useEffect(() => {
    if (application) setValues(application.creditData)
  }, [application?.ref])

  if (!product || !application || !values) return null

  function onChange(next) {
    setValues(next)
    if (attempted) setErrors(validateCreditData(next, product))
    demo.updateCreditData(application.ref, next)
  }

  async function next() {
    const nextErrors = validateCreditData(values, product)
    setAttempted(true)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      await demo.updateCreditData(application.ref, values, true)
    } catch {
      return
    }
    navigate(wizardPath(product.id, 4))
  }

  return (
    <Frame
      step={3}
      product={product}
      application={application}
      title={`Datos de ${product.name}`}
      lead="Completá la información específica de esta línea. Cada crédito tiene su propio formulario y los datos se guardan en JSON."
      actions={
        <>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(wizardPath(product.id, 2))}>
            Anterior
          </button>
          <button className="btn btn-primary" type="button" onClick={next}>
            Guardar y continuar
          </button>
        </>
      }
    >
      {Object.keys(errors).length ? (
        <p className="form-alert" role="alert">
          Revisá los campos marcados antes de continuar.
        </p>
      ) : null}
      <CreditInformationForm
        fields={product.creditForm}
        values={values}
        errors={errors}
        onChange={onChange}
      />
    </Frame>
  )
}

export function DocumentsStepPage() {
  const { product, application, demo, navigate } = useWizard(4)
  const [error, setError] = useState('')
  usePageTitle('Documentos')

  if (!product || !application) return null
  const progress = completion(application, product)
  const loading = Object.values(application.documents).some((file) => file.status === 'cargando')

  function next() {
    if (loading) return
    if (!progress.docsOk) {
      setError('Seleccioná los documentos obligatorios del prototipo antes de continuar.')
      return
    }
    setError('')
    navigate(wizardPath(product.id, 5))
  }

  return (
    <Frame
      step={4}
      product={product}
      application={application}
      title="Prepará tus documentos"
      lead="Adjuntá los documentos solicitados para continuar con tu pregestión. Solo se guardan el nombre y el tamaño en la base de demostración; el archivo no se almacena."
      actions={
        <>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(wizardPath(product.id, 3))}>
            Anterior
          </button>
          <button className="btn btn-primary" type="button" onClick={next} disabled={loading}>
            Guardar y continuar
          </button>
        </>
      }
    >
      <p className="hint">
        {progress.pendingRequired.length
          ? `Pendientes obligatorios: ${progress.pendingRequired.map((doc) => doc.name).join(', ')}.`
          : 'Los documentos obligatorios ya están seleccionados en este dispositivo.'}
      </p>
      {error ? (
        <p className="form-alert" role="alert">
          {error}
        </p>
      ) : null}
      <DocumentUploadList
        documents={product.documents}
        values={application.documents}
        onSelect={(doc, file) => demo.selectFile(application.ref, doc, file)}
        onRemove={(docId) => demo.removeFile(application.ref, docId)}
      />
    </Frame>
  )
}

export function ConfirmationStepPage() {
  const { product, application, demo, navigate } = useWizard(5)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  usePageTitle('Confirmación')

  if (!product || !application) return null
  const progress = completion(application, product)

  async function save() {
    if (!progress.personalOk || !progress.employmentOk || !progress.creditOk || !progress.docsOk) {
      setError('Faltan datos o documentos obligatorios del prototipo.')
      return
    }
    if (!accepted) {
      setError('Confirmá que entendés el alcance de la demostración.')
      return
    }
    try {
      await demo.submitApplication(application.ref)
    } catch (error) {
      setError(error.message)
      return
    }
    navigate(`/creditos/solicitud/${product.id}/resultado?ref=${application.ref}`)
  }

  return (
    <Frame
      step={5}
      product={product}
      application={application}
      title="Revisá tu pregestión"
      lead="Verificá la información antes de guardarla en JSON en el prototipo."
      actions={
        <>
          <button className="btn btn-secondary" type="button" onClick={() => navigate(wizardPath(product.id, 4))}>
            Anterior
          </button>
          <button className="btn btn-primary" type="button" onClick={save}>
            Enviar pregestión
          </button>
        </>
      }
    >
      {error ? (
        <p className="form-alert" role="alert">
          {error}
        </p>
      ) : null}
      <ApplicationSummary
        application={application}
        product={product}
        accepted={accepted}
        acceptError={accepted ? '' : error}
        onAccept={(value) => {
          setAccepted(value)
          setError('')
        }}
      />
    </Frame>
  )
}

export function ResultPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { getApplication, getAnyProduct } = useDemo()
  const ref = params.get('ref')
  const application = ref ? getApplication(ref) : null
  const product = getAnyProduct(id)
  usePageTitle('Pregestión guardada')

  if (!application || !product) {
    return (
      <section className="page">
        <div className="wrap narrow">
          <h1>No encontramos la pregestión</h1>
          <Link className="btn btn-primary" to="/mis-creditos">
            Volver a mis créditos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="wrap narrow">
        <div className="result-card">
          <ApplicationStatusBadge status={application.status} />
          <h1>Pregestión guardada en el prototipo</h1>
          <p>
            Generamos la referencia de demostración <strong>{application.ref}</strong> para {product.name}. La información quedó guardada en JSON en la base de demostración.
            ASECCSS no recibió esta pregestión. En Mis créditos podés simular una aceptación o un rechazo; eso tampoco es una decisión oficial.
          </p>
          <div className="form-actions">
            <Link className="btn btn-primary" to={`/mis-creditos/${application.ref}`}>
              Ver detalle y simular revisión
            </Link>
            <Link className="btn btn-secondary" to="/mis-creditos">
              Ver mis créditos
            </Link>
            <button className="btn btn-secondary" type="button" onClick={() => downloadApplicationJson(application, product)}>
              Descargar JSON
            </button>
            <Link className="btn btn-secondary" to="/creditos">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
