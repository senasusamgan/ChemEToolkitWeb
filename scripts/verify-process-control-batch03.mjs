import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const ids = ['inverseLaplaceTransformHelper','laplaceTransformHelper','liquidControlValveSizing','liquidLevelDynamics','modelPredictiveControl','nonInteractingTankSystem']
const catalog = fs.readFileSync(path.join(root, 'src/data/calculators.ts'), 'utf8')
const entries = [...catalog.matchAll(/\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g)]
const live = entries.filter((entry) => entry[4] === 'true')
if (entries.length !== 380 || live.length !== 278) { console.error(`Catalog mismatch: ${entries.length} total / ${live.length} live`); process.exit(1) }
for (const id of ids) {
  const entry = entries.find((candidate) => candidate[1] === id)
  if (!entry || entry[3] !== 'Process Control' || entry[4] !== 'true') { console.error(`Calculator is not live: ${id}`); process.exit(1) }
}
const pc = live.filter((entry) => entry[3] === 'Process Control').length
if (pc !== 24) { console.error(`Process Control count is ${pc}, expected 24.`); process.exit(1) }
const categories = fs.readFileSync(path.join(root, 'src/data/categories.ts'), 'utf8')
const block = categories.match(/\{[^{}]*name:\s*"Process Control"[^{}]*\}/s)
if (!block || !/\btotal:\s*40\b/.test(block[0]) || !/\blive:\s*24\b/.test(block[0])) { console.error('Process Control category count is not 24 / 40.'); process.exit(1) }
console.log('Process Control Batch 03 verification PASS')
console.log('380 total / 278 live / 102 queued')
console.log('Process Control: 24 live / 40 total')
