import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, listPurposes } from '../data/catalog.js'
import { externalLinks } from '../data/site.js'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { CreditCatalogFilters } from '../components/CreditCatalogFilters.jsx'
import { CreditProductCard } from '../components/CreditProductCard.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useDemo } from '../context/DemoStore.jsx'
import { filterProducts } from '../lib/domain.js'
import { usePageTitle } from '../lib/usePageTitle.js'

const emptyFilters = { tipo: '', finalidad: '', plazo: '', monto: '', q: '' }

export function CatalogPage() {
  usePageTitle('Catálogo de créditos')
  const demo = useDemo()
  const [params, setParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const applied = useMemo(
    () => ({
      tipo: params.get('tipo') || '',
      finalidad: params.get('finalidad') || '',
      plazo: params.get('plazo') || '',
      monto: params.get('monto') || '',
      q: params.get('q') || '',
    }),
    [params],
  )
  const [draft, setDraft] = useState(applied)

  useEffect(() => {
    setDraft(applied)
  }, [applied])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const purposes = listPurposes(demo.catalog)
  const results = filterProducts(demo.catalog, applied)

  function apply() {
    const next = {}
    Object.entries(draft).forEach(([key, value]) => {
      if (value) next[key] = value
    })
    setParams(next)
  }

  return (
    <section className="page">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: 'Catálogo' },
          ]}
        />
        <div className="page-head">
          <h1>Catálogo de créditos</h1>
          <p>
            Solo aparecen vivienda y vehículo. Consumo, deudas externas, salud, educación, inversión, pymes y Credi Pet ya tienen formulario digital en el catálogo público de ASECCSS.
          </p>
        </div>
        <div className="catalog-layout">
          <CreditCatalogFilters
            draft={draft}
            categories={categories.filter((category) => demo.catalog.some((item) => item.categoryId === category.id))}
            purposes={purposes}
            onChange={setDraft}
            onApply={apply}
            onClear={() => {
              setDraft(emptyFilters)
              setParams({})
            }}
          />
          <div>
            {demo.simulateCatalogError ? (
              <EmptyState
                icon="alert"
                title="No se pudo cargar el catálogo"
                text="La simulación de error está activa en el panel de demostración. Podés reintentar desde aquí."
                actionLabel="Reintentar"
                onAction={() => demo.setCatalogError(false)}
              />
            ) : loading ? (
              <div className="skeleton-list" aria-live="polite">
                <p className="sr-only">Cargando información</p>
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            ) : results.length ? (
              <>
                <p className="results-count" aria-live="polite">
                  {results.length} {results.length === 1 ? 'línea encontrada' : 'líneas encontradas'}
                </p>
                <div className="results">
                  {results.map((product) => (
                    <CreditProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon="search"
                title="No hay resultados"
                text="Ninguna línea coincide con esos filtros. Limpiá la búsqueda o consultá otra finalidad."
                actionLabel="Limpiar filtros"
                onAction={() => {
                  setDraft(emptyFilters)
                  setParams({})
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
