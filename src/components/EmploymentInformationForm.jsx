import { jobOptions, tenureOptions } from '../data/formConfig.js'

function Field({ id, label, hint, error, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
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

export function EmploymentInformationForm({ values, errors, onChange, showOtherIncome = false }) {
  function set(name, value) {
    onChange({ ...values, [name]: value })
  }

  return (
    <div className="form-grid">
      <Field id="tipo-trabajo" label="Tipo de trabajo" error={errors.jobType}>
        <select
          id="tipo-trabajo"
          value={values.jobType}
          onChange={(event) => set('jobType', event.target.value)}
          aria-invalid={Boolean(errors.jobType)}
          aria-describedby="tipo-trabajo-error"
          required
        >
          {jobOptions.map((option) => (
            <option key={option.value || 'vacio'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="empresa" label="Nombre de la empresa o patrono" error={errors.employer} hint="Usá un nombre ficticio.">
        <input
          id="empresa"
          value={values.employer}
          onChange={(event) => set('employer', event.target.value)}
          placeholder="Ejemplo: Centro de salud demo"
          aria-invalid={Boolean(errors.employer)}
          aria-describedby="empresa-hint empresa-error"
          required
        />
      </Field>
      <Field id="puesto" label="Puesto" error={errors.position}>
        <input
          id="puesto"
          value={values.position}
          onChange={(event) => set('position', event.target.value)}
          placeholder="Ejemplo: Profesional de apoyo"
          aria-invalid={Boolean(errors.position)}
          aria-describedby="puesto-error"
          required
        />
      </Field>
      <Field id="antiguedad" label="Antigüedad laboral" error={errors.tenure}>
        <select
          id="antiguedad"
          value={values.tenure}
          onChange={(event) => set('tenure', event.target.value)}
          aria-invalid={Boolean(errors.tenure)}
          aria-describedby="antiguedad-error"
          required
        >
          {tenureOptions.map((option) => (
            <option key={option.value || 'vacio'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field
        id="ingresos"
        label="Ingresos mensuales"
        error={errors.income}
        hint="Monto de ejemplo, en colones. No se envía a ASECCSS."
        className="span-2"
      >
        <input
          id="ingresos"
          inputMode="numeric"
          value={values.income}
          onChange={(event) => set('income', event.target.value.replace(/[^\d]/g, ''))}
          placeholder="Ejemplo: 450000"
          aria-invalid={Boolean(errors.income)}
          aria-describedby="ingresos-hint ingresos-error"
        required
      />
    </Field>
    {showOtherIncome ? (
      <Field
        id="otros-ingresos"
        label="Otros ingresos"
        error={errors.otherIncome}
        hint="Opcional. Es un campo del prototipo para esta línea y está pendiente de confirmación con ASECCSS."
      >
        <input
          id="otros-ingresos"
          inputMode="numeric"
          value={values.otherIncome || ''}
          onChange={(event) => set('otherIncome', event.target.value.replace(/[^\d]/g, ''))}
          placeholder="Ejemplo: 80000"
          aria-invalid={Boolean(errors.otherIncome)}
          aria-describedby="otros-ingresos-hint otros-ingresos-error"
        />
      </Field>
    ) : null}
  </div>
)
}
