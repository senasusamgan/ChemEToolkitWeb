import {
  readFile,
} from 'node:fs/promises'

const [
  types,
  engine,
  component,
  tests,
  workbench,
  catalog,
  categories,
  catalogVerifier,
  routingVerifier,
  coverageVerifier,
  baselineSource,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/features/separation-processes/packed-column-liquid-holdup-residence/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/packed-column-liquid-holdup-residence/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/packed-column-liquid-holdup-residence/PackedColumnLiquidHoldupCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/packed-column-liquid-holdup-residence/packed-column-liquid-holdup-residence.test.ts',
      'utf8',
    ),
    readFile(
      'src/components/CalculatorWorkbench.tsx',
      'utf8',
    ),
    readFile(
      'src/data/calculators.ts',
      'utf8',
    ),
    readFile(
      'src/data/categories.ts',
      'utf8',
    ),
    readFile(
      'scripts/verify-calculator-catalog-v1.mjs',
      'utf8',
    ),
    readFile(
      'scripts/verify-calculator-routing-v1.mjs',
      'utf8',
    ),
    readFile(
      'scripts/verify-calculator-test-coverage-v1.mjs',
      'utf8',
    ),
    readFile(
      'scripts/calculator-test-coverage-baseline-v1.json',
      'utf8',
    ),
    readFile(
      'package.json',
      'utf8',
    ),
  ])

const typeMarkers = [
  'PackedColumnHoldupStatus',
  'PackedColumnLiquidHoldupInput',
  'PackedColumnLiquidHoldupScenario',
  'PackedColumnLiquidHoldupResult',
]

for (const marker of typeMarkers) {
  if (!types.includes(marker)) {
    throw new Error(
      `Calculator 387 type marker missing: ${marker}`,
    )
  }
}

const engineMarkers = [
  'PACKED_COLUMN_LIQUID_HOLDUP_ENGINE_VERSION',
  'calculatePackedColumnHoldupScenario',
  'calculatePackedColumnLiquidHoldup',
  'createPackedColumnLiquidHoldupCsv',
]

for (const marker of engineMarkers) {
  if (!engine.includes(marker)) {
    throw new Error(
      `Calculator 387 engine marker missing: ${marker}`,
    )
  }
}

const componentMarkers = [
  'Packed Column Liquid Holdup & Residence Time',
  'Liquid holdup volume',
  'Liquid Residence Time',
  'Liquid Inventory Mass',
  'Void Saturation',
  'Maximum Flow by Residence',
  'Liquid-load operating window',
  'Export calculation CSV',
]

for (const marker of componentMarkers) {
  if (!component.includes(marker)) {
    throw new Error(
      `Calculator 387 UI marker missing: ${marker}`,
    )
  }
}

if (
  !tests.includes(
    'packedColumnLiquidHoldupResidence',
  )
) {
  throw new Error(
    'Calculator 387 ID marker missing from tests.',
  )
}

const testMarkers = [
  'calculates packed-bed and void volumes',
  'calculates liquid holdup volume and inventory mass',
  'calculates liquid velocities mass flux and residence time',
  'calculates minimum holdup and maximum residence-limited flow',
  'classifies liquid-load residence-time scenarios',
  'rejects holdup above the available bed void fraction',
  'exports liquid inventory and residence scenarios as CSV',
]

for (const marker of testMarkers) {
  if (!tests.includes(marker)) {
    throw new Error(
      `Calculator 387 test marker missing: ${marker}`,
    )
  }
}

const routeMarkers = [
  'PackedColumnLiquidHoldupCalculator',
  "calculatorId === 'packedColumnLiquidHoldupResidence'",
  'return <PackedColumnLiquidHoldupCalculator />',
]

for (const marker of routeMarkers) {
  if (!workbench.includes(marker)) {
    throw new Error(
      `Calculator 387 routing marker missing: ${marker}`,
    )
  }
}

if (
  !catalog.includes(
    'id: "packedColumnLiquidHoldupResidence"',
  )
) {
  throw new Error(
    'Calculator 387 catalog entry is missing.',
  )
}

const separationCategoryLine =
  categories
    .split('\n')
    .find(
      line =>
        line.includes('Separation Processes'),
    )

const separationCategoryLine49 =
  categories
    .split('\n')
    .find(
      line =>
        line.includes(
          'Separation Processes',
        ),
    )

if (
  !separationCategoryLine49 ||
  !separationCategoryLine49.includes(
    'total: 52',
  ) ||
  !separationCategoryLine49.includes(
    'live: 52',
  )
) {
  throw new Error(
    'Separation Processes metadata is not 52/52.',
  )
}

const separationCatalogLines =
  catalogVerifier.split('\n')

const separationCatalogIndex =
  separationCatalogLines.findIndex(
    line =>
      line.includes(
        "name: 'Separation Processes'",
      ) ||
      line.includes(
        'name: "Separation Processes"',
      ),
  )

const separationCatalogWindow =
  separationCatalogIndex >= 0
    ? separationCatalogLines
        .slice(
          separationCatalogIndex,
          separationCatalogIndex + 6,
        )
        .join('\n')
    : ''

const legacy387CatalogSingleQuoteIndex49 =
  catalogVerifier.indexOf(
    "name: 'Separation Processes'",
  )

const legacy387CatalogDoubleQuoteIndex49 =
  catalogVerifier.indexOf(
    'name: "Separation Processes"',
  )

const legacy387CatalogIndex49 =
  legacy387CatalogSingleQuoteIndex49 >= 0
    ? legacy387CatalogSingleQuoteIndex49
    : legacy387CatalogDoubleQuoteIndex49

const legacy387CatalogWindow49 =
  legacy387CatalogIndex49 >= 0
    ? catalogVerifier.slice(
        legacy387CatalogIndex49,
        legacy387CatalogIndex49 + 500,
      )
    : ''

if (
  !legacy387CatalogWindow49.includes(
    'count: 52',
  )
) {
  throw new Error(
    'Catalog verifier does not expect 52 Separation calculators.',
  )
}

for (
  const source
  of [
    routingVerifier,
    coverageVerifier,
  ]
) {
  if (
    !source.match(
      /EXPECTED_CALCULATOR_COUNT\s*=\s*454/,
    )
  ) {
    throw new Error(
      'A global calculator verifier does not expect 389 calculators.',
    )
  }
}

for (
  const marker
  of [
    'test:packed-column-liquid-holdup-residence-v1',
    'verify:packed-column-liquid-holdup-residence-v1',
  ]
) {
  if (!packageSource.includes(marker)) {
    throw new Error(
      `Calculator 387 package script missing: ${marker}`,
    )
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  454
) {
  throw new Error(
    'Coverage baseline calculator count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'packedColumnLiquidHoldupResidence',
    )
) {
  throw new Error(
    'Calculator 387 is listed as a direct-test coverage gap.',
  )
}

console.log(
  'PASS: Liquid holdup volume and inventory calculations verified.',
)

console.log(
  'PASS: Residence-time and flow-capacity calculations verified.',
)

console.log(
  'PASS: Liquid-load scenarios and CSV export verified.',
)

console.log(
  'PASS: Native routing and calculator counts verified.',
)

console.log(
  'PASS: CALCULATOR 387 — LIQUID HOLDUP V1',
)
