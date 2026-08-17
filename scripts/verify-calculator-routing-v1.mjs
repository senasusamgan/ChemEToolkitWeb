import {
  readFileSync,
} from 'node:fs'

const EXPECTED_CALCULATOR_COUNT = 473
const EXPECTED_COUNT =
  EXPECTED_CALCULATOR_COUNT

const catalogSource =
  readFileSync(
    'src/data/calculators.ts',
    'utf8',
  )

const registrySource =
  readFileSync(
    'src/components/NativeCalculatorRegistry.tsx',
    'utf8',
  )

const workbenchSource =
  readFileSync(
    'src/components/CalculatorWorkbench.tsx',
    'utf8',
  )

const catalogIds =
  [
    ...catalogSource.matchAll(
      /\{\s*id:\s*"([^"]+)"/g,
    ),
  ].map(
    (match) =>
      match[1],
  )

const registryIds =
  [
    ...registrySource.matchAll(
      /^  "([^"]+)":\s*\(/gm,
    ),
  ].map(
    (match) =>
      match[1],
  )

const catalogSet =
  new Set(
    catalogIds,
  )

const registrySet =
  new Set(
    registryIds,
  )

const missing =
  catalogIds.filter(
    (id) =>
      !registrySet.has(id),
  )

const unknown =
  registryIds.filter(
    (id) =>
      !catalogSet.has(id),
  )

const errors = []

if (
  catalogIds.length !==
  EXPECTED_COUNT
) {
  errors.push(
    `Expected ${EXPECTED_COUNT} catalog calculators; found ${catalogIds.length}.`,
  )
}

if (
  registryIds.length !==
  EXPECTED_COUNT
) {
  errors.push(
    `Expected ${EXPECTED_COUNT} registry routes; found ${registryIds.length}.`,
  )
}

if (
  registrySet.size !==
  EXPECTED_COUNT
) {
  errors.push(
    `Expected ${EXPECTED_COUNT} unique routes; found ${registrySet.size}.`,
  )
}

if (missing.length) {
  errors.push(
    `Missing native routes: ${missing.join(', ')}`,
  )
}

if (unknown.length) {
  errors.push(
    `Unknown native routes: ${unknown.join(', ')}`,
  )
}

if (
  !workbenchSource.includes(
    'renderNativeCalculator(',
  )
) {
  errors.push(
    'CalculatorWorkbench is not delegated to the native registry.',
  )
}

if (
  workbenchSource.includes(
    'LegacyWorkbench',
  )
  || workbenchSource.includes(
    '/legacy/',
  )
) {
  errors.push(
    'Legacy calculator runtime reference detected.',
  )
}

if (errors.length) {
  console.error(
    'CALCULATOR ROUTING VERIFICATION FAILED',
  )

  for (
    const [
      index,
      error,
    ]
    of errors.entries()
  ) {
    console.error(
      `${index + 1}. ${error}`,
    )
  }

  process.exit(1)
}

console.log(
  'CALCULATOR ROUTING VERIFICATION PASSED',
)
console.log(
  `Catalog calculators: ${catalogIds.length}`,
)
console.log(
  `Native routes: ${registryIds.length}`,
)
console.log(
  'Legacy routes: 0',
)
console.log(
  'Unrouted calculators: 0',
)
