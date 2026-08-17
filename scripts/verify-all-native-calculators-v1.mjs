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

const calculators =
  [
    ...catalogSource.matchAll(
      /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}/g,
    ),
  ].map(
    (match) => ({
      id: match[1],
      title: match[2],
      category: match[3],
      available:
        match[4] === 'true',
    }),
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

const registrySet =
  new Set(
    registryIds,
  )

const catalogSet =
  new Set(
    calculators.map(
      (calculator) =>
        calculator.id,
    ),
  )

const missing =
  calculators.filter(
    (calculator) =>
      !registrySet.has(
        calculator.id,
      ),
  )

const unknown =
  registryIds.filter(
    (id) =>
      !catalogSet.has(id),
  )

const categories =
  new Map()

for (
  const calculator
  of calculators
) {
  const current =
    categories.get(
      calculator.category,
    ) ?? {
      total: 0,
      native: 0,
    }

  current.total += 1

  if (
    registrySet.has(
      calculator.id,
    )
  ) {
    current.native += 1
  }

  categories.set(
    calculator.category,
    current,
  )
}

const errors = []

if (
  calculators.length !==
  EXPECTED_COUNT
) {
  errors.push(
    `Expected ${EXPECTED_COUNT} calculators; found ${calculators.length}.`,
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
    `Expected ${EXPECTED_COUNT} unique registry routes; found ${registrySet.size}.`,
  )
}

if (missing.length) {
  errors.push(
    `Non-native calculators: ${missing.map((item) => item.id).join(', ')}`,
  )
}

if (unknown.length) {
  errors.push(
    `Unknown routes: ${unknown.join(', ')}`,
  )
}

if (errors.length) {
  console.error(
    'ALL-NATIVE CALCULATOR VERIFIER FAILED',
  )

  for (
    const error
    of errors
  ) {
    console.error(
      `- ${error}`,
    )
  }

  process.exit(1)
}

console.log(
  '======================================',
)
console.log(
  'ALL-NATIVE CALCULATOR VERIFIER',
)
console.log(
  '======================================',
)
console.log(
  `Catalog calculators: ${calculators.length}`,
)
console.log(
  `Native catalog calculators: ${registrySet.size}`,
)
console.log(
  'Legacy catalog calculators: 0',
)
console.log('')

for (
  const [
    category,
    counts,
  ]
  of [
    ...categories.entries(),
  ].sort()
) {
  console.log(
    `- ${category}: ${counts.native}/${counts.total} native`,
  )
}

console.log('')
console.log(
  'PASS: 473/473 calculator catalog is native.',
)
console.log(
  'PASS: 0 legacy catalog calculators.',
)
