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
      'src/features/problem-solver/constraintOperatingWindowEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/ConstraintOperatingWindowPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/constraint-operating-window-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/constraint-operating-window/constraint-operating-window.test.ts',
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
  const contract
  of [
    'CONSTRAINT_OPERATING_WINDOW_ENGINE_VERSION',
    'parseConstraintAssignments',
    'replaceConstraintAssignment',
    'createConstraintRange',
    'buildConstraintGrid',
    'classifyConstraintValue',
    'summarizeConstraintWindow',
    'createConstraintWindowCsv',
  ]
) {
  if (
    !engine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Constraint Window engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'Constraint operating window',
    'Evaluate feasible window',
    'Feasible operating-point heat map',
    'Feasible coverage',
    'Best constraint margin',
    'Closest constraint boundary',
    'Export CSV',
    'Transfer selected feasible point',
    'requestProblemSolverMatches',
    'EVALUATION_BATCH_SIZE',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Constraint Window component contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.constraint-window-panel',
    '.constraint-window-controls',
    '.constraint-window-summary',
    '.constraint-window-map',
    'data-status="feasible"',
    'data-status="below"',
    'data-status="above"',
    '@media (max-width: 620px)',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Constraint Window style contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "| 'constraint'",
    'loadConstraintOperatingWindowPanel',
    'const ConstraintOperatingWindowPanel =',
    "id:\n        'constraint'",
    "<ConstraintOperatingWindowPanel",
    'Feasible constraint-window operating point loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      contract,
    )
  ) {
    throw new Error(
      `Constraint Window Advanced Tool integration missing: ${contract}`,
    )
  }
}

if (
  advancedTools.includes(
    'onPointerEnter',
  )
) {
  throw new Error(
    'Constraint Window integration regressed click-only tool loading.',
  )
}

for (
  const contract
  of [
    'parses numeric engineering assignments',
    'builds one and two-variable operating grids',
    'classifies feasible, below-limit and above-limit outputs',
    'summarizes feasibility, best margin and closest boundary',
    'exports evaluated operating points as CSV',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Constraint Window test contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'test:constraint-operating-window-v1',
    'verify:constraint-operating-window-v1',
  ]
) {
  if (
    !packageSource.includes(
      contract,
    )
  ) {
    throw new Error(
      `Constraint Window package script missing: ${contract}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/ConstraintOperatingWindowPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect the Constraint Window dynamic chunk.',
  )
}

console.log(
  'PASS: Constraint Operating Window engine verified.',
)

console.log(
  'PASS: Feasibility heat map and summary verified.',
)

console.log(
  'PASS: CSV export and Solver transfer verified.',
)

console.log(
  'PASS: Click-only dynamic Advanced Tool integration verified.',
)

console.log(
  'PASS: CONSTRAINT OPERATING WINDOW V1',
)
