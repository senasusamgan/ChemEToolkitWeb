import {
  readFileSync,
} from 'node:fs'

const engine =
  readFileSync(
    'src/features/fluid-mechanics/minimum-fluidization-velocity/engine.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/features/fluid-mechanics/minimum-fluidization-velocity/MinimumFluidizationVelocityCalculator.tsx',
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
    'tests/minimum-fluidization-velocity/minimum-fluidization-velocity.test.ts',
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
      'calculateMinimumFluidizationVelocity',
    )
      && engine.includes(
        '33.7 ** 2',
      )
      && engine.includes(
        '0.0408',
      ),
    'Wen-Yu calculation engine missing.',
  ],
  [
    engine.includes(
      'archimedesNumber',
    )
      && engine.includes(
        'minimumFluidizationReynoldsNumber',
      )
      && engine.includes(
        'minimumFluidizationVelocity',
      ),
    'Fluidization result contract missing.',
  ],
  [
    component.includes(
      'Minimum Fluidization Velocity',
    )
      && component.includes(
        'Wen–Yu',
      )
      && component.includes(
        'AIChE Journal 12(3), 610–612',
      ),
    'Calculator reference UI missing.',
  ],
  [
    component.includes(
      'Archimedes number',
    )
      && component.includes(
        'Minimum-fluidization Reynolds number',
      ),
    'Engineering result context missing.',
  ],
  [
    catalog.includes(
      'id: "minimumFluidizationVelocity"',
    ),
    'Calculator 474 catalog entry missing.',
  ],
  [
    categories.includes(
      'name: "Fluid Mechanics", icon: "≈", total: 91, live: 91',
    ),
    'Fluid Mechanics category must be 91/91.',
  ],
  [
    registry.includes(
      '"minimumFluidizationVelocity": "fluid-mechanics"',
    ),
    'Native registry route missing.',
  ],
  [
    category.includes(
      '"minimumFluidizationVelocity": "shard-01"',
    ),
    'Fluid Mechanics shard assignment missing.',
  ],
  [
    shard.includes(
      '<MinimumFluidizationVelocityCalculator />',
    ),
    'Fluid Mechanics renderer missing.',
  ],
  [
    tests.includes(
      "'minimumFluidizationVelocity'",
    )
      && tests.includes(
        '0.09443050633678475',
      ),
    'Direct regression tests missing.',
  ],
  [
    baseline.catalogCalculatorCount ===
      474
      && baseline.directTestSignals ===
        474
      && baseline.withoutDirectTestSignal ===
        0,
    'Calculator coverage baseline must be 474/474 with zero gaps.',
  ],
  [
    Boolean(
      pkg.scripts[
        'test:minimum-fluidization-velocity-v1'
      ],
    )
      && Boolean(
        pkg.scripts[
          'verify:minimum-fluidization-velocity-v1'
        ],
      ),
    'Calculator package scripts missing.',
  ],
  [
    pkg.scripts[
      'verify:release'
    ]?.includes(
      'verify:minimum-fluidization-velocity-v1',
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
    'MINIMUM FLUIDIZATION VELOCITY V1 VERIFICATION FAILED',
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
  'MINIMUM FLUIDIZATION VELOCITY V1 VERIFICATION PASSED',
)

console.log(
  'PASS: Wen-Yu engine.',
)

console.log(
  'PASS: Ar → Re_mf → U_mf calculation chain.',
)

console.log(
  'PASS: Fluid Mechanics 91/91.',
)

console.log(
  'PASS: catalog 474 / native 474 / coverage gaps 0.',
)
