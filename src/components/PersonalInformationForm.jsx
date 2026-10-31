import { maritalOptions } from '../data/formConfig.js'

function Field({ id, label, hint, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function PersonalInformationForm({ values, errors, onChange }) {
  function set(name, value) {
    onChange({ ...values, [name]: value })
  }

  return (
    <div className="form-grid">
      <Field id="nombre" label="Nombre completo" error={errors.fullName} hint="Usá un nombre de ejemplo.">
        <input
          id="nombre"
          value={values.fullName}
          onChange={(event) => set('fullName', event.target.value)}
          placeholder="Ejemplo: Ana Rojas Solís"
          autoComplete="name"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby="nombre-hint nombre-error"
          required
        />
      </Field>
      <Field
        id="identificacion"
        label="Identificación"
        error={errors.identification}
        hint="Para la demostración usá DEMO-0001. No escribas una cédula real."
      >
        <input
          id="identificacion"
          value={values.identification}
          onChange={(event) => set('identification', event.target.value)}
          placeholder="DEMO-0001"
          aria-invalid={Boolean(errors.identification)}
          aria-describedby="identificacion-hint identificacion-error"
          required
        />
      </Field>
      <Field id="correo" label="Correo electrónico" error={errors.email} hint="Puede ser un correo ficticio.">
        <input
          id="correo"
          type="email"
          value={values.email}
          onChange={(event) => set('email', event.target.value)}
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby="correo-hint correo-error"
          required
        />
      </Field>
      <Field id="telefono" label="Teléfono" error={errors.phone} hint="Ocho dígitos. Ejemplo: 8888-0000.">
        <input
          id="telefono"
          inputMode="tel"
          value={values.phone}
          onChange={(event) => set('phone', event.target.value)}
          placeholder="8888-0000"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby="telefono-hint telefono-error"
          required
        />
      </Field>
      <Field id="nacimiento" label="Fecha de nacimiento" error={errors.birthDate} hint="Opcional en este prototipo.">
        <input
          id="nacimiento"
          type="date"
          value={values.birthDate}
          onChange={(event) => set('birthDate', event.target.value)}
          aria-invalid={Boolean(errors.birthDate)}
          aria-describedby="nacimiento-hint nacimiento-error"
        />
      </Field>
      <Field id="estado-civil" label="Estado civil" hint="Opcional. No es un dato confirmado por la institución para esta pregestión.">
        <select id="estado-civil" value={values.maritalStatus} onChange={(event) => set('maritalStatus', event.target.value)}>
          {maritalOptions.map((option) => (
            <option key={option.value || 'vacio'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}
