import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const children = []

function start(args) {
  const child = spawn(process.execPath, args, { cwd: project, stdio: 'inherit' })
  children.push(child)
  child.on('exit', (code) => {
    for (const item of children) {
      if (!item.killed) item.kill()
    }
    process.exit(code ?? 0)
  })
}

start([path.join(project, 'server', 'index.js')])
start([path.join(project, 'node_modules', 'vite', 'bin', 'vite.js')])

function stop() {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
