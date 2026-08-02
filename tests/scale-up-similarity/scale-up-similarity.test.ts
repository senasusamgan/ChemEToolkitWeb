import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateDimensionlessSet,
  calculateRequiredScaleVelocity,
  calculateScaleUpSimilarity,
  createScaleUpCsv,
  createScaleUpProblem,
} from '../../src/features/problem-solver/scaleUpSimilarityEngine.ts'

const baseInput = {
  criterion:
    'reynolds' as const,
  prototypeLength:
    1,
  scaleLength:
    4,
  prototypeVelocity:
    2,
  density:
    1000,
  dynamicViscosity:
    0.001,
  gravity:
    9.81,
  surfaceTension:
    0.072,
}

test(
  'calculates Reynolds, Froude and Weber numbers',
  () => {
    const result =
      calculateDimensionlessSet({
        length:
          2,
        velocity:
          3,
        density:
          1000,
        dynamicViscosity:
          0.001,
        gravity:
          9.81,
        surfaceTension:
          0.072,
      })

    assert.equal(
      result.reynoldsNumber,
      6000000,
    )

    assert.ok(
      Math.abs(
        result.froudeNumber -
        (
          3 /
          Math.sqrt(
            19.62,
          )
        ),
      ) <
      1e-12,
    )

    assert.ok(
      Math.abs(
        result.weberNumber -
        250000,
      ) <
        1e-9,
    )
  },
)

test(
  'calculates required velocity for Reynolds similarity',
  () => {
    assert.equal(
      calculateRequiredScaleVelocity(
        baseInput,
      ),
      0.5,
    )
  },
)

test(
  'calculates required velocity for Froude similarity',
  () => {
    assert.equal(
      calculateRequiredScaleVelocity({
        ...baseInput,
        criterion:
          'froude',
      }),
      4,
    )
  },
)

test(
  'calculates required velocity for Weber similarity',
  () => {
    assert.equal(
      calculateRequiredScaleVelocity({
        ...baseInput,
        criterion:
          'weber',
      }),
      1,
    )
  },
)

test(
  'preserves the selected dimensionless group',
  () => {
    const result =
      calculateScaleUpSimilarity(
        baseInput,
      )

    assert.ok(
      result,
    )

    const reynoldsMetric =
      result.metrics.find(
        (
          metric,
        ) =>
          metric.key ===
          'reynolds',
      )

    assert.ok(
      reynoldsMetric,
    )

    assert.ok(
      Math.abs(
        reynoldsMetric.ratio -
        1,
      ) <
      1e-12,
    )

    assert.equal(
      reynoldsMetric.score,
      100,
    )

    assert.equal(
      reynoldsMetric.isPreserved,
      true,
    )
  },
)

test(
  'replaces scale length and velocity in the engineering problem',
  () => {
    assert.equal(
      createScaleUpProblem(
        'L=1 m; v=2 m/s; Re=?',
        'L',
        'v',
        4,
        0.5,
      ),
      'L=4 m; v=0.5 m/s; Re=?',
    )
  },
)

test(
  'exports dimensionless scale-up results as CSV',
  () => {
    const result =
      calculateScaleUpSimilarity(
        baseInput,
      )

    assert.ok(
      result,
    )

    const csv =
      createScaleUpCsv(
        result,
      )

    assert.ok(
      csv.includes(
        '"Reynolds number"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Overall similarity score"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Preserved criterion"',
      ),
    )
  },
)
