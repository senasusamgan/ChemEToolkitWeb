import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateAgitatedVesselScaleUp,
  calculateAgitatedVesselState,
  calculateRequiredAgitatorSpeedRpm,
  createAgitatedVesselScaleUpCsv,
  createAgitatedVesselScaleUpProblem,
} from '../../src/features/problem-solver/agitatedVesselScaleUpEngine.ts'

const baseInput = {
  criterion:
    'tipSpeed' as const,
  prototypeImpellerDiameter:
    0.2,
  scaleImpellerDiameter:
    0.8,
  prototypeSpeedRpm:
    600,
  prototypeVesselVolume:
    0.05,
  density:
    1000,
  dynamicViscosity:
    0.001,
  powerNumber:
    5,
  gravity:
    9.81,
}

test(
  'calculates agitated-vessel power, torque and dimensionless groups',
  () => {
    const state =
      calculateAgitatedVesselState({
        impellerDiameter:
          0.2,
        speedRpm:
          600,
        vesselVolume:
          0.05,
        density:
          1000,
        dynamicViscosity:
          0.001,
        powerNumber:
          5,
        gravity:
          9.81,
      })

    assert.ok(
      Math.abs(
        state.tipSpeed -
        (
          2 *
          Math.PI
        ),
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        state.impellerReynoldsNumber -
        400000,
      ) <
        1e-8,
    )

    assert.ok(
      Math.abs(
        state.power -
        1600,
      ) <
        1e-9,
    )

    assert.ok(
      Math.abs(
        state.powerPerVolume -
        32000,
      ) <
        1e-8,
    )
  },
)

test(
  'calculates constant-tip-speed scale-up rpm',
  () => {
    assert.equal(
      calculateRequiredAgitatorSpeedRpm(
        baseInput,
      ),
      150,
    )
  },
)

test(
  'calculates constant-power-per-volume scale-up rpm',
  () => {
    const result =
      calculateRequiredAgitatorSpeedRpm({
        ...baseInput,
        criterion:
          'powerPerVolume',
      })

    assert.ok(
      result !==
        null,
    )

    assert.ok(
      Math.abs(
        result -
        (
          600 *
          0.25 **
            (
              2 /
              3
            )
        ),
      ) <
        1e-10,
    )
  },
)

test(
  'calculates constant-Reynolds scale-up rpm',
  () => {
    assert.equal(
      calculateRequiredAgitatorSpeedRpm({
        ...baseInput,
        criterion:
          'reynolds',
      }),
      37.5,
    )
  },
)

test(
  'calculates constant-Froude scale-up rpm',
  () => {
    assert.equal(
      calculateRequiredAgitatorSpeedRpm({
        ...baseInput,
        criterion:
          'froude',
      }),
      300,
    )
  },
)

test(
  'preserves the selected agitation similarity criterion',
  () => {
    const result =
      calculateAgitatedVesselScaleUp(
        baseInput,
      )

    assert.ok(
      result,
    )

    const tipSpeedMetric =
      result.metrics.find(
        (
          metric,
        ) =>
          metric.key ===
          'tipSpeed',
      )

    assert.ok(
      tipSpeedMetric,
    )

    assert.ok(
      Math.abs(
        tipSpeedMetric.ratio -
        1,
      ) <
        1e-12,
    )

    assert.equal(
      tipSpeedMetric.isPreserved,
      true,
    )

    assert.ok(
      Math.abs(
        result.scale.vesselVolume -
        3.2,
      ) <
        1e-12,
    )
  },
)

test(
  'preserves power per volume for the P over V criterion',
  () => {
    const result =
      calculateAgitatedVesselScaleUp({
        ...baseInput,
        criterion:
          'powerPerVolume',
      })

    assert.ok(
      result,
    )

    const metric =
      result.metrics.find(
        (
          item,
        ) =>
          item.key ===
          'powerPerVolume',
      )

    assert.ok(
      metric,
    )

    assert.ok(
      Math.abs(
        metric.ratio -
        1,
      ) <
        1e-12,
    )
  },
)

test(
  'replaces diameter and speed in the scaled Solver problem',
  () => {
    assert.equal(
      createAgitatedVesselScaleUpProblem(
        'D=0.2 m; N=600 rpm; Re=?',
        'D',
        'N',
        0.8,
        150,
      ),
      'D=0.8 m; N=150 rpm; Re=?',
    )
  },
)

test(
  'exports agitation scale-up results as CSV',
  () => {
    const result =
      calculateAgitatedVesselScaleUp(
        baseInput,
      )

    assert.ok(
      result,
    )

    const csv =
      createAgitatedVesselScaleUpCsv(
        result,
      )

    assert.ok(
      csv.includes(
        '"Impeller tip speed"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Power increase ratio"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Scale-up torque, N m"',
      ),
    )
  },
)
