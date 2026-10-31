import { categories, isModuleCredit, products } from '../data/catalog.js'
import { CreditCategoryCard } from '../components/CreditCategoryCard.jsx'
import { CreditHero } from '../components/CreditHero.jsx'
import { HelpSection } from '../components/HelpSection.jsx'
import { Icon } from '../components/Icons.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

const steps = [
  { icon: 'file', title: 'Elegí tu crédito', text: 'Revisá las opciones disponibles y conocé los requisitos de cada línea.' },
  { icon: 'folder', title: 'Prepará los documentos', text: 'Completá la información y seleccioná los archivos de ejemplo en este dispositivo.' },
  { icon: 'search', title: 'Consultá el avance', text: 'Da seguimiento a la pregestión guardada en el prototipo, en todo momento.' },
]

export function CreditsHome() {
  usePageTitle('Créditos')
  return (
    <>
      <CreditHero />
      <section className="section">
        <div className="wrap">
          <p className="section-kicker">Líneas de referencia</p>
          <h2>¿Qué te gustaría financiar?</h2>
          <p className="lead">
            Este módulo solo incluye vivienda y vehículo. Esas líneas no están en el catálogo de aseccss.com/creditos/, donde ASECCSS ya publica un formulario digital de solicitud. Las demás se consultan en ese canal.
          </p>
          <div className="category-grid">
            {categories
              .filter((category) => products.some((item) => item.categoryId === category.id && isModuleCredit(item)))
              .map((category) => (
                <CreditCategoryCard key={category.id} category={category} />
              ))}
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="wrap">
          <h2>¿Cómo funciona?</h2>
          <p className="lead">Es un recorrido de pregestión dentro de este prototipo.</p>
          <ol className="process">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <Icon name={step.icon} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <HelpSection />
        </div>
      </section>
    </>
  )
}
