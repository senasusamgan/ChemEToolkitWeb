import assert from 'node:assert/strict'
import test from 'node:test'
import {
  solveProblemQuickly,
} from '../../src/features/problem-solver/problemQuickSolveEngine.ts'

function requireSolution(
  solution:
    ReturnType<
      typeof solveProblemQuickly
    >,
) {
  assert.ok(solution)
  return solution
}

test(
  'quick-solves Reynolds number and flow regime',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'reynoldsNumber',
          [
            'Find Reynolds number for',
            'fluid density 998 kg/m3,',
            'velocity 2 m/s,',
            'characteristic diameter 0.05 m',
            'and dynamic viscosity 0.001 Pa s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        99_800,
      ) < 1e-6,
    )

    assert.match(
      solution.resultValue,
      /Turbulent/,
    )

    assert.equal(
      solution.equation,
      'Re = ρvD/μ',
    )
  },
)

test(
  'quick-solves Darcy-Weisbach pressure drop',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'pressureDrop',
          [
            'Estimate pressure drop.',
            'Pipe length 30 m,',
            'inside diameter 0.05 m,',
            'velocity 2 m/s,',
            'fluid density 998 kg/m3,',
            'dynamic viscosity 0.001 Pa s,',
            'roughness 0.045 mm.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        26_339.001987447435,
      ) < 1,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )

    assert.match(
      solution.resultValue,
      /kPa/,
    )
  },
)

test(
  'derives pipe velocity from volumetric flow rate',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'pressureDrop',
          [
            'Estimate pressure drop.',
            'Pipe length 30 m,',
            'inside diameter 0.05 m,',
            'flow rate 0.003927 m3/s,',
            'fluid density 998 kg/m3,',
            'dynamic viscosity 0.001 Pa s,',
            'roughness 0.045 mm.',
          ].join(' '),
        ),
      )

    assert.ok(
      solution.numericValue >
      20_000,
    )

    assert.match(
      solution.steps[0],
      /Velocity/,
    )
  },
)

test(
  'quick-solves required pump power',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'pumpPower',
          [
            'Calculate pump power.',
            'Fluid density 1000 kg/m3,',
            'flow rate 0.01 m3/s,',
            'total head 20 m',
            'and pump efficiency 80%.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        2451.6625,
      ) < 1e-6,
    )

    assert.match(
      solution.resultValue,
      /kW/,
    )
  },
)

test(
  'quick-solves Biot number',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'biotNumber',
          [
            'Find Biot number.',
            'Convection coefficient 25 W/m2K,',
            'characteristic length 0.01 m',
            'and thermal conductivity 15 W/mK.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        1 / 60,
      ) < 1e-12,
    )

    assert.match(
      solution.steps.join(' '),
      /Lumped-capacitance/,
    )
  },
)

test(
  'quick-solves missing ideal-gas pressure',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'idealGas',
          [
            'Find the ideal gas pressure.',
            'Volume 0.024 m3,',
            'moles 1 mol',
            'and temperature 293.15 K.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        101_557.69651944583,
      ) < 1e-6,
    )

    assert.equal(
      solution.unit,
      'Pa',
    )
  },
)

test(
  'does not invent a result when inputs are incomplete',
  () => {
    assert.equal(
      solveProblemQuickly(
        'reynoldsNumber',
        'Find Reynolds number for density 998 kg/m3.',
      ),
      undefined,
    )
  },
)

test(
  'does not quick-solve unsupported calculators',
  () => {
    assert.equal(
      solveProblemQuickly(
        'pidController',
        'Tune a PID controller.',
      ),
      undefined,
    )
  },
)

test(
  'quick-solves heat-exchanger LMTD',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'heatExchangerLMTD',
          [
            'Calculate LMTD.',
            'Terminal temperature difference 1 60 K',
            'and terminal temperature difference 2 30 K.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        43.2808512266689,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'K',
    )
  },
)

test(
  'quick-solves required heat-exchanger area',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'heatExchangerAreaSizing',
          [
            'Size the heat exchanger.',
            'Heat duty 500 kW,',
            'overall heat transfer coefficient 800 W/m2K,',
            'LMTD 40 K',
            'and correction factor 0.9.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        17.36111111111111,
      ) < 1e-10,
    )

    assert.equal(
      solution.unit,
      'm2',
    )
  },
)

test(
  'quick-solves required CSTR volume',
  () => {
    const solution =
      requireSolution(
        solveProblemQuickly(
          'reactorDesign',
          [
            'Calculate the required CSTR volume.',
            'Feed molar flow 2 mol/s,',
            'conversion 75%',
            'and exit reaction rate 0.5 mol/m3 s.',
          ].join(' '),
        ),
      )

    assert.ok(
      Math.abs(
        solution.numericValue -
        3,
      ) < 1e-12,
    )

    assert.equal(
      solution.unit,
      'm3',
    )
  },
)

test(
  'does not size an exchanger without a correction factor',
  () => {
    const solution =
      solveProblemQuickly(
        'heatExchangerAreaSizing',
        [
          'Heat duty 500 kW,',
          'overall heat transfer coefficient 800 W/m2K',
          'and LMTD 40 K.',
        ].join(' '),
      )

    assert.equal(
      solution,
      undefined,
    )
  },
)
