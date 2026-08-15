import {
  readFile,
  stat,
} from 'node:fs/promises'
import path from 'node:path'

const root =
  process.cwd()

const requiredIds = [
  'linearInterpolationCalculator',
  'weightedAverageProperty',
]

const requiredPaths = [
  'src/features/engineering-fundamentals/shared/NativeCalculatorPrimitives.tsx',
  'src/features/engineering-fundamentals/linear-interpolation/types.ts',
  'src/features/engineering-fundamentals/linear-interpolation/engine.ts',
  'src/features/engineering-fundamentals/linear-interpolation/LinearInterpolationCalculator.tsx',
  'src/features/engineering-fundamentals/weighted-average-property/types.ts',
  'src/features/engineering-fundamentals/weighted-average-property/engine.ts',
  'src/features/engineering-fundamentals/weighted-average-property/WeightedAveragePropertyCalculator.tsx',
  'tests/engineering-fundamentals-batch01/linear-interpolation.test.ts',
  'tests/engineering-fundamentals-batch01/weighted-average-property.test.ts',
]

for (
  const relativePath
  of requiredPaths
) {
  await stat(
    path.join(
      root,
      relativePath,
    ),
  )
}

const catalogSource =
  await readFile(
    path.join(
      root,
      'src/data/calculators.ts',
    ),
    'utf8',
  )

for (
  const calculatorId
  of requiredIds
) {
  const pattern =
    new RegExp(
      `\\{ id: "${calculatorId}", title: "[^"]+", category: "Engineering Fundamentals", available: true \\}`,
    )

  if (
    !pattern.test(
      catalogSource,
    )
  ) {
    throw new Error(
      `${calculatorId} is not an available Engineering Fundamentals catalog entry.`,
    )
  }
}

const workbenchSource =
  await readFile(
    path.join(
      root,
      'src/components/CalculatorWorkbench.tsx',
    ),
    'utf8',
  )

const routeContracts = [
  {
    calculatorId:
      'linearInterpolationCalculator',
    component:
      'LinearInterpolationCalculator',
  },
  {
    calculatorId:
      'weightedAverageProperty',
    component:
      'WeightedAveragePropertyCalculator',
  },
]

for (
  const contract
  of routeContracts
) {
  if (
    !workbenchSource.includes(
      `calculatorId === '${contract.calculatorId}'`,
    )
  ) {
    throw new Error(
      `${contract.calculatorId} is not routed by CalculatorWorkbench.`,
    )
  }

  if (
    !workbenchSource.includes(
      `<${contract.component} />`,
    )
  ) {
    throw new Error(
      `${contract.component} is not rendered by CalculatorWorkbench.`,
    )
  }
}

const baseline =
  JSON.parse(
    await readFile(
      path.join(
        root,
        'scripts/calculator-test-coverage-baseline-v1.json',
      ),
      'utf8',
    ),
  )

if (
  baseline.catalogCalculatorCount !==
  459
) {
  throw new Error(
    'Coverage baseline catalog count must remain 390.',
  )
}

if (
  baseline.directTestSignals !==
  320
) {
  throw new Error(
    `Expected 252 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline.withoutDirectTestSignal !==
  139
) {
  throw new Error(
    `Expected 141 remaining coverage gaps; found ${baseline.withoutDirectTestSignal}.`,
  )
}

for (
  const calculatorId
  of requiredIds
) {
  if (
    baseline
      .calculatorIdsWithoutDirectTestSignal
      .includes(
        calculatorId,
      )
  ) {
    throw new Error(
      `${calculatorId} remains in the test-coverage baseline.`,
    )
  }
}

console.log(
  'ENGINEERING FUNDAMENTALS BATCH 01 VERIFICATION PASSED',
)

console.log(
  'Native calculators verified: 2',
)

console.log(
  'Direct test signals: 258',
)

console.log(
  'Remaining tracked coverage gaps: 141',
)
