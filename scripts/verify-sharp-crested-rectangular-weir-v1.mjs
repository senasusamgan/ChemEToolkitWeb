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
    'src/features/fluid-mechanics/sharp-crested-rectangular-weir/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/sharp-crested-rectangular-weir/SharpCrestedRectangularWeirCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/sharp-crested-rectangular-weir/sharp-crested-rectangular-weir.test.ts',
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
      `Calculator 418 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'SHARP_CRESTED_RECTANGULAR_WEIR_ENGINE_VERSION',
  'calculateSharpCrestedRectangularWeir',
  'idealVolumetricFlowRate',
  'unitDischarge',
  'recoveredHeadOverCrest',
  'headClosureResidual',
  'createSharpCrestedRectangularWeirCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–35',
  'Sharp-Crested Rectangular Weir Flow Rate',
  'Unit Discharge',
  'Recovered Head Over Crest',
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
  'sharpCrestedRectangularWeir',
  'direct test ID',
)

requireMarker(
  tests,
  'recovers the specified head from calculated discharge',
  'head closure test',
)

requireMarker(
  tests,
  'flow follows the three-halves head power law',
  'head scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'sharpCrestedRectangularWeir'",
  'route',
)

requireMarker(
  catalog,
  'id: "sharpCrestedRectangularWeir"',
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
      'sharpCrestedRectangularWeir',
    )
) {
  throw new Error(
    'Calculator 418 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:sharp-crested-rectangular-weir-v1',
  'verify:sharp-crested-rectangular-weir-v1',
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
    'verify:sharp-crested-rectangular-weir-v1',
  )
) {
  throw new Error(
    'Calculator 418 is not in verify:release.',
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
  'PASS: Calculator 418 verifier.',
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
