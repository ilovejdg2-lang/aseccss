/** Campos del prototipo por línea. Pendientes de confirmación con ASECCSS; no son requisitos oficiales. */

const money = (id, label, placeholder) => ({
  id,
  label,
  type: 'money',
  required: true,
  placeholder,
  hint: 'Monto de ejemplo, en colones. No se envía a ASECCSS.',
})

const text = (id, label, placeholder, required = true) => ({
  id,
  label,
  type: 'text',
  required,
  placeholder,
})

const mapsLink = (id, label) => ({
  id,
  label,
  type: 'url',
  required: true,
  placeholder: 'https://maps.google.com/...',
  hint: 'Pegá el enlace de Google Maps del lugar. Debe empezar con https://.',
})

const textarea = (id, label, placeholder, required = false) => ({
  id,
  label,
  type: 'textarea',
  required,
  placeholder,
})

const select = (id, label, options, required = true) => ({
  id,
  label,
  type: 'select',
  required,
  options: [{ value: '', label: 'Seleccioná una opción' }, ...options],
})

const termYears = select('requestedTermYears', 'Plazo deseado (años)', [
  { value: '5', label: '5 años' },
  { value: '8', label: '8 años' },
  { value: '10', label: '10 años' },
  { value: '15', label: '15 años' },
  { value: '20', label: '20 años' },
  { value: '25', label: '25 años' },
  { value: '30', label: '30 años' },
])

const shortTerm = select('requestedTermYears', 'Plazo deseado (años)', [
  { value: '3', label: '3 años' },
  { value: '5', label: '5 años' },
  { value: '6', label: '6 años' },
  { value: '7', label: '7 años' },
  { value: '8', label: '8 años' },
])

const notes = textarea('notes', 'Notas adicionales', 'Información de ejemplo para la pregestión', false)

const FORMS = {
  'vivienda-hipotecario': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 25000000'),
    termYears,
    mapsLink('propertyLocation', 'Enlace de Google Maps del inmueble'),
    select('propertyUse', 'Uso del inmueble', [
      { value: 'vivienda', label: 'Vivienda familiar' },
      { value: 'inversion', label: 'Inversión' },
      { value: 'otro', label: 'Otro' },
    ]),
    notes,
  ],
  'vivienda-lote-construccion': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 40000000'),
    termYears,
    mapsLink('lotLocation', 'Enlace de Google Maps del lote'),
    money('constructionBudget', 'Presupuesto de construcción estimado', 'Ejemplo: 28000000'),
    notes,
  ],
  'vivienda-construccion': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 30000000'),
    termYears,
    select('lotOwned', '¿El lote es propio?', [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
      { value: 'en-tramite', label: 'En trámite' },
    ]),
    money('constructionBudget', 'Presupuesto de construcción estimado', 'Ejemplo: 30000000'),
    notes,
  ],
  'vivienda-casa': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 45000000'),
    termYears,
    money('propertyPrice', 'Precio de la casa', 'Ejemplo: 50000000'),
    mapsLink('propertyLocation', 'Enlace de Google Maps de la casa'),
    notes,
  ],
  'vivienda-lote': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 15000000'),
    termYears,
    money('lotPrice', 'Precio del lote', 'Ejemplo: 18000000'),
    mapsLink('lotLocation', 'Enlace de Google Maps del lote'),
    notes,
  ],
  'vivienda-cancelacion': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 20000000'),
    termYears,
    text('currentCreditor', 'Acreedor actual (ejemplo)', 'Ejemplo: Banco de demostración'),
    money('outstandingBalance', 'Saldo pendiente estimado', 'Ejemplo: 18500000'),
    notes,
  ],
  'vivienda-remodelacion': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 8000000'),
    termYears,
    mapsLink('propertyLocation', 'Enlace de Google Maps del inmueble'),
    textarea('improvementDescription', 'Descripción de las mejoras', 'Ejemplo: Remodelación de cocina y baños', true),
    notes,
  ],
  'vehiculo-nuevo': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 9000000'),
    shortTerm,
    text('vehicleBrand', 'Marca del vehículo', 'Ejemplo: Toyota'),
    text('vehicleModel', 'Modelo', 'Ejemplo: Corolla'),
    text('vehicleYear', 'Año modelo', 'Ejemplo: 2026'),
    money('proformaAmount', 'Monto de la factura proforma', 'Ejemplo: 12000000'),
    notes,
  ],
  'vehiculo-usado': [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 6000000'),
    shortTerm,
    text('vehicleBrand', 'Marca del vehículo', 'Ejemplo: Hyundai'),
    text('vehicleModel', 'Modelo', 'Ejemplo: Tucson'),
    text('vehicleYear', 'Año del vehículo', 'Ejemplo: 2023'),
    select('vehicleAge', 'Antigüedad aproximada', [
      { value: 'menos-2', label: 'Menos de 2 años' },
      { value: '2-5', label: 'De 2 a 5 años' },
      { value: 'mas-5', label: 'Más de 5 años' },
    ]),
    money('estimatedValue', 'Valor estimado del vehículo', 'Ejemplo: 8500000'),
    notes,
  ],
}

export function getCreditForm(productId) {
  return FORMS[productId] || [
    money('requestedAmount', 'Monto solicitado', 'Ejemplo: 1000000'),
    shortTerm,
    notes,
  ]
}

export function emptyCreditData(productId) {
  const values = {}
  getCreditForm(productId).forEach((field) => {
    values[field.id] = ''
  })
  return values
}

export function creditFieldLabel(productId, fieldId) {
  return getCreditForm(productId).find((field) => field.id === fieldId)?.label || fieldId
}
