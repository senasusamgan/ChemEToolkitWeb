import assert from 'node:assert/strict'
import {
  readFile,
} from 'node:fs/promises'
import test from 'node:test'

const componentPath =
  'src/components/HomepageProblemSolverPanel.tsx'

const appPath =
  'src/App.tsx'

const stylePath =
  'src/styles/homepage-problem-solver.css'

test(
  'renders a visible homepage Problem Solver',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'Solve an engineering problem',
        'Describe your problem',
        'Best calculator match',
        'Recognized model',
        'Requested unknown',
        'Quick Solve',
        'Parsed symbolic inputs',
        'Input check',
        'Solution blueprint',
        'Open calculator →',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing visible contract: ${contract}`,
      )
    }
  },
)

test(
  'uses equation-aware Problem Solver data',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'rankProblemSolvers',
        'equationIntent',
        'equationContext',
        'equationAssignments',
        'quickSolution',
        'solutionPlan',
        'missingVariableNames',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing solver contract: ${contract}`,
      )
    }
  },
)

test(
  'mounts the panel directly after the hero',
  async () => {
    const source =
      await readFile(
        appPath,
        'utf8',
      )

    assert.ok(
      source.includes(
        'HomepageProblemSolverPanel',
      ),
    )

    assert.ok(
      source.includes(
        'href="#problem-solver"',
      ),
    )

    assert.ok(
      source.includes(
        "'#problem-solver'",
      ),
    )
  },
)

test(
  'includes responsive standalone styles',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.homepage-problem-solver',
        '.homepage-problem-solver-layout',
        '.homepage-problem-solver-editor',
        '.homepage-problem-solver-result',
        '.homepage-problem-readiness',
        '.homepage-problem-input-chips',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing style contract: ${contract}`,
      )
    }
  },
)

test(
  'provides copy download and clear result actions',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'function buildSolverReport()',
        'async function copySolverReport()',
        'function downloadSolverReport()',
        'function clearProblem()',
        'navigator.clipboard',
        'new Blob',
        'Copy report',
        'Download .txt',
        'Clear problem',
        'Engineering Solution Report',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing result action: ${contract}`,
      )
    }
  },
)

test(
  'styles report actions and feedback responsively',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.homepage-problem-editor-actions',
        '.homepage-problem-result-actions',
        'button.is-secondary',
        'button.is-primary',
        '.homepage-problem-action-feedback',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing result action style: ${contract}`,
      )
    }
  },
)

test(
  'saves and restores recent engineering solutions',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing saved-solution contract: ${contract}`,
      )
    }
  },
)

test(
  'styles saved solution history responsively',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.homepage-problem-history',
        '.homepage-problem-history-header',
        '.homepage-problem-history-grid',
        '.homepage-problem-history-result',
        '.homepage-problem-history-actions',
        '.homepage-problem-history-empty',
        '@media (max-width: 1000px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing saved-history style: ${contract}`,
      )
    }
  },
)

test(
  'creates shareable Problem Solver links',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

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
        'navigator.clipboard',
        'URLSearchParams',
        'window.history.replaceState',
        'Share case',
        'Shared problem loaded',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing sharing contract: ${contract}`,
      )
    }
  },
)

test(
  'styles shared problem feedback',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.homepage-problem-share-notice',
        'button:first-child::before',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing sharing style: ${contract}`,
      )
    }
  },
)

test(
  'compares two engineering scenarios',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing comparison contract: ${contract}`,
      )
    }
  },
)

test(
  'styles responsive scenario comparison',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.homepage-problem-comparison',
        '.homepage-problem-comparison-grid',
        '.homepage-problem-scenario-card',
        '.homepage-problem-scenario-summary',
        '.homepage-problem-comparison-result',
        '.homepage-problem-comparison-metrics',
        '@media (max-width: 850px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing comparison style: ${contract}`,
      )
    }
  },
)

test(
  'provides a guided engineering input builder',
  async () => {
    const source =
      await readFile(
        'src/components/GuidedProblemBuilder.tsx',
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
        'Solve for',
        'Input completion',
        'Generated problem',
        'Fill sample values',
        'Use in solver →',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing guided builder contract: ${contract}`,
      )
    }
  },
)

test(
  'integrates guided inputs with the homepage solver',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'GuidedProblemBuilder',
        'isGuidedBuilderOpen',
        'Guided input',
        'Guided engineering problem loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing guided integration: ${contract}`,
      )
    }
  },
)

test(
  'styles the guided builder responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/guided-problem-builder.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.guided-problem-builder',
        '.guided-problem-builder-layout',
        '.guided-problem-models',
        '.guided-problem-variable-grid',
        '.guided-problem-progress',
        '.guided-problem-preview',
        '.guided-problem-actions',
        '@media (max-width: 850px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing guided builder style: ${contract}`,
      )
    }
  },
)

test(
  'provides a parametric sensitivity sweep',
  async () => {
    const source =
      await readFile(
        'src/components/SensitivitySweepPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing sensitivity contract: ${contract}`,
      )
    }
  },
)

test(
  'integrates sensitivity analysis with the homepage solver',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'SensitivitySweepPanel',
        'isSensitivitySweepOpen',
        'Sensitivity sweep',
        'Sensitivity operating point loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing sensitivity integration: ${contract}`,
      )
    }
  },
)

test(
  'styles the sensitivity chart and table responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/sensitivity-sweep-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.sensitivity-sweep-panel',
        '.sensitivity-sweep-controls',
        '.sensitivity-sweep-summary',
        '.sensitivity-sweep-chart',
        '.sensitivity-line',
        '.sensitivity-point',
        '.sensitivity-sweep-table',
        '.sensitivity-sweep-actions',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing sensitivity style: ${contract}`,
      )
    }
  },
)

test(
  'provides an automated engineering validation gate',
  async () => {
    const source =
      await readFile(
        'src/components/EngineeringValidationGate.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing validation contract: ${contract}`,
      )
    }
  },
)

test(
  'integrates validation with the live solver result',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing validation integration: ${contract}`,
      )
    }
  },
)

test(
  'styles validation states responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/engineering-validation-gate.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.engineering-validation-gate',
        'data-status="review"',
        'data-status="block"',
        '.engineering-validation-status',
        '.engineering-validation-checks',
        '.engineering-validation-findings',
        '.engineering-validation-footer',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing validation style: ${contract}`,
      )
    }
  },
)

test(
  'provides deterministic Monte Carlo uncertainty analysis',
  async () => {
    const source =
      await readFile(
        'src/components/UncertaintyAnalysisPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing uncertainty contract: ${contract}`,
      )
    }
  },
)

test(
  'integrates uncertainty analysis with the homepage solver',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'UncertaintyAnalysisPanel',
        'isUncertaintyAnalysisOpen',
        'Uncertainty analysis',
        'Uncertainty operating case loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing uncertainty integration: ${contract}`,
      )
    }
  },
)

test(
  'styles uncertainty controls and histogram responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/uncertainty-analysis-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.uncertainty-analysis-panel',
        '.uncertainty-analysis-controls',
        '.uncertainty-analysis-summary',
        '.uncertainty-histogram',
        '.uncertainty-bar',
        '.uncertainty-percentile-grid',
        '.uncertainty-analysis-actions',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing uncertainty style: ${contract}`,
      )
    }
  },
)

test(
  'provides automatic engineering unit harmonization',
  async () => {
    const source =
      await readFile(
        'src/components/UnitHarmonizerPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Unit Harmonizer contract: ${contract}`,
      )
    }
  },
)

test(
  'supports common chemical engineering unit families',
  async () => {
    const source =
      await readFile(
        'src/components/UnitHarmonizerPanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        "'Pressure'",
        "'Temperature'",
        "'Volumetric flow'",
        "'Mass flow'",
        "'Molar flow'",
        "'Density'",
        "'Dynamic viscosity'",
        "'Energy'",
        "'Power'",
        "'Force'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing unit family: ${contract}`,
      )
    }
  },
)

test(
  'integrates Unit Harmonizer with the homepage solver',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'UnitHarmonizerPanel',
        'isUnitHarmonizerOpen',
        'Unit harmonizer',
        'SI-normalized problem loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Unit Harmonizer integration: ${contract}`,
      )
    }
  },
)

test(
  'styles Unit Harmonizer responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/unit-harmonizer-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.unit-harmonizer-panel',
        '.unit-harmonizer-summary',
        '.unit-harmonizer-table',
        '.unit-harmonizer-preview',
        '.unit-harmonizer-warning',
        '.unit-harmonizer-reference',
        '.unit-harmonizer-actions',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Unit Harmonizer style: ${contract}`,
      )
    }
  },
)
