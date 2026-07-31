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

test(
  'rejects nonpositive absolute pressure',
  () => {
    const result =
      diagnoseProblemInput(
        'idealGas',
        [
          'Calculate ideal gas volume.',
          'Absolute pressure 0 Pa',
          'and absolute temperature 300 K.',
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
          'nonpositive-absolute-pressure',
      ),
    )
  },
)

test(
  'rejects nonpositive flow rate',
  () => {
    assert.ok(
      diagnosticCodes(
        'pumpPower',
        'Volumetric flow rate -0.1 m3/s.',
      ).includes(
        'nonpositive-flow-rate',
      ),
    )
  },
)

test(
  'rejects heat-exchanger temperature crossing',
  () => {
    const codes =
      diagnosticCodes(
        'heatExchangerLMTD',
        [
          'Counter-current heat exchanger.',
          'Hot inlet temperature 120 C,',
          'hot outlet temperature 80 C,',
          'cold inlet temperature 90 C',
          'and cold outlet temperature 110 C.',
        ].join(
          ' ',
        ),
      )

    assert.ok(
      codes.includes(
        'heat-exchanger-temperature-cross',
      ),
    )
  },
)

test(
  'accepts physically ordered heat-exchanger temperatures',
  () => {
    const result =
      diagnoseProblemInput(
        'heatExchangerLMTD',
        [
          'Counter-current heat exchanger.',
          'Hot inlet temperature 150 C,',
          'hot outlet temperature 100 C,',
          'cold inlet temperature 20 C',
          'and cold outlet temperature 70 C.',
        ].join(
          ' ',
        ),
      )

    assert.equal(
      result.hasBlockingErrors,
      false,
    )

    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code.includes(
            'heat-exchanger',
          ),
      ),
      false,
    )
  },
)

test(
  'rejects mole fractions whose sum exceeds one',
  () => {
    assert.ok(
      diagnosticCodes(
        'averageMolecularWeight',
        [
          'Component 1 mole fraction 0.7',
          'and component 2 mole fraction 0.5.',
        ].join(
          ' ',
        ),
      ).includes(
        'mole-fraction-sum-above-one',
      ),
    )
  },
)

test(
  'warns when supplied component fractions do not close',
  () => {
    const result =
      diagnoseProblemInput(
        'averageMolecularWeight',
        [
          'Component 1 mole fraction 0.3',
          'and component 2 mole fraction 0.4.',
        ].join(
          ' ',
        ),
      )

    assert.equal(
      result.hasBlockingErrors,
      false,
    )

    assert.ok(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
            'mole-fraction-closure' &&
          diagnostic.severity ===
            'warning',
      ),
    )
  },
)

test(
  'warns when gauge pressure lacks atmospheric pressure',
  () => {
    const result =
      diagnoseProblemInput(
        'idealGas',
        [
          'Calculate ideal gas volume.',
          'Gauge pressure 2 bar,',
          'temperature 300 K',
          'and amount of gas 1 mol.',
        ].join(
          ' ',
        ),
      )

    assert.equal(
      result.hasBlockingErrors,
      false,
    )

    assert.ok(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
          'gauge-pressure-conversion-missing',
      ),
    )
  },
)
