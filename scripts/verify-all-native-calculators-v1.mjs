import {
  readFileSync,
} from 'node:fs'

const CATALOG_PATH =
  'src/data/calculators.ts'

const WORKBENCH_PATH =
  'src/components/CalculatorWorkbench.tsx'

const EXPECTED_COUNT = 473

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

if (
  calculators.length !==
  EXPECTED_COUNT
) {
  console.error(
    `❌ Expected ${EXPECTED_COUNT} calculators; found ${calculators.length}.`,
  )

  process.exit(1)
}

const nativeIds =
  new Set()

const directPattern =
  /calculatorId\s*===\s*(['"])([^'"]+)\1/g

for (
  const match
  of workbenchSource.matchAll(
    directPattern,
  )
) {
  nativeIds.add(
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
  const values =
    group[1].matchAll(
      /['"]([^'"]+)['"]/g,
    )

  for (
    const value
    of values
  ) {
    nativeIds.add(
      value[1],
    )
  }
}

const catalogIds =
  new Set(
    calculators.map(
      (calculator) =>
        calculator.id,
    ),
  )

const missingNative =
  calculators.filter(
    (calculator) =>
      !nativeIds.has(
        calculator.id,
      ),
  )

const unknownNative =
  [
    ...nativeIds,
  ].filter(
    (calculatorId) =>
      !catalogIds.has(
        calculatorId,
      ),
  )

const duplicateCheck =
  new Set(
    calculators.map(
      (calculator) =>
        calculator.id,
    ),
  )

const availableCount =
  calculators.filter(
    (calculator) =>
      calculator.available,
  ).length

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
    nativeIds.has(
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
  `Available calculators: ${availableCount}`,
)
console.log(
  `Native catalog calculators: ${
    calculators.length -
    missingNative.length
  }`,
)
console.log(
  `Legacy catalog calculators: ${missingNative.length}`,
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

if (
  duplicateCheck.size !==
  calculators.length
) {
  console.error(
    '❌ Duplicate calculator IDs detected.',
  )

  process.exit(1)
}

if (
  unknownNative.length > 0
) {
  console.error('')
  console.error(
    '❌ Native routes not present in catalog:',
  )

  for (
    const calculatorId
    of unknownNative
  ) {
    console.error(
      `- ${calculatorId}`,
    )
  }

  process.exit(1)
}

if (
  missingNative.length > 0
) {
  console.error('')
  console.error(
    '❌ Legacy/non-native calculators detected:',
  )

  for (
    const calculator
    of missingNative
  ) {
    console.error(
      `- ${calculator.id} (${calculator.category})`,
    )
  }

  process.exit(1)
}

if (
  nativeIds.size <
  EXPECTED_COUNT
) {
  console.error(
    `❌ Expected at least ${EXPECTED_COUNT} native routes; found ${nativeIds.size}.`,
  )

  process.exit(1)
}

console.log('')
console.log(
  'PASS: 473/473 calculator catalog is native.',
)
console.log(
  'PASS: 0 legacy catalog calculators.',
)
