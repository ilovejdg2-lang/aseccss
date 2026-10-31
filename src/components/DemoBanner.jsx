import { useDemo } from '../context/DemoStore.jsx'

export function DemoBanner({ compact = false }) {
  const { saveError, storageMode } = useDemo()
  const message = saveError
    ? saveError
    : storageMode === 'navegador'
      ? 'En esta publicación no está la API local. La pregestión se guarda en este navegador. No se envía a ASECCSS, no aprueba créditos y no sustituye la formalización oficial.'
      : 'La información se guarda en la base de datos local del proyecto, mediante una API de demostración. No se envía a ASECCSS, no aprueba créditos y no sustituye el análisis ni la formalización oficial.'
  return (
    <div className={`demo-banner ${compact ? 'compact' : ''}`} role="note">
      <strong>Prototipo de demostración.</strong>
      <span>{message}</span>
    </div>
  )
}
