import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createCustomProduct, isModuleCredit, resolveCatalog } from '../data/catalog.js'
import { emptyCreditData } from '../data/creditForms.js'
import { createSeedState } from '../data/seeds.js'
import { api } from '../lib/api.js'
import { deriveStatus, emptyEmployment, emptyPersonal, isEditable, nextReference, validateFile } from '../lib/domain.js'

const BROWSER_KEY = 'aseccss-modulo-creditos-demo-v2'

const DemoContext = createContext(null)

function normalize(data) {
  const seed = createSeedState()
  if (!data || data.version !== 2 || !Array.isArray(data.applications)) return seed
  return {
    ...seed,
    ...data,
    patches: data.patches || {},
    customProducts: data.customProducts || [],
    observations: data.observations || {},
    applications: data.applications.map((application) => ({
      ...application,
      creditData: application.creditData || emptyCreditData(application.productId),
    })),
  }
}

export function DemoProvider({ children }) {
  const [state, setState] = useState(createSeedState)
  const [ready, setReady] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [storageMode, setStorageMode] = useState('api')
  const modeRef = useRef('api')
  const timers = useRef({})
  const pending = useRef(new Map())
  const inflight = useRef(new Map())

  useEffect(() => {
    let active = true
    api('/api/estado')
      .then((data) => {
        if (!active) return
        setState(normalize(data))
        setReady(true)
      })
      .catch(() => {
        if (!active) return
        modeRef.current = 'navegador'
        setStorageMode('navegador')
        try {
          setState(normalize(JSON.parse(localStorage.getItem(BROWSER_KEY) || '')))
        } catch {
          setState(createSeedState())
        }
        setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ready || storageMode !== 'navegador') return
    localStorage.setItem(BROWSER_KEY, JSON.stringify(state))
  }, [ready, state, storageMode])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      Object.values(activeTimers).forEach((timer) => window.clearTimeout(timer))
      pending.current.forEach((entry) => window.clearTimeout(entry.timer))
    }
  }, [])

  const catalog = useMemo(() => resolveCatalog(state), [state])
  const findProduct = useCallback((source, productId) => resolveCatalog(source).find((item) => item.id === productId), [])

  const queueSave = useCallback((refId, partial, immediate = false) => {
    return new Promise((resolve, reject) => {
      const entry = pending.current.get(refId) || { body: {}, waiters: [], timer: 0 }
      entry.body = { ...entry.body, ...partial }
      entry.waiters.push({ resolve, reject })
      window.clearTimeout(entry.timer)
      const send = async () => {
        if (modeRef.current === 'navegador') {
          pending.current.delete(refId)
          entry.waiters.forEach((waiter) => waiter.resolve(null))
          return
        }
        const snapshot = entry.body
        const waiters = entry.waiters
        pending.current.delete(refId)
        const previous = inflight.current.get(refId) || Promise.resolve()
        const run = previous.catch(() => {}).then(() =>
          api(`/api/pregestiones/${encodeURIComponent(refId)}`, {
            method: 'PATCH',
            body: snapshot,
          }),
        )
        inflight.current.set(refId, run)
        try {
          const saved = await run
          if (inflight.current.get(refId) === run) inflight.current.delete(refId)
          setState((prev) => {
            if (pending.current.has(refId)) return prev
            return {
              ...prev,
              applications: prev.applications.map((item) => {
                if (item.ref !== refId) return item
                if (new Date(item.updatedAt) > new Date(saved.updatedAt)) return item
                return saved
              }),
            }
          })
          setSaveError('')
          waiters.forEach((waiter) => waiter.resolve(saved))
        } catch (error) {
          if (inflight.current.get(refId) === run) inflight.current.delete(refId)
          setSaveError(error.message)
          waiters.forEach((waiter) => waiter.reject(error))
        }
      }
      if (immediate) {
        pending.current.delete(refId)
        send()
      } else {
        entry.timer = window.setTimeout(send, 250)
        pending.current.set(refId, entry)
      }
    })
  }, [])

  const changeApplication = useCallback(
    (refId, updater) => {
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((application) => {
          if (application.ref !== refId) return application
          const next = updater(application)
          const product = findProduct(prev, next.productId)
          return { ...next, status: deriveStatus(next, product), updatedAt: new Date().toISOString() }
        }),
      }))
    },
    [findProduct],
  )

  const remember = useCallback((promise) => {
    promise.catch(() => {})
    return promise
  }, [])

  const value = useMemo(() => {
    const publicCatalog = catalog.filter(isModuleCredit)
    return {
      applications: state.applications,
      observations: state.observations,
      simulateCatalogError: state.simulateCatalogError,
      storageMode,
      saveError,
      catalog: publicCatalog,
      allProducts: catalog,
      getPublicProduct: (id) => publicCatalog.find((item) => item.id === id),
      getAnyProduct: (id) => catalog.find((item) => item.id === id),
      getApplication: (refId) => state.applications.find((item) => item.ref === refId),
      getWizardApplication: (productId) =>
        state.applications
          .filter((item) => item.productId === productId && isEditable(item.status))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0],
      startApplication: async (productId) => {
        if (modeRef.current === 'navegador') {
          const product = publicCatalog.find((item) => item.id === productId)
          if (!product) throw new Error('No encontramos ese crédito en el catálogo de demostración.')
          let created
          setState((prev) => {
            const current = prev.applications
              .filter((item) => item.productId === productId && isEditable(item.status))
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
            if (current) {
              created = current
              return prev
            }
            const now = new Date().toISOString()
            created = {
              ref: nextReference(prev.applications),
              productId,
              creditName: product.name,
              origin: 'usuario',
              createdAt: now,
              updatedAt: now,
              status: 'borrador',
              submittedAt: null,
              personal: emptyPersonal(),
              employment: emptyEmployment(),
              creditData: emptyCreditData(productId),
              documents: {},
              history: [{ id: `evt-${Date.now()}`, at: now, text: 'Se creó la pregestión en este navegador.' }],
            }
            return { ...prev, applications: [created, ...prev.applications] }
          })
          return created
        }
        const existing = state.applications
          .filter((item) => item.productId === productId && isEditable(item.status))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
        if (existing) return existing
        const created = await api('/api/pregestiones', { method: 'POST', body: { productId } })
        setState((prev) => {
          if (prev.applications.some((item) => item.ref === created.ref)) return prev
          return { ...prev, applications: [created, ...prev.applications] }
        })
        setSaveError('')
        return created
      },
      updatePersonal: (refId, personal, immediate = false) => {
        changeApplication(refId, (application) => ({ ...application, personal }))
        return remember(queueSave(refId, { personal }, immediate))
      },
      updateEmployment: (refId, employment, immediate = false) => {
        changeApplication(refId, (application) => ({ ...application, employment }))
        return remember(queueSave(refId, { employment }, immediate))
      },
      updateCreditData: (refId, creditData, immediate = false) => {
        changeApplication(refId, (application) => ({ ...application, creditData }))
        return remember(queueSave(refId, { creditData }, immediate))
      },
      selectFile: (refId, doc, file) => {
        const message = validateFile(file, doc)
        const base = { fileName: file.name, fileSize: file.size, fileType: file.type || '' }
        const key = `${refId}:${doc.id}`
        window.clearTimeout(timers.current[key])
        if (message) {
          const record = { ...base, status: 'error', message }
          changeApplication(refId, (application) => ({
            ...application,
            documents: { ...application.documents, [doc.id]: record },
          }))
          return remember(queueSave(refId, { document: { id: doc.id, file: record } }, true))
        }
        changeApplication(refId, (application) => ({
          ...application,
          documents: {
            ...application.documents,
            [doc.id]: { ...base, status: 'cargando', message: 'Leyendo el archivo en este dispositivo.' },
          },
        }))
        timers.current[key] = window.setTimeout(() => {
          const record = {
            ...base,
            status: 'seleccionado_local',
            message: 'Metadatos guardados en la base de demostración. El archivo no se almacenó y no se envió a ASECCSS.',
          }
          changeApplication(refId, (application) => {
            const current = application.documents[doc.id]
            if (!current || current.fileName !== file.name) return application
            return { ...application, documents: { ...application.documents, [doc.id]: record } }
          })
          remember(queueSave(refId, { document: { id: doc.id, file: record } }, true))
        }, 700)
      },
      removeFile: (refId, docId) => {
        window.clearTimeout(timers.current[`${refId}:${docId}`])
        changeApplication(refId, (application) => {
          const documents = { ...application.documents }
          delete documents[docId]
          return { ...application, documents }
        })
        return remember(queueSave(refId, { document: { id: docId, file: null } }, true))
      },
      submitApplication: async (refId) => {
        if (modeRef.current === 'navegador') {
          if (pending.current.has(refId)) await queueSave(refId, {}, true)
          let saved
          setState((prev) => {
            const application = prev.applications.find((item) => item.ref === refId)
            if (!application) return prev
            const at = new Date().toISOString()
            const next = {
              ...application,
              submittedAt: at,
              updatedAt: at,
              history: [
                ...(application.history || []),
                { id: `evt-${Date.now()}`, at, text: 'Se envió la pregestión en este navegador. No se transmitió a ASECCSS.' },
              ],
            }
            next.status = deriveStatus(next, findProduct(prev, next.productId))
            saved = next
            return { ...prev, applications: prev.applications.map((item) => (item.ref === refId ? next : item)) }
          })
          if (!saved) throw new Error('No encontramos esa pregestión.')
          return saved
        }
        if (pending.current.has(refId)) await queueSave(refId, {}, true)
        const flying = inflight.current.get(refId)
        if (flying) await flying
        const saved = await api(`/api/pregestiones/${encodeURIComponent(refId)}/enviar`, { method: 'POST' })
        setState((prev) => ({
          ...prev,
          applications: prev.applications.map((item) => (item.ref === refId ? saved : item)),
        }))
        setSaveError('')
        return saved
      },
      updateStatus: (refId, status, reason = '') => {
        const message =
          status === 'aceptada_demo'
            ? 'Se simuló la aceptación de la pregestión. No es una aprobación de ASECCSS.'
            : status === 'rechazada_demo'
              ? 'Se simuló el rechazo de la pregestión. No es una decisión oficial de ASECCSS.'
              : 'Se actualizó el estado dentro de la simulación administrativa.'
        if (modeRef.current === 'navegador') {
          setState((prev) => ({
            ...prev,
            applications: prev.applications.map((application) => {
              if (application.ref !== refId) return application
              const updatedAt = new Date().toISOString()
              const decision =
                status === 'aceptada_demo' || status === 'rechazada_demo'
                  ? {
                      result: status === 'aceptada_demo' ? 'aceptada' : 'rechazada',
                      reason: String(reason || '').trim(),
                      decidedAt: updatedAt,
                      simulated: true,
                    }
                  : application.decision || null
              return {
                ...application,
                status,
                submittedAt:
                  status === 'listo_para_revision' ||
                  status === 'en_revision_demo' ||
                  status === 'finalizado_demo' ||
                  status === 'aceptada_demo' ||
                  status === 'rechazada_demo'
                    ? application.submittedAt || updatedAt
                    : application.submittedAt,
                decision,
                updatedAt,
                history: [...(application.history || []), { id: `evt-${Date.now()}`, at: updatedAt, text: message }],
              }
            }),
          }))
          return Promise.resolve()
        }
        const promise = api(`/api/pregestiones/${encodeURIComponent(refId)}/estado`, {
          method: 'PATCH',
          body: { status, reason },
        }).then((saved) => {
          setState((prev) => ({
            ...prev,
            applications: prev.applications.map((item) => (item.ref === refId ? saved : item)),
          }))
          setSaveError('')
          return saved
        })
        return remember(promise)
      },
      addObservation: (refId, text) => {
        if (modeRef.current === 'navegador') {
          const note = { id: `obs-${Date.now()}`, text: text.trim(), at: new Date().toISOString() }
          setState((prev) => ({
            ...prev,
            observations: { ...prev.observations, [refId]: [...(prev.observations[refId] || []), note] },
          }))
          return Promise.resolve(note)
        }
        const promise = api(`/api/pregestiones/${encodeURIComponent(refId)}/observaciones`, {
          method: 'POST',
          body: { text },
        }).then((note) => {
          setState((prev) => ({
            ...prev,
            observations: {
              ...prev.observations,
              [refId]: [...(prev.observations[refId] || []), note],
            },
          }))
          setSaveError('')
          return note
        })
        return remember(promise)
      },
      saveProduct: (draft) => {
        if (modeRef.current === 'navegador') {
          setState((prev) => {
            if (draft.custom) {
              const nextProduct = createCustomProduct(draft)
              const exists = prev.customProducts.some((item) => item.id === nextProduct.id)
              return {
                ...prev,
                customProducts: exists
                  ? prev.customProducts.map((item) => (item.id === nextProduct.id ? { ...item, ...nextProduct } : item))
                  : [nextProduct, ...prev.customProducts],
              }
            }
            const patch = {}
            ;['name', 'summary', 'description', 'categoryId', 'purposeId', 'purposeLabel', 'published', 'documents', 'publishedRequirements', 'highlights'].forEach(
              (key) => {
                if (draft[key] !== undefined) patch[key] = draft[key]
              },
            )
            return { ...prev, patches: { ...prev.patches, [draft.id]: { ...prev.patches[draft.id], ...patch } } }
          })
          return Promise.resolve()
        }
        const promise = api('/api/catalogo/productos', { method: 'PUT', body: draft }).then((saved) => {
          setState((prev) => ({ ...prev, patches: saved.patches, customProducts: saved.customProducts }))
          setSaveError('')
        })
        return remember(promise)
      },
      setPublished: (id, published) => {
        if (modeRef.current === 'navegador') {
          setState((prev) => {
            if (prev.customProducts.some((item) => item.id === id)) {
              return { ...prev, customProducts: prev.customProducts.map((item) => (item.id === id ? { ...item, published } : item)) }
            }
            return { ...prev, patches: { ...prev.patches, [id]: { ...prev.patches[id], published } } }
          })
          return Promise.resolve()
        }
        const promise = api(`/api/catalogo/productos/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: { published },
        }).then((saved) => {
          setState((prev) => ({ ...prev, patches: saved.patches, customProducts: saved.customProducts }))
          setSaveError('')
        })
        return remember(promise)
      },
      setCatalogError: (simulateCatalogError) => {
        setState((prev) => ({ ...prev, simulateCatalogError }))
        if (modeRef.current === 'navegador') return Promise.resolve()
        const promise = api('/api/configuracion', { method: 'PATCH', body: { simulateCatalogError } }).then(() => setSaveError(''))
        return remember(promise)
      },
      resetDemo: () => {
        if (modeRef.current === 'navegador') {
          setState(createSeedState())
          return Promise.resolve()
        }
        const promise = api('/api/demo/reiniciar', { method: 'POST' }).then((saved) => {
          setState(normalize(saved))
          setSaveError('')
        })
        return remember(promise)
      },
      clearApplications: () => {
        if (modeRef.current === 'navegador') {
          setState((prev) => ({ ...prev, applications: [], observations: {} }))
          return Promise.resolve()
        }
        const promise = api('/api/pregestiones', { method: 'DELETE' }).then((saved) => {
          setState((prev) => ({ ...prev, applications: saved.applications, observations: saved.observations }))
          setSaveError('')
        })
        return remember(promise)
      },
    }
  }, [catalog, changeApplication, findProduct, queueSave, remember, saveError, state, storageMode])

  if (!ready) {
    return (
      <section className="page">
        <div className="wrap narrow">
          <h1>Cargando la base de demostración</h1>
          <p>Se están leyendo las pregestiones desde la API local.</p>
        </div>
      </section>
    )
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo debe usarse dentro de DemoProvider')
  return context
}
