import {
  readFileSync,
} from 'node:fs'

const engine =
  readFileSync(
    'src/features/fluid-mechanics/fluidized-bed-pressure-drop-check/engine.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/features/fluid-mechanics/fluidized-bed-pressure-drop-check/FluidizedBedPressureDropCalculator.tsx',
    'utf8',
  )

const catalog =
  readFileSync(
    'src/data/calculators.ts',
    'utf8',
  )

const categories =
  readFileSync(
    'src/data/categories.ts',
    'utf8',
  )

const fluidMechanicsMetadata =
  categories.match(
    /name:\s*["']Fluid Mechanics["']\s*,\s*icon:\s*["']≈["']\s*,\s*total:\s*(\d+)\s*,\s*live:\s*(\d+)/,
  )

const fluidMechanicsTotal =
  Number(
    fluidMechanicsMetadata?.[1]
    ?? Number.NaN,
  )

const fluidMechanicsLive =
  Number(
    fluidMechanicsMetadata?.[2]
    ?? Number.NaN,
  )

const registry =
  readFileSync(
    'src/components/NativeCalculatorRegistry.tsx',
    'utf8',
  )

const category =
  readFileSync(
    'src/components/native-calculator-categories/FluidMechanicsCalculatorCategory.tsx',
    'utf8',
  )

const shard =
  readFileSync(
    'src/components/native-calculator-categories/fluid-mechanics-shards/FluidMechanicsShard01.tsx',
    'utf8',
  )

const tests =
  readFileSync(
    'tests/fluidized-bed-pressure-drop-check/fluidized-bed-pressure-drop-check.test.ts',
    'utf8',
  )

const baseline =
  JSON.parse(
    readFileSync(
      'scripts/calculator-test-coverage-baseline-v1.json',
      'utf8',
    ),
  )

const pkg =
  JSON.parse(
    readFileSync(
      'package.json',
      'utf8',
    ),
  )

const contracts = [
  [
    engine.includes(
      'calculateFluidizedBedPressureDrop',
    )
      && engine.includes(
        '150'
      )
      && engine.includes(
        '1.75'
      ),
    'Ergun pressure-drop engine missing.',
  ],
  [
    engine.includes(
      'bedWeightPressureDrop',
    )
      && engine.includes(
        'fluidizationRatio',
      ),
    'Fluidization threshold comparison missing.',
  ],
  [
    engine.includes(
      "'at-or-above-threshold'",
    )
      && engine.includes(
        "'below-threshold'",
      ),
    'Fluidization state contract missing.',
  ],
  [
    component.includes(
      'Fluidized-Bed Pressure Drop',
    )
      && component.includes(
        'Ergun (1952)',
      ),
    'Calculator engineering reference missing.',
  ],
  [
    component.includes(
      'Bed-weight threshold',
    )
      && component.includes(
        'Viscous contribution',
      )
      && component.includes(
        'Inertial contribution',
      ),
    'Pressure-drop engineering outputs missing.',
  ],
  [
    catalog.includes(
      'id: "fluidizedBedPressureDropCheck"',
    ),
    'Calculator 475 catalog entry missing.',
  ],
  [
    Number.isFinite(
      fluidMechanicsTotal,
    )
      && fluidMechanicsTotal >=
        92
      && fluidMechanicsLive ===
        fluidMechanicsTotal,
    'Fluid Mechanics metadata must remain consistent and include Calculator 475.',
  ],
  [
    registry.includes(
      '"fluidizedBedPressureDropCheck": "fluid-mechanics"',
    ),
    'Native registry route missing.',
  ],
  [
    category.includes(
      '"fluidizedBedPressureDropCheck": "shard-01"',
    ),
    'Fluid Mechanics shard assignment missing.',
  ],
  [
    shard.includes(
      '<FluidizedBedPressureDropCalculator />',
    ),
    'Fluid Mechanics native renderer missing.',
  ],
  [
    tests.includes(
      "'fluidizedBedPressureDropCheck'",
    )
      && tests.includes(
        '0.575508325738931',
      ),
    'Direct engineering regression test missing.',
  ],
  [
    baseline.catalogCalculatorCount >=
      475
      && baseline.directTestSignals ===
        baseline.catalogCalculatorCount
      && baseline.withoutDirectTestSignal ===
        0,
    'Coverage baseline must include Calculator 475 and remain gap-free.',
  ],
  [
    Boolean(
      pkg.scripts[
        'test:fluidized-bed-pressure-drop-v1'
      ],
    )
      && Boolean(
        pkg.scripts[
          'verify:fluidized-bed-pressure-drop-v1'
        ],
      ),
    'Calculator package scripts missing.',
  ],
  [
    pkg.scripts[
      'verify:release'
    ]?.includes(
      'verify:fluidized-bed-pressure-drop-v1',
    ),
    'Calculator verifier missing from release chain.',
  ],
]

const failures =
  contracts
    .filter(
      ([passed]) =>
        !passed,
    )
    .map(
      ([, message]) =>
        message,
    )

if (failures.length) {
  console.error(
    'FLUIDIZED BED PRESSURE DROP V1 VERIFICATION FAILED',
  )

  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  'FLUIDIZED BED PRESSURE DROP V1 VERIFICATION PASSED',
)

console.log(
  'PASS: Ergun viscous + inertial pressure drop.',
)

console.log(
  'PASS: bed-weight fluidization threshold.',
)

console.log(
  'PASS: Fluid Mechanics contains Calculator 475.',
)

console.log(
  'PASS: live catalog integrity and zero coverage gaps.',
)
