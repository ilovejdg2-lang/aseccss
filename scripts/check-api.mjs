import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const dbPath = path.join(os.tmpdir(), `aseccss-demo-${Date.now()}.json`)
process.env.DB_PATH = dbPath
process.env.PORT = '8791'

const { startServer } = await import('../server/index.js')
const server = await startServer({ port: 8791 })
const base = 'http://127.0.0.1:8791'

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

async function call(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  return { status: response.status, data }
}

try {
  const health = await call('/api/salud')
  expect(health.status === 200 && health.data.ok, 'La API no respondió')

  const empty = await call('/api/pregestiones')
  expect(empty.status === 200 && empty.data.length === 0, 'La base no inicia vacía')

  const online = await call('/api/pregestiones', { method: 'POST', body: { productId: 'pymes' } })
  expect(online.status === 404, 'La API permitió una línea que ASECCSS ya publica con formulario digital')

  const created = await call('/api/pregestiones', { method: 'POST', body: { productId: 'vivienda-hipotecario' } })
  expect(created.status === 201 && created.data.ref === 'PG-DEMO-1100', 'No se creó la pregestión')
  expect(fs.existsSync(dbPath), 'No se escribió el archivo de la base')

  const personal = {
    fullName: 'Ana Rojas Solís',
    identification: 'DEMO-2201',
    email: 'ana.rojas@ejemplo.local',
    phone: '8888-0000',
    birthDate: '',
    maritalStatus: '',
  }
  const employment = {
    jobType: 'asalariado',
    employer: 'Taller de ejemplo',
    position: 'Encargada',
    tenure: '1-3',
    income: '450000',
    otherIncome: '80000',
  }
  const creditData = {
    requestedAmount: '25000000',
    requestedTermYears: '20',
    propertyLocation: 'https://maps.app.goo.gl/ejemploDemo',
    propertyUse: 'vivienda',
    notes: 'Ejemplo',
  }
  const draft = await call(`/api/pregestiones/${created.data.ref}`, {
    method: 'PATCH',
    body: { personal, employment, creditData },
  })
  expect(draft.status === 200 && draft.data.status === 'pendiente_completar', 'La pregestión no quedó pendiente de documentos')
  expect(draft.data.creditData.requestedAmount === '25000000', 'Los datos del crédito no se guardaron en JSON')

  const blocked = await call(`/api/pregestiones/${created.data.ref}/enviar`, { method: 'POST' })
  expect(blocked.status === 400, 'La API permitió enviar sin documentos')

  const file = { fileName: 'ejemplo.pdf', fileSize: 120, fileType: 'application/pdf', status: 'seleccionado_local' }
  const withDocs = await call(`/api/pregestiones/${created.data.ref}`, {
    method: 'PATCH',
    body: { document: { id: 'identidad', file } },
  })
  expect(withDocs.data.documents.identidad.status === 'seleccionado_local', 'No se guardó el metadato del documento')
  expect(!JSON.stringify(withDocs.data.documents).includes('base64'), 'La base no debe guardar el archivo')

  await call(`/api/pregestiones/${created.data.ref}`, {
    method: 'PATCH',
    body: { document: { id: 'ingresos', file } },
  })
  const sent = await call(`/api/pregestiones/${created.data.ref}/enviar`, { method: 'POST' })
  expect(sent.status === 200 && sent.data.status === 'listo_para_revision', 'El envío no quedó listo para revisión')
  expect(sent.data.creditData.propertyLocation.includes('maps.app.goo.gl'), 'El JSON enviado no conservó el enlace de Maps')

  const locked = await call(`/api/pregestiones/${created.data.ref}`, {
    method: 'PATCH',
    body: { personal },
  })
  expect(locked.status === 409, 'Una pregestión enviada siguió siendo editable')

  const accepted = await call(`/api/pregestiones/${created.data.ref}/estado`, {
    method: 'PATCH',
    body: { status: 'aceptada_demo', reason: 'Documentación completa en la simulación' },
  })
  expect(accepted.status === 200 && accepted.data.status === 'aceptada_demo', 'No se simuló la aceptación')
  expect(accepted.data.decision?.result === 'aceptada', 'La decisión aceptada no quedó en JSON')

  const listed = await call('/api/pregestiones')
  expect(listed.data.some((item) => item.ref === created.data.ref), 'El listado no devuelve la pregestión guardada')

  const cleared = await call('/api/pregestiones', { method: 'DELETE' })
  expect(cleared.status === 200 && cleared.data.applications.length === 0, 'No se vació la base')

  const stored = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  expect(!stored._result && stored.applications.length === 0, 'El archivo de la base quedó inconsistente')
  console.log('Revisión de la API correcta: base JSON y pregestión PG-DEMO-1100.')
} finally {
  await new Promise((resolve) => server.close(resolve))
  fs.rmSync(dbPath, { force: true })
}
