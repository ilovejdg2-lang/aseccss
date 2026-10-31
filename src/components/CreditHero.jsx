import { Link } from 'react-router-dom'
import { externalLinks } from '../data/site.js'
import { Breadcrumbs } from './Breadcrumbs.jsx'
import { Icon } from './Icons.jsx'

export function CreditHero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: externalLinks.home },
              { label: 'Créditos' },
            ]}
          />
          <h1>Tu proyecto también es parte de nuestro compromiso</h1>
          <p>
            Conocé las opciones de crédito y prepará tus documentos con mayor claridad. Te acompañamos durante el proceso de pregestión.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/creditos/catalogo">
              Explorar créditos
              <Icon name="arrow" size={18} />
            </Link>
            <Link className="btn btn-secondary" to="/mis-creditos">
              Consultar mis solicitudes
            </Link>
          </div>
        </div>
        <figure className="hero-figure">
          <img
            src="/images/hero-pregestion.jpg"
            alt="Persona revisando documentos junto a una computadora. Imagen ilustrativa, no corresponde a una oficina de ASECCSS."
          />
          <blockquote>
            Tu esfuerzo
            <br />
            también
            <br />
            construye futuro
          </blockquote>
          <figcaption>Imagen ilustrativa. No es una oficina ni una persona asociada de ASECCSS.</figcaption>
        </figure>
      </div>
    </section>
  )
}
