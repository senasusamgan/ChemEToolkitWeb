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
