import http from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createCustomProduct, isModuleCredit, resolveCatalog } from '../src/data/catalog.js'
import { emptyCreditData } from '../src/data/creditForms.js'
import { createSeedState } from '../src/data/seeds.js'
import {
  ADMIN_STATUSES,
  completion,
  deriveStatus,
  emptyEmployment,
  emptyPersonal,
  isEditable,
  nextReference,
  validateFile,
} from '../src/lib/domain.js'
import { readDb, updateDb } from './db.js'

const PATCH_KEYS = [
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

function event(text) {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    at: new Date().toISOString(),
    text,
  }
}

function publicCatalog(db) {
  return resolveCatalog(db).filter(isModuleCredit)
}

function findApplication(db, ref) {
  return db.applications.find((item) => item.ref === ref)
}

function storedFile(file, doc) {
  const stored = {
    fileName: String(file?.fileName || ''),
    fileSize: Number(file?.fileSize || 0),
    fileType: String(file?.fileType || ''),
  }
  const message = validateFile({ name: stored.fileName, size: stored.fileSize }, doc)
  if (message) return { ...stored, status: 'error', message }
  return {
    ...stored,
    status: 'seleccionado_local',
    message: 'Metadatos guardados en la base de demostración. El archivo no se almacenó y no se envió a ASECCSS.',
  }
}

function applyDocuments(application, product, body) {
  const documents = { ...(application.documents || {}) }
  if (body.documents && typeof body.documents === 'object') {
    for (const [id, file] of Object.entries(body.documents)) {
      const doc = product.documents.find((item) => item.id === id)
      if (!doc || !file) continue
      documents[id] = storedFile(file, doc)
    }
  }
  if (body.document?.id) {
    const doc = product.documents.find((item) => item.id === body.document.id)
    if (!doc) return documents
    if (!body.document.file) delete documents[doc.id]
    else documents[doc.id] = storedFile(body.document.file, doc)
  }
  return documents
}

function replaceApplication(db, application) {
  return {
    ...db,
    applications: db.applications.map((item) => (item.ref === application.ref ? application : item)),
  }
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 1_000_000) {
      const error = new Error('La solicitud es demasiado grande.')
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('El cuerpo no es JSON válido.')
    error.status = 400
    throw error
  }
}

function send(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Demo-Almacenamiento': 'json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(body)
}

function fail(res, status, message) {
  send(res, status, { error: message })
}

async function handle(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, {})
    return
  }

  const url = new URL(req.url, 'http://127.0.0.1')
  const { pathname } = url
  const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await readBody(req)

  if (req.method === 'GET' && pathname === '/api/salud') {
    send(res, 200, {
      ok: true,
      almacenamiento: 'json',
      aviso: 'Base de demostración del proyecto. No pertenece a ASECCSS y no tiene autenticación.',
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/estado') {
    send(res, 200, readDb())
    return
  }

  if (req.method === 'GET' && pathname === '/api/pregestiones') {
    send(res, 200, readDb().applications)
    return
  }

  if (req.method === 'POST' && pathname === '/api/pregestiones') {
    const saved = await updateDb((current) => {
      const product = publicCatalog(current).find((item) => item.id === body.productId)
      if (!product) {
        const error = new Error('No encontramos ese crédito en el catálogo de demostración.')
        error.status = 404
        throw error
      }
      const existing = current.applications
        .filter((item) => item.productId === product.id && isEditable(item.status))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
      if (existing) return { state: current, result: existing, created: false }
      const now = new Date().toISOString()
      const application = {
        ref: nextReference(current.applications),
        productId: product.id,
        creditName: product.name,
        origin: 'usuario',
        createdAt: now,
        updatedAt: now,
        status: 'borrador',
        submittedAt: null,
        personal: emptyPersonal(),
        employment: emptyEmployment(),
        creditData: emptyCreditData(product.id),
        documents: {},
        history: [event('Se creó la pregestión en la base de demostración.')],
      }
      return {
        state: { ...current, applications: [application, ...current.applications] },
        result: application,
        created: true,
      }
    })
    send(res, saved.created ? 201 : 200, saved.result)
    return
  }

  if (req.method === 'DELETE' && pathname === '/api/pregestiones') {
    const db = await updateDb((current) => ({ ...current, applications: [], observations: {} }))
    send(res, 200, { applications: db.applications, observations: db.observations })
    return
  }

  const nested = pathname.match(/^\/api\/pregestiones\/([^/]+)\/(enviar|estado|observaciones)$/)
  if (nested) {
    const ref = decodeURIComponent(nested[1])
    const action = nested[2]
    if (req.method === 'POST' && action === 'enviar') {
      const saved = await updateDb((current) => {
        const application = findApplication(current, ref)
        const product = resolveCatalog(current).find((item) => item.id === application?.productId)
        if (!application || !product) {
          const error = new Error('No encontramos esa pregestión.')
          error.status = 404
          throw error
        }
        const progress = completion(application, product)
        if (!progress.personalOk || !progress.employmentOk || !progress.creditOk || !progress.docsOk) {
          const error = new Error('Faltan datos o documentos obligatorios del prototipo.')
          error.status = 400
          throw error
        }
        const at = new Date().toISOString()
        const next = {
          ...application,
          submittedAt: at,
          updatedAt: at,
          history: [
            ...(application.history || []),
            event('Se envió la pregestión a la API de demostración. No se transmitió a ASECCSS.'),
          ],
        }
        next.status = deriveStatus(next, product)
        return { state: replaceApplication(current, next), result: next }
      })
      send(res, 200, saved.result)
      return
    }
    if (req.method === 'PATCH' && action === 'estado') {
      if (!ADMIN_STATUSES.includes(body.status)) {
        fail(res, 400, 'Ese estado no existe en la demostración.')
        return
      }
      const saved = await updateDb((current) => {
        const application = findApplication(current, ref)
        if (!application) {
          const error = new Error('No encontramos esa pregestión.')
          error.status = 404
          throw error
        }
        const updatedAt = new Date().toISOString()
        const submittedAt =
          body.status === 'listo_para_revision' ||
          body.status === 'en_revision_demo' ||
          body.status === 'finalizado_demo' ||
          body.status === 'aceptada_demo' ||
          body.status === 'rechazada_demo'
            ? application.submittedAt || updatedAt
            : application.submittedAt
        const historyText =
          body.status === 'aceptada_demo'
            ? 'Se simuló la aceptación de la pregestión. No es una aprobación de ASECCSS.'
            : body.status === 'rechazada_demo'
              ? 'Se simuló el rechazo de la pregestión. No es una decisión oficial de ASECCSS.'
              : 'Se actualizó el estado dentro de la simulación administrativa.'
        const decision =
          body.status === 'aceptada_demo' || body.status === 'rechazada_demo'
            ? {
                result: body.status === 'aceptada_demo' ? 'aceptada' : 'rechazada',
                reason: String(body.reason || '').trim(),
                decidedAt: updatedAt,
                simulated: true,
              }
            : application.decision || null
        const next = {
          ...application,
          status: body.status,
          submittedAt,
          decision,
          updatedAt,
          history: [...(application.history || []), event(historyText)],
        }
        return { state: replaceApplication(current, next), result: next }
      })
      send(res, 200, saved.result)
      return
    }
    if (req.method === 'POST' && action === 'observaciones') {
      const text = String(body.text || '').trim()
      if (text.length < 3) {
        fail(res, 400, 'Escribí una observación de ejemplo.')
        return
      }
      const note = { id: `obs-${Date.now()}`, text, at: new Date().toISOString() }
      await updateDb((current) => {
        if (!findApplication(current, ref)) {
          const error = new Error('No encontramos esa pregestión.')
          error.status = 404
          throw error
        }
        return {
          ...current,
          observations: {
            ...current.observations,
            [ref]: [...(current.observations[ref] || []), note],
          },
        }
      })
      send(res, 201, note)
      return
    }
  }

  const one = pathname.match(/^\/api\/pregestiones\/([^/]+)$/)
  if (one) {
    const ref = decodeURIComponent(one[1])
    if (req.method === 'GET') {
      const application = findApplication(readDb(), ref)
      if (!application) {
        fail(res, 404, 'No encontramos esa pregestión.')
        return
      }
      send(res, 200, application)
      return
    }
    if (req.method === 'PATCH') {
      const saved = await updateDb((current) => {
        const application = findApplication(current, ref)
        const product = resolveCatalog(current).find((item) => item.id === application?.productId)
        if (!application || !product) {
          const error = new Error('No encontramos esa pregestión.')
          error.status = 404
          throw error
        }
        if (!isEditable(application.status)) {
          const error = new Error('Esta pregestión ya se envió en el prototipo y no se puede modificar.')
          error.status = 409
          throw error
        }
        const next = {
          ...application,
          personal: body.personal ? { ...emptyPersonal(), ...body.personal } : application.personal,
          employment: body.employment ? { ...emptyEmployment(), ...body.employment } : application.employment,
          creditData: body.creditData
            ? { ...emptyCreditData(application.productId), ...body.creditData }
            : application.creditData || emptyCreditData(application.productId),
          documents: applyDocuments(application, product, body),
          updatedAt: new Date().toISOString(),
        }
        next.status = deriveStatus(next, product)
        return { state: replaceApplication(current, next), result: next }
      })
      send(res, 200, saved.result)
      return
    }
  }

  if (req.method === 'PUT' && pathname === '/api/catalogo/productos') {
    const db = await updateDb((current) => {
      if (body.custom) {
        const nextProduct = createCustomProduct(body)
        const exists = current.customProducts.some((item) => item.id === nextProduct.id)
        return {
          ...current,
          customProducts: exists
            ? current.customProducts.map((item) => (item.id === nextProduct.id ? { ...item, ...nextProduct } : item))
            : [nextProduct, ...current.customProducts],
        }
      }
      const patch = {}
      PATCH_KEYS.forEach((key) => {
        if (body[key] !== undefined) patch[key] = body[key]
      })
      return {
        ...current,
        patches: { ...current.patches, [body.id]: { ...current.patches[body.id], ...patch } },
      }
    })
    send(res, 200, { patches: db.patches, customProducts: db.customProducts })
    return
  }

  const published = pathname.match(/^\/api\/catalogo\/productos\/([^/]+)$/)
  if (req.method === 'PATCH' && published) {
    const id = decodeURIComponent(published[1])
    const db = await updateDb((current) => {
      if (current.customProducts.some((item) => item.id === id)) {
        return {
          ...current,
          customProducts: current.customProducts.map((item) => (item.id === id ? { ...item, published: body.published } : item)),
        }
      }
      return { ...current, patches: { ...current.patches, [id]: { ...current.patches[id], published: body.published } } }
    })
    send(res, 200, { patches: db.patches, customProducts: db.customProducts })
    return
  }

  if (req.method === 'PATCH' && pathname === '/api/configuracion') {
    const db = await updateDb((current) => ({ ...current, simulateCatalogError: Boolean(body.simulateCatalogError) }))
    send(res, 200, { simulateCatalogError: db.simulateCatalogError })
    return
  }

  if (req.method === 'POST' && pathname === '/api/demo/reiniciar') {
    const db = await updateDb(() => createSeedState())
    send(res, 200, db)
    return
  }

  fail(res, 404, 'Esa ruta no existe en la API de demostración.')
}

function handler(req, res) {
  handle(req, res).catch((error) => {
    if (res.headersSent) return
    const status = error.status || 500
    send(res, status, { error: error.message || 'La API de demostración falló.' })
  })
}

export function startServer({ port = 8787 } = {}) {
  const server = http.createServer(handler)
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  const port = Number(process.env.PORT || 8787)
  startServer({ port }).then(() => {
    console.log(`API de demostración en http://127.0.0.1:${port}`)
    console.log('Base de datos: server/data/db.json')
  })
}
