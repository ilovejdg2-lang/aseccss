import { Link } from 'react-router-dom'
import { processFaqs } from '../data/site.js'
import { Icon } from './Icons.jsx'

export function CreditDetails({ product, related, onStart, hasDraft }) {
  return (
    <div className="detail-layout">
      <div>
        <p className="eyebrow">{product.categoryName}</p>
        <h1>{product.name}</h1>
        <p className="lead">{product.summary}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={onStart}>
            {hasDraft ? 'Continuar pregestión' : 'Solicitar crédito'}
          </button>
          <Link className="btn btn-secondary" to="/creditos/catalogo">
            Volver al catálogo
          </Link>
        </div>
        {product.editedInDemo ? <p className="hint">Parte del texto de esta ficha fue editado en la simulación.</p> : null}

        <section className="block">
          <h2>Descripción</h2>
          <p>{product.description}</p>
          {product.sourceUrl ? (
            <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
              Ver la página pública de referencia
              <Icon name="external" size={16} />
            </a>
          ) : (
            <p className="hint">Ficha creada dentro del prototipo. No corresponde a una publicación de ASECCSS.</p>
          )}
        </section>

        <section className="block">
          <h2>Finalidad</h2>
          <p>{product.purposeLabel}</p>
          {product.highlights?.length ? (
            <ul>
              {product.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="block" id="requisitos">
          <h2>Requisitos</h2>
          {product.publishedRequirements.length ? (
            <>
              <p>Estos puntos aparecen en la página pública consultada:</p>
              <ul>
                {product.publishedRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>La página pública consultada no detalla la lista de requisitos. Consultá las condiciones vigentes con ASECCSS.</p>
          )}
          <a className="btn btn-secondary btn-small" href="#documentos">
            Consultar lista de requisitos
          </a>
        </section>

        <section className="block" id="documentos">
          <h2>Documentos para la pregestión</h2>
          <p className="hint">
            La lista de abajo sirve para ensayar el prototipo. Un documento marcado como ejemplo no es un requisito oficial. Nada se envía a ASECCSS.
          </p>
          <ul className="doc-preview">
            {product.documents.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.name}</strong>
                <span>{doc.required ? 'Obligatorio en el prototipo' : 'Opcional en el prototipo'}</span>
                <span>{doc.origin === 'pagina-publica' ? 'Mencionado en la página pública' : 'Ejemplo del prototipo'}</span>
                <span>
                  {doc.formats.join(', ')} · máximo {doc.maxMb} MB
                </span>
                <p>{doc.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="block">
          <h2>Condiciones disponibles</h2>
          {product.conditionsConfirmed && product.conditions.length ? (
            <>
              <dl className="condition-list">
                {product.conditions.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              {product.conditionsNote ? <p className="hint">{product.conditionsNote}</p> : null}
            </>
          ) : (
            <p>Consultá las condiciones vigentes con ASECCSS. Esta ficha no muestra cifras porque no estaban publicadas para esta finalidad.</p>
          )}
          {related ? (
            <p>
              La ficha general relacionada es{' '}
              <Link to={`/creditos/${related.id}`}>{related.name}</Link>. Confirmá con ASECCSS si esas condiciones aplican aquí.
            </p>
          ) : null}
        </section>

        <section className="block">
          <h2>Preguntas frecuentes</h2>
          <div className="faq-list">
            {processFaqs.slice(0, 4).map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
