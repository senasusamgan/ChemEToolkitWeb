import {
  readFileSync,
  writeFileSync,
} from 'node:fs'

const catalogSource =
  readFileSync(
    'src/data/calculators.ts',
    'utf8',
  )

const workbenchSource =
  readFileSync(
    'src/components/CalculatorWorkbench.tsx',
    'utf8',
  )


const registrySource =
  readFileSync(
    'src/components/NativeCalculatorRegistry.tsx',
    'utf8',
  )

const baseline =
  JSON.parse(
    readFileSync(
      'scripts/calculator-test-coverage-baseline-v1.json',
      'utf8',
    ),
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
  available:
    match[4] === 'true',
}))

if (calculators.length !== 473) {
  throw new Error(
    `Expected 474 calculators, found ${calculators.length}.`,
  )
}

const nativeIds =
  new Set()

const registryMapMarker =
  'const CATEGORY_BY_CALCULATOR:'

const registryMapStart =
  registrySource.indexOf(
    registryMapMarker,
  )

if (registryMapStart < 0) {
  throw new Error(
    'CATEGORY_BY_CALCULATOR not found.',
  )
}

const registryMapBodyStart =
  registrySource.indexOf(
    '{',
    registryMapStart,
  )

const registryMapBodyEnd =
  registrySource.indexOf(
    '\n}',
    registryMapBodyStart,
  )

if (
  registryMapBodyStart < 0
  || registryMapBodyEnd < 0
) {
  throw new Error(
    'CATEGORY_BY_CALCULATOR body could not be parsed.',
  )
}

const registryMapBody =
  registrySource.slice(
    registryMapBodyStart + 1,
    registryMapBodyEnd,
  )

for (
  const line
  of registryMapBody.split(
    '\n',
  )
) {
  const trimmed =
    line.trim()

  if (
    !trimmed.startsWith(
      '"',
    )
  ) {
    continue
  }

  const delimiter =
    trimmed.indexOf(
      '":',
    )

  if (delimiter <= 1) {
    continue
  }

  nativeIds.add(
    trimmed.slice(
      1,
      delimiter,
    ),
  )
}

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
  for (
    const value
    of group[1].matchAll(
      /['"]([^'"]+)['"]/g,
    )
  ) {
    nativeIds.add(
      value[1],
    )
  }
}

if (
  nativeIds.size !== 473
) {
  throw new Error(
    `Expected 473 native calculator IDs, found ${nativeIds.size}.`,
  )
}

const coverageGaps =
  new Set(
    baseline
      .calculatorIdsWithoutDirectTestSignal ??
      [],
  )

const categoryWeight = {
  'Process Safety & Economics': 6,
  'Material & Energy Balances': 4,
  'Fluid Mechanics': 3,
  'Heat Transfer': 3,
  'Reaction Engineering': 3,
  'Separation Processes': 3,
  'Mass Transfer': 2,
  'Process Control': 2,
  'Thermodynamics': 2,
  'Engineering Fundamentals': 1,
  'Numerical Methods': 1,
}

const engineeringKeywords = [
  'safety',
  'relief',
  'pressure',
  'flow',
  'pump',
  'pipe',
  'compressor',
  'reactor',
  'heat',
  'energy',
  'mass',
  'distillation',
  'evaporator',
  'dryer',
  'npsh',
  'hydraulic',
  'steam',
  'temperature',
]

function calculatePriority(
  calculator,
) {
  const isNative =
    nativeIds.has(
      calculator.id,
    )

  const hasGap =
    coverageGaps.has(
      calculator.id,
    )

  const searchable =
    `${calculator.id} ${calculator.title}`
      .toLowerCase()

  const keywordHits =
    engineeringKeywords.filter(
      (keyword) =>
        searchable.includes(
          keyword,
        ),
    ).length

  let score = 0

  if (hasGap) {
    score += 100
  }

  if (!isNative) {
    score += 20
  }

  score +=
    categoryWeight[
      calculator.category
    ] ?? 0

  score +=
    Math.min(
      keywordHits,
      5,
    )

  return {
    ...calculator,
    routeType:
      isNative
        ? 'native'
        : 'legacy',
    hasDirectTest:
      !hasGap,
    priorityScore:
      score,
  }
}

const rows =
  calculators
    .filter(
      (calculator) =>
        calculator.available,
    )
    .map(
      calculatePriority,
    )

const nativeCount =
  rows.filter(
    (row) =>
      row.routeType ===
      'native',
  ).length

const legacyCount =
  rows.length -
  nativeCount

const directTestCount =
  rows.filter(
    (row) =>
      row.hasDirectTest,
  ).length

const top20 =
  [...rows]
    .sort(
      (a, b) =>
        b.priorityScore -
          a.priorityScore ||
        a.title.localeCompare(
          b.title,
        ),
    )
    .slice(
      0,
      20,
    )

const categories =
  [
    ...new Set(
      rows.map(
        (row) =>
          row.category,
      ),
    ),
  ]

const categoryRows =
  categories.map(
    (category) => {
      const members =
        rows.filter(
          (row) =>
            row.category ===
            category,
        )

      const native =
        members.filter(
          (row) =>
            row.routeType ===
            'native',
        ).length

      return {
        category,
        total:
          members.length,
        native,
        legacy:
          members.length -
          native,
      }
    },
  )

const report = []

report.push(
  '# ChemE Toolkit — Phase 8 Calculator Quality Audit',
)

report.push('')
report.push(
  `Generated: ${new Date().toISOString()}`,
)
report.push('')
report.push('## Executive summary')
report.push('')
report.push(
  `- Catalog calculators: ${rows.length}`,
)
report.push(
  `- Native calculators: ${nativeCount}`,
)
report.push(
  `- Legacy calculators: ${legacyCount}`,
)
report.push(
  `- Direct test signals: ${directTestCount}/${rows.length}`,
)
report.push(
  `- Coverage gaps: ${rows.length - directTestCount}`,
)

report.push('')
report.push('## Category architecture')
report.push('')
report.push(
  '| Category | Total | Native | Legacy |',
)
report.push(
  '|---|---:|---:|---:|',
)

for (
  const row
  of categoryRows
) {
  report.push(
    `| ${row.category} | ${row.total} | ${row.native} | ${row.legacy} |`,
  )
}

report.push('')
report.push(
  '## Top 20 modernization candidates',
)
report.push('')
report.push(
  'Priority score is a structural heuristic, not an engineering safety rating. Coverage gaps receive the highest weight, followed by legacy routing and engineering-criticality signals.',
)
report.push('')
report.push(
  '| # | Calculator | Category | Route | Direct test | Score |',
)
report.push(
  '|---:|---|---|---|---|---:|',
)

top20.forEach(
  (row, index) => {
    report.push(
      `| ${index + 1} | ${row.title} (\`${row.id}\`) | ${row.category} | ${row.routeType} | ${row.hasDirectTest ? 'yes' : 'no'} | ${row.priorityScore} |`,
    )
  },
)

report.push('')
report.push('## Recommended execution')
report.push('')
report.push(
  '1. Preserve existing numerical behavior and references.',
)
report.push(
  '2. Migrate selected legacy calculators to the native calculator primitives.',
)
report.push(
  '3. Add calculator-specific numerical regression tests during migration.',
)
report.push(
  '4. Verify desktop/mobile layout, validation, units and result presentation.',
)
report.push(
  '5. Run the complete release gate after each migration batch.',
)
report.push('')

writeFileSync(
  'audit-reports/phase8-calculator-quality.md',
  `${report.join('\n')}\n`,
)

console.log(
  '======================================',
)
console.log(
  'PHASE 8 CALCULATOR QUALITY AUDIT',
)
console.log(
  '======================================',
)
console.log(
  `calculators: ${rows.length}`,
)
console.log(
  `native:      ${nativeCount}`,
)
console.log(
  `legacy:      ${legacyCount}`,
)
console.log(
  `direct test: ${directTestCount}`,
)
console.log(
  `gaps:        ${rows.length - directTestCount}`,
)
console.log('')
console.log(
  'TOP 20 MODERNIZATION CANDIDATES',
)

for (
  const [
    index,
    row,
  ]
  of top20.entries()
) {
  console.log(
    `${String(index + 1).padStart(2, '0')}. ${row.id} | ${row.category} | ${row.routeType} | score=${row.priorityScore}`,
  )
}

console.log('')
console.log(
  'Report: audit-reports/phase8-calculator-quality.md',
)
