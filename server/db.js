import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSeedState } from '../src/data/seeds.js'

const root = path.dirname(fileURLToPath(import.meta.url))

function databaseFile() {
  return process.env.DB_PATH || path.join(root, 'data', 'db.json')
}

export function readDb() {
  try {
    const parsed = JSON.parse(fs.readFileSync(databaseFile(), 'utf8'))
    if (parsed.version !== 2 || !Array.isArray(parsed.applications)) return createSeedState()
    return {
      ...createSeedState(),
      ...parsed,
      patches: parsed.patches || {},
      customProducts: parsed.customProducts || [],
      observations: parsed.observations || {},
    }
  } catch {
    return createSeedState()
  }
}

let chain = Promise.resolve()

export function updateDb(mutator) {
  const run = chain.then(() => {
    const current = readDb()
    const output = mutator(current)
    const next = output && Object.prototype.hasOwnProperty.call(output, 'state') ? output.state : output
    const file = databaseFile()
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`)
    return output && Object.prototype.hasOwnProperty.call(output, 'state') ? output : next
  })
  chain = run.then(
    () => {},
    () => {},
  )
  return run
}
