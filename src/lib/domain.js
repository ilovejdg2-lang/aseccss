export const STATUS = {
  borrador: { label: 'Borrador', icon: 'pencil', tone: 'neutral' },
  pendiente_completar: { label: 'Pendiente de completar', icon: 'alert', tone: 'warning' },
  listo_para_revision: { label: 'Listo para revisión', icon: 'check', tone: 'ok' },
  en_revision_demo: { label: 'En revisión (demo)', icon: 'clock', tone: 'info' },
  aceptada_demo: { label: 'Aceptada (simulación)', icon: 'check', tone: 'ok' },
  rechazada_demo: { label: 'Rechazada (simulación)', icon: 'alert', tone: 'danger' },
  finalizado_demo: { label: 'Finalizado (demo)', icon: 'flag', tone: 'slate' },
}

export const DECISION_STATUSES = ['aceptada_demo', 'rechazada_demo']

export const ADMIN_STATUSES = Object.keys(STATUS)

export const FILE_STATUS = {
  pendiente: 'Pendiente',
  cargando: 'Cargando',
  seleccionado_local: 'Seleccionado',
  error: 'Error',
}

export const PLAZO_OPTIONS = [
  { id: '', label: 'Cualquiera' },
  { id: '0-8', label: 'Hasta 8 años' },
  { id: '9-15', label: 'De 9 a 15 años' },
  { id: '16-25', label: 'De 16 a 25 años' },
  { id: '26-30', label: 'De 26 a 30 años' },
  { id: 'sin-dato', label: 'Sin plazo publicado' },
]

export const MONTO_OPTIONS = [
  { id: '', label: 'Cualquiera' },
  { id: 'hasta-5', label: 'Hasta ¢5 millones' },
  { id: '5-50', label: 'De ¢5 a ¢50 millones' },
  { id: 'mas-50', label: 'Más de ¢50 millones' },
  { id: 'garantia', label: 'Según ahorro o valor del bien' },
  { id: 'sin-dato', label: 'Sin monto publicado' },
]

export const APPLICATION_FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'preparacion', label: 'En preparación' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'revision', label: 'En revisión' },
  { id: 'aceptadas', label: 'Aceptadas' },
  { id: 'rechazadas', label: 'Rechazadas' },
  { id: 'finalizadas', label: 'Finalizadas' },
]

const PLAZO_BUCKETS = {
  '0-8': [0, 8],
  '9-15': [9, 15],
  '16-25': [16, 25],
  '26-30': [26, 30],
}

export function emptyPersonal() {
  return {
    fullName: '',
    identification: '',
    email: '',
    phone: '',
    birthDate: '',
    maritalStatus: '',
  }
}

export function emptyEmployment() {
  return {
    jobType: '',
    employer: '',
    position: '',
    tenure: '',
    income: '',
    otherIncome: '',
  }
}

export function filterProducts(products, filters) {
  const query = String(filters.q || '').trim().toLowerCase()
  return products.filter((product) => {
    if (product.published === false) return false
    if (filters.tipo && product.categoryId !== filters.tipo) return false
    if (filters.finalidad && product.purposeId !== filters.finalidad) return false
    if (query) {
      const haystack = [product.name, product.summary, product.description, product.categoryName, product.purposeLabel]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (filters.plazo === 'sin-dato') {
      if (product.termMaxYears != null) return false
    } else if (filters.plazo && PLAZO_BUCKETS[filters.plazo]) {
      const [min, max] = PLAZO_BUCKETS[filters.plazo]
      if (product.termMaxYears == null || product.termMaxYears < min || product.termMaxYears > max) return false
    }
    if (filters.monto === 'sin-dato') {
      if (product.amountKind !== 'unknown') return false
    } else if (filters.monto === 'garantia') {
      if (product.amountKind !== 'guarantee') return false
    } else if (filters.monto === 'hasta-5') {
      if (product.amountKind !== 'fixed' || product.amountMax > 5_000_000) return false
    } else if (filters.monto === '5-50') {
      if (product.amountKind !== 'fixed' || product.amountMax <= 5_000_000 || product.amountMax > 50_000_000) return false
    } else if (filters.monto === 'mas-50') {
      if (product.amountKind !== 'fixed' || product.amountMax <= 50_000_000) return false
    }
    return true
  })
}

export function matchesApplicationFilter(application, filterId) {
  if (!filterId || filterId === 'todas') return true
  if (filterId === 'preparacion') return application.status === 'borrador'
  if (filterId === 'pendientes') return application.status === 'pendiente_completar'
  if (filterId === 'revision') {
    return application.status === 'listo_para_revision' || application.status === 'en_revision_demo'
  }
  if (filterId === 'aceptadas') return application.status === 'aceptada_demo'
  if (filterId === 'rechazadas') return application.status === 'rechazada_demo'
  if (filterId === 'finalizadas') {
    return (
      application.status === 'finalizado_demo' ||
      application.status === 'aceptada_demo' ||
      application.status === 'rechazada_demo'
    )
  }
  return true
}

export function summarizeApplications(applications) {
  return {
    total: applications.length,
    preparacion: applications.filter((item) => item.status === 'borrador').length,
    pendientes: applications.filter((item) => item.status === 'pendiente_completar').length,
    revision: applications.filter(
      (item) => item.status === 'listo_para_revision' || item.status === 'en_revision_demo',
    ).length,
    aceptadas: applications.filter((item) => item.status === 'aceptada_demo').length,
    rechazadas: applications.filter((item) => item.status === 'rechazada_demo').length,
    finalizadas: applications.filter(
      (item) =>
        item.status === 'finalizado_demo' ||
        item.status === 'aceptada_demo' ||
        item.status === 'rechazada_demo',
    ).length,
  }
}

export function canSimulateDecision(status) {
  return status === 'listo_para_revision' || status === 'en_revision_demo'
}

export function decisionLabel(status) {
  if (status === 'aceptada_demo') return 'Aceptada en la simulación'
  if (status === 'rechazada_demo') return 'Rechazada en la simulación'
  return ''
}

export function validatePersonal(values = {}) {
  const errors = {}
  const name = String(values.fullName || '').trim()
  if (!/^[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*)+$/u.test(name)) {
    errors.fullName = 'Ingresá el nombre y al menos un apellido.'
  }
  const identification = String(values.identification || '').trim()
  if (!/^(?:DEMO-\d{3,6}|\d-\d{4}-\d{4})$/i.test(identification)) {
    errors.identification = 'Usá DEMO-0001 o el formato 0-0000-0000.'
  }
  const email = String(values.email || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = 'Ingresá un correo electrónico válido.'
  }
  const phone = String(values.phone || '').trim()
  if (!/^\d{4}-?\d{4}$/.test(phone)) {
    errors.phone = 'Ingresá un teléfono de 8 dígitos.'
  }
  if (values.birthDate) {
    const birth = new Date(`${values.birthDate}T00:00:00`)
    const today = new Date()
    const birthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    const age = today.getFullYear() - birth.getFullYear() - (today < birthday ? 1 : 0)
    if (Number.isNaN(birth.getTime()) || age < 18 || age > 100) {
      errors.birthDate = 'Revisá la fecha. En el prototipo se espera una persona mayor de edad.'
    }
  }
  return errors
}

export function validateEmployment(values = {}) {
  const errors = {}
  if (!values.jobType) errors.jobType = 'Seleccioná el tipo de trabajo.'
  if (String(values.employer || '').trim().length < 2) errors.employer = 'Ingresá el nombre de la empresa o patrono.'
  if (String(values.position || '').trim().length < 2) errors.position = 'Ingresá el puesto.'
  if (!values.tenure) errors.tenure = 'Seleccioná la antigüedad laboral.'
  const income = Number(String(values.income || '').replace(/[^\d]/g, ''))
  if (!Number.isFinite(income) || income <= 0) {
    errors.income = 'Ingresá un ingreso mensual de ejemplo, mayor que cero.'
  }
  if (String(values.otherIncome || '').trim()) {
    const extra = Number(String(values.otherIncome).replace(/[^\d]/g, ''))
    if (!Number.isFinite(extra) || extra <= 0) {
      errors.otherIncome = 'Si indicás otros ingresos, usá un monto de ejemplo mayor que cero.'
    }
  }
  return errors
}

export function validateCreditData(values = {}, product) {
  const errors = {}
  const fields = product?.creditForm || []
  fields.forEach((field) => {
    const raw = String(values[field.id] ?? '').trim()
    if (field.required && !raw) {
      errors[field.id] = `Completá ${field.label.toLowerCase()}.`
      return
    }
    if (!raw) return
    if (field.type === 'money') {
      const amount = Number(raw.replace(/[^\d]/g, ''))
      if (!Number.isFinite(amount) || amount <= 0) {
        errors[field.id] = 'Ingresá un monto de ejemplo mayor que cero.'
      }
    }
    if (field.type === 'url') {
      const ok =
        /^https:\/\/(www\.)?(google\.[^/]+\/maps|maps\.google\.[^/]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(raw) ||
        /^https:\/\/maps\.app\.goo\.gl\//i.test(raw)
      if (!ok) {
        errors[field.id] = 'Pegá un enlace válido de Google Maps que empiece con https://.'
      }
    }
  })
  return errors
}

export function validateFile(file, doc) {
  const extension = String(file?.name || '').split('.').pop().toLowerCase()
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
    return 'Formato no permitido. Usá PDF, JPG o PNG.'
  }
  const maxMb = doc?.maxMb || 5
  if (Number(file?.size || 0) > maxMb * 1024 * 1024) {
    return `El archivo supera el máximo de ${maxMb} MB.`
  }
  return ''
}

export function completion(app, product) {
  const personalOk = Object.keys(validatePersonal(app?.personal)).length === 0
  const employmentOk = Object.keys(validateEmployment(app?.employment)).length === 0
  const creditOk = Object.keys(validateCreditData(app?.creditData, product)).length === 0
  const required = (product?.documents || []).filter((doc) => doc.required)
  const pendingRequired = required.filter((doc) => app?.documents?.[doc.id]?.status !== 'seleccionado_local')
  return {
    personalOk,
    employmentOk,
    creditOk,
    docsOk: pendingRequired.length === 0,
    pendingRequired,
  }
}

export function deriveStatus(app, product) {
  if (
    app.status === 'en_revision_demo' ||
    app.status === 'finalizado_demo' ||
    app.status === 'aceptada_demo' ||
    app.status === 'rechazada_demo'
  ) {
    return app.status
  }
  const progress = completion(app, product)
  if (app.submittedAt && progress.personalOk && progress.employmentOk && progress.creditOk && progress.docsOk) {
    return 'listo_para_revision'
  }
  if (progress.personalOk && progress.employmentOk && progress.creditOk && !progress.docsOk) return 'pendiente_completar'
  return 'borrador'
}

export function nextStepLabel(app, product) {
  if (app.status === 'aceptada_demo') return 'Simulación aceptada. No es una aprobación de ASECCSS.'
  if (app.status === 'rechazada_demo') return 'Simulación rechazada. No es una decisión oficial de ASECCSS.'
  if (app.status === 'finalizado_demo') return 'Ninguno. La demostración está cerrada.'
  if (app.status === 'en_revision_demo') return 'Podés simular la aceptación o el rechazo.'
  if (app.status === 'listo_para_revision') return 'Podés simular la aceptación o el rechazo.'
  const progress = completion(app, product)
  if (!progress.personalOk) return 'Completar los datos personales'
  if (!progress.employmentOk) return 'Completar la información laboral'
  if (!progress.creditOk) return 'Completar los datos del crédito'
  if (!progress.docsOk) return 'Seleccionar los documentos pendientes'
  if (!app.submittedAt) return 'Revisar y enviar la pregestión'
  return 'Consultar el resumen. Ya no se puede modificar.'
}

export function progressPercent(app, product) {
  const progress = completion(app, product)
  const steps = [
    progress.personalOk,
    progress.employmentOk,
    progress.creditOk,
    progress.docsOk,
    Boolean(app?.submittedAt),
  ]
  return Math.round((steps.filter(Boolean).length / steps.length) * 100)
}

export function isEditable(status) {
  return status === 'borrador' || status === 'pendiente_completar'
}

export function applicationToJson(application, product) {
  return {
    id: application.ref,
    creditId: application.productId,
    creditName: application.creditName || product?.name || '',
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    status: application.status,
    personalData: application.personal,
    employmentData: application.employment,
    creditData: application.creditData || {},
    documents: application.documents,
    completedSteps: {
      personal: Boolean(completion(application, product).personalOk),
      employment: Boolean(completion(application, product).employmentOk),
      credit: Boolean(completion(application, product).creditOk),
      documents: Boolean(completion(application, product).docsOk),
      submitted: Boolean(application.submittedAt),
    },
    nextAction: product ? nextStepLabel(application, product) : '',
  }
}

export function downloadApplicationJson(application, product) {
  const payload = applicationToJson(application, product)
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${application.ref}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function wizardPath(productId, step) {
  const steps = {
    1: 'datos-personales',
    2: 'informacion-laboral',
    3: 'datos-del-credito',
    4: 'documentos',
    5: 'confirmacion',
  }
  return `/creditos/solicitud/${productId}/${steps[step]}`
}

export function continuePath(app, product) {
  if (!isEditable(app.status)) return `/mis-creditos/${app.ref}`
  const progress = completion(app, product)
  if (!progress.personalOk) return wizardPath(app.productId, 1)
  if (!progress.employmentOk) return wizardPath(app.productId, 2)
  if (!progress.creditOk) return wizardPath(app.productId, 3)
  if (!progress.docsOk) return wizardPath(app.productId, 4)
  return wizardPath(app.productId, 5)
}

export function nextReference(applications) {
  const numbers = applications.map((item) => Number(String(item.ref).replace(/\D/g, ''))).filter(Boolean)
  const next = Math.max(1099, ...numbers) + 1
  return `PG-DEMO-${next}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function formatColones(value) {
  const number = Number(String(value ?? '').replace(/[^\d]/g, ''))
  if (!number) return '—'
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(number)
}

export function formatBytes(bytes) {
  const size = Number(bytes || 0)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
