import {
  readFile,
} from 'node:fs/promises'

const [
  component,
  app,
  styles,
  tests,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/components/HomepageProblemSolverPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/App.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/homepage-problem-solver.css',
      'utf8',
    ),
    readFile(
      'tests/homepage-problem-solver-ui/homepage-problem-solver-ui.test.mjs',
      'utf8',
    ),
    readFile(
      'package.json',
      'utf8',
    ),
  ])

for (
  const contract
  of [
    'HomepageProblemSolverPanel',
    'Solve an engineering problem',
    'rankProblemSolvers',
    'Best calculator match',
    'Requested unknown',
    'Quick Solve',
    'Parsed symbolic inputs',
    'Solution blueprint',
    'Open calculator →',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver component missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'HomepageProblemSolverPanel',
    'href="#problem-solver"',
    "'#problem-solver'",
  ]
) {
  if (
    !app.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-solver',
    '.homepage-problem-solver-layout',
    '.homepage-problem-solver-result',
    '.homepage-problem-input-chips',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'renders a visible homepage Problem Solver',
    'uses equation-aware Problem Solver data',
    'mounts the panel directly after the hero',
    'includes responsive standalone styles',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver test missing: ${contract}`,
    )
  }
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  packageJson.scripts[
    'test:homepage-problem-solver-ui'
  ] !==
  'node --test tests/homepage-problem-solver-ui/*.test.mjs'
) {
  throw new Error(
    'Homepage Problem Solver test command is missing.',
  )
}

if (
  packageJson.scripts[
    'verify:homepage-problem-solver-ui'
  ] !==
  'npm run test:homepage-problem-solver-ui && node scripts/verify-homepage-problem-solver-ui.mjs'
) {
  throw new Error(
    'Homepage Problem Solver verifier command is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'npm run verify:homepage-problem-solver-ui',
  )
) {
  throw new Error(
    'Homepage Problem Solver is missing from release verification.',
  )
}

for (
  const contract
  of [
    'function buildSolverReport()',
    'async function copySolverReport()',
    'function downloadSolverReport()',
    'function clearProblem()',
    'Copy report',
    'Download .txt',
    'Clear problem',
    'homepage-problem-result-actions',
    'homepage-problem-action-feedback',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver report action missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-editor-actions',
    '.homepage-problem-result-actions',
    '.homepage-problem-action-feedback',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver report style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides copy download and clear result actions',
    'styles report actions and feedback responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver report test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'SAVED_SOLVER_CASES_KEY',
    'interface SavedSolverCase',
    'readSavedSolverCases',
    'window.localStorage',
    'function saveCurrentSolution()',
    'function loadSavedCase(',
    'function removeSavedCase(',
    'function clearSavedCases()',
    'Save solution',
    'Recent solutions',
    'Load case',
    'Clear saved',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage saved-solution contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-history',
    '.homepage-problem-history-header',
    '.homepage-problem-history-grid',
    '.homepage-problem-history-actions',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage saved-solution style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'saves and restores recent engineering solutions',
    'styles saved solution history responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage saved-solution test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'SHARED_PROBLEM_QUERY_PARAM',
    'SOLVER_DRAFT_KEY',
    'function readSharedProblem()',
    'function readInitialProblem()',
    'function buildProblemShareUrl(',
    'async function shareCurrentProblem()',
    'navigator.share',
    'URLSearchParams',
    'window.history.replaceState',
    'Share case',
    'Shared problem loaded',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage shareable-case contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-share-notice',
    'button:first-child::before',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage shareable-case style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'creates shareable Problem Solver links',
    'styles shared problem feedback',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage shareable-case test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'formatComparisonValue',
    'isComparisonOpen',
    'comparisonQuery',
    'comparisonMatches',
    'comparisonBestMatch',
    'scenarioDifference',
    'function openScenarioComparison()',
    'function closeScenarioComparison()',
    'function useComparisonAsMain()',
    'Compare scenarios',
    'Scenario A',
    'Scenario B',
    'Absolute change',
    'Percentage change',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Scenario Comparison contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-comparison',
    '.homepage-problem-comparison-grid',
    '.homepage-problem-scenario-card',
    '.homepage-problem-comparison-metrics',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Scenario Comparison style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'compares two engineering scenarios',
    'styles responsive scenario comparison',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Scenario Comparison test missing: ${contract}`,
    )
  }
}

const guidedBuilder =
  await readFile(
    'src/components/GuidedProblemBuilder.tsx',
    'utf8',
  )

const guidedBuilderStyles =
  await readFile(
    'src/styles/guided-problem-builder.css',
    'utf8',
  )

for (
  const contract
  of [
    'Guided input builder',
    'BUILDER_PRESETS',
    'Ideal gas law',
    'Reynolds number',
    'Flow continuity',
    'Darcy–Weisbach pressure drop',
    'Input completion',
    'Generated problem',
    'Fill sample values',
    'Use in solver →',
  ]
) {
  if (
    !guidedBuilder.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage guided builder contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'GuidedProblemBuilder',
    'isGuidedBuilderOpen',
    'Guided input',
    'Guided engineering problem loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage guided integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.guided-problem-builder',
    '.guided-problem-builder-layout',
    '.guided-problem-variable-grid',
    '.guided-problem-actions',
  ]
) {
  if (
    !guidedBuilderStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage guided builder style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a guided engineering input builder',
    'integrates guided inputs with the homepage solver',
    'styles the guided builder responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage guided builder test missing: ${contract}`,
    )
  }
}

const sensitivitySweep =
  await readFile(
    'src/components/SensitivitySweepPanel.tsx',
    'utf8',
  )

const sensitivitySweepStyles =
  await readFile(
    'src/styles/sensitivity-sweep-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Sensitivity sweep',
    'parseNumericAssignments',
    'replaceNumericAssignment',
    'rankProblemSolvers',
    'Response curve',
    'Solvable points',
    'Minimum result',
    'Maximum result',
    'Export CSV',
    'Use minimum case',
    'Use maximum case',
  ]
) {
  if (
    !sensitivitySweep.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage sensitivity sweep contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'SensitivitySweepPanel',
    'isSensitivitySweepOpen',
    'Sensitivity sweep',
    'Sensitivity operating point loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage sensitivity integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.sensitivity-sweep-panel',
    '.sensitivity-sweep-controls',
    '.sensitivity-sweep-chart',
    '.sensitivity-sweep-table',
    '.sensitivity-sweep-actions',
  ]
) {
  if (
    !sensitivitySweepStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage sensitivity style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a parametric sensitivity sweep',
    'integrates sensitivity analysis with the homepage solver',
    'styles the sensitivity chart and table responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage sensitivity test missing: ${contract}`,
    )
  }
}

console.log(
  'PASS: Standalone homepage Problem Solver verified.',
)
