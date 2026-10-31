export function CreditInformationForm({ fields, values, errors, onChange }) {
  function set(name, value) {
    onChange({ ...values, [name]: value })
  }

  return (
    <div className="form-grid">
      {fields.map((field) => {
        const id = `credito-${field.id}`
        const error = errors[field.id]
        const common = {
          id,
          value: values[field.id] || '',
          'aria-invalid': Boolean(error),
          'aria-describedby': `${id}-hint ${id}-error`,
          required: field.required,
        }
        return (
          <div key={field.id} className={`field ${field.type === 'textarea' ? 'span-2' : ''}`}>
            <label htmlFor={id}>{field.label}</label>
            {field.type === 'select' ? (
              <select {...common} onChange={(event) => set(field.id, event.target.value)}>
                {field.options.map((option) => (
                  <option key={option.value || 'vacio'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                {...common}
                rows={3}
                placeholder={field.placeholder}
                onChange={(event) => set(field.id, event.target.value)}
              />
            ) : (
              <input
                {...common}
                type={field.type === 'url' ? 'url' : 'text'}
                inputMode={field.type === 'money' ? 'numeric' : 'text'}
                placeholder={field.placeholder}
                onChange={(event) =>
                  set(
                    field.id,
                    field.type === 'money' ? event.target.value.replace(/[^\d]/g, '') : event.target.value,
                  )
                }
              />
            )}
            {field.hint ? (
              <p id={`${id}-hint`} className="hint">
                {field.hint}
              </p>
            ) : null}
            {error ? (
              <p id={`${id}-error`} className="field-error">
                {error}
              </p>
            ) : null}
          </div>
        )
      })}
      <p className="hint span-2">
        Estos campos son del prototipo para esta línea y están pendientes de confirmación con ASECCSS. No inventan un requisito oficial.
      </p>
    </div>
  )
}
