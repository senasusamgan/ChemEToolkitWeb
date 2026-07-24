import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const requiredIds = [
  'constantPressureFiltration',
  'countercurrentSolidsWashing',
  'crystallizationYieldMotherLiquor',
  'dryingRateTime',
]
const requiredPaths = [
  'src/features/mass-transfer/constant-pressure-filtration/engine.ts',
  'src/features/mass-transfer/countercurrent-solids-washing/engine.ts',
  'src/features/mass-transfer/crystallization-yield-mother-liquor/engine.ts',
  'src/features/mass-transfer/drying-rate-time/engine.ts',
  'src/features/mass-transfer/shared/NativeCalculatorPrimitives.tsx',
  'tests/batch01/constant-pressure-filtration.test.ts',
  'tests/batch01/countercurrent-solids-washing.test.ts',
  'tests/batch01/crystallization-yield-mother-liquor.test.ts',
  'tests/batch01/drying-rate-time.test.ts',
]

for (const relative of requiredPaths) {
  await stat(path.join(root, relative))
}

const catalogText = await readFile(
  path.join(root, 'src/data/calculators.ts'),
  'utf8',
)
const entries = [...catalogText.matchAll(/\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g)]

if (entries.length !== 380) {
  throw new Error(`Expected 380 catalog entries; found ${entries.length}.`)
}

const live = entries.filter((entry) => entry[4] === 'true').length
if (live !== 190) {
  throw new Error(`Expected 190 live calculators; found ${live}.`)
}

for (const id of requiredIds) {
  const entry = entries.find((candidate) => candidate[1] === id)
  if (!entry || entry[4] !== 'true') {
    throw new Error(`${id} is not live in the calculator catalog.`)
  }
}

const categoriesText = await readFile(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)
if (!/name: "Mass Transfer", icon: "⠿", total: 45, live: 34/.test(categoriesText)) {
  throw new Error('Mass Transfer category count is not 34 live of 45.')
}

const workbenchText = await readFile(
  path.join(root, 'src/components/CalculatorWorkbench.tsx'),
  'utf8',
)
for (const id of requiredIds) {
  if (!workbenchText.includes(`calculatorId === '${id}'`)) {
    throw new Error(`${id} is not routed by CalculatorWorkbench.`)
  }
}

console.log('Batch 01 verification PASS')
console.log('380 total / 190 live / 190 queued')
console.log('Mass Transfer: 34 live / 45 total')
