import {
  readFileSync,
} from 'node:fs'

const CATALOG_PATH =
  'src/data/calculators.ts'

const WORKBENCH_PATH =
  'src/components/CalculatorWorkbench.tsx'

const EXPECTED_CALCULATOR_COUNT = 473

const catalogSource =
  readFileSync(
    CATALOG_PATH,
    'utf8',
  )

const workbenchSource =
  readFileSync(
    WORKBENCH_PATH,
    'utf8',
  )

const catalogPattern =
  /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}/g

const calculators = [
  ...catalogSource.matchAll(
    catalogPattern,
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

const catalogIds =
  calculators.map(
    (calculator) =>
      calculator.id,
  )

const catalogIdSet =
  new Set(
    catalogIds,
  )

const routeOccurrences = []

const directPattern =
  /calculatorId\s*===\s*(['"])([^'"]+)\1/g

for (
  const match
  of workbenchSource.matchAll(
    directPattern,
  )
) {
  routeOccurrences.push(
    match[2],
  )
}

const groupedPattern =
  /if\s*\(\s*\[([\s\S]*?)\]\s*\.includes\(\s*calculatorId\s*\)\s*\)/g

for (
  const group
  of workbenchSource.matchAll(
    groupedPattern,
  )
) {
  for (
    const value
    of group[1].matchAll(
      /['"]([^'"]+)['"]/g,
    )
  ) {
    routeOccurrences.push(
      value[1],
    )
  }
}

const counts =
  new Map()

for (
  const calculatorId
  of routeOccurrences
) {
  counts.set(
    calculatorId,
    (
      counts.get(
        calculatorId,
      ) ?? 0
    ) + 1,
  )
}

const duplicateRoutes =
  [
    ...counts,
  ].filter(
    ([, count]) =>
      count > 1,
  )

const nativeIds =
  [
    ...counts.keys(),
  ]

const nativeIdSet =
  new Set(
    nativeIds,
  )

const missingRoutes =
  catalogIds.filter(
    (calculatorId) =>
      !nativeIdSet.has(
        calculatorId,
      ),
  )

const unknownRoutes =
  nativeIds.filter(
    (calculatorId) =>
      !catalogIdSet.has(
        calculatorId,
      ),
  )

const errors = []

if (
  calculators.length !==
  EXPECTED_CALCULATOR_COUNT
) {
  errors.push(
    `Expected ${EXPECTED_CALCULATOR_COUNT} catalog calculators; found ${calculators.length}.`,
  )
}

if (
  catalogIdSet.size !==
  calculators.length
) {
  errors.push(
    'Duplicate calculator IDs exist in the catalog.',
  )
}

for (
  const [
    calculatorId,
    count,
  ]
  of duplicateRoutes
) {
  errors.push(
    `Native calculator route "${calculatorId}" is declared ${count} times.`,
  )
}

for (
  const calculatorId
  of missingRoutes
) {
  errors.push(
    `Catalog calculator "${calculatorId}" has no native route.`,
  )
}

for (
  const calculatorId
  of unknownRoutes
) {
  errors.push(
    `Native route "${calculatorId}" is not present in the catalog.`,
  )
}

if (
  workbenchSource.includes(
    'LegacyWorkbench',
  )
) {
  errors.push(
    'CalculatorWorkbench still contains LegacyWorkbench.',
  )
}

if (
  workbenchSource.includes(
    '/legacy/',
  )
) {
  errors.push(
    'CalculatorWorkbench still contains a legacy runtime URL.',
  )
}

if (
  errors.length > 0
) {
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
  `Catalog calculators: ${calculators.length}`,
)

console.log(
  `Native route IDs: ${nativeIds.length}`,
)

console.log(
  'Legacy route IDs: 0',
)

console.log(
  'Unrouted calculators: 0',
)

console.log(
  'PASS: 473/473 calculators use native routing.',
)
