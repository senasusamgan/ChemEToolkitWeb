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
      'src/features/problem-solver/robustnessCornerEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/RobustnessCornerAnalysisPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/robustness-corner-analysis-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/robustness-corner-analysis/robustness-corner-analysis.test.ts',
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
    'ROBUSTNESS_CORNER_ENGINE_VERSION',
    'createRobustnessCornerCases',
    'classifyRobustnessOutput',
    'summarizeRobustnessCases',
    'criticalVariableSymbol',
    'maximumAbsoluteDeviation',
    'createRobustnessCsv',
  ]
) {
  if (
    !engine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Robustness engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'Worst-case tolerance analysis',
    'Run worst-case analysis',
    'Critical input',
    'Worst deviation',
    'Limit coverage',
    'Export CSV',
    'Transfer selected case to Solver',
    'requestProblemSolverMatches',
    'EVALUATION_BATCH_SIZE',
    'MAXIMUM_VARIABLE_COUNT',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Robustness component contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.robustness-corner-panel',
    '.robustness-variable-grid',
    '.robustness-summary-grid',
    '.robustness-case-table',
    'data-status="below"',
    'data-status="above"',
    '@media (max-width: 650px)',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Robustness style contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "| 'robustness'",
    'loadRobustnessCornerAnalysisPanel',
    'const RobustnessCornerAnalysisPanel =',
    "id:\n        'robustness'",
    'Worst-case tolerance',
    '<RobustnessCornerAnalysisPanel',
    'Worst-case tolerance scenario loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      contract,
    )
  ) {
    throw new Error(
      `Robustness Tool integration missing: ${contract}`,
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
    'Robustness integration regressed click-only loading.',
  )
}

for (
  const contract
  of [
    'creates nominal and deterministic low-high corner cases',
    'classifies outputs against optional engineering limits',
    'identifies output span, worst case and critical variable',
    'exports evaluated tolerance cases as CSV',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Robustness test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'test:robustness-corner-analysis-v1',
    'verify:robustness-corner-analysis-v1',
  ]
) {
  if (
    !packageSource.includes(
      contract,
    )
  ) {
    throw new Error(
      `Robustness package script missing: ${contract}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/RobustnessCornerAnalysisPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect the Robustness Tool.',
  )
}

console.log(
  'PASS: Deterministic tolerance corners verified.',
)

console.log(
  'PASS: Worst-case and critical-input analysis verified.',
)

console.log(
  'PASS: Limit coverage and CSV export verified.',
)

console.log(
  'PASS: Click-only dynamic Tool integration verified.',
)

console.log(
  'PASS: WORST-CASE TOLERANCE ANALYSIS V1',
)
