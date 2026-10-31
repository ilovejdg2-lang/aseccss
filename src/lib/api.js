export async function api(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('No se pudo conectar con la API de demostración en este equipo.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'La API de demostración no pudo completar la operación.')
  return data
}
