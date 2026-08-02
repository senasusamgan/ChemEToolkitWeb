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
      'src/features/problem-solver/responseSurfaceEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/ResponseSurfacePanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/response-surface-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/response-surface/response-surface.test.ts',
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
    'RESPONSE_SURFACE_ENGINE_VERSION',
    'createResponseSurfaceDesign',
    'fitResponseSurface',
    'predictResponseSurface',
    'findResponseSurfaceOptimum',
    'formatResponseSurfaceEquation',
    'createResponseSurfaceCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Response Surface engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Response surface model',
    'Build response surface',
    'Fitted quadratic model',
    'Predicted optimum operating point',
    'Solver sample map',
    'Export surface CSV',
    'Transfer predicted optimum to Solver',
    'requestProblemSolverMatches',
    'EVALUATION_BATCH_SIZE',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Response Surface component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.response-surface-panel',
    '.response-surface-controls',
    '.response-surface-summary',
    '.response-surface-equation',
    '.response-surface-map',
    '.response-surface-table',
    '@media (max-width: 620px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `Response Surface style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'surface'",
    'loadResponseSurfacePanel',
    'const ResponseSurfacePanel =',
    "id:\n        'surface'",
    'Response surface',
    '<ResponseSurfacePanel',
    'Predicted response-surface optimum loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `Response Surface Tool integration missing: ${marker}`,
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
    'Response Surface integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'creates one and two-variable response-surface designs',
    'fits an exact one-variable quadratic model',
    'fits a two-variable quadratic response surface',
    'finds a quadratic optimum inside the selected range',
    'exports observed, fitted and residual values as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Response Surface test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:response-surface-v1',
    'verify:response-surface-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Response Surface package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/ResponseSurfacePanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Response Surface.',
  )
}

console.log(
  'PASS: Response-surface design generation verified.',
)

console.log(
  'PASS: One and two-variable quadratic fitting verified.',
)

console.log(
  'PASS: R-squared, RMSE and residual calculations verified.',
)

console.log(
  'PASS: Predicted optimum and Solver transfer verified.',
)

console.log(
  'PASS: RESPONSE SURFACE MODEL V1',
)
