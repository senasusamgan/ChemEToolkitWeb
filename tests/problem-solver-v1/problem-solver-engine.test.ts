import assert from 'node:assert/strict'
import test from 'node:test'
import {
  rankProblemSolvers,
} from '../../src/features/problem-solver/problemSolverEngine.ts'
import type {
  ProblemSolverCalculator,
} from '../../src/features/problem-solver/problemSolverEngine.ts'

const calculators:
  ProblemSolverCalculator[] = [
    {
      id: 'reynoldsNumber',
      title:
        'Reynolds Number & Flow Regime',
      category:
        'Fluid Mechanics',
      available: true,
    },
    {
      id: 'pressureDrop',
      title:
        'Darcy–Weisbach Pressure Drop',
      category:
        'Fluid Mechanics',
      available: true,
    },
    {
      id: 'heatExchangerLMTD',
      title:
        'Heat Exchanger LMTD',
      category:
        'Heat Transfer',
      available: true,
    },
    {
      id: 'heatExchangerAreaSizing',
      title:
        'Heat Exchanger Area Sizing',
      category:
        'Heat Transfer',
      available: true,
    },
    {
      id: 'pidController',
      title:
        'PID Controller',
      category:
        'Process Control',
      available: true,
    },
    {
      id: 'reactorDesign',
      title:
        'CSTR Design',
      category:
        'Reaction Engineering',
      available: true,
    },
    {
      id: 'disabledCalculator',
      title:
        'Disabled Pressure Drop',
      category:
        'Fluid Mechanics',
      available: false,
    },
  ]

test(
  'ranks pipe pressure drop first',
  () => {
    const matches =
      rankProblemSolvers(
        'Estimate the pressure drop through a pipe',
        calculators,
      )

    assert.equal(
      matches[0]?.calculatorId,
      'pressureDrop',
    )

    assert.equal(
      matches[0]?.confidence,
      'high',
    )
  },
)

test(
  'recognizes Reynolds-number intent',
  () => {
    const matches =
      rankProblemSolvers(
        'Determine the Reynolds number and flow regime',
        calculators,
      )

    assert.equal(
      matches[0]?.calculatorId,
      'reynoldsNumber',
    )
  },
)

test(
  'ranks exchanger-area sizing above LMTD',
  () => {
    const matches =
      rankProblemSolvers(
        'Size the required heat exchanger area using LMTD',
        calculators,
      )

    assert.equal(
      matches[0]?.calculatorId,
      'heatExchangerAreaSizing',
    )

    assert.ok(
      matches.some(
        (match) =>
          match.calculatorId ===
          'heatExchangerLMTD',
      ),
    )
  },
)

test(
  'recognizes PID tuning',
  () => {
    const matches =
      rankProblemSolvers(
        'Tune a PID controller for this process',
        calculators,
      )

    assert.equal(
      matches[0]?.calculatorId,
      'pidController',
    )
  },
)

test(
  'recognizes CSTR design',
  () => {
    const matches =
      rankProblemSolvers(
        'Calculate the required CSTR volume',
        calculators,
      )

    assert.equal(
      matches[0]?.calculatorId,
      'reactorDesign',
    )
  },
)

test(
  'supports Turkish pressure-drop intent',
  () => {
    const matches =
      rankProblemSolvers(
        'Boru basinc dusumunu hesapla',
        calculators,
      )

    assert.equal(
      matches[0]?.calculatorId,
      'pressureDrop',
    )
  },
)

test(
  'excludes unavailable calculators',
  () => {
    const matches =
      rankProblemSolvers(
        'pressure drop',
        calculators,
      )

    assert.equal(
      matches.some(
        (match) =>
          match.calculatorId ===
          'disabledCalculator',
      ),
      false,
    )
  },
)

test(
  'returns no matches for an empty problem',
  () => {
    assert.deepEqual(
      rankProblemSolvers(
        ' ',
        calculators,
      ),
      [],
    )
  },
)

test(
  'returns an actionable pressure-drop solution brief',
  () => {
    const matches =
      rankProblemSolvers(
        'Estimate the pressure drop through a pipe',
        calculators,
      )

    const match =
      matches.find(
        (item) =>
          item.calculatorId ===
          'pressureDrop',
      )

    assert.ok(match)

    assert.match(
      match.guidance,
      /pressure-loss model/i,
    )

    assert.ok(
      match.requiredInputs.includes(
        'pipe length',
      ),
    )

    assert.match(
      match.equationHint,
      /Darcy/,
    )
  },
)

test(
  'returns category guidance when no dedicated calculator profile exists',
  () => {
    const matches =
      rankProblemSolvers(
        'Calculate a mass transfer coefficient',
        [
          {
            id:
              'genericMassTransferTool',
            title:
              'Generic Mass Transfer Tool',
            category:
              'Mass Transfer',
            available: true,
          },
        ],
      )

    assert.equal(
      matches.length,
      1,
    )

    assert.match(
      matches[0].guidance,
      /transferring species/i,
    )

    assert.ok(
      matches[0]
        .requiredInputs
        .includes(
          'compositions or concentrations',
        ),
    )
  },
)

test(
  'every recommended calculator includes a solution brief',
  () => {
    const matches =
      rankProblemSolvers(
        'Tune a PID controller and size a heat exchanger',
        calculators,
      )

    assert.ok(
      matches.length > 0,
    )

    for (const match of matches) {
      assert.ok(
        match.guidance.length > 0,
      )

      assert.ok(
        match.requiredInputs.length > 0,
      )

      assert.ok(
        match.equationHint.length > 0,
      )
    }
  },
)
