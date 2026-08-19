import {
  readFileSync,
} from 'node:fs'

const calculatorId =
  'geldartParticleClassification'

const engine =
  readFileSync(
    'src/features/fluid-mechanics/geldart-particle-classification/engine.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/features/fluid-mechanics/geldart-particle-classification/GeldartParticleClassificationCalculator.tsx',
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

const shard =
  readFileSync(
    'src/components/native-calculator-categories/fluid-mechanics-shards/FluidMechanicsShard01.tsx',
    'utf8',
  )

const routingContract =
  readFileSync(
    'scripts/calculator-routing-contract-v1.txt',
    'utf8',
  )

const tests =
  readFileSync(
    'tests/geldart-particle-classification/geldart-particle-classification.test.ts',
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

const html =
  readFileSync(
    'index.html',
    'utf8',
  )

const manifest =
  JSON.parse(
    readFileSync(
      'public/site.webmanifest',
      'utf8',
    ),
  )

const catalogMatches = [
  ...catalog.matchAll(
    /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"/g,
  ),
]

const catalogCount =
  catalogMatches.length

const fluidMechanicsCount =
  catalogMatches.filter(
    (match) =>
      match[3] ===
      'Fluid Mechanics',
  ).length

const categoryMatch =
  categories.match(
    /\{\s*number:\s*2,\s*name:\s*"Fluid Mechanics",\s*icon:\s*"[^"]+",\s*total:\s*(\d+),\s*live:\s*(\d+)\s*\}/,
  )

const releaseSteps =
  String(
    pkg.scripts[
      'verify:release'
    ] ?? '',
  )
    .split('&&')
    .map(
      (step) =>
        step.trim(),
    )

const calculatorVerifierStep =
  'npm run verify:geldart-particle-classification-v1'

const regressionStep =
  'npm run verify:scientific-notebook-regression-v30'

const finalStep =
  'npm run verify:verified-calculator-copy'

const contracts = [
  [
    engine.includes(
      'calculateGeldartParticleClassification',
    )
      && engine.includes(
        'GROUP_AB_INDEX_LIMIT',
      )
      && engine.includes(
        'GROUP_D_INDEX_LIMIT',
      ),
    'Engine contract missing.',
  ],
  [
    component.includes(
      'Geldart Particle Classification',
    )
      && component.includes(
        'Geldart (1973)',
      ),
    'Calculator component or reference basis missing.',
  ],
  [
    catalogMatches.filter(
      (match) =>
        match[1] ===
        calculatorId,
    ).length === 1,
    'Calculator must occur exactly once in catalog.',
  ],
  [
    registry.includes(
      `"${calculatorId}": "fluid-mechanics"`,
    ),
    'Native registry mapping missing.',
  ],
  [
    shard.includes(
      'GeldartParticleClassificationCalculator',
    )
      && shard.includes(
        `"${calculatorId}"`,
      ),
    'Fluid Mechanics shard renderer missing.',
  ],
  [
    routingContract.includes(
      `calculatorId === "${calculatorId}"`,
    ),
    'Routing contract entry missing.',
  ],
  [
    tests.includes(
      `'${calculatorId}'`,
    )
      && tests.includes(
        "result.group,\n      'A'",
      )
      && tests.includes(
        "result.group,\n      'B'",
      )
      && tests.includes(
        "result.group,\n      'C'",
      )
      && tests.includes(
        "result.group,\n      'D'",
      ),
    'Direct calculator tests are incomplete.',
  ],
  [
    categoryMatch
      && Number(
        categoryMatch[1],
      ) === fluidMechanicsCount
      && Number(
        categoryMatch[2],
      ) === fluidMechanicsCount,
    'Fluid Mechanics category metadata is stale.',
  ],
  [
    baseline.catalogCalculatorCount ===
      catalogCount
      && baseline.directTestSignals ===
        catalogCount
      && baseline.withoutDirectTestSignal ===
        0,
    'Coverage baseline must track the live catalog with zero gaps.',
  ],
  [
    Boolean(
      pkg.scripts[
        'test:geldart-particle-classification-v1'
      ],
    )
      && Boolean(
        pkg.scripts[
          'verify:geldart-particle-classification-v1'
        ],
      ),
    'Calculator package scripts missing.',
  ],
  [
    releaseSteps.includes(
      calculatorVerifierStep,
    ),
    'Calculator verifier missing from release chain.',
  ],
  [
    releaseSteps.indexOf(
      calculatorVerifierStep,
    ) <
      releaseSteps.indexOf(
        regressionStep,
      ),
    'Calculator verifier must run before the notebook regression guard.',
  ],
  [
    releaseSteps.at(-2) ===
      regressionStep
      && releaseSteps.at(-1) ===
        finalStep,
    'Release-chain final ordering changed.',
  ],
  [
    html.includes(
      `${catalogCount} calculators`,
    )
      && String(
        manifest.description,
      ).includes(
        `${catalogCount} calculators`,
      ),
    'Visible calculator-count metadata is stale.',
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
    'GELDART PARTICLE CLASSIFICATION VERIFICATION FAILED',
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
  'GELDART PARTICLE CLASSIFICATION VERIFICATION PASSED',
)

console.log(
  `PASS: ${calculatorId} native routing registered.`,
)

console.log(
  'PASS: Geldart A/B/C/D screening cases covered.',
)

console.log(
  `PASS: live catalog integrity ${catalogCount}/${catalogCount} with zero coverage gaps.`,
)

console.log(
  'PASS: release-chain final ordering preserved.',
)
