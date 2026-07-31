import assert from 'node:assert/strict'
import test from 'node:test'

import {
  diagnoseProblemInput,
} from '../../src/features/problem-solver/problemInputDiagnosticsEngine.ts'

import {
  rankProblemSolvers,
} from '../../src/features/problem-solver/problemSolverEngine.ts'

function diagnosticCodes(
  calculatorId: string,
  query: string,
): string[] {
  return diagnoseProblemInput(
    calculatorId,
    query,
  ).diagnostics.map(
    (diagnostic) =>
      diagnostic.code,
  )
}

test(
  'blocks a pressure-drop solution with negative density',
  () => {
    const query = [
      'Calculate pipe pressure drop.',
      'Pipe length 10 m,',
      'inside diameter 0.1 m,',
      'fluid density -1000 kg/m3,',
      'dynamic viscosity 0.001 Pa s,',
      'surface roughness 0.0001 m',
      'and velocity 2 m/s.',
    ].join(
      ' ',
    )

    const matches =
      rankProblemSolvers(
        query,
        [
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
        1,
      )

    assert.equal(
      matches.length,
      1,
    )

    assert.ok(
      matches[0].diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
          'nonpositive-density',
      ),
    )

    assert.equal(
      matches[0].quickSolution,
      undefined,
    )

    assert.match(
      matches[0].guidance,
      /Density must be greater than zero/,
    )
  },
)

test(
  'rejects pump efficiency above 100 percent',
  () => {
    const result =
      diagnoseProblemInput(
        'pumpPower',
        [
          'Calculate pump power.',
          'Pump efficiency 120%.',
        ].join(
          ' ',
        ),
      )

    assert.equal(
      result.hasBlockingErrors,
      true,
    )

    assert.ok(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
          'efficiency-above-100',
      ),
    )
  },
)

test(
  'rejects conversion above 100 percent',
  () => {
    assert.ok(
      diagnosticCodes(
        'reactorDesign',
        'Target conversion 140%.',
      ).includes(
        'invalid-conversion',
      ),
    )
  },
)

test(
  'rejects nonphysical Kelvin temperature',
  () => {
    assert.ok(
      diagnosticCodes(
        'idealGas',
        'Absolute temperature -5 K.',
      ).includes(
        'invalid-absolute-temperature',
      ),
    )
  },
)

test(
  'warns when ideal-gas pressure basis is ambiguous',
  () => {
    const query = [
      'Calculate ideal gas temperature.',
      'Pressure 101325 Pa,',
      'gas volume 0.024 m3',
      'and amount of gas 1 mol.',
    ].join(
      ' ',
    )

    const matches =
      rankProblemSolvers(
        query,
        [
          {
            id:
              'idealGas',
            title:
              'Ideal Gas',
            category:
              'Thermodynamics',
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
      matches[0].diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
          'pressure-basis-ambiguous' &&
          diagnostic.severity ===
          'warning',
      ),
    )

    assert.ok(
      matches[0].quickSolution,
    )
  },
)

test(
  'rejects pipe roughness greater than diameter',
  () => {
    const codes =
      diagnosticCodes(
        'pressureDrop',
        [
          'Pipe diameter 0.05 m',
          'and surface roughness 0.08 m.',
        ].join(
          ' ',
        ),
      )

    assert.ok(
      codes.includes(
        'roughness-exceeds-diameter',
      ),
    )
  },
)

test(
  'allows a physically valid pressure-drop problem',
  () => {
    const query = [
      'Calculate pipe pressure drop.',
      'Pipe length 10 m,',
      'inside diameter 0.1 m,',
      'fluid density 1000 kg/m3,',
      'dynamic viscosity 0.001 Pa s,',
      'surface roughness 0.0001 m',
      'and velocity 2 m/s.',
    ].join(
      ' ',
    )

    const result =
      diagnoseProblemInput(
        'pressureDrop',
        query,
      )

    assert.equal(
      result.hasBlockingErrors,
      false,
    )

    assert.deepEqual(
      result.diagnostics,
      [],
    )

    const matches =
      rankProblemSolvers(
        query,
        [
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
        1,
      )

    assert.ok(
      matches[0].quickSolution,
    )
  },
)
