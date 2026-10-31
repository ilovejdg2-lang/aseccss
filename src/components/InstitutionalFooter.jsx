import { useState } from 'react'
import { Link } from 'react-router-dom'
import { externalLinks } from '../data/site.js'
import { Icon } from './Icons.jsx'

export function InstitutionalFooter() {
  const [logoFailed, setLogoFailed] = useState(false)
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Link className="brand" to="/creditos" aria-label="ASECCSS, inicio del módulo">
            {logoFailed ? (
              <span className="logo-fallback">ASECCSS</span>
            ) : (
              <img src="/brand/logo.png" alt="ASECCSS" onError={() => setLogoFailed(true)} />
            )}
          </Link>
          <p>Prototipo académico del módulo de pregestión de créditos. No es un canal oficial de solicitud.</p>
        </div>
        <div>
          <h2>Institución</h2>
          <a href={externalLinks.condiciones} target="_blank" rel="noopener noreferrer">
            Términos y condiciones
          </a>
          <a href={externalLinks.privacidad} target="_blank" rel="noopener noreferrer">
            Política de privacidad
          </a>
          <a href={externalLinks.contacto} target="_blank" rel="noopener noreferrer">
            Contacto
          </a>
          <a href={externalLinks.sucursales} target="_blank" rel="noopener noreferrer">
            Sucursales
          </a>
        </div>
        <div>
          <h2>Este módulo</h2>
          <Link to="/creditos">Créditos</Link>
          <Link to="/mis-creditos">Mis créditos</Link>
          <Link to="/mi-perfil">Mi perfil</Link>
          <Link to="/creditos/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link to="/admin/creditos">Panel de demostración</Link>
        </div>
        <div>
          <h2>Redes sociales</h2>
          <div className="socials">
            <a href={externalLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook de ASECCSS">
              <Icon name="external" size={18} />
              <span>Facebook</span>
            </a>
            <a href={externalLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de ASECCSS">
              <Icon name="external" size={18} />
              <span>Instagram</span>
            </a>
            <a href={externalLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de ASECCSS">
              <Icon name="external" size={18} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
