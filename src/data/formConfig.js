export const maritalOptions = [
  { value: '', label: 'Seleccioná una opción' },
  { value: 'soltero', label: 'Soltero o soltera' },
  { value: 'casado', label: 'Casado o casada' },
  { value: 'union', label: 'Unión libre' },
  { value: 'divorciado', label: 'Divorciado o divorciada' },
  { value: 'viudo', label: 'Viudo o viuda' },
  { value: 'otro', label: 'Otra' },
]

export const jobOptions = [
  { value: '', label: 'Seleccioná una opción' },
  { value: 'asalariado', label: 'Asalariado' },
  { value: 'independiente', label: 'Independiente' },
  { value: 'pensionado', label: 'Pensionado' },
  { value: 'otro', label: 'Otro' },
]

export const tenureOptions = [
  { value: '', label: 'Seleccioná una opción' },
  { value: 'menos-1', label: 'Menos de 1 año' },
  { value: '1-3', label: 'De 1 a 3 años' },
  { value: '3-5', label: 'De 3 a 5 años' },
  { value: 'mas-5', label: 'Más de 5 años' },
]

export function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || '—'
}
