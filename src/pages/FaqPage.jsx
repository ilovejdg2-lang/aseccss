import { processFaqs } from '../data/site.js'
import { externalLinks } from '../data/site.js'
import { Breadcrumbs } from '../components/Breadcrumbs.jsx'
import { HelpSection } from '../components/HelpSection.jsx'
import { usePageTitle } from '../lib/usePageTitle.js'

export function FaqPage() {
  usePageTitle('Preguntas frecuentes')
  return (
    <section className="page">
      <div className="wrap narrow">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: externalLinks.home },
            { label: 'Créditos', to: '/creditos' },
            { label: 'Preguntas frecuentes' },
          ]}
        />
        <div className="page-head">
          <h1>Preguntas frecuentes</h1>
          <p>Respuestas sobre este prototipo. Para trámites reales, consultá los canales de ASECCSS.</p>
        </div>
        <div className="faq-list">
          {processFaqs.map((item) => (
            <details key={item.question} open>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <HelpSection />
      </div>
    </section>
  )
}
