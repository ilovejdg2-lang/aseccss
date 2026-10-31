import { Link } from 'react-router-dom'
import { wizardPath } from '../lib/domain.js'

const STEPS = [
  { id: 1, label: 'Datos personales' },
  { id: 2, label: 'Información laboral' },
  { id: 3, label: 'Datos del crédito' },
  { id: 4, label: 'Documentos' },
  { id: 5, label: 'Confirmación' },
]

export function ApplicationStepper({ productId, current, unlocked }) {
  return (
    <ol className="stepper" aria-label="Progreso de la pregestión">
      {STEPS.map((step) => {
        const state = step.id === current ? 'current' : step.id < current ? 'done' : 'upcoming'
        const canOpen = step.id <= unlocked && step.id !== current
        return (
          <li key={step.id} className={`step-${state}`}>
            {canOpen ? (
              <Link to={wizardPath(productId, step.id)}>
                <span>{step.id}</span>
                {step.label}
              </Link>
            ) : (
              <span className="step-label" aria-current={step.id === current ? 'step' : undefined}>
                <span>{step.id}</span>
                {step.label}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
