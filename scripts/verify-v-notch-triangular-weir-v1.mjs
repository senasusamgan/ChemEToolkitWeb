import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  workbench,
  catalog,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/v-notch-triangular-weir/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/v-notch-triangular-weir/VNotchTriangularWeirCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/v-notch-triangular-weir/v-notch-triangular-weir.test.ts',
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
    'package.json',
    'utf8',
  ),
  readFile(
    'scripts/calculator-test-coverage-baseline-v1.json',
    'utf8',
  ),
])

function requireMarker(
  source,
  marker,
  label,
) {
  if (!source.includes(marker)) {
    throw new Error(
      `Calculator 419 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'V_NOTCH_TRIANGULAR_WEIR_ENGINE_VERSION',
  'calculateVNotchTriangularWeir',
  'topWidthAtHead',
  'wettedTriangularArea',
  'recoveredHeadOverVertex',
  'headClosureResidual',
  'createVNotchTriangularWeirCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–36',
  'V-Notch / Triangular Weir Flow Rate',
  'Top Width at Head',
  'Recovered Head Over Vertex',
  'Head Closure Residual',
  'Export calculation CSV',
]) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'vNotchTriangularWeir',
  'direct test ID',
)

requireMarker(
  tests,
  'recovers the specified upstream head',
  'head closure test',
)

requireMarker(
  tests,
  'flow follows the five-halves head power law',
  'head scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'vNotchTriangularWeir'",
  'route',
)

requireMarker(
  catalog,
  'id: "vNotchTriangularWeir"',
  'catalog ID',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'vNotchTriangularWeir',
    )
) {
  throw new Error(
    'Calculator 419 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:v-notch-triangular-weir-v1',
  'verify:v-notch-triangular-weir-v1',
  'sync:verified-calculator-copy',
  'verify:verified-calculator-copy',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Missing package script: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:v-notch-triangular-weir-v1',
  )
) {
  throw new Error(
    'Calculator 419 is not in verify:release.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].endsWith(
    'npm run verify:verified-calculator-copy',
  )
) {
  throw new Error(
    'Visible calculator-count verifier must remain last in verify:release.',
  )
}

console.log(
  'PASS: Calculator 419 verifier.',
)

console.log(
  `Catalog calculators: ${baseline.catalogCalculatorCount}`,
)

console.log(
  `Direct test signals: ${baseline.directTestSignals}`,
)

console.log(
  `Coverage gaps: ${baseline.withoutDirectTestSignal}`,
)
