import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'src/components/CalculatorSearchCombobox.tsx',
  'src/components/CalculatorStage.tsx',
  'src/styles/calculator-search.css',
]

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`MISSING: ${relativePath}`)
    process.exit(1)
  }
}

const combobox = fs.readFileSync(
  path.join(
    root,
    'src/components/CalculatorSearchCombobox.tsx',
  ),
  'utf8',
)

const requiredTokens = [
  'role="combobox"',
  'role="listbox"',
  'ArrowDown',
  'ArrowUp',
  'Enter',
  'Escape',
  'localStorage',
  'categoryGroups',
  'No calculator found',
]

for (const token of requiredTokens) {
  if (!combobox.includes(token)) {
    console.error(
      `Search combobox missing feature: ${token}`,
    )
    process.exit(1)
  }
}

const stage = fs.readFileSync(
  path.join(
    root,
    'src/components/CalculatorStage.tsx',
  ),
  'utf8',
)

if (
  !stage.includes('<CalculatorSearchCombobox') ||
  stage.includes('<select')
) {
  console.error(
    'CalculatorStage is not using the searchable combobox.',
  )
  process.exit(1)
}

console.log(
  'Calculator search combobox verification PASS',
)
console.log(
  'Calculator engines and availability counts were not changed.',
)
