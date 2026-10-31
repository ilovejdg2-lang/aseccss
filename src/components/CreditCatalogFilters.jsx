import { MONTO_OPTIONS, PLAZO_OPTIONS } from '../lib/domain.js'

export function CreditCatalogFilters({ draft, categories, purposes, onChange, onApply, onClear }) {
  function update(name, value) {
    onChange({ ...draft, [name]: value })
  }

  return (
    <form
      className="filters"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <h2>Filtrar</h2>
      <label htmlFor="filtro-tipo">Tipo de crédito</label>
      <select id="filtro-tipo" value={draft.tipo} onChange={(event) => update('tipo', event.target.value)}>
        <option value="">Todos</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <label htmlFor="filtro-finalidad">Finalidad</label>
      <select id="filtro-finalidad" value={draft.finalidad} onChange={(event) => update('finalidad', event.target.value)}>
        <option value="">Todas</option>
        {purposes.map((purpose) => (
          <option key={purpose.id} value={purpose.id}>
            {purpose.label}
          </option>
        ))}
      </select>

      <label htmlFor="filtro-plazo">Plazo máximo publicado</label>
      <select id="filtro-plazo" value={draft.plazo} onChange={(event) => update('plazo', event.target.value)}>
        {PLAZO_OPTIONS.map((option) => (
          <option key={option.id || 'plazo-todos'} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor="filtro-monto">Monto aproximado publicado</label>
      <select id="filtro-monto" value={draft.monto} onChange={(event) => update('monto', event.target.value)}>
        {MONTO_OPTIONS.map((option) => (
          <option key={option.id || 'monto-todos'} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor="filtro-q">Búsqueda</label>
      <input
        id="filtro-q"
        value={draft.q}
        onChange={(event) => update('q', event.target.value)}
        placeholder="Nombre o finalidad"
      />
      <p className="hint">Plazo y monto solo distinguen fichas con cifras publicadas.</p>
      <div className="filter-actions">
        <button className="btn btn-primary" type="submit">
          Aplicar filtros
        </button>
        <button className="btn btn-secondary" type="button" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </form>
  )
}
