import { EmptyState } from '../components/EmptyState.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export function NotFoundPage() {
  usePageTitle('Página no encontrada')
  return (
    <section className="page">
      <div className="wrap">
        <EmptyState
          title="No encontramos esta página"
          text="El enlace no forma parte del módulo de créditos."
          actionLabel="Ir a créditos"
          actionTo="/creditos"
        />
      </div>
    </section>
  )
}
