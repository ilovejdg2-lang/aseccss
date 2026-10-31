import { Link } from 'react-router-dom'
import { externalLinks } from '../data/site.js'
import { Icon } from './Icons.jsx'

export function HelpSection() {
  return (
    <section className="help" aria-labelledby="titulo-ayuda">
      <div className="help-copy">
        <span className="help-icon" aria-hidden="true">
          <Icon name="headset" size={28} />
        </span>
        <div>
          <h2 id="titulo-ayuda">¿Necesitás ayuda?</h2>
          <p>
            Si la duda es sobre condiciones, requisitos o el estado formal de un crédito, usá los canales oficiales.
            También podés llamar al {externalLinks.phoneLabel}.
          </p>
        </div>
      </div>
      <div className="help-actions">
        <a className="btn btn-primary" href={externalLinks.whatsapp} target="_blank" rel="noopener noreferrer">
          Escribir por WhatsApp
        </a>
        <Link className="btn btn-secondary" to="/creditos/preguntas-frecuentes">
          Preguntas frecuentes
        </Link>
        <a className="text-link" href={externalLinks.canales} target="_blank" rel="noopener noreferrer">
          Canales de atención
        </a>
      </div>
    </section>
  )
}
