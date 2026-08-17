import {
  readFileSync,
} from 'node:fs'

const EXPECTED_CALCULATOR_COUNT = 473

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

const calculators =
  [
    ...catalog.matchAll(
      /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}/g,
    ),
  ].map(
    (match) => ({
      id: match[1],
      category: match[3],
    }),
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

const routeSet =
  new Set(routeIds)

const missing =
  calculators.filter(
    (calculator) =>
      !routeSet.has(
        calculator.id,
      ),
  )

if (
  calculators.length !==
    EXPECTED_CALCULATOR_COUNT
  || routeIds.length !==
    EXPECTED_CALCULATOR_COUNT
  || routeSet.size !==
    EXPECTED_CALCULATOR_COUNT
  || missing.length
) {
  console.error(
    'ALL-NATIVE CALCULATOR VERIFIER FAILED',
  )
  console.error(
    `catalog=${calculators.length}`,
  )
  console.error(
    `native=${routeSet.size}`,
  )
  console.error(
    `missing=${missing.length}`,
  )
  process.exit(1)
}

const categories =
  new Map()

for (const calculator of calculators) {
  categories.set(
    calculator.category,
    (
      categories.get(
        calculator.category,
      ) ?? 0
    ) + 1,
  )
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
  'Catalog calculators: 473',
)
console.log(
  'Native catalog calculators: 473',
)
console.log(
  'Legacy catalog calculators: 0',
)
console.log('')

for (
  const [
    category,
    count,
  ]
  of [
    ...categories.entries(),
  ].sort()
) {
  console.log(
    `- ${category}: ${count}/${count} native`,
  )
}

console.log('')
console.log(
  'PASS: 473/473 calculator catalog is native.',
)
console.log(
  'PASS: 0 legacy catalog calculators.',
)
