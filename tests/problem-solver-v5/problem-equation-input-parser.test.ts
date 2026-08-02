import assert from 'node:assert/strict'
import test from 'node:test'

import {
  parseEquationAwareInput,
} from '../../src/features/problem-solver/problemEquationInputParser.ts'

import {
  inferProblemEquationIntent,
} from '../../src/features/problem-solver/problemEquationIntentEngine.ts'

import {
  resolveProblemEquationContext,
} from '../../src/features/problem-solver/problemEquationContextEngine.ts'

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


test(
  'marks a complete ideal-gas equation as ready',
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

    const context =
      resolveProblemEquationContext(
        intent,
        parsed.assignments,
      )

    assert.equal(
      context.status,
      'ready',
    )

    assert.equal(
      context.readinessPercent,
      100,
    )

    assert.equal(
      context.targetName,
      'gas volume',
    )

    assert.deepEqual(
      context.missingVariableNames,
      [],
    )
  },
)

test(
  'reports missing ideal-gas equation inputs',
  () => {
    const query =
      'PV=nRT, solve for V. P=101325 Pa.'

    const parsed =
      parseEquationAwareInput(
        query,
      )

    const intent =
      inferProblemEquationIntent(
        query,
        parsed.assignments,
      )

    const context =
      resolveProblemEquationContext(
        intent,
        parsed.assignments,
      )

    assert.equal(
      context.status,
      'needs-inputs',
    )

    assert.ok(
      context.missingVariableNames.includes(
        'amount of gas',
      ),
    )

    assert.ok(
      context.missingVariableNames.includes(
        'absolute temperature',
      ),
    )
  },
)

test(
  'detects conflicting equation assignments',
  () => {
    const intent =
      inferProblemEquationIntent(
        'PV=nRT, solve for V.',
        [],
      )

    const context =
      resolveProblemEquationContext(
        intent,
        [
          {
            symbol:
              'P',
            canonicalName:
              'pressure',
            value:
              101325,
            unit:
              'pa',
            canonicalText:
              'pressure 101325 pa',
          },
          {
            symbol:
              'P',
            canonicalName:
              'pressure',
            value:
              200000,
            unit:
              'pa',
            canonicalText:
              'pressure 200000 pa',
          },
          {
            symbol:
              'n',
            canonicalName:
              'amount of gas',
            value:
              1,
            unit:
              'mol',
            canonicalText:
              'amount of gas 1 mol',
          },
          {
            symbol:
              'T',
            canonicalName:
              'absolute temperature',
            value:
              300,
            unit:
              'k',
            canonicalText:
              'absolute temperature 300 k',
          },
        ],
      )

    assert.equal(
      context.status,
      'ambiguous',
    )

    assert.ok(
      context.diagnostics.some(
        (diagnostic) =>
          diagnostic.includes(
            'Conflicting assignments',
          ),
      ),
    )
  },
)

test(
  'resolves D as diffusivity in Ficks law context',
  () => {
    const intent =
      inferProblemEquationIntent(
        'J=-DΔC/L, solve for D.',
        [],
      )

    const context =
      resolveProblemEquationContext(
        intent,
        [
          {
            symbol:
              'L',
            canonicalName:
              'pipe length',
            value:
              0.01,
            unit:
              'm',
            canonicalText:
              'pipe length 0.01 m',
          },
        ],
      )

    assert.equal(
      context.targetKey,
      'diffusivity',
    )

    assert.equal(
      context.targetName,
      'diffusivity',
    )

    assert.ok(
      context.providedVariableNames.includes(
        'diffusion length',
      ),
    )
  },
)

test(
  'marks an unknown equation as not recognized',
  () => {
    const intent =
      inferProblemEquationIntent(
        'x = y + z.',
        [],
      )

    const context =
      resolveProblemEquationContext(
        intent,
        [],
      )

    assert.equal(
      context.status,
      'not-recognized',
    )

    assert.equal(
      context.enrichedText,
      '',
    )
  },
)

test(
  'integrates equation context into ranked matches',
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
      matches[0].equationContext
        .status,
      'ready',
    )

    assert.equal(
      matches[0].equationContext
        .readinessPercent,
      100,
    )

    assert.ok(
      matches[0].quickSolution,
    )

    assert.ok(
      matches[0].reasons.some(
        (reason) =>
          reason.includes(
            'Equation inputs ready',
          ),
      ),
    )
  },
)

test(
  'shortlists candidates before expensive engineering enrichment',
  () => {
    const syntheticCalculators =
      Array.from(
        {
          length:
            800,
        },
        (
          _,
          index,
        ) => ({
          id:
            `syntheticCalculator${index}`,
          title:
            `Synthetic Calculator ${index}`,
          category:
            'Engineering Fundamentals',
          available:
            true,
        }),
      )

    const calculators = [
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
      ...syntheticCalculators,
    ]

    const startedAt =
      performance.now()

    const matches =
      rankProblemSolvers(
        'PV=nRT; P=101325 Pa; n=1 mol; T=300 K; V=?',
        calculators,
        3,
      )

    const elapsedMs =
      performance.now() -
      startedAt

    assert.equal(
      matches.length,
      3,
    )

    assert.equal(
      matches[0]
        .calculatorId,
      'idealGas',
    )

    assert.ok(
      matches.every(
        (match) =>
          match
            .engineeringReport,
      ),
    )

    assert.ok(
      elapsedMs <
        4000,
      `Two-stage ranking exceeded its generous test budget: ${elapsedMs.toFixed(1)} ms`,
    )
  },
)
