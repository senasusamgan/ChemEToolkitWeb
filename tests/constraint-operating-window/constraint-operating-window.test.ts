import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildConstraintGrid,
  classifyConstraintValue,
  createConstraintRange,
  createConstraintWindowCsv,
  parseConstraintAssignments,
  replaceConstraintAssignment,
  summarizeConstraintWindow,
} from '../../src/features/problem-solver/constraintOperatingWindowEngine.ts'

test(
  'parses numeric engineering assignments and preserves their units',
  () => {
    const assignments =
      parseConstraintAssignments(
        'PV=nRT; P=101325 Pa; T=300 K; n=1 mol; V=?',
      )

    assert.deepEqual(
      assignments.map(
        (
          assignment,
        ) => [
          assignment.symbol,
          assignment.value,
          assignment.unit,
        ],
      ),
      [
        [
          'P',
          101325,
          'Pa',
        ],
        [
          'T',
          300,
          'K',
        ],
        [
          'n',
          1,
          'mol',
        ],
      ],
    )
  },
)

test(
  'replaces only the requested numeric assignment',
  () => {
    const updated =
      replaceConstraintAssignment(
        'P=100 Pa; T=300 K; P2=500 Pa',
        'P',
        125,
      )

    assert.equal(
      updated,
      'P=125 Pa; T=300 K; P2=500 Pa',
    )
  },
)

test(
  'creates inclusive engineering ranges',
  () => {
    assert.deepEqual(
      createConstraintRange(
        10,
        20,
        3,
      ),
      [
        10,
        15,
        20,
      ],
    )
  },
)

test(
  'builds one and two-variable operating grids',
  () => {
    const oneVariable =
      buildConstraintGrid(
        'P=100 Pa; T=300 K; V=?',
        {
          symbol:
            'P',
          minimum:
            80,
          maximum:
            120,
          steps:
            3,
        },
      )

    assert.equal(
      oneVariable.length,
      3,
    )

    assert.equal(
      oneVariable[1]
        .problem,
      'P=100 Pa; T=300 K; V=?',
    )

    const twoVariable =
      buildConstraintGrid(
        'P=100 Pa; T=300 K; V=?',
        {
          symbol:
            'P',
          minimum:
            80,
          maximum:
            120,
          steps:
            3,
        },
        {
          symbol:
            'T',
          minimum:
            280,
          maximum:
            320,
          steps:
            2,
        },
      )

    assert.equal(
      twoVariable.length,
      6,
    )

    assert.equal(
      twoVariable[5]
        .problem,
      'P=120 Pa; T=320 K; V=?',
    )
  },
)

test(
  'classifies feasible, below-limit and above-limit outputs',
  () => {
    assert.deepEqual(
      classifyConstraintValue(
        50,
        40,
        60,
      ),
      {
        status:
          'feasible',
        feasible:
          true,
        signedMargin:
          10,
        boundaryDistance:
          10,
      },
    )

    assert.equal(
      classifyConstraintValue(
        35,
        40,
        60,
      ).status,
      'below',
    )

    assert.equal(
      classifyConstraintValue(
        70,
        40,
        60,
      ).status,
      'above',
    )

    assert.equal(
      classifyConstraintValue(
        null,
        40,
        60,
      ).status,
      'unresolved',
    )
  },
)

test(
  'summarizes feasibility, best margin and closest boundary',
  () => {
    const summary =
      summarizeConstraintWindow([
        {
          id:
            'a',
          status:
            'feasible',
          signedMargin:
            5,
          boundaryDistance:
            5,
        },
        {
          id:
            'b',
          status:
            'feasible',
          signedMargin:
            12,
          boundaryDistance:
            12,
        },
        {
          id:
            'c',
          status:
            'above',
          signedMargin:
            -2,
          boundaryDistance:
            2,
        },
        {
          id:
            'd',
          status:
            'unresolved',
          signedMargin:
            null,
          boundaryDistance:
            null,
        },
      ])

    assert.equal(
      summary.feasiblePointCount,
      2,
    )

    assert.equal(
      summary.feasiblePercentage,
      50,
    )

    assert.equal(
      summary.bestPointId,
      'b',
    )

    assert.equal(
      summary.closestBoundaryPointId,
      'c',
    )
  },
)

test(
  'exports evaluated operating points as CSV',
  () => {
    const csv =
      createConstraintWindowCsv([
        {
          id:
            '0-0',
          row:
            0,
          column:
            0,
          xSymbol:
            'P',
          xValue:
            100,
          ySymbol:
            null,
          yValue:
            null,
          problem:
            'P=100 Pa; V=?',
          calculatorTitle:
            'Ideal Gas Calculator',
          outputValue:
            0.0246,
          outputLabel:
            'Volume',
          outputUnit:
            'm³',
          status:
            'feasible',
          feasible:
            true,
          signedMargin:
            0.0046,
        },
      ])

    assert.ok(
      csv.includes(
        '"Primary variable"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Ideal Gas Calculator"',
      ),
    )

    assert.ok(
      csv.includes(
        '"feasible"',
      ),
    )
  },
)
