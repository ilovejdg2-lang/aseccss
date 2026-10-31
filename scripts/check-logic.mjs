import { isModuleCredit, products, withCategory } from '../src/data/catalog.js'
import { createSeedState } from '../src/data/seeds.js'
import {
  completion,
  deriveStatus,
  emptyEmployment,
  emptyPersonal,
  filterProducts,
  isEditable,
  progressPercent,
  summarizeApplications,
  validateEmployment,
  validateFile,
  validatePersonal,
} from '../src/lib/domain.js'
import { emptyCreditData } from '../src/data/creditForms.js'

const catalog = products.map(withCategory)
const failures = []

function expect(condition, message) {
  if (!condition) failures.push(message)
}

const modulo = catalog.filter(isModuleCredit)
expect(modulo.length === 9, `El módulo debería ofrecer 9 líneas de vivienda y vehículo y ofrece ${modulo.length}`)
expect(
  modulo.every((item) => item.categoryId === 'vivienda' || item.categoryId === 'vehiculo'),
  'El módulo incluye una línea que ASECCSS ya publica con formulario digital',
)
expect(catalog.filter((item) => item.handledOnline).length === 13, 'No quedaron marcadas las 13 líneas del catálogo digital')

const consumo = filterProducts(catalog, { tipo: 'consumo' })
expect(consumo.length === 7, `Consumo debería tener 7 fichas y tiene ${consumo.length}`)

const sinPlazo = filterProducts(catalog, { plazo: 'sin-dato' })
expect(sinPlazo.every((item) => item.termMaxYears == null), 'El filtro sin plazo incluye fichas con plazo')
expect(sinPlazo.length === 6, `Sin plazo debería tener 6 finalidades de vivienda y tiene ${sinPlazo.length}`)

const mascotas = filterProducts(catalog, { monto: 'hasta-5' })
expect(mascotas.length === 1 && mascotas[0].id === 'credi-pet', 'Hasta ¢5 millones debería mostrar solo Credi Pet')

const vacio = filterProducts(catalog, { q: 'producto-que-no-existe' })
expect(vacio.length === 0, 'La búsqueda inexistente debería venir vacía')

expect(Object.keys(validatePersonal({ fullName: 'Ana', identification: '123', email: 'mal', phone: '12' })).length >= 4, 'La validación personal dejó pasar datos incompletos')
expect(
  Object.keys(
    validatePersonal({
      fullName: 'Asociada de demostración',
      identification: 'DEMO-1002',
      email: 'demo.pregestion@ejemplo.local',
      phone: '8888-0002',
      birthDate: '1992-04-16',
    }),
  ).length === 0,
  'La ficha de demostración no pasó la validación personal',
)
expect(validateFile({ name: 'foto.webp', size: 1000 }, { maxMb: 5 }), 'Un formato no permitido quedó sin error')
expect(!validateFile({ name: 'foto.jpg', size: 1000 }, { maxMb: 5 }), 'Un JPG válido fue rechazado')

const seed = createSeedState()
expect(seed.applications.length === 0, 'Mis créditos no debe iniciar con pregestiones de ejemplo')
expect(summarizeApplications(seed.applications).total === 0, 'El resumen inicial no está vacío')

const educacion = catalog.find((item) => item.id === 'social-educacion')
const pendiente = {
  status: 'borrador',
  submittedAt: null,
  personal: {
    fullName: 'Asociada de demostración',
    identification: 'DEMO-1002',
    email: 'demo.pregestion@ejemplo.local',
    phone: '8888-0002',
    birthDate: '1992-04-16',
    maritalStatus: '',
  },
  employment: { ...emptyEmployment(), jobType: 'asalariado', employer: 'Patrona de ejemplo', position: 'Apoyo', tenure: '1-3', income: '450000' },
  creditData: emptyCreditData('social-educacion'),
  documents: { identidad: { status: 'seleccionado_local' } },
}
const progress = completion(pendiente, educacion)
expect(progress.personalOk && progress.employmentOk && !progress.creditOk, 'La pregestión pendiente no refleja el crédito incompleto')
expect(deriveStatus(pendiente, educacion) === 'borrador', 'Sin datos del crédito el estado debería ser borrador')
expect(progressPercent(pendiente, educacion) === 40, 'El progreso debería ser 40%')
const vivienda = catalog.find((item) => item.id === 'vivienda-hipotecario')
expect(vivienda.creditForm?.length > 0, 'Cada crédito del módulo debe tener formulario propio')
const conCredito = {
  ...pendiente,
  productId: 'vivienda-hipotecario',
  creditData: {
    requestedAmount: '25000000',
    requestedTermYears: '20',
    propertyLocation: 'https://maps.app.goo.gl/ejemploDemo',
    propertyUse: 'vivienda',
    notes: '',
  },
  documents: { identidad: { status: 'seleccionado_local' } },
}
expect(completion(conCredito, vivienda).creditOk && !completion(conCredito, vivienda).docsOk, 'Los datos del crédito no se validaron')
expect(deriveStatus(conCredito, vivienda) === 'pendiente_completar', 'Con crédito completo y documentos faltantes debería quedar pendiente')
const enviada = {
  ...conCredito,
  submittedAt: '2026-10-18T00:00:00.000Z',
  documents: { identidad: { status: 'seleccionado_local' }, ingresos: { status: 'seleccionado_local' } },
}
expect(deriveStatus(enviada, vivienda) === 'listo_para_revision', 'La pregestión enviada no quedó lista para revisión')
expect(progressPercent(enviada, vivienda) === 100, 'El progreso enviado debería ser 100%')
expect(!isEditable('listo_para_revision'), 'Una pregestión enviada no debe seguir siendo editable')
expect(Object.keys(validateEmployment(enviada.employment)).length === 0, 'El empleo de ejemplo no es válido')
expect(Object.keys(validatePersonal(emptyPersonal())).length > 0, 'Un formulario personal vacío no debe pasar')

const confirmed = catalog.filter((item) => item.conditionsConfirmed)
const missingNote = confirmed.filter((item) => item.conditions.length === 0)
expect(missingNote.length === 0, 'Hay fichas confirmadas sin condiciones')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Revisión lógica correcta: ${catalog.length} fichas y ${seed.applications.length} pregestiones de ejemplo.`)
