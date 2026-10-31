import { getCreditForm } from './creditForms.js'

const FILE_RULES = { formats: ['PDF', 'JPG', 'PNG'], maxMb: 5 }

const ONLINE_CREDIT_IDS = new Set([
  'consumo-ahorro',
  'consumo-pagare',
  'consumo-estreno',
  'consumo-fiador',
  'consumo-hipotecario',
  'consumo-back-to-back',
  'consumo-convenios',
  'deudas-externas',
  'social-salud',
  'social-educacion',
  'inversion-equipo',
  'pymes',
  'credi-pet',
])

const SOURCE_NOTE =
  'Cifras publicadas en aseccss.com y consultadas el 18 de octubre de 2026. Confirmá la vigencia con ASECCSS antes de un trámite formal.'

function demoDocs(extra = []) {
  return [
    {
      id: 'identidad',
      name: 'Documento de identidad',
      description: 'Documento de ejemplo del prototipo. No adjuntes tu documento real.',
      required: true,
      origin: 'prototipo',
      ...FILE_RULES,
    },
    {
      id: 'ingresos',
      name: 'Comprobante de ingresos',
      description: 'Documento de ejemplo del prototipo. No adjuntes colillas ni constancias reales.',
      required: true,
      origin: 'prototipo',
      ...FILE_RULES,
    },
    ...extra,
  ]
}

function product(entry) {
  const item = {
    published: true,
    conditionsConfirmed: false,
    conditions: [],
    conditionsNote: '',
    termMaxYears: null,
    amountKind: 'unknown',
    amountMax: null,
    publishedRequirements: [],
    documents: demoDocs(),
    highlights: [],
    relatedId: '',
    formFields: {},
    custom: false,
    ...entry,
  }
  item.handledOnline = ONLINE_CREDIT_IDS.has(item.id)
  item.creditForm = item.creditForm || getCreditForm(item.id)
  return item
}

export function isModuleCredit(productItem) {
  return productItem.published !== false && productItem.handledOnline !== true
}

export const categories = [
  {
    id: 'consumo',
    name: 'Consumo',
    icon: 'wallet',
    description: 'Líneas públicas para gastos personales, con distintas garantías.',
  },
  {
    id: 'social',
    name: 'Social',
    icon: 'users',
    description: 'Referencia de las líneas públicas de salud y educación.',
  },
  {
    id: 'vivienda',
    name: 'Vivienda',
    icon: 'home',
    description: 'Finalidades hipotecarias publicadas para el hogar.',
  },
  {
    id: 'vehiculo',
    name: 'Vehículo',
    icon: 'car',
    description: 'Referencia de las páginas de vehículo nuevo y usado.',
  },
  {
    id: 'inversion',
    name: 'Inversión',
    icon: 'chart',
    description: 'Línea pública para financiar equipo médico.',
  },
  {
    id: 'deudas',
    name: 'Deudas externas',
    icon: 'layers',
    description: 'Línea pública para unificar deudas externas.',
  },
  {
    id: 'pymes',
    name: 'Pymes',
    icon: 'store',
    description: 'Línea pública para capital de trabajo y activo del negocio.',
  },
  {
    id: 'mascota',
    name: 'Credi Pet',
    icon: 'paw',
    description: 'Línea pública orientada al bienestar de la mascota.',
  },
]

export const products = [
  product({
    id: 'consumo-ahorro',
    name: 'Crédito personal con garantía sobre ahorro',
    categoryId: 'consumo',
    purposeId: 'gastos-personales',
    purposeLabel: 'Gastos personales',
    summary: 'Línea pública que usa el ahorro como garantía.',
    description:
      'ASECCSS publica esta alternativa para gastos personales e imprevistos, con garantía sobre ahorros. La pregestión de este prototipo no reserva el ahorro ni formaliza el crédito.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que se aplican restricciones.',
    termMaxYears: 30,
    amountKind: 'guarantee',
    conditions: [
      { label: 'Monto', value: 'Hasta el 100% del ahorro' },
      { label: 'Plazo', value: 'Hasta 30 años' },
      { label: 'Garantía', value: 'Sobre ahorros' },
      { label: 'Tasa de interés anual', value: '13%' },
      { label: 'Comisión', value: 'Sin comisión' },
    ],
  }),
  product({
    id: 'consumo-pagare',
    name: 'Crédito personal con garantía pagaré',
    categoryId: 'consumo',
    purposeId: 'gastos-personales',
    purposeLabel: 'Gastos personales',
    summary: 'Línea pública de consumo con garantía pagaré.',
    description:
      'La página de créditos de consumo describe esta opción para necesidades personales sin presentar fiador. Las cifras siguientes son las publicadas y deben confirmarse.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que se aplican restricciones.',
    termMaxYears: 15,
    amountKind: 'fixed',
    amountMax: 50_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢50 millones' },
      { label: 'Plazo', value: 'Hasta 15 años' },
      { label: 'Tasa de interés', value: '18,50%' },
      { label: 'Comisión', value: '2%' },
    ],
  }),
  product({
    id: 'consumo-estreno',
    name: 'Crédito Estreno',
    categoryId: 'consumo',
    purposeId: 'gastos-personales',
    purposeLabel: 'Gastos personales',
    summary: 'Línea pública para personas asociadas sin créditos activos.',
    description:
      'ASECCSS publica el Crédito Estreno para asociados que no tienen un crédito activo. Este prototipo no verifica esa condición en los sistemas de la asociación.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que se aplican restricciones y que aplica para asociados sin créditos activos.',
    termMaxYears: 15,
    amountKind: 'fixed',
    amountMax: 50_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢50.000.000' },
      { label: 'Plazo', value: 'Hasta 15 años' },
      { label: 'Tasa de interés anual', value: '15%' },
      { label: 'Comisión', value: '2%' },
    ],
  }),
  product({
    id: 'consumo-fiador',
    name: 'Crédito personal con garantía fiador',
    categoryId: 'consumo',
    purposeId: 'gastos-personales',
    purposeLabel: 'Gastos personales',
    summary: 'Línea pública de consumo respaldada con fiador.',
    description:
      'La página pública presenta esta garantía para proyectos personales. La cantidad de fiadores depende del monto y debe consultarse con ASECCSS.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: 'La página pide consultar la cantidad de fiadores según el monto. No publica comisión en el extracto consultado.',
    termMaxYears: 20,
    amountKind: 'fixed',
    amountMax: 50_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢50 millones' },
      { label: 'Plazo', value: 'Hasta 20 años' },
      { label: 'Tasa de interés anual', value: '15,50%' },
    ],
  }),
  product({
    id: 'consumo-hipotecario',
    name: 'Crédito personal con garantía hipotecaria',
    categoryId: 'consumo',
    purposeId: 'gastos-personales',
    purposeLabel: 'Gastos personales',
    summary: 'Línea de consumo publicada con garantía hipotecaria.',
    description:
      'Esta ficha corresponde al crédito personal con garantía hipotecaria de la página de consumo. No es la misma ficha que el crédito hipotecario de vivienda.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: SOURCE_NOTE,
    termMaxYears: 30,
    amountKind: 'fixed',
    amountMax: 300_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢300 millones' },
      { label: 'Avalúo', value: '90% en primer grado y 70% en segundo grado' },
      { label: 'Plazo', value: 'Hasta 30 años' },
      { label: 'Tasa de interés anual', value: '11%' },
      { label: 'Comisión', value: '2%' },
    ],
  }),
  product({
    id: 'consumo-back-to-back',
    name: 'Crédito personal Back to Back',
    categoryId: 'consumo',
    purposeId: 'gastos-personales',
    purposeLabel: 'Gastos personales',
    summary: 'Línea pública que usa un ahorro extraordinario como garantía.',
    description:
      'ASECCSS publica esta alternativa para atender eventualidades usando un ahorro extraordinario como garantía. El prototipo no consulta saldos reales.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que aplican condiciones.',
    termMaxYears: 10,
    amountKind: 'guarantee',
    conditions: [
      { label: 'Monto', value: '95% del monto principal del ahorro extraordinario' },
      { label: 'Plazo', value: 'Hasta 120 meses o el vencimiento del ahorro extraordinario' },
      { label: 'Tasa de interés anual', value: 'Tasa del ahorro + 3%' },
      { label: 'Garantía', value: 'Ahorro extraordinario' },
    ],
  }),
  product({
    id: 'consumo-convenios',
    name: 'Crédito de convenios',
    categoryId: 'consumo',
    purposeId: 'convenios',
    purposeLabel: 'Convenios comerciales',
    summary: 'Línea pública para compras con empresas en convenio.',
    description:
      'La página de consumo publica condiciones distintas según la garantía. No se completaron montos que la página no detalla.',
    sourceUrl: 'https://aseccss.com/creditos-de-consumo/',
    conditionsConfirmed: true,
    conditionsNote: 'Solo se muestra el monto que la página detalla: 100% del ahorro en la variante sobre ahorro.',
    termMaxYears: 15,
    amountKind: 'guarantee',
    conditions: [
      { label: 'Sobre ahorro', value: 'Tasa anual 14,50%, plazo hasta 15 años, comisión 2% y monto hasta el 100% del ahorro' },
      { label: 'Fiador', value: 'Tasa anual 15,50%, plazo hasta 12 años y comisión 2%' },
      { label: 'Sin fiador', value: 'Tasa anual 16,50%, plazo hasta 15 años y comisión 2%' },
    ],
  }),
  product({
    id: 'deudas-externas',
    name: 'Crédito para cancelación de deudas externas',
    categoryId: 'deudas',
    purposeId: 'deudas',
    purposeLabel: 'Unificar deudas',
    summary: 'Línea pública para reunir deudas externas en una cuota.',
    description:
      'ASECCSS publica esta línea para unificar deudas externas. La pregestión no consolida deudas ni consulta obligaciones reales.',
    sourceUrl: 'https://aseccss.com/creditos-para-cancelacion-de-deuda-externas/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que aplican condiciones.',
    termMaxYears: 25,
    amountKind: 'fixed',
    amountMax: 50_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢50.000.000, pagaré o fiduciario' },
      { label: 'Plazo', value: '20 años con garantía pagaré y 25 años con garantía fiduciaria' },
      { label: 'Tasa anual', value: '14,50% con garantía fiador y 15,50% con garantía pagaré' },
      { label: 'Comisión', value: '2%' },
    ],
  }),
  product({
    id: 'social-salud',
    name: 'Crédito de salud',
    categoryId: 'social',
    purposeId: 'salud',
    purposeLabel: 'Salud',
    summary: 'Línea social pública para gastos de salud.',
    description:
      'La página de créditos sociales menciona medicinas, operaciones, equipo de consultorio y otros gastos de salud. TBP se refiere a la Tasa Básica Pasiva, tal como aparece en la publicación.',
    sourceUrl: 'https://aseccss.com/credito-sociales/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que se aplican restricciones.',
    termMaxYears: 7,
    amountKind: 'fixed',
    amountMax: 20_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢5 millones con pagaré y hasta ¢20 millones con otras garantías' },
      { label: 'Plazo', value: 'Hasta 7 años' },
      { label: 'Tasa de interés anual', value: 'TBP + 1,50%, con piso de 6% y techo de 10%' },
      { label: 'Membresía', value: 'No aplica' },
      { label: 'Comisión', value: '1%' },
    ],
  }),
  product({
    id: 'social-educacion',
    name: 'Crédito de educación',
    categoryId: 'social',
    purposeId: 'educacion',
    purposeLabel: 'Educación',
    summary: 'Línea social pública para estudios.',
    description:
      'ASECCSS publica esta línea para gastos de estudio. TBP se refiere a la Tasa Básica Pasiva, tal como aparece en la publicación.',
    sourceUrl: 'https://aseccss.com/credito-sociales/',
    conditionsConfirmed: true,
    conditionsNote: SOURCE_NOTE,
    termMaxYears: 7,
    amountKind: 'fixed',
    amountMax: 10_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢5 millones con pagaré y hasta ¢10 millones con otras garantías' },
      { label: 'Plazo', value: '7 años' },
      { label: 'Tasa de interés anual', value: 'TBP + 2,85%, con piso de 6% y techo de 10%' },
      { label: 'Membresía', value: 'No aplica' },
      { label: 'Comisión', value: '1%' },
    ],
  }),
  product({
    id: 'inversion-equipo',
    name: 'Crédito de equipo médico',
    categoryId: 'inversion',
    purposeId: 'equipo-medico',
    purposeLabel: 'Equipo médico',
    summary: 'Línea pública para la compra de equipo médico nuevo.',
    description:
      'La página de crédito de inversión publica el financiamiento de equipo médico nuevo. El prototipo no valida facturas ni proveedores.',
    sourceUrl: 'https://aseccss.com/credito-de-inversion/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que aplican condiciones y que del financiamiento se descuentan gastos de formalización.',
    termMaxYears: 8,
    amountKind: 'fixed',
    amountMax: 80_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢80.000.000' },
      { label: 'Plazo', value: 'Hasta 8 años' },
      { label: 'Tasa fija anual', value: '11%' },
      { label: 'Comisión', value: '1%' },
      { label: 'Financiamiento', value: '100%, con descuento de gastos de formalización' },
    ],
  }),
  product({
    id: 'vivienda-hipotecario',
    name: 'Crédito hipotecario',
    categoryId: 'vivienda',
    purposeId: 'vivienda-general',
    purposeLabel: 'Vivienda',
    summary: 'Ficha general publicada para financiamiento hipotecario.',
    description:
      'Esta es la condición general publicada en la página de créditos hipotecarios. Las finalidades específicas de esa misma página no repiten estas cifras y se muestran por separado.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que se aplican restricciones.',
    termMaxYears: 30,
    amountKind: 'fixed',
    amountMax: 300_000_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢300 millones' },
      { label: 'Avalúo', value: '90% en primer grado y 70% en segundo grado' },
      { label: 'Plazo', value: 'Hasta 30 años' },
      { label: 'Tasa', value: '7,75% fija los primeros 3 años; después TBP + 4,25%, con piso de 7,75%' },
    ],
  }),
  product({
    id: 'vivienda-lote-construccion',
    name: 'Compra de lote y construcción',
    categoryId: 'vivienda',
    purposeId: 'lote-construccion',
    purposeLabel: 'Compra de lote y construcción',
    summary: 'Finalidad hipotecaria publicada, sin cifras propias en la página consultada.',
    description:
      'ASECCSS publica la compra de lote y construcción como finalidad hipotecaria. En la revisión del 18 de octubre de 2026 esa finalidad no traía monto, plazo ni tasa propios.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    relatedId: 'vivienda-hipotecario',
  }),
  product({
    id: 'vivienda-construccion',
    name: 'Construcción',
    categoryId: 'vivienda',
    purposeId: 'construccion',
    purposeLabel: 'Construcción',
    summary: 'Finalidad hipotecaria publicada, sin cifras propias en la página consultada.',
    description:
      'La página de créditos hipotecarios incluye construcción como finalidad. No se copiaron cifras de la ficha general porque la página no las asigna de forma explícita a esta finalidad.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    relatedId: 'vivienda-hipotecario',
  }),
  product({
    id: 'vivienda-casa',
    name: 'Compra de casa',
    categoryId: 'vivienda',
    purposeId: 'compra-casa',
    purposeLabel: 'Compra de casa',
    summary: 'Finalidad hipotecaria publicada, sin cifras propias en la página consultada.',
    description:
      'ASECCSS publica la compra de casa dentro de los créditos hipotecarios. La página consultada no detalla una tasa o un monto exclusivo de esta finalidad.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    relatedId: 'vivienda-hipotecario',
  }),
  product({
    id: 'vivienda-lote',
    name: 'Compra de lote',
    categoryId: 'vivienda',
    purposeId: 'compra-lote',
    purposeLabel: 'Compra de lote',
    summary: 'Finalidad hipotecaria publicada, sin cifras propias en la página consultada.',
    description:
      'La compra de lote aparece como finalidad en la página de créditos hipotecarios. Las condiciones numéricas deben confirmarse con ASECCSS.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    relatedId: 'vivienda-hipotecario',
  }),
  product({
    id: 'vivienda-cancelacion',
    name: 'Cancelación de hipoteca',
    categoryId: 'vivienda',
    purposeId: 'cancelacion-hipoteca',
    purposeLabel: 'Cancelación de hipoteca',
    summary: 'Finalidad hipotecaria publicada, sin cifras propias en la página consultada.',
    description:
      'ASECCSS publica una finalidad para cancelar una hipoteca. La página consultada no incluye monto, plazo ni tasa específicos.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    relatedId: 'vivienda-hipotecario',
  }),
  product({
    id: 'vivienda-remodelacion',
    name: 'Remodelación y mejoras',
    categoryId: 'vivienda',
    purposeId: 'remodelacion',
    purposeLabel: 'Remodelación y mejoras',
    summary: 'Finalidad hipotecaria publicada, sin cifras propias en la página consultada.',
    description:
      'La página institucional incluye remodelación y mejoras. No se muestran cifras porque el extracto consultado no las publica para esta finalidad.',
    sourceUrl: 'https://aseccss.com/creditos-hipotecarios/',
    relatedId: 'vivienda-hipotecario',
  }),
  product({
    id: 'vehiculo-nuevo',
    name: 'Crédito para vehículo nuevo',
    categoryId: 'vehiculo',
    purposeId: 'vehiculo-nuevo',
    purposeLabel: 'Vehículo nuevo',
    summary: 'Línea pública para un vehículo cero kilómetros.',
    description:
      'La página de vehículo nuevo publica tasa, plazo, comisión y porcentaje de financiamiento. También indica tres requisitos, que se muestran aparte de los archivos de ejemplo.',
    sourceUrl: 'https://aseccss.com/credito-para-comprar-vehiculo-nuevo/',
    conditionsConfirmed: true,
    conditionsNote: 'TBP se refiere a la Tasa Básica Pasiva, como aparece en la publicación.',
    termMaxYears: 8,
    amountKind: 'guarantee',
    publishedRequirements: [
      'Ser asociado de ASECCSS.',
      'Presentar las colillas de pago para conocer hasta qué monto aplica.',
      'Presentar una factura proforma del vehículo.',
    ],
    documents: [
      ...demoDocs().filter((doc) => doc.id === 'identidad'),
      {
        id: 'colillas',
        name: 'Colillas de pago',
        description: 'Requisito mencionado en la página pública. En el prototipo el archivo solo se selecciona en el dispositivo.',
        required: true,
        origin: 'pagina-publica',
        ...FILE_RULES,
      },
      {
        id: 'proforma',
        name: 'Factura proforma',
        description: 'Requisito mencionado en la página pública. No se envía a ASECCSS desde este prototipo.',
        required: true,
        origin: 'pagina-publica',
        ...FILE_RULES,
      },
    ],
    conditions: [
      { label: 'Tasa los primeros 36 meses', value: '8,50% fija' },
      { label: 'Tasa desde la cuota 37', value: 'TBP + 4,50%' },
      { label: 'Plazo', value: '8 años' },
      { label: 'Comisión', value: '2%' },
      { label: 'Financiamiento', value: 'Hasta el 80% del vehículo' },
    ],
  }),
  product({
    id: 'vehiculo-usado',
    name: 'Crédito para vehículo usado',
    categoryId: 'vehiculo',
    purposeId: 'vehiculo-usado',
    purposeLabel: 'Vehículo usado',
    summary: 'Línea pública para un vehículo seminuevo.',
    description:
      'La página publica la tasa, la comisión según antigüedad y dos referencias de plazo. Se muestran por separado para no mezclarlas en una sola regla.',
    sourceUrl: 'https://aseccss.com/credito-para-comprar-vehiculo-usado/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que se aplican condiciones. Confirmá cómo se relacionan el plazo y la antigüedad del vehículo.',
    termMaxYears: 8,
    amountKind: 'unknown',
    publishedRequirements: [
      'Ser asociado de ASECCSS.',
      'Presentar las colillas de pago para conocer hasta qué monto aplica.',
    ],
    documents: [
      ...demoDocs().filter((doc) => doc.id === 'identidad'),
      {
        id: 'colillas',
        name: 'Colillas de pago',
        description: 'Requisito mencionado en la página pública. En el prototipo el archivo solo se selecciona en el dispositivo.',
        required: true,
        origin: 'pagina-publica',
        ...FILE_RULES,
      },
    ],
    conditions: [
      { label: 'Tasa los primeros 36 meses', value: '9% fija' },
      { label: 'Tasa desde la cuota 37', value: 'TBP + 4,50%' },
      { label: 'Plazo publicado', value: 'Hasta 96 meses, según antigüedad' },
      { label: 'Antigüedad del vehículo', value: 'La página indica un máximo de 5 años para financiarlo' },
      { label: 'Comisión', value: '2,5% si la antigüedad es menor a 2 años y 3% si es mayor' },
    ],
  }),
  product({
    id: 'pymes',
    name: 'Crédito Pymes',
    categoryId: 'pymes',
    purposeId: 'negocio',
    purposeLabel: 'Negocio',
    summary: 'Línea pública para inversión y operación de una pyme.',
    description:
      'ASECCSS publica el Crédito Pymes con tasas según la garantía y un rango de financiamiento. La página también indica que es válido hasta agotar presupuesto.',
    sourceUrl: 'https://aseccss.com/credito-pymes/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que aplican condiciones y que la oferta es válida hasta agotar presupuesto.',
    termMaxYears: 10,
    amountKind: 'fixed',
    amountMax: 30_000_000,
    formFields: { otherIncome: true },
    highlights: [
      'Capital de trabajo.',
      'Compra de activo fijo.',
      'Consolidación de pasivos de un crédito Pymes.',
      'Compra de maquinaria y equipo.',
      'La página menciona, de forma opcional, el seguro SOS Pymes del INS.',
    ],
    conditions: [
      { label: 'Monto', value: 'Desde ¢200.000 hasta ¢30.000.000' },
      { label: 'Plazo', value: 'Hasta 10 años' },
      { label: 'Tasa sobre ahorros', value: '10%' },
      { label: 'Tasa fiduciaria', value: '11%' },
      { label: 'Tasa hipotecaria', value: '9%' },
      { label: 'Tasa prendaria o mobiliaria', value: '9,50%' },
      { label: 'Tasa con pagaré', value: '12%' },
    ],
  }),
  product({
    id: 'credi-pet',
    name: 'Credi Pet',
    categoryId: 'mascota',
    purposeId: 'mascota',
    purposeLabel: 'Mascota',
    summary: 'Línea pública para gastos de bienestar de la mascota.',
    description:
      'ASECCSS publica Credi Pet como una línea para gastos relacionados con el bienestar de la mascota. El prototipo no evalúa ese destino ni aprueba el desembolso.',
    sourceUrl: 'https://aseccss.com/creditos/credi-pet/',
    conditionsConfirmed: true,
    conditionsNote: 'La página indica que aplican condiciones.',
    termMaxYears: 5,
    amountKind: 'fixed',
    amountMax: 2_500_000,
    conditions: [
      { label: 'Monto', value: 'Hasta ¢2.500.000' },
      { label: 'Plazo', value: 'Hasta 5 años' },
      { label: 'Tasa de interés anual', value: '12%' },
    ],
  }),
]

export const PATCH_KEYS = [
  'name',
  'summary',
  'description',
  'categoryId',
  'purposeId',
  'purposeLabel',
  'published',
  'documents',
  'publishedRequirements',
  'highlights',
]

export function applyPatch(productItem, patch) {
  if (!patch) return { ...productItem, published: productItem.published !== false }
  const next = { ...productItem, editedInDemo: true }
  PATCH_KEYS.forEach((key) => {
    if (patch[key] !== undefined) next[key] = patch[key]
  })
  return next
}

export function withCategory(productItem) {
  const category = categories.find((item) => item.id === productItem.categoryId)
  return { ...productItem, categoryName: category ? category.name : 'Sin categoría' }
}

export function listPurposes(items) {
  const map = new Map()
  items.forEach((item) => {
    if (item.purposeId && !map.has(item.purposeId)) map.set(item.purposeId, item.purposeLabel)
  })
  return [...map.entries()].map(([id, label]) => ({ id, label }))
}

export function createCustomProduct(partial = {}) {
  const id = partial.id || `demo-${Date.now()}`
  return product({
    id,
    name: partial.name || '',
    categoryId: partial.categoryId || 'consumo',
    purposeId: partial.purposeId || `proposito-${id}`,
    purposeLabel: partial.purposeLabel || 'Definida en el prototipo',
    summary: partial.summary || partial.description || '',
    description: partial.description || '',
    sourceUrl: '',
    publishedRequirements: partial.publishedRequirements || [],
    documents: partial.documents || demoDocs(),
    highlights: partial.highlights || [],
    published: partial.published !== false,
    custom: true,
  })
}

export function resolveCatalog(state = {}) {
  const patches = state.patches || {}
  const merged = products.map((item) => withCategory(applyPatch(item, patches[item.id])))
  const custom = (state.customProducts || []).map((item) => withCategory(item))
  return [...merged, ...custom]
}

export { demoDocs, SOURCE_NOTE }
