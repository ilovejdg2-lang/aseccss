export function MyCreditsSummary({ counts, active, onChange }) {
  const cards = [
    { id: 'todas', label: 'Todas', value: counts.total },
    { id: 'preparacion', label: 'En preparación', value: counts.preparacion },
    { id: 'pendientes', label: 'Pendientes', value: counts.pendientes },
    { id: 'revision', label: 'En revisión', value: counts.revision },
    { id: 'aceptadas', label: 'Aceptadas', value: counts.aceptadas || 0 },
    { id: 'rechazadas', label: 'Rechazadas', value: counts.rechazadas || 0 },
  ]
  return (
    <div className="stat-grid">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          className={`stat-card ${active === card.id ? 'is-active' : ''}`}
          onClick={() => onChange(card.id)}
        >
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </button>
      ))}
    </div>
  )
}
