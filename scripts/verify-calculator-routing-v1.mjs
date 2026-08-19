import {
  readFileSync,
} from 'node:fs'

const EXPECTED_CALCULATOR_COUNT = 474

const catalog =
  readFileSync(
    'src/data/calculators.ts',
    'utf8',
  )

const registry =
  readFileSync(
    'src/components/NativeCalculatorRegistry.tsx',
    'utf8',
  )

const workbench =
  readFileSync(
    'src/components/CalculatorWorkbench.tsx',
    'utf8',
  )

const catalogIds =
  [
    ...catalog.matchAll(
      /\{\s*id:\s*"([^"]+)"/g,
    ),
  ].map(
    (match) => match[1],
  )

const mapMatch =
  registry.match(
    /const CATEGORY_BY_CALCULATOR:[\s\S]*?=\s*\{([\s\S]*?)\n\}/,
  )

const routeIds =
  mapMatch
    ? [
        ...mapMatch[1].matchAll(
          /^\s{2}"([^"]+)":\s*"[^"]+",$/gm,
        ),
      ].map(
        (match) => match[1],
      )
    : []

const catalogSet =
  new Set(catalogIds)

const routeSet =
  new Set(routeIds)

const missing =
  catalogIds.filter(
    (id) =>
      !routeSet.has(id),
  )

const unknown =
  routeIds.filter(
    (id) =>
      !catalogSet.has(id),
  )

const errors = []

if (
  catalogIds.length !==
  EXPECTED_CALCULATOR_COUNT
) {
  errors.push(
    `catalog=${catalogIds.length}`,
  )
}

if (
  routeIds.length !==
  EXPECTED_CALCULATOR_COUNT
) {
  errors.push(
    `routes=${routeIds.length}`,
  )
}

if (
  routeSet.size !==
  EXPECTED_CALCULATOR_COUNT
) {
  errors.push(
    `unique routes=${routeSet.size}`,
  )
}

if (missing.length) {
  errors.push(
    `missing=${missing.join(',')}`,
  )
}

if (unknown.length) {
  errors.push(
    `unknown=${unknown.join(',')}`,
  )
}

if (
  !workbench.includes(
    'getNativeCalculatorComponent(',
  )
) {
  errors.push(
    'Workbench lazy registry dispatcher missing',
  )
}

if (
  !workbench.includes(
    '<Suspense',
  )
) {
  errors.push(
    'Workbench Suspense boundary missing',
  )
}

if (
  workbench.includes(
    'LegacyWorkbench',
  )
  || workbench.includes(
    '/legacy/',
  )
) {
  errors.push(
    'legacy runtime reference',
  )
}

if (errors.length) {
  console.error(
    'CALCULATOR ROUTING VERIFICATION FAILED',
  )

  for (const error of errors) {
    console.error(
      `- ${error}`,
    )
  }

  process.exit(1)
}

console.log(
  'CALCULATOR ROUTING VERIFICATION PASSED',
)
console.log(
  'Catalog calculators: 474',
)
console.log(
  'Native routes: 474',
)
console.log(
  'Legacy routes: 0',
)
console.log(
  'Lazy category routes: enabled',
)
