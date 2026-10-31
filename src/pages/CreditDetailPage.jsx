import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { externalLinks } from '../data/site.js'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { CreditDetails } from '../components/CreditDetails.jsx'
import { Dialog } from '../components/Dialog.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useDemo } from '../context/DemoStore.jsx'
import { continuePath } from '../lib/domain.js'
import { usePageTitle } from '../lib/usePageTitle.js'

export function CreditDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const demo = useDemo()
  const product = demo.getPublicProduct(id)
  const draft = product ? demo.getWizardApplication(product.id) : null
  const related = product?.relatedId ? demo.getPublicProduct(product.relatedId) : null
  const [open, setOpen] = useState(false)
  const [startError, setStartError] = useState('')
  usePageTitle(product?.name || 'Crédito')

  if (!product) {
    return (
      <section className="page">
        <div className="wrap">
          <EmptyState
            title="No encontramos esa línea"
            text="Puede estar desactivada en la simulación o el enlace ya no corresponde a una ficha publicada."
            actionLabel="Volver al catálogo"
            actionTo="/creditos/catalogo"
          />
        </div>
      </section>
    )
  }

  async function start() {
    try {
      const application = await demo.startApplication(product.id)
      navigate(continuePath(application, product))
    } catch (error) {
      setStartError(error.message)
    }
  }

  return (
    <section className="page">
      <div className="wrap narrow">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: 'Catálogo', to: '/creditos/catalogo' },
            { label: product.name },
          ]}
        />
        <CreditDetails product={product} related={related} hasDraft={Boolean(draft)} onStart={() => setOpen(true)} />
      </div>
      {open ? (
        <Dialog title={draft ? 'Ya tenés una pregestión en curso' : 'Esta es una demostración'} onClose={() => setOpen(false)}>
          <p>
            {draft
              ? 'Podés continuar la pregestión guardada en la base de demostración. Seguir no envía nada a ASECCSS.'
              : 'Al continuar se crea una pregestión en la base de demostración. No inicia una solicitud formal, no consulta datos reales y no aprueba el crédito.'}
          </p>
          {startError ? <p className="form-alert">{startError}</p> : null}
          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="button" onClick={start}>
              {draft ? 'Continuar pregestión' : 'Continuar demostración'}
            </button>
          </div>
          <p className="hint">
            Si preferís un canal oficial, usá <a href={externalLinks.psl}>la Plataforma de Servicios en Línea</a>.
          </p>
          <Link to="/mis-creditos">Ver mis pregestiones</Link>
        </Dialog>
      ) : null}
    </section>
  )
}
