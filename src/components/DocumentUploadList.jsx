import { useRef } from 'react'
import { FILE_STATUS, formatBytes } from '../lib/domain.js'
import { Icon } from './Icons.jsx'

export function DocumentUploadList({ documents, values, onSelect, onRemove, disabled }) {
  const inputs = useRef({})
  return (
    <ul className="doc-list">
      {documents.map((doc) => {
        const file = values[doc.id]
        const status = file?.status || 'pendiente'
        return (
          <li key={doc.id} className={`doc-row status-${status}`}>
            <span className="doc-icon" aria-hidden="true">
              <Icon name="file" />
            </span>
            <div>
              <h3>{doc.name}</h3>
              <p>{doc.description}</p>
              <p className="hint">
                {doc.required ? 'Obligatorio en el prototipo' : 'Opcional en el prototipo'}
                {' · '}
                {doc.origin === 'pagina-publica' ? 'Mencionado en la página pública' : 'Ejemplo del prototipo'}
                {' · '}
                {doc.formats.join(', ')} · máximo {doc.maxMb} MB
              </p>
              <p className={`file-state state-${status}`}>
                <Icon name={status === 'error' ? 'alert' : status === 'seleccionado_local' ? 'check' : status === 'cargando' ? 'clock' : 'file'} size={15} />
                {FILE_STATUS[status] || 'Pendiente'}
                {file?.fileName ? ` · ${file.fileName} (${formatBytes(file.fileSize)})` : ''}
              </p>
              {file?.message ? <p className="hint">{file.message}</p> : null}
              <div className="card-actions">
                <button
                  className="btn btn-secondary btn-small"
                  type="button"
                  disabled={disabled || status === 'cargando'}
                  onClick={() => inputs.current[doc.id]?.click()}
                >
                  {status === 'seleccionado_local' || status === 'error' ? 'Reemplazar archivo' : 'Seleccionar archivo'}
                </button>
                <input
                  ref={(node) => {
                    inputs.current[doc.id] = node
                  }}
                  className="sr-only"
                  type="file"
                  tabIndex={-1}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => {
                    const selected = event.target.files?.[0]
                    if (selected) onSelect(doc, selected)
                    event.target.value = ''
                  }}
                />
                {file ? (
                  <button className="btn btn-ghost btn-small" type="button" onClick={() => onRemove(doc.id)} disabled={disabled}>
                    <Icon name="trash" size={16} />
                    Quitar
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
