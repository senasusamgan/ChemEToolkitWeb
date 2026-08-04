import {
  readFileSync,
} from 'node:fs'

const CATALOG_PATH =
  'src/data/calculators.ts'

const WORKBENCH_PATH =
  'src/components/CalculatorWorkbench.tsx'

const LEGACY_WORKBENCH_PATH =
  'src/components/LegacyWorkbench.tsx'

const LEGACY_HTML_PATH =
  'public/legacy/index.html'

const EXPECTED_CALCULATOR_COUNT = 385

const errors = []

function addError(message) {
  errors.push(message)
}

function countValues(values) {
  const counts = new Map()

  for (const value of values) {
    counts.set(
      value,
      (counts.get(value) ?? 0) + 1,
    )
  }

  return counts
}

function duplicates(values) {
  return [
    ...countValues(values),
  ]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({
      value,
      count,
    }))
}

function unique(values) {
  return [
    ...new Set(values),
  ]
}

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

const legacyWorkbenchSource =
  readFileSync(
    LEGACY_WORKBENCH_PATH,
    'utf8',
  )

const legacyHtmlSource =
  readFileSync(
    LEGACY_HTML_PATH,
    'utf8',
  )

const catalogPattern =
  /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}/g

const calculators = [
  ...catalogSource.matchAll(
    catalogPattern,
  ),
].map((match) => ({
  id: match[1],
  title: match[2],
  category: match[3],
  available: match[4] === 'true',
}))

const catalogIds =
  calculators.map(
    (calculator) =>
      calculator.id,
  )

const catalogIdSet =
  new Set(catalogIds)

if (
  calculators.length !==
  EXPECTED_CALCULATOR_COUNT
) {
  addError(
    `Expected ${EXPECTED_CALCULATOR_COUNT} catalog entries, found ${calculators.length}.`,
  )
}

const directNativeIds = []

const directNativePattern =
  /calculatorId\s*===\s*(['"])([^'"]+)\1/g

for (
  const match
  of workbenchSource.matchAll(
    directNativePattern,
  )
) {
  directNativeIds.push(
    match[2],
  )
}

const groupedNativeIds = []

const groupedNativePattern =
  /if\s*\(\s*\[([\s\S]*?)\]\s*\.includes\(\s*calculatorId\s*\)\s*\)/g

for (
  const groupMatch
  of workbenchSource.matchAll(
    groupedNativePattern,
  )
) {
  const groupSource =
    groupMatch[1]

  const stringPattern =
    /['"]([^'"]+)['"]/g

  for (
    const valueMatch
    of groupSource.matchAll(
      stringPattern,
    )
  ) {
    groupedNativeIds.push(
      valueMatch[1],
    )
  }
}

const allNativeRouteOccurrences = [
  ...directNativeIds,
  ...groupedNativeIds,
]

const nativeRouteIds =
  unique(
    allNativeRouteOccurrences,
  )

const nativeRouteIdSet =
  new Set(nativeRouteIds)

const legacyOptionIds = []

const legacyOptionPattern =
  /<option\b[^>]*\bvalue=(['"])(.*?)\1/gs

for (
  const match
  of legacyHtmlSource.matchAll(
    legacyOptionPattern,
  )
) {
  legacyOptionIds.push(
    match[2],
  )
}

const uniqueLegacyOptionIds =
  unique(
    legacyOptionIds,
  )

const legacyOptionIdSet =
  new Set(
    uniqueLegacyOptionIds,
  )

for (
  const duplicate
  of duplicates(
    allNativeRouteOccurrences,
  )
) {
  addError(
    `Native calculator route "${duplicate.value}" is declared ${duplicate.count} times.`,
  )
}

for (
  const duplicate
  of duplicates(
    legacyOptionIds,
  )
) {
  addError(
    `Legacy calculator option "${duplicate.value}" appears ${duplicate.count} times.`,
  )
}

for (
  const nativeId
  of nativeRouteIds
) {
  if (
    !catalogIdSet.has(
      nativeId,
    )
  ) {
    addError(
      `Native route "${nativeId}" is not present in the calculator catalog.`,
    )
  }
}

for (
  const legacyId
  of uniqueLegacyOptionIds
) {
  if (
    !catalogIdSet.has(
      legacyId,
    )
  ) {
    addError(
      `Legacy option "${legacyId}" is not present in the calculator catalog.`,
    )
  }
}

const unroutedCalculatorIds =
  catalogIds.filter(
    (calculatorId) =>
      !nativeRouteIdSet.has(
        calculatorId,
      ) &&
      !legacyOptionIdSet.has(
        calculatorId,
      ),
  )

for (
  const calculatorId
  of unroutedCalculatorIds
) {
  addError(
    `Catalog calculator "${calculatorId}" has neither a native route nor a legacy selector option.`,
  )
}

if (
  nativeRouteIds.length === 0
) {
  addError(
    'No native calculator routes were detected.',
  )
}

if (
  uniqueLegacyOptionIds.length === 0
) {
  addError(
    'No legacy calculator selector options were detected.',
  )
}

const requiredWorkbenchContracts = [
  {
    description:
      'LegacyWorkbench import',
    pattern:
      /import\s*\{\s*LegacyWorkbench\s*\}\s*from\s*['"]\.\/LegacyWorkbench['"]/,
  },
  {
    description:
      'LegacyWorkbench fallback rendering',
    pattern:
      /<LegacyWorkbench\b/,
  },
  {
    description:
      'fallback calculatorId forwarding',
    pattern:
      /calculatorId=\{calculatorId\}/,
  },
  {
    description:
      'fallback title forwarding',
    pattern:
      /title=\{title\}/,
  },
]

for (
  const contract
  of requiredWorkbenchContracts
) {
  if (
    !contract.pattern.test(
      workbenchSource,
    )
  ) {
    addError(
      `CalculatorWorkbench is missing ${contract.description}.`,
    )
  }
}

const requiredLegacyContracts = [
  {
    description:
      'same-origin legacy source',
    pattern:
      /\/legacy\/index\.html\?embed=1&calculator=/,
  },
  {
    description:
      'encoded calculator query parameter',
    pattern:
      /encodeURIComponent\(\s*calculatorId\s*,?\s*\)/,
  },
  {
    description:
      'legacy selector option lookup',
    pattern:
      /option\.value\s*===\s*calculatorId/,
  },
  {
    description:
      'selector value synchronization',
    pattern:
      /calculatorSelector\.value\s*!==\s*calculatorId/,
  },
  {
    description:
      'input event dispatch',
    pattern:
      /initEvent\(\s*['"]input['"]/,
  },
  {
    description:
      'change event dispatch',
    pattern:
      /initEvent\(\s*['"]change['"]/,
  },
  {
    description:
      'calculator-aware synchronization dependency',
    pattern:
      /\},\s*\[\s*calculatorId\s*\]\s*\)/,
  },
  {
    description:
      'iframe source binding',
    pattern:
      /src=\{source\}/,
  },
]

for (
  const contract
  of requiredLegacyContracts
) {
  if (
    !contract.pattern.test(
      legacyWorkbenchSource,
    )
  ) {
    addError(
      `LegacyWorkbench is missing ${contract.description}.`,
    )
  }
}

const nativeAndLegacyOverlap =
  nativeRouteIds.filter(
    (calculatorId) =>
      legacyOptionIdSet.has(
        calculatorId,
      ),
  )

const nativeOnlyIds =
  nativeRouteIds.filter(
    (calculatorId) =>
      !legacyOptionIdSet.has(
        calculatorId,
      ),
  )

const legacyOnlyIds =
  uniqueLegacyOptionIds.filter(
    (calculatorId) =>
      !nativeRouteIdSet.has(
        calculatorId,
      ),
  )

if (errors.length > 0) {
  console.error(
    'CALCULATOR ROUTING VERIFICATION FAILED',
  )

  for (
    const [
      index,
      error,
    ] of errors.entries()
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
  `Native route IDs: ${nativeRouteIds.length}`,
)

console.log(
  `Legacy selector IDs: ${uniqueLegacyOptionIds.length}`,
)

console.log(
  `Native and legacy overlap: ${nativeAndLegacyOverlap.length}`,
)

console.log(
  `Native-only routes: ${nativeOnlyIds.length}`,
)

console.log(
  `Legacy-only routes: ${legacyOnlyIds.length}`,
)

console.log(
  'Unrouted calculators: 0',
)

console.log(
  'Legacy fallback and synchronization contracts verified.',
)
