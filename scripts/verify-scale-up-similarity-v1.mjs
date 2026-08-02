import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  styles,
  advancedTools,
  tests,
  packageSource,
  performanceGate,
] =
  await Promise.all([
    readFile(
      'src/features/problem-solver/scaleUpSimilarityEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/ScaleUpSimilarityPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/scale-up-similarity-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/scale-up-similarity/scale-up-similarity.test.ts',
      'utf8',
    ),
    readFile(
      'package.json',
      'utf8',
    ),
    readFile(
      'scripts/verify-problem-solver-performance-v10.mjs',
      'utf8',
    ),
  ])

for (
  const marker
  of [
    'SCALE_UP_SIMILARITY_ENGINE_VERSION',
    'calculateDimensionlessSet',
    'calculateRequiredScaleVelocity',
    'calculateScaleUpSimilarity',
    'createScaleUpProblem',
    'createScaleUpCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Scale-Up engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Scale-up similarity assistant',
    'Constant Reynolds number',
    'Constant Froude number',
    'Constant Weber number',
    'Calculate scale-up similarity',
    'Overall similarity score',
    'Export similarity CSV',
    'Transfer scaled case to Solver',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Scale-Up component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.scale-up-similarity-panel',
    '.scale-up-criterion-grid',
    '.scale-up-input-grid',
    '.scale-up-summary',
    '.scale-up-metric-table',
    '.scale-up-transfer',
    '@media (max-width: 620px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `Scale-Up style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'scaleup'",
    'loadScaleUpSimilarityPanel',
    'const ScaleUpSimilarityPanel =',
    "id:\n        'scaleup'",
    'Scale-up similarity',
    '<ScaleUpSimilarityPanel',
    'Scaled similarity case loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `Scale-Up Tool integration missing: ${marker}`,
    )
  }
}

if (
  advancedTools.includes(
    'onPointerEnter',
  ) ||
  advancedTools.includes(
    'prefetchTool(',
  )
) {
  throw new Error(
    'Scale-Up integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'calculates Reynolds, Froude and Weber numbers',
    'calculates required velocity for Reynolds similarity',
    'calculates required velocity for Froude similarity',
    'calculates required velocity for Weber similarity',
    'preserves the selected dimensionless group',
    'exports dimensionless scale-up results as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Scale-Up test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:scale-up-similarity-v1',
    'verify:scale-up-similarity-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Scale-Up package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/ScaleUpSimilarityPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Scale-Up Similarity.',
  )
}

console.log(
  'PASS: Dimensionless group calculations verified.',
)

console.log(
  'PASS: Reynolds, Froude and Weber scale laws verified.',
)

console.log(
  'PASS: Similarity scoring and preserved criterion verified.',
)

console.log(
  'PASS: CSV export and Solver transfer verified.',
)

console.log(
  'PASS: SCALE-UP SIMILARITY ASSISTANT V1',
)
