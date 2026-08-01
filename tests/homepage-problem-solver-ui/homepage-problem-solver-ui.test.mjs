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
