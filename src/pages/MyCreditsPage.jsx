import { useMemo, useState } from 'react'
import { externalLinks } from '../data/site.js'
import { APPLICATION_FILTERS, matchesApplicationFilter, summarizeApplications } from '../lib/domain.js'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { MyCreditsSummary } from '../components/MyCreditsSummary.jsx'
import { MyCreditsTable } from '../components/MyCreditsTable.jsx'
import { useDemo } from '../context/DemoStore.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export function MyCreditsPage() {
  usePageTitle('Mis créditos')
  const { applications, getAnyProduct } = useDemo()
  const [filter, setFilter] = useState('todas')
  const [query, setQuery] = useState('')
  const counts = summarizeApplications(applications)
  const rows = useMemo(
    () =>
      applications
        .filter((application) => matchesApplicationFilter(application, filter))
        .map((application) => ({ application, product: getAnyProduct(application.productId) }))
        .filter(({ application, product }) => {
          const haystack = `${application.ref} ${product?.name || application.creditName || ''}`.toLowerCase()
          return haystack.includes(query.trim().toLowerCase())
        }),
    [applications, filter, getAnyProduct, query],
  )

  return (
    <section className="page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: 'Mis créditos' },
          ]}
        />
        <div className="page-head">
          <h1>Mis créditos</h1>
          <p>Consultá tus pregestiones y revisá qué pasos te faltan.</p>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Todavía no tenés pregestiones registradas"
            text="Cuando envíes una pregestión desde el catálogo, vas a verla en esta pantalla."
            actionLabel="Explorar créditos"
            actionTo="/creditos/catalogo"
          />
        ) : (
          <>
            <MyCreditsSummary counts={counts} active={filter} onChange={setFilter} />
            <div className="toolbar">
              <label htmlFor="buscar-pregestion">Buscar</label>
              <input
                id="buscar-pregestion"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Referencia o nombre del crédito"
              />
            </div>
            <div className="chip-row" role="toolbar" aria-label="Filtrar pregestiones">
              {APPLICATION_FILTERS.map((item) => (
                <button key={item.id} type="button" className={filter === item.id ? 'is-active' : ''} onClick={() => setFilter(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            {rows.length ? (
              <MyCreditsTable rows={rows} />
            ) : (
              <EmptyState title="No hay pregestiones en este estado" text="Probá con otro filtro para ver el resto de la simulación." />
            )}
          </>
        )}
      </div>
    </section>
  )
}
