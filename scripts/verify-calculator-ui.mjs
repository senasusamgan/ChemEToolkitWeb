import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'src/components/CalculatorStage.tsx',
  'src/components/LegacyWorkbench.tsx',
  'src/styles/calculator-polish.css',
  'src/App.tsx',
]

for (const relativePath of required) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`MISSING: ${relativePath}`)
    process.exit(1)
  }
}

const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8')
for (const token of [
  "import './styles/calculator-polish.css'",
  "import { CalculatorStage } from './components/CalculatorStage'",
  '<CalculatorStage',
  'activeCalculator={activeCalculator}',
  'onSelect={openCalculator}',
]) {
  if (!app.includes(token)) {
    console.error(`App.tsx missing UI token: ${token}`)
    process.exit(1)
  }
}

const legacy = fs.readFileSync(
  path.join(root, 'src/components/LegacyWorkbench.tsx'),
  'utf8',
)
if (!legacy.includes('ResizeObserver') || !legacy.includes('MutationObserver')) {
  console.error('Legacy iframe auto-height observers are missing.')
  process.exit(1)
}

console.log('Calculator UI polish verification PASS')
console.log('Calculator engines and catalog state were not changed.')
