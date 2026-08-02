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

const advancedToolsPath =
  'src/components/SolverAdvancedTools.tsx'

const resultToolsPath =
  'src/components/SolverResultTools.tsx'


const workerPath =
  'src/features/problem-solver/problemSolver.worker.ts'

const workerClientPath =
  'src/features/problem-solver/problemSolverWorkerClient.ts'

const workerHookPath =
  'src/features/problem-solver/useProblemSolverWorker.ts'

async function readSolverIntegrationSource() {
  const sources =
    await Promise.all([
      readFile(
        componentPath,
        'utf8',
      ),
      readFile(
        advancedToolsPath,
        'utf8',
      ),
      readFile(
        resultToolsPath,
        'utf8',
      ),
      readFile(
        workerPath,
        'utf8',
      ),
      readFile(
        workerClientPath,
        'utf8',
      ),
      readFile(
        workerHookPath,
        'utf8',
      ),
    ])

  return sources.join(
    '\n',
  )
}

test(
  'renders a visible homepage Problem Solver',
  async () => {
    const source =
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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
      await readSolverIntegrationSource()

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

test(
  'provides multi-case batch engineering solving',
  async () => {
    const source =
      await readFile(
        'src/components/BatchProblemSolverPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Batch Solver contract: ${contract}`,
      )
    }
  },
)

test(
  'classifies solved incomplete and unmatched batch cases',
  async () => {
    const source =
      await readFile(
        'src/components/BatchProblemSolverPanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        "'solved'",
        "'needs-inputs'",
        "'unmatched'",
        'Inputs required',
        'No calculator match',
        'missingVariableNames',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Batch Solver status: ${contract}`,
      )
    }
  },
)

test(
  'integrates batch cases with the main Problem Solver',
  async () => {
    const source =
      await readSolverIntegrationSource()

    for (
      const contract
      of [
        'BatchProblemSolverPanel',
        'onLoadCase={',
        'Batch engineering case loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Batch Solver integration: ${contract}`,
      )
    }
  },
)

test(
  'styles Batch Solver responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/batch-problem-solver-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.batch-problem-solver-panel',
        '.batch-problem-solver-content',
        '.batch-problem-summary',
        '.batch-problem-filter-bar',
        '.batch-problem-table',
        '.batch-problem-readiness',
        '.batch-problem-footer',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Batch Solver style: ${contract}`,
      )
    }
  },
)

test(
  'provides a two-variable design envelope explorer',
  async () => {
    const source =
      await readFile(
        'src/components/DesignEnvelopePanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Design Envelope contract: ${contract}`,
      )
    }
  },
)

test(
  'supports 25 to 81 design-envelope operating points',
  async () => {
    const source =
      await readFile(
        'src/components/DesignEnvelopePanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        '<option value="5">',
        '<option value="7">',
        '<option value="9">',
        '5 × 5',
        '7 × 7',
        '9 × 9',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Design Envelope resolution: ${contract}`,
      )
    }
  },
)

test(
  'integrates the Design Envelope with the main Solver',
  async () => {
    const source =
      await readSolverIntegrationSource()

    for (
      const contract
      of [
        'DesignEnvelopePanel',
        'baseQuery={',
        'Design-envelope operating point loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Design Envelope integration: ${contract}`,
      )
    }
  },
)

test(
  'styles the Design Envelope responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/design-envelope-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.design-envelope-panel',
        '.design-envelope-controls',
        '.design-envelope-summary',
        '.design-envelope-grid',
        '.design-envelope-point-details',
        '.design-envelope-actions',
        '@media (max-width: 750px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Design Envelope style: ${contract}`,
      )
    }
  },
)

test(
  'provides an inverse target operating-point search',
  async () => {
    const source =
      await readFile(
        'src/components/TargetOperatingPointPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Target Finder contract: ${contract}`,
      )
    }
  },
)

test(
  'supports 41 to 121 target-search operating points',
  async () => {
    const source =
      await readFile(
        'src/components/TargetOperatingPointPanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        '<option value="41">',
        '<option value="81">',
        '<option value="121">',
        'Target nominal +10%',
        'Reset range ±50%',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Target Finder resolution: ${contract}`,
      )
    }
  },
)

test(
  'integrates Target Finder with the main Solver',
  async () => {
    const source =
      await readSolverIntegrationSource()

    for (
      const contract
      of [
        'TargetOperatingPointPanel',
        'Target operating point loaded.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Target Finder integration: ${contract}`,
      )
    }
  },
)

test(
  'styles Target Finder responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/target-operating-point-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.target-operating-point-panel',
        '.target-operating-point-controls',
        '.target-operating-point-summary',
        '.target-operating-point-best',
        '.target-operating-point-candidates',
        '.target-operating-point-actions',
        '@media (max-width: 750px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Target Finder style: ${contract}`,
      )
    }
  },
)

test(
  'provides a guided missing-input completion assistant',
  async () => {
    const source =
      await readFile(
        'src/components/MissingInputAssistant.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing input assistant contract: ${contract}`,
      )
    }
  },
)

test(
  'supports core equation-context variables',
  async () => {
    const source =
      await readFile(
        'src/components/MissingInputAssistant.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        "'absolute pressure'",
        "'gas volume'",
        "'dynamic viscosity'",
        "'pressure difference'",
        "'pump efficiency'",
        "'overall heat-transfer coefficient'",
        "'log-mean temperature difference'",
        "'molar flux'",
        "'concentration difference'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing variable profile: ${contract}`,
      )
    }
  },
)

test(
  'integrates missing-input completion with Quick Solve',
  async () => {
    const source =
      await readSolverIntegrationSource()

    for (
      const contract
      of [
        'MissingInputAssistant',
        'missingVariables={',
        'Missing inputs added and problem recalculated.',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing assistant integration: ${contract}`,
      )
    }
  },
)

test(
  'styles the missing-input assistant responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/missing-input-assistant.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.missing-input-assistant',
        '.missing-input-assistant-progress',
        '.missing-input-assistant-grid',
        '.missing-input-assistant-field-row',
        '.missing-input-assistant-preview',
        '.missing-input-assistant-actions',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing assistant style: ${contract}`,
      )
    }
  },
)

test(
  'provides a step-by-step calculation trace',
  async () => {
    const source =
      await readFile(
        'src/components/CalculationTracePanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Calculation Trace contract: ${contract}`,
      )
    }
  },
)

test(
  'supports specialized equation rearrangements',
  async () => {
    const source =
      await readFile(
        'src/components/CalculationTracePanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        "'ideal gas'",
        "'reynolds'",
        "'continuity'",
        "'darcy'",
        "'pump power'",
        "'heat exchanger'",
        "'fick'",
        'P·V = n·R·T',
        'Re=(ρ·v·D)/μ',
        'Q=U·A·ΔTlm',
        'J=−D·ΔC/L',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing formula profile: ${contract}`,
      )
    }
  },
)

test(
  'integrates Calculation Trace with Quick Solve',
  async () => {
    const source =
      await readSolverIntegrationSource()

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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Calculation Trace integration: ${contract}`,
      )
    }
  },
)

test(
  'styles Calculation Trace responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/calculation-trace-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.calculation-trace-panel',
        '.calculation-trace-launcher',
        '.calculation-trace-steps',
        '.calculation-trace-input-table',
        '.calculation-trace-unit-audit',
        '.calculation-trace-footer',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Calculation Trace style: ${contract}`,
      )
    }
  },
)

test(
  'provides a model-specific engineering assumption review',
  async () => {
    const source =
      await readFile(
        'src/components/AssumptionReviewPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Assumption Review contract: ${contract}`,
      )
    }
  },
)

test(
  'persists assumption decisions and engineering notes',
  async () => {
    const source =
      await readFile(
        'src/components/AssumptionReviewPanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        'STORAGE_PREFIX',
        'window.localStorage.getItem',
        'window.localStorage.setItem',
        'window.localStorage.removeItem',
        'engineeringNotes',
        "'confirmed'",
        "'review'",
        "'not-applicable'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing assumption persistence contract: ${contract}`,
      )
    }
  },
)

test(
  'integrates Assumption Review with the homepage solver',
  async () => {
    const source =
      await readSolverIntegrationSource()

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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Assumption Review integration: ${contract}`,
      )
    }
  },
)

test(
  'styles Assumption Review responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/assumption-review-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.assumption-review-panel',
        '.assumption-review-summary',
        '.assumption-review-list',
        '.assumption-review-evidence-snapshot',
        '.assumption-review-notes',
        '.assumption-review-actions',
        '.assumption-review-final-state',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Assumption Review style: ${contract}`,
      )
    }
  },
)

test(
  'provides a Quick Solve result unit converter',
  async () => {
    const source =
      await readFile(
        'src/components/ResultUnitConverterPanel.tsx',
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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Result Unit Converter contract: ${contract}`,
      )
    }
  },
)

test(
  'supports core chemical engineering result units',
  async () => {
    const source =
      await readFile(
        'src/components/ResultUnitConverterPanel.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        "'pressure'",
        "'temperature'",
        "'volumetric-flow'",
        "'mass-flow'",
        "'molar-flow'",
        "'energy'",
        "'power'",
        "'density'",
        "'dynamic-viscosity'",
        "'heat-transfer-coefficient'",
        "'heat-flux'",
        "'molar-flux'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing result-unit family: ${contract}`,
      )
    }
  },
)

test(
  'integrates the Result Unit Converter with Quick Solve',
  async () => {
    const source =
      await readSolverIntegrationSource()

    for (
      const contract
      of [
        'ResultUnitConverterPanel',
        '<ResultUnitConverterPanel',
        'numericValue={',
        'sourceUnit={',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Result Unit Converter integration: ${contract}`,
      )
    }
  },
)

test(
  'styles the Result Unit Converter responsively',
  async () => {
    const source =
      await readFile(
        'src/styles/result-unit-converter-panel.css',
        'utf8',
      )

    for (
      const contract
      of [
        '.result-unit-converter-panel',
        '.result-unit-converter-controls',
        '.result-unit-converter-comparison',
        '.result-unit-converter-family',
        '.result-unit-converter-options',
        '.result-unit-converter-actions',
        '@media (max-width: 700px)',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Result Unit Converter style: ${contract}`,
      )
    }
  },
)

test(
  'debounces homepage solver matching and lazy loads secondary workspaces',
  async () => {
    const source =
      await readFile(
        'src/components/HomepageProblemSolverPanel.tsx',
        'utf8',
      )

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
        'Loading result review tools',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing performance contract: ${contract}`,
      )
    }

    for (
      const eagerImport
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
      assert.equal(
        source.includes(
          eagerImport,
        ),
        false,
        `Homepage still eagerly imports: ${eagerImport}`,
      )
    }
  },
)

test(
  'mounts only the selected advanced and result tool',
  async () => {
    const [
      advancedSource,
      resultSource,
    ] =
      await Promise.all([
        readFile(
          'src/components/SolverAdvancedTools.tsx',
          'utf8',
        ),
        readFile(
          'src/components/SolverResultTools.tsx',
          'utf8',
        ),
      ])

    for (
      const contract
      of [
        'Advanced solver tools',
        'activeTool ===',
        'Choose an engineering analysis tool',
        'initiallyOpen',
        'Close advanced tools',
      ]
    ) {
      assert.ok(
        advancedSource.includes(
          contract,
        ),
        `Missing advanced workspace contract: ${contract}`,
      )
    }

    for (
      const contract
      of [
        'Result review tools',
        'activeTool ===',
        'Complete inputs',
        'Calculation trace',
        'Assumption review',
        'Validation gate',
      ]
    ) {
      assert.ok(
        resultSource.includes(
          contract,
        ),
        `Missing result workspace contract: ${contract}`,
      )
    }
  },
)

test(
  'supports immediate opening for lazily mounted study panels',
  async () => {
    for (
      const componentPath
      of [
        'src/components/TargetOperatingPointPanel.tsx',
        'src/components/DesignEnvelopePanel.tsx',
        'src/components/BatchProblemSolverPanel.tsx',
      ]
    ) {
      const source =
        await readFile(
          componentPath,
          'utf8',
        )

      assert.ok(
        source.includes(
          'initiallyOpen?: boolean',
        ),
        `Missing initiallyOpen prop: ${componentPath}`,
      )

      assert.ok(
        source.includes(
          'useState(initiallyOpen)',
        ),
        `Missing controlled initial state: ${componentPath}`,
      )
    }
  },
)

test(
  'styles lazy Solver workspaces responsively',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

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
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing performance style: ${contract}`,
      )
    }
  },
)

test(
  'splits every advanced Solver tool into an individual lazy chunk',
  async () => {
    const source =
      await readFile(
        'src/components/SolverAdvancedTools.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        'lazy(',
        '<Suspense',
        'TOOL_PREFETCHERS',
        'Loading selected engineering tool',
        'Each engineering tool loads in its own',
        "import(\n      './GuidedProblemBuilder'",
        "import(\n      './UnitHarmonizerPanel'",
        "import(\n      './SensitivitySweepPanel'",
        "import(\n      './UncertaintyAnalysisPanel'",
        "import(\n      './TargetOperatingPointPanel'",
        "import(\n      './DesignEnvelopePanel'",
        "import(\n      './BatchProblemSolverPanel'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing advanced chunk contract: ${contract}`,
      )
    }

    for (
      const eagerImport
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
      assert.equal(
        source.includes(
          eagerImport,
        ),
        false,
        `Advanced tool is still eagerly imported: ${eagerImport}`,
      )
    }
  },
)

test(
  'splits every result review tool into an individual lazy chunk',
  async () => {
    const source =
      await readFile(
        'src/components/SolverResultTools.tsx',
        'utf8',
      )

    for (
      const contract
      of [
        'lazy(',
        '<Suspense',
        'RESULT_TOOL_PREFETCHERS',
        'Loading selected result tool',
        'Choose a result review tool',
        "import(\n      './MissingInputAssistant'",
        "import(\n      './ResultUnitConverterPanel'",
        "import(\n      './CalculationTracePanel'",
        "import(\n      './AssumptionReviewPanel'",
        "import(\n      './EngineeringValidationGate'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing result chunk contract: ${contract}`,
      )
    }

    for (
      const eagerImport
      of [
        'import {\n  MissingInputAssistant,',
        'import {\n  ResultUnitConverterPanel,',
        'import {\n  CalculationTracePanel,',
        'import {\n  AssumptionReviewPanel,',
        'import {\n  EngineeringValidationGate,',
      ]
    ) {
      assert.equal(
        source.includes(
          eagerImport,
        ),
        false,
        `Result tool is still eagerly imported: ${eagerImport}`,
      )
    }
  },
)

test(
  'shows a responsive loading state for separately downloaded tools',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.solver-tool-chunk-loading',
        '.solver-result-tools-empty',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing tool-chunk loading style: ${contract}`,
      )
    }
  },
)

test(
  'runs homepage Solver ranking in a background Web Worker',
  async () => {
    const source =
      await readFile(
        workerPath,
        'utf8',
      )

    for (
      const contract
      of [
        "from '../../data/calculators'",
        "from './problemSolverEngine'",
        'rankProblemSolvers',
        'performance.now',
        'workerScope.onmessage',
        'workerScope.postMessage',
        'requestId',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing Solver worker contract: ${contract}`,
      )
    }
  },
)

test(
  'shares, caches and safely falls back from the Solver worker',
  async () => {
    const source =
      await readFile(
        workerClientPath,
        'utf8',
      )

    for (
      const contract
      of [
        "new Worker(",
        "new URL(",
        "'./problemSolver.worker.ts'",
        'pendingRequests',
        'inFlightRequests',
        'resultCache',
        'RESULT_CACHE_LIMIT',
        'WORKER_TIMEOUT_MS',
        'requestProblemSolverMatches',
        "executionMode:\n      'fallback'",
        "import(\n        '../../data/calculators'",
        "import(\n        './problemSolverEngine'",
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing worker-client contract: ${contract}`,
      )
    }
  },
)

test(
  'prevents stale background Solver results from rendering',
  async () => {
    const source =
      await readFile(
        workerHookPath,
        'utf8',
      )

    for (
      const contract
      of [
        'useProblemSolverWorker',
        'requestProblemSolverMatches',
        'isCurrent',
        'resolvedQuery',
        'isStale',
        'isLoading',
        'executionMode',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing worker-hook contract: ${contract}`,
      )
    }
  },
)

test(
  'removes synchronous Solver engine imports from the homepage',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'useProblemSolverWorker',
        'isWorkerAnalyzing',
        'isComparisonWorkerAnalyzing',
        'Background Solver worker',
        'Model matching runs outside the main',
        'homepage-problem-worker-status',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing homepage worker integration: ${contract}`,
      )
    }

    for (
      const forbidden
      of [
        "import { calculators }",
        "from '../features/problem-solver/problemSolverEngine'",
        'rankProblemSolvers(',
      ]
    ) {
      assert.equal(
        source.includes(
          forbidden,
        ),
        false,
        `Homepage still performs synchronous ranking: ${forbidden}`,
      )
    }
  },
)

test(
  'styles the background Solver execution status',
  async () => {
    const source =
      await readFile(
        stylePath,
        'utf8',
      )

    for (
      const contract
      of [
        '.homepage-problem-worker-status',
        'data-mode="cache"',
        'data-mode="fallback"',
        'data-mode="error"',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing worker-status style: ${contract}`,
      )
    }
  },
)

test(
  'debounces Solver draft persistence instead of writing on every keystroke',
  async () => {
    const source =
      await readFile(
        componentPath,
        'utf8',
      )

    for (
      const contract
      of [
        'SOLVER_DRAFT_SAVE_DELAY_MS',
        '500',
        'window.localStorage.setItem',
        'window.localStorage.removeItem',
        'window.setTimeout',
        'window.clearTimeout',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing draft-persistence contract: ${contract}`,
      )
    }

    const storageIndex =
      source.indexOf(
        'window.localStorage.setItem',
      )

    const surroundingSource =
      source.slice(
        Math.max(
          0,
          storageIndex -
            900,
        ),
        storageIndex +
          900,
      )

    assert.ok(
      surroundingSource.includes(
        'SOLVER_DRAFT_SAVE_DELAY_MS',
      ),
      'Solver draft write is not inside the delayed persistence effect.',
    )
  },
)

test(
  'prewarms the Solver worker only when the section approaches the viewport',
  async () => {
    const [
      homepageSource,
      clientSource,
    ] =
      await Promise.all([
        readFile(
          componentPath,
          'utf8',
        ),
        readFile(
          workerClientPath,
          'utf8',
        ),
      ])

    for (
      const contract
      of [
        'prewarmProblemSolverWorker',
        'IntersectionObserver',
        'requestIdleCallback',
        "'600px 0px'",
        'warms only when this',
      ]
    ) {
      assert.ok(
        homepageSource.includes(
          contract,
        ),
        `Missing viewport-prewarm integration: ${contract}`,
      )
    }

    for (
      const contract
      of [
        'PROBLEM_SOLVER_WORKER_PREWARM_MODE',
        "'viewport-idle-prewarm-v5'",
        'prewarmProblemSolverWorker',
        'getSharedWorker()',
      ]
    ) {
      assert.ok(
        clientSource.includes(
          contract,
        ),
        `Missing worker-prewarm client contract: ${contract}`,
      )
    }
  },
)

test(
  'defers large worker result commits with a React transition',
  async () => {
    const source =
      await readFile(
        workerHookPath,
        'utf8',
      )

    for (
      const contract
      of [
        'startTransition',
        'PROBLEM_SOLVER_RESULT_RENDER_MODE',
        "'deferred-worker-result-render-v5'",
        'result.matches',
        'result.elapsedMs',
        'result.executionMode',
      ]
    ) {
      assert.ok(
        source.includes(
          contract,
        ),
        `Missing deferred-render contract: ${contract}`,
      )
    }

    assert.ok(
      (
        source.match(
          /startTransition/g,
        ) ??
        []
      ).length >=
        3,
      'Expected the import and both worker-result transitions.',
    )
  },
)
