import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const required = [
  'src/components/CalculatorWorkbench.tsx',
  'src/features/mass-transfer/binary-flash/engine.ts',
  'src/features/mass-transfer/binary-flash/engine.test.ts',
  'src/features/mass-transfer/binary-flash/BinaryFlashCalculator.tsx',
]

for (const relativePath of required) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`MISSING: ${relativePath}`)
    process.exit(1)
  }
}

const catalog = fs.readFileSync(
  path.join(root, 'src/data/calculators.ts'),
  'utf8',
)

const total = (catalog.match(/available:/g) ?? []).length
const live = (catalog.match(/available: true/g) ?? []).length

if (total !== 380 || live !== 185) {
  console.error(`Catalog mismatch: ${total} total / ${live} live`)
  process.exit(1)
}

console.log('Phase 2 verification PASS')
console.log('380 total / 185 live / 195 queued')
