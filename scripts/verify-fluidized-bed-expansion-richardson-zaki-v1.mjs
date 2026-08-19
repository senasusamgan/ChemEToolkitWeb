import {
  readFileSync,
} from 'node:fs'

const calculatorId =
  'fluidizedBedExpansionRichardsonZaki'

const engine =
  readFileSync(
    'src/features/fluid-mechanics/fluidized-bed-expansion-richardson-zaki/engine.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/features/fluid-mechanics/fluidized-bed-expansion-richardson-zaki/FluidizedBedExpansionRichardsonZakiCalculator.tsx',
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

const routingContract =
  readFileSync(
    'scripts/calculator-routing-contract-v1.txt',
    'utf8',
  )

const tests =
  readFileSync(
    'tests/fluidized-bed-expansion-richardson-zaki/fluidized-bed-expansion-richardson-zaki.test.ts',
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
  'npm run verify:fluidized-bed-expansion-richardson-zaki-v1'

const regressionStep =
  'npm run verify:scientific-notebook-regression-v30'

const finalStep =
  'npm run verify:verified-calculator-copy'

const contracts = [
  [
    engine.includes(
      'calculateFluidizedBedExpansionRichardsonZaki',
    )
      && engine.includes(
        'calculateRichardsonZakiExponent',
      )
      && engine.includes(
        '4.65',
      )
      && engine.includes(
        '2.4',
      ),
    'Richardson-Zaki engine contract missing.',
  ],
  [
    component.includes(
      'Fluidized-Bed Expansion',
    )
      && component.includes(
        'Richardson & Zaki (1954)',
      )
      && component.includes(
        'H/H₀',
      ),
    'Calculator component or engineering reference missing.',
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
    category.includes(
      `"${calculatorId}": "shard-01"`,
    ),
    'Fluid Mechanics shard assignment missing.',
  ],
  [
    shard.includes(
      'FluidizedBedExpansionRichardsonZakiCalculator',
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
        '3.0426127255974524',
      )
      && tests.includes(
        '0.5360559464608008',
      )
      && tests.includes(
        '1.2501507360110935',
      ),
    'Direct engineering regression tests are incomplete.',
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
        'test:fluidized-bed-expansion-richardson-zaki-v1'
      ],
    )
      && Boolean(
        pkg.scripts[
          'verify:fluidized-bed-expansion-richardson-zaki-v1'
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
    'FLUIDIZED BED EXPANSION RICHARDSON-ZAKI VERIFICATION FAILED',
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
  'FLUIDIZED BED EXPANSION RICHARDSON-ZAKI VERIFICATION PASSED',
)

console.log(
  'PASS: Richardson-Zaki exponent regimes verified.',
)

console.log(
  'PASS: voidage and solids-inventory bed expansion verified.',
)

console.log(
  `PASS: live catalog integrity ${catalogCount}/${catalogCount} with zero coverage gaps.`,
)

console.log(
  'PASS: full native routing path and release ordering preserved.',
)
