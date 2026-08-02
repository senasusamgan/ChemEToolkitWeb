import {
  readFile,
} from 'node:fs/promises'

const [
  homepageComponent,
  advancedToolsComponent,
  resultToolsComponent,
  workerSource,
  workerClient,
  workerHook,
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
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'src/components/SolverResultTools.tsx',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemSolver.worker.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemSolverWorkerClient.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/useProblemSolverWorker.ts',
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

const component = [
  homepageComponent,
  advancedToolsComponent,
  resultToolsComponent,
  workerSource,
  workerClient,
  workerHook,
].join(
  '\n',
)

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

const validationGate =
  await readFile(
    'src/components/EngineeringValidationGate.tsx',
    'utf8',
  )

const validationGateStyles =
  await readFile(
    'src/styles/engineering-validation-gate.css',
    'utf8',
  )

for (
  const contract
  of [
    'Engineering validation',
    'checkPhysicalPlausibility',
    'Quality score',
    'Validation status',
    'Input completeness',
    'Unit coverage',
    'Equation diagnostics',
    'Numerical result',
    'Physical findings',
    'Copy validation summary',
    'Engineering judgment remains required',
  ]
) {
  if (
    !validationGate.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage validation gate contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'EngineeringValidationGate',
    'calculatorTitle={',
    'missingVariables={',
    'diagnostics={',
    'assignments={',
    'quickSolution={',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage validation integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.engineering-validation-gate',
    '.engineering-validation-status',
    '.engineering-validation-checks',
    '.engineering-validation-findings',
    '.engineering-validation-footer',
  ]
) {
  if (
    !validationGateStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage validation style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides an automated engineering validation gate',
    'integrates validation with the live solver result',
    'styles validation states responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage validation test missing: ${contract}`,
    )
  }
}

const uncertaintyAnalysis =
  await readFile(
    'src/components/UncertaintyAnalysisPanel.tsx',
    'utf8',
  )

const uncertaintyStyles =
  await readFile(
    'src/styles/uncertainty-analysis-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Monte Carlo uncertainty',
    'createSeededRandom',
    'createNormalRandom',
    'parseNumericAssignments',
    'rankProblemSolvers',
    'Simulated mean',
    'Standard deviation',
    '90% interval',
    'Coefficient of variation',
    'Output distribution',
    'Export samples CSV',
    'Use P5 case',
    'Use P95 case',
  ]
) {
  if (
    !uncertaintyAnalysis.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage uncertainty contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'UncertaintyAnalysisPanel',
    'isUncertaintyAnalysisOpen',
    'Uncertainty analysis',
    'Uncertainty operating case loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage uncertainty integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.uncertainty-analysis-panel',
    '.uncertainty-analysis-controls',
    '.uncertainty-histogram',
    '.uncertainty-percentile-grid',
    '.uncertainty-analysis-actions',
  ]
) {
  if (
    !uncertaintyStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage uncertainty style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides deterministic Monte Carlo uncertainty analysis',
    'integrates uncertainty analysis with the homepage solver',
    'styles uncertainty controls and histogram responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage uncertainty test missing: ${contract}`,
    )
  }
}

const unitHarmonizer =
  await readFile(
    'src/components/UnitHarmonizerPanel.tsx',
    'utf8',
  )

const unitHarmonizerStyles =
  await readFile(
    'src/styles/unit-harmonizer-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Unit harmonizer',
    'UNIT_DEFINITIONS',
    'normalizeUnitToken',
    'findUnitDefinition',
    'harmonizeQuery',
    'Converted to SI',
    'Already SI',
    'Unit review',
    'SI-normalized problem',
    'Copy normalized problem',
    'Normalize and solve →',
  ]
) {
  if (
    !unitHarmonizer.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Unit Harmonizer contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'UnitHarmonizerPanel',
    'isUnitHarmonizerOpen',
    'Unit harmonizer',
    'SI-normalized problem loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Unit Harmonizer integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.unit-harmonizer-panel',
    '.unit-harmonizer-summary',
    '.unit-harmonizer-table',
    '.unit-harmonizer-preview',
    '.unit-harmonizer-actions',
  ]
) {
  if (
    !unitHarmonizerStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Unit Harmonizer style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides automatic engineering unit harmonization',
    'supports common chemical engineering unit families',
    'integrates Unit Harmonizer with the homepage solver',
    'styles Unit Harmonizer responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Unit Harmonizer test missing: ${contract}`,
    )
  }
}

const batchSolver =
  await readFile(
    'src/components/BatchProblemSolverPanel.tsx',
    'utf8',
  )

const batchSolverStyles =
  await readFile(
    'src/styles/batch-problem-solver-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Batch case solver',
    'MAXIMUM_CASES',
    'rankProblemSolvers',
    'One problem per line',
    'Average readiness',
    'Load sample batch',
    'Copy batch summary',
    'Export batch CSV',
    'Load in Solver',
  ]
) {
  if (
    !batchSolver.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Batch Solver contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'BatchProblemSolverPanel',
    'onLoadCase={',
    'Batch engineering case loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Batch Solver integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.batch-problem-solver-panel',
    '.batch-problem-solver-content',
    '.batch-problem-summary',
    '.batch-problem-table',
    '.batch-problem-footer',
  ]
) {
  if (
    !batchSolverStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Batch Solver style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides multi-case batch engineering solving',
    'classifies solved incomplete and unmatched batch cases',
    'integrates batch cases with the main Problem Solver',
    'styles Batch Solver responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Batch Solver test missing: ${contract}`,
    )
  }
}

const designEnvelope =
  await readFile(
    'src/components/DesignEnvelopePanel.tsx',
    'utf8',
  )

const designEnvelopeStyles =
  await readFile(
    'src/styles/design-envelope-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Design envelope explorer',
    'parseNumericAssignments',
    'replaceNumericAssignment',
    'createRange',
    'rankProblemSolvers',
    'Operating-window heat map',
    'Minimum output',
    'Maximum output',
    'Use selected case',
    'Export envelope CSV',
  ]
) {
  if (
    !designEnvelope.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Design Envelope contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'DesignEnvelopePanel',
    'baseQuery={',
    'Design-envelope operating point loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Design Envelope integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.design-envelope-panel',
    '.design-envelope-controls',
    '.design-envelope-summary',
    '.design-envelope-grid',
    '.design-envelope-actions',
  ]
) {
  if (
    !designEnvelopeStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Design Envelope style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a two-variable design envelope explorer',
    'supports 25 to 81 design-envelope operating points',
    'integrates the Design Envelope with the main Solver',
    'styles the Design Envelope responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Design Envelope test missing: ${contract}`,
    )
  }
}

const targetFinder =
  await readFile(
    'src/components/TargetOperatingPointPanel.tsx',
    'utf8',
  )

const targetFinderStyles =
  await readFile(
    'src/styles/target-operating-point-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Target operating point finder',
    'parseNumericAssignments',
    'replaceNumericAssignment',
    'createLinearRange',
    'determineTrend',
    'rankProblemSolvers',
    'Desired output',
    'Target bracketed',
    'Recommended input',
    'Top five candidates',
    'Use closest operating point →',
  ]
) {
  if (
    !targetFinder.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Target Finder contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'TargetOperatingPointPanel',
    'Target operating point loaded.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Target Finder integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.target-operating-point-panel',
    '.target-operating-point-controls',
    '.target-operating-point-summary',
    '.target-operating-point-candidates',
    '.target-operating-point-actions',
  ]
) {
  if (
    !targetFinderStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Target Finder style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides an inverse target operating-point search',
    'supports 41 to 121 target-search operating points',
    'integrates Target Finder with the main Solver',
    'styles Target Finder responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Target Finder test missing: ${contract}`,
    )
  }
}

const missingInputAssistant =
  await readFile(
    'src/components/MissingInputAssistant.tsx',
    'utf8',
  )

const missingInputAssistantStyles =
  await readFile(
    'src/styles/missing-input-assistant.css',
    'utf8',
  )

for (
  const contract
  of [
    'Complete the missing inputs',
    'VARIABLE_PROFILES',
    'findVariableProfile',
    'appendAssignments',
    'Input readiness',
    'Completed problem preview',
    'Fill example values',
    'Add inputs and solve →',
  ]
) {
  if (
    !missingInputAssistant.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Missing Input Assistant contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'MissingInputAssistant',
    'missingVariables={',
    'Missing inputs added and problem recalculated.',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Missing Input Assistant integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.missing-input-assistant',
    '.missing-input-assistant-progress',
    '.missing-input-assistant-grid',
    '.missing-input-assistant-preview',
    '.missing-input-assistant-actions',
  ]
) {
  if (
    !missingInputAssistantStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Missing Input Assistant style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a guided missing-input completion assistant',
    'supports core equation-context variables',
    'integrates missing-input completion with Quick Solve',
    'styles the missing-input assistant responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Missing Input Assistant test missing: ${contract}`,
    )
  }
}

const calculationTrace =
  await readFile(
    'src/components/CalculationTracePanel.tsx',
    'utf8',
  )

const calculationTraceStyles =
  await readFile(
    'src/styles/calculation-trace-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Step-by-step calculation trace',
    'FORMULA_PROFILES',
    'findFormulaTarget',
    'createCalculationTrace',
    'Governing equation',
    'Rearrange for the requested unknown',
    'Numerical substitution',
    'Computed result',
    'Copy calculation trace',
  ]
) {
  if (
    !calculationTrace.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Calculation Trace contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'CalculationTracePanel',
    'equationLabel={',
    'readinessPercent={',
    'assignments={',
    'quickSolution={',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Calculation Trace integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.calculation-trace-panel',
    '.calculation-trace-launcher',
    '.calculation-trace-steps',
    '.calculation-trace-input-table',
    '.calculation-trace-unit-audit',
    '.calculation-trace-footer',
  ]
) {
  if (
    !calculationTraceStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Calculation Trace style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a step-by-step calculation trace',
    'supports specialized equation rearrangements',
    'integrates Calculation Trace with Quick Solve',
    'styles Calculation Trace responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Calculation Trace test missing: ${contract}`,
    )
  }
}

const assumptionReview =
  await readFile(
    'src/components/AssumptionReviewPanel.tsx',
    'utf8',
  )

const assumptionReviewStyles =
  await readFile(
    'src/styles/assumption-review-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Engineering assumption review',
    'ASSUMPTION_PROFILES',
    'createAssumptions',
    'Ideal Gas Law',
    'Reynolds Number',
    'Darcy–Weisbach',
    'Pump Power',
    'Heat Exchanger',
    'Fickian Diffusion',
    'Confirm all assumptions',
    'Copy assumption register',
  ]
) {
  if (
    !assumptionReview.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Assumption Review contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'STORAGE_PREFIX',
    'window.localStorage.getItem',
    'window.localStorage.setItem',
    'engineeringNotes',
  ]
) {
  if (
    !assumptionReview.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Assumption Review persistence missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'AssumptionReviewPanel',
    '<AssumptionReviewPanel',
    'baseQuery={',
    'equationLabel={',
    'assignments={',
    'quickSolution={',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Assumption Review integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.assumption-review-panel',
    '.assumption-review-summary',
    '.assumption-review-list',
    '.assumption-review-notes',
    '.assumption-review-actions',
    '.assumption-review-final-state',
  ]
) {
  if (
    !assumptionReviewStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Assumption Review style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a model-specific engineering assumption review',
    'persists assumption decisions and engineering notes',
    'integrates Assumption Review with the homepage solver',
    'styles Assumption Review responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Assumption Review test missing: ${contract}`,
    )
  }
}

const resultUnitConverter =
  await readFile(
    'src/components/ResultUnitConverterPanel.tsx',
    'utf8',
  )

const resultUnitConverterStyles =
  await readFile(
    'src/styles/result-unit-converter-panel.css',
    'utf8',
  )

for (
  const contract
  of [
    'Result unit converter',
    'UNIT_FAMILIES',
    'resolveUnit',
    'formatEngineering',
    'formatScientific',
    'Converted engineering result',
    'Compatible result units',
    'Copy converted result',
  ]
) {
  if (
    !resultUnitConverter.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Result Unit Converter contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'ResultUnitConverterPanel',
    '<ResultUnitConverterPanel',
    'numericValue={',
    'sourceUnit={',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Result Unit Converter integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.result-unit-converter-panel',
    '.result-unit-converter-controls',
    '.result-unit-converter-comparison',
    '.result-unit-converter-family',
    '.result-unit-converter-options',
    '.result-unit-converter-actions',
  ]
) {
  if (
    !resultUnitConverterStyles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Result Unit Converter style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides a Quick Solve result unit converter',
    'supports core chemical engineering result units',
    'integrates the Result Unit Converter with Quick Solve',
    'styles the Result Unit Converter responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage Result Unit Converter test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'lazy(',
    '<Suspense',
    'SolverAdvancedTools',
    'SolverResultTools',
    'analysisQuery',
    'isAnalysisPending',
    'window.setTimeout',
    '350',
    'Advanced tools load on demand',
  ]
) {
  if (
    !homepageComponent.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver performance contract missing: ${contract}`,
    )
  }
}

for (
  const forbiddenImport
  of [
    "from './TargetOperatingPointPanel'",
    "from './DesignEnvelopePanel'",
    "from './BatchProblemSolverPanel'",
    "from './UncertaintyAnalysisPanel'",
    "from './SensitivitySweepPanel'",
    "from './CalculationTracePanel'",
    "from './AssumptionReviewPanel'",
    "from './ResultUnitConverterPanel'",
  ]
) {
  if (
    homepageComponent.includes(
      forbiddenImport,
    )
  ) {
    throw new Error(
      `Homepage Solver still eagerly imports: ${forbiddenImport}`,
    )
  }
}

for (
  const contract
  of [
    'Advanced solver tools',
    'Choose an engineering analysis tool',
    'activeTool ===',
    'initiallyOpen',
  ]
) {
  if (
    !advancedToolsComponent.includes(
      contract,
    )
  ) {
    throw new Error(
      `Advanced Solver workspace missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'Result review tools',
    'Complete inputs',
    'Calculation trace',
    'Assumption review',
    'Validation gate',
    'activeTool ===',
  ]
) {
  if (
    !resultToolsComponent.includes(
      contract,
    )
  ) {
    throw new Error(
      `Result Solver workspace missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-tool-loading',
    '.solver-advanced-tools',
    '.solver-advanced-tool-selector',
    '.homepage-problem-lazy-tool-launcher',
    '.solver-result-tools',
    '.solver-result-tool-tabs',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver performance style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'debounces homepage solver matching and lazy loads secondary workspaces',
    'mounts only the selected advanced and result tool',
    'supports immediate opening for lazily mounted study panels',
    'styles lazy Solver workspaces responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver performance test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'lazy(',
    '<Suspense',
    'TOOL_PREFETCHERS',
    'Loading selected engineering tool',
    'Each engineering tool loads in its own',
    './GuidedProblemBuilder',
    './UnitHarmonizerPanel',
    './SensitivitySweepPanel',
    './UncertaintyAnalysisPanel',
    './TargetOperatingPointPanel',
    './DesignEnvelopePanel',
    './BatchProblemSolverPanel',
  ]
) {
  if (
    !advancedToolsComponent.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver individual chunk contract missing: ${contract}`,
    )
  }
}

for (
  const forbiddenImport
  of [
    'import {\n  GuidedProblemBuilder,',
    'import {\n  UnitHarmonizerPanel,',
    'import {\n  SensitivitySweepPanel,',
    'import {\n  UncertaintyAnalysisPanel,',
    'import {\n  TargetOperatingPointPanel,',
    'import {\n  DesignEnvelopePanel,',
    'import {\n  BatchProblemSolverPanel,',
  ]
) {
  if (
    advancedToolsComponent.includes(
      forbiddenImport,
    )
  ) {
    throw new Error(
      `Advanced Solver tool remains eager: ${forbiddenImport}`,
    )
  }
}

for (
  const contract
  of [
    'lazy(',
    '<Suspense',
    'RESULT_TOOL_PREFETCHERS',
    'Loading selected result tool',
    'Choose a result review tool',
    './MissingInputAssistant',
    './ResultUnitConverterPanel',
    './CalculationTracePanel',
    './AssumptionReviewPanel',
    './EngineeringValidationGate',
  ]
) {
  if (
    !resultToolsComponent.includes(
      contract,
    )
  ) {
    throw new Error(
      `Result Solver individual chunk contract missing: ${contract}`,
    )
  }
}

for (
  const forbiddenImport
  of [
    'import {\n  MissingInputAssistant,',
    'import {\n  ResultUnitConverterPanel,',
    'import {\n  CalculationTracePanel,',
    'import {\n  AssumptionReviewPanel,',
    'import {\n  EngineeringValidationGate,',
  ]
) {
  if (
    resultToolsComponent.includes(
      forbiddenImport,
    )
  ) {
    throw new Error(
      `Result Solver tool remains eager: ${forbiddenImport}`,
    )
  }
}

for (
  const contract
  of [
    '.solver-tool-chunk-loading',
    '.solver-result-tools-empty',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver chunk-loading style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'splits every advanced Solver tool into an individual lazy chunk',
    'splits every result review tool into an individual lazy chunk',
    'shows a responsive loading state for separately downloaded tools',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver chunk test missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "from '../../data/calculators'",
    "from './problemSolverEngine'",
    'rankProblemSolvers',
    'performance.now',
    'workerScope.onmessage',
    'workerScope.postMessage',
  ]
) {
  if (
    !workerSource.includes(
      contract,
    )
  ) {
    throw new Error(
      `Background Solver worker contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'new Worker(',
    "'./problemSolver.worker.ts'",
    'pendingRequests',
    'inFlightRequests',
    'resultCache',
    'requestProblemSolverMatches',
    "'fallback'",
  ]
) {
  if (
    !workerClient.includes(
      contract,
    )
  ) {
    throw new Error(
      `Background Solver client contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'useProblemSolverWorker',
    'requestProblemSolverMatches',
    'isCurrent',
    'resolvedQuery',
    'isStale',
  ]
) {
  if (
    !workerHook.includes(
      contract,
    )
  ) {
    throw new Error(
      `Background Solver hook contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'useProblemSolverWorker',
    'isWorkerAnalyzing',
    'isComparisonWorkerAnalyzing',
    'Background Solver worker',
    'Model matching runs outside the main',
  ]
) {
  if (
    !homepageComponent.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage worker integration missing: ${contract}`,
    )
  }
}

for (
  const forbidden
  of [
    'import { calculators }',
    "from '../features/problem-solver/problemSolverEngine'",
    'rankProblemSolvers(',
  ]
) {
  if (
    homepageComponent.includes(
      forbidden,
    )
  ) {
    throw new Error(
      `Homepage still performs synchronous Solver ranking: ${forbidden}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-worker-status',
    'data-mode="cache"',
    'data-mode="fallback"',
    'data-mode="error"',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Background Solver status style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'runs homepage Solver ranking in a background Web Worker',
    'shares, caches and safely falls back from the Solver worker',
    'prevents stale background Solver results from rendering',
    'removes synchronous Solver engine imports from the homepage',
    'styles the background Solver execution status',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Background Solver worker test missing: ${contract}`,
    )
  }
}

console.log(
  'PASS: Standalone homepage Problem Solver verified.',
)
