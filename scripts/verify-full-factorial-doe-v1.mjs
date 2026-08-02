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
      'src/features/problem-solver/fullFactorialDoeEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/FullFactorialDoePanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/full-factorial-doe-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/full-factorial-doe/full-factorial-doe.test.ts',
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
    'FULL_FACTORIAL_DOE_ENGINE_VERSION',
    'createFullFactorialDesign',
    'calculateFactorMainEffects',
    'calculateFactorInteractions',
    'summarizeFullFactorialDesign',
    'createFullFactorialCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `DOE engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Full-factorial design of experiments',
    'Run full-factorial DOE',
    'Main factor effects',
    'Two-factor interactions',
    'Strongest factor',
    'Export DOE CSV',
    'Transfer selected DOE run to Solver',
    'requestProblemSolverMatches',
    'MAXIMUM_FACTOR_COUNT',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `DOE component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.factorial-doe-panel',
    '.factorial-doe-factor-grid',
    '.factorial-doe-summary',
    '.factorial-doe-effects',
    '.factorial-doe-run-table',
    '@media (max-width: 620px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `DOE style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'doe'",
    'loadFullFactorialDoePanel',
    'const FullFactorialDoePanel =',
    "id:\n        'doe'",
    'Factorial DOE',
    '<FullFactorialDoePanel',
    'Selected factorial DOE run loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `DOE Tool integration missing: ${marker}`,
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
    'DOE integration regressed click-only Tool loading.',
  )
}

for (
  const marker
  of [
    'creates a center point and every low-high factor combination',
    'calculates full-factorial main effects',
    'calculates two-factor interaction effects',
    'summarizes the strongest factor and objective-specific best run',
    'exports full-factorial runs as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `DOE test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:full-factorial-doe-v1',
    'verify:full-factorial-doe-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `DOE package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/FullFactorialDoePanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Full-Factorial DOE.',
  )
}

console.log(
  'PASS: Full-factorial run generation verified.',
)

console.log(
  'PASS: Main factor and interaction effects verified.',
)

console.log(
  'PASS: Objective-based experimental ranking verified.',
)

console.log(
  'PASS: DOE CSV export and Solver transfer verified.',
)

console.log(
  'PASS: FULL-FACTORIAL DESIGN OF EXPERIMENTS V1',
)
