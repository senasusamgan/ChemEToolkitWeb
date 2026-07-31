import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProblemSolutionPlan,
} from '../../src/features/problem-solver/problemSolutionPlanEngine.ts'

import {
  rankProblemSolvers,
} from '../../src/features/problem-solver/problemSolverEngine.ts'

test(
  'builds a pressure-drop engineering plan',
  () => {
    const plan =
      buildProblemSolutionPlan({
        calculatorId:
          'pressureDrop',
        title:
          'Pressure Drop',
        category:
          'Fluid Mechanics',
        equationHint:
          'Darcy–Weisbach: ΔP = f(L/D)(ρv²/2)',
        requiredInputs: [
          'pipe length',
          'inside diameter',
          'fluid density',
        ],
        detectedInputs: [
          'pipe length',
        ],
        missingInputs: [
          'inside diameter',
          'fluid density',
        ],
        diagnostics: [],
        hasQuickSolution:
          false,
      })

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'missing inputs',
          ),
      ),
    )

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'Reynolds number',
          ),
      ),
    )

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'Darcy–Weisbach',
          ),
      ),
    )
  },
)

test(
  'places blocking diagnostics before calculation',
  () => {
    const plan =
      buildProblemSolutionPlan({
        calculatorId:
          'pumpPower',
        title:
          'Pump Power',
        category:
          'Fluid Mechanics',
        equationHint:
          'P = ρgQH/η',
        requiredInputs: [
          'flow rate',
          'total head',
          'pump efficiency',
        ],
        detectedInputs: [],
        missingInputs: [
          'total head',
        ],
        diagnostics: [
          {
            severity:
              'error',
            message:
              'Efficiency cannot exceed 100%.',
          },
        ],
        hasQuickSolution:
          false,
      })

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'Resolve the blocking input issues',
          ),
      ),
    )

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'Efficiency cannot exceed 100%',
          ),
      ),
    )
  },
)

test(
  'builds an ideal-gas-specific plan',
  () => {
    const plan =
      buildProblemSolutionPlan({
        calculatorId:
          'idealGas',
        title:
          'Ideal Gas Calculator',
        category:
          'Thermodynamics',
        equationHint:
          'PV = nRT',
        requiredInputs: [
          'pressure',
          'volume',
          'amount of gas',
          'absolute temperature',
        ],
        detectedInputs: [
          'pressure',
          'volume',
        ],
        missingInputs: [
          'amount of gas',
          'absolute temperature',
        ],
        diagnostics: [],
        hasQuickSolution:
          false,
      })

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'Kelvin',
          ),
      ),
    )

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'PV = nRT',
          ),
      ),
    )
  },
)

test(
  'adds Quick Solve verification when a result exists',
  () => {
    const plan =
      buildProblemSolutionPlan({
        calculatorId:
          'ficksFirstLaw',
        title:
          "Fick's First Law",
        category:
          'Mass Transfer',
        equationHint:
          'J = -DΔC/L',
        requiredInputs: [],
        detectedInputs: [],
        missingInputs: [],
        diagnostics: [],
        hasQuickSolution:
          true,
      })

    assert.ok(
      plan.some(
        (step) =>
          step.includes(
            'Quick Solve result',
          ),
      ),
    )
  },
)

test(
  'integrates the solution plan into ranked matches',
  () => {
    const matches =
      rankProblemSolvers(
        [
          'Calculate pump power.',
          'Flow rate 0.02 m3/s,',
          'total head 18 m,',
          'fluid density 1000 kg/m3',
          'and pump efficiency 80%.',
        ].join(
          ' ',
        ),
        [
          {
            id:
              'pumpPower',
            title:
              'Pump Power',
            category:
              'Fluid Mechanics',
            available:
              true,
          },
        ],
        1,
      )

    assert.equal(
      matches.length,
      1,
    )

    assert.ok(
      matches[0].solutionPlan.length >=
      4,
    )

    assert.match(
      matches[0].guidance,
      /Solution plan:/,
    )

    assert.ok(
      matches[0].solutionPlan.some(
        (step) =>
          step.includes(
            'hydraulic power',
          ),
      ),
    )
  },
)
