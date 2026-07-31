import assert from 'node:assert/strict'
import test from 'node:test'

import {
  parseEquationAwareInput,
} from '../../src/features/problem-solver/problemEquationInputParser.ts'

import {
  inferProblemEquationIntent,
} from '../../src/features/problem-solver/problemEquationIntentEngine.ts'

import {
  rankProblemSolvers,
} from '../../src/features/problem-solver/problemSolverEngine.ts'

test(
  'parses compact fluid-mechanics symbol assignments',
  () => {
    const result =
      parseEquationAwareInput(
        [
          'Calculate the pressure drop.',
          'ρ=998 kg/m³,',
          'μ=0.001 Pa·s,',
          'D=0.05 m,',
          'L=20 m,',
          'v=2 m/s,',
          'ε=0.0001 m.',
        ].join(
          ' ',
        ),
      )

    assert.equal(
      result.assignments.length,
      6,
    )

    assert.ok(
      result.enrichedQuery.includes(
        'fluid density 998 kg/m3',
      ),
    )

    assert.ok(
      result.enrichedQuery.includes(
        'dynamic viscosity 0.001 pa s',
      ),
    )

    assert.ok(
      result.enrichedQuery.includes(
        'pipe diameter 0.05 m',
      ),
    )

    assert.ok(
      result.enrichedQuery.includes(
        'surface roughness 0.0001 m',
      ),
    )
  },
)

test(
  'preserves uppercase V as volume and lowercase v as velocity',
  () => {
    const result =
      parseEquationAwareInput(
        'V=25 L, v=3 m/s.',
      )

    assert.deepEqual(
      result.assignments.map(
        (assignment) =>
          assignment.canonicalName,
      ),
      [
        'volume',
        'velocity',
      ],
    )
  },
)

test(
  'parses ideal-gas symbolic inputs into Quick Solve',
  () => {
    const query = [
      'Calculate ideal gas volume.',
      'P=101325 Pa,',
      'n=1 mol,',
      'T=300 K.',
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
              'Ideal Gas Calculator',
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

    assert.equal(
      matches[0].equationAssignments.length,
      3,
    )

    assert.ok(
      matches[0].quickSolution,
    )

    assert.equal(
      matches[0].quickSolution?.unit,
      'm3',
    )

    assert.ok(
      Math.abs(
        (
          matches[0].quickSolution
            ?.numericValue ?? 0
        ) -
        0.0246172098,
      ) <
      1e-8,
    )
  },
)

test(
  'parses symbolic pressure-drop inputs into Quick Solve',
  () => {
    const query = [
      'Calculate pipe pressure drop.',
      'L=10 m,',
      'D=0.1 m,',
      'ρ=1000 kg/m³,',
      'μ=0.001 Pa·s,',
      'v=2 m/s,',
      'ε=0.0001 m.',
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

    assert.equal(
      matches[0].equationAssignments.length,
      6,
    )

    assert.ok(
      matches[0].quickSolution,
    )

    assert.equal(
      matches[0].quickSolution?.unit,
      'Pa',
    )
  },
)

test(
  'parses dimensionless efficiency and conversion',
  () => {
    const result =
      parseEquationAwareInput(
        'η=0.82, X_A=75%.',
      )

    assert.deepEqual(
      result.assignments.map(
        (assignment) =>
          assignment.canonicalText,
      ),
      [
        'efficiency 0.82',
        'conversion 75 %',
      ],
    )
  },
)

test(
  'ignores unsupported symbols and invalid units',
  () => {
    const result =
      parseEquationAwareInput(
        'zeta=3, D=12 kg, random=8 m.',
      )

    assert.deepEqual(
      result.assignments,
      [],
    )

    assert.equal(
      result.enrichedQuery,
      result.originalQuery,
    )
  },
)

test(
  'supports colon assignment syntax',
  () => {
    const result =
      parseEquationAwareInput(
        'ρ: 1.2 kg/m3; Q: 0.03 m3/s.',
      )

    assert.equal(
      result.assignments.length,
      2,
    )

    assert.equal(
      result.assignments[0].canonicalName,
      'fluid density',
    )

    assert.equal(
      result.assignments[1].canonicalName,
      'volumetric flow rate',
    )
  },
)


test(
  'infers volume as the missing ideal-gas variable',
  () => {
    const query = [
      'Use PV=nRT.',
      'P=101325 Pa,',
      'n=1 mol,',
      'T=300 K.',
    ].join(
      ' ',
    )

    const parsed =
      parseEquationAwareInput(
        query,
      )

    const intent =
      inferProblemEquationIntent(
        query,
        parsed.assignments,
      )

    assert.equal(
      intent.equationId,
      'ideal-gas-law',
    )

    assert.equal(
      intent.targetSymbol,
      'V',
    )

    assert.equal(
      intent.targetName,
      'volume',
    )

    assert.equal(
      intent.targetSource,
      'missing-variable',
    )
  },
)

test(
  'honors an explicit solve-for target',
  () => {
    const query = [
      'PV=nRT, solve for T.',
      'P=101325 Pa,',
      'V=0.025 m3,',
      'n=1 mol.',
    ].join(
      ' ',
    )

    const parsed =
      parseEquationAwareInput(
        query,
      )

    const intent =
      inferProblemEquationIntent(
        query,
        parsed.assignments,
      )

    assert.equal(
      intent.targetSymbol,
      'T',
    )

    assert.equal(
      intent.targetName,
      'absolute temperature',
    )

    assert.equal(
      intent.targetSource,
      'explicit',
    )
  },
)

test(
  'recognizes question-mark target assignment',
  () => {
    const query =
      'PV=nRT; P=101325 Pa; n=1 mol; T=300 K; V=?'

    const parsed =
      parseEquationAwareInput(
        query,
      )

    const intent =
      inferProblemEquationIntent(
        query,
        parsed.assignments,
      )

    assert.equal(
      intent.targetSymbol,
      'V',
    )

    assert.equal(
      intent.targetSource,
      'explicit',
    )
  },
)

test(
  'infers Reynolds number from the symbolic equation',
  () => {
    const query = [
      'Re=ρvD/μ.',
      'ρ=998 kg/m3,',
      'v=2 m/s,',
      'D=0.05 m,',
      'μ=0.001 Pa s.',
    ].join(
      ' ',
    )

    const parsed =
      parseEquationAwareInput(
        query,
      )

    const intent =
      inferProblemEquationIntent(
        query,
        parsed.assignments,
      )

    assert.equal(
      intent.equationId,
      'reynolds-number',
    )

    assert.equal(
      intent.targetName,
      'Reynolds number',
    )

    assert.equal(
      intent.targetSource,
      'missing-variable',
    )
  },
)

test(
  'infers velocity from Q equals A v',
  () => {
    const query =
      'Q=Av; Q=0.02 m3/s; A=0.01 m2.'

    const parsed =
      parseEquationAwareInput(
        query,
      )

    const intent =
      inferProblemEquationIntent(
        query,
        parsed.assignments,
      )

    assert.equal(
      intent.equationId,
      'flow-continuity',
    )

    assert.equal(
      intent.targetSymbol,
      'v',
    )

    assert.equal(
      intent.targetName,
      'velocity',
    )
  },
)

test(
  'interprets D as diffusivity inside Ficks law',
  () => {
    const query =
      'J=-DΔC/L, solve for D.'

    const intent =
      inferProblemEquationIntent(
        query,
        [],
      )

    assert.equal(
      intent.equationId,
      'ficks-first-law',
    )

    assert.equal(
      intent.targetSymbol,
      'D',
    )

    assert.equal(
      intent.targetName,
      'diffusivity',
    )
  },
)

test(
  'integrates equation intent into ranked matches',
  () => {
    const query = [
      'Use PV=nRT.',
      'P=101325 Pa,',
      'n=1 mol,',
      'T=300 K.',
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
              'Ideal Gas Calculator',
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

    assert.equal(
      matches[0].equationIntent
        .equationId,
      'ideal-gas-law',
    )

    assert.equal(
      matches[0].equationIntent
        .targetName,
      'volume',
    )

    assert.ok(
      matches[0].quickSolution,
    )
  },
)

test(
  'returns an empty equation intent for ordinary text',
  () => {
    const intent =
      inferProblemEquationIntent(
        'Explain this engineering problem.',
        [],
      )

    assert.equal(
      intent.equationId,
      null,
    )

    assert.equal(
      intent.targetName,
      null,
    )

    assert.equal(
      intent.enrichedText,
      '',
    )
  },
)
