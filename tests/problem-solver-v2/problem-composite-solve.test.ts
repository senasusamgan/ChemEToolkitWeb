import assert from 'node:assert/strict'
import test from 'node:test'

import {
  solveCompositeProblem,
} from '../../src/features/problem-solver/problemCompositeSolveEngine.ts'

import {
  rankProblemSolvers,
} from '../../src/features/problem-solver/problemSolverEngine.ts'

import type {
  ProblemCompositeSolution,
} from '../../src/features/problem-solver/problemCompositeSolveEngine.ts'

function requireSolution(
  solution:
    ProblemCompositeSolution | undefined,
): ProblemCompositeSolution {
  assert.ok(
    solution,
    'Expected a composite solution.',
  )

  return solution
}

test(
  'chains pipe pressure drop into required pump power',
  () => {
    const query = [
      'Calculate the pump power required to overcome pipe pressure drop.',
      'Pipe length 100 m,',
      'inside diameter 0.1 m,',
      'fluid density 1000 kg/m3,',
      'dynamic viscosity 0.001 Pa s,',
      'surface roughness 0.0001 m,',
      'volumetric flow rate 0.01 m3/s',
      'and pump efficiency 80%.',
    ].join(
      ' ',
    )

    const solution =
      requireSolution(
        solveCompositeProblem(
          'pumpPower',
          query,
        ),
      )

    assert.equal(
      solution.solutionMode,
      'composite',
    )

    assert.deepEqual(
      solution.chain,
      [
        'pressureDrop',
        'pumpPower',
      ],
    )

    assert.ok(
      solution.numericValue >
        220 &&
      solution.numericValue <
        223,
    )

    assert.equal(
      solution.unit,
      'W',
    )

    assert.match(
      solution.equation,
      /ΔP/,
    )
  },
)

test(
  'chains LMTD into heat-exchanger area sizing',
  () => {
    const query = [
      'Calculate the required heat exchanger area.',
      'Terminal temperature difference 1 is 60 K,',
      'terminal temperature difference 2 is 30 K,',
      'heat duty 500 kW,',
      'overall heat transfer coefficient 800 W/m2K',
      'and correction factor 0.9.',
    ].join(
      ' ',
    )

    const solution =
      requireSolution(
        solveCompositeProblem(
          'heatExchangerAreaSizing',
          query,
        ),
      )

    assert.deepEqual(
      solution.chain,
      [
        'heatExchangerLMTD',
        'heatExchangerAreaSizing',
      ],
    )

    assert.ok(
      Math.abs(
        solution.numericValue -
        16.04507362407281,
      ) < 1e-9,
    )

    assert.equal(
      solution.unit,
      'm2',
    )
  },
)

test(
  'chains Ficks law into a mass-transfer coefficient',
  () => {
    const query = [
      'Calculate the mass transfer coefficient.',
      'Diffusivity 2e-9 m2/s,',
      'concentration difference 500 mol/m3',
      'and diffusion distance 0.001 m.',
    ].join(
      ' ',
    )

    const solution =
      requireSolution(
        solveCompositeProblem(
          'massTransferCoefficient',
          query,
        ),
      )

    assert.deepEqual(
      solution.chain,
      [
        'ficksFirstLaw',
        'massTransferCoefficient',
      ],
    )

    assert.ok(
      Math.abs(
        solution.numericValue -
        2e-6,
      ) < 1e-16,
    )

    assert.equal(
      solution.unit,
      'm/s',
    )
  },
)

test(
  'chains Grashof number into Rayleigh number',
  () => {
    const query = [
      'Calculate the Rayleigh number for natural convection.',
      'Thermal expansion coefficient 0.0034 1/K,',
      'temperature difference 30 K,',
      'characteristic length 0.1 m,',
      'kinematic viscosity 1.5e-5 m2/s',
      'and Prandtl number 0.71.',
    ].join(
      ' ',
    )

    const solution =
      requireSolution(
        solveCompositeProblem(
          'rayleighNumber',
          query,
        ),
      )

    assert.deepEqual(
      solution.chain,
      [
        'grashofNumber',
        'rayleighNumber',
      ],
    )

    assert.ok(
      Math.abs(
        solution.numericValue -
        3156433.746666666,
      ) < 1e-6,
    )

    assert.equal(
      solution.unit,
      'dimensionless',
    )
  },
)

test(
  'does not invent a composite solution for incomplete pipe data',
  () => {
    const solution =
      solveCompositeProblem(
        'pumpPower',
        [
          'Calculate pump power from pipe pressure drop.',
          'Pipe length 100 m',
          'and pump efficiency 80%.',
        ].join(
          ' ',
        ),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)

test(
  'surfaces the composite solution through Problem Solver ranking',
  () => {
    const query = [
      'Calculate the pump power required to overcome pipe pressure drop.',
      'Pipe length 100 m,',
      'inside diameter 0.1 m,',
      'fluid density 1000 kg/m3,',
      'dynamic viscosity 0.001 Pa s,',
      'surface roughness 0.0001 m,',
      'volumetric flow rate 0.01 m3/s',
      'and pump efficiency 80%.',
    ].join(
      ' ',
    )

    const matches =
      rankProblemSolvers(
        query,
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
          {
            id:
              'pressureDrop',
            title:
              'Pressure Drop',
            category:
              'Fluid Mechanics',
            available:
              true,
          },
        ],
        2,
      )

    const pumpMatch =
      matches.find(
        (match) =>
          match.calculatorId ===
          'pumpPower',
      )

    assert.ok(
      pumpMatch,
    )

    assert.equal(
      pumpMatch.quickSolution
        ?.resultLabel,
      'Composite pipe-flow pump requirement',
    )
  },
)
