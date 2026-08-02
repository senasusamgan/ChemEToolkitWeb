import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculatePumpAffinityPrediction,
  calculatePumpSystemAnalysis,
  createPumpCurvePoints,
  createPumpOperatingProblem,
  createPumpSystemCsv,
} from '../../src/features/problem-solver/pumpAffinitySystemEngine.ts'

const baseInput = {
  referenceFlowRate:
    0.1,
  referenceHead:
    20,
  referenceSpeedRpm:
    1000,
  referenceImpellerDiameter:
    0.2,
  targetSpeedRpm:
    1500,
  targetImpellerDiameter:
    0.2,
  referenceShutoffHead:
    30,
  staticHead:
    10,
  systemResistanceCoefficient:
    1000,
  density:
    1000,
  efficiency:
    0.8,
  gravity:
    9.81,
}

test(
  'applies pump affinity laws for speed and diameter changes',
  () => {
    const prediction =
      calculatePumpAffinityPrediction(
        baseInput,
      )

    assert.ok(
      prediction,
    )

    assert.equal(
      prediction.speedRatio,
      1.5,
    )

    assert.equal(
      prediction.diameterRatio,
      1,
    )

    assert.ok(
      Math.abs(
        prediction.predictedFlowRate -
        0.15,
      ) <
        1e-12,
    )

    assert.equal(
      prediction.predictedHead,
      45,
    )

    assert.equal(
      prediction.powerScaleRatio,
      3.375,
    )
  },
)

test(
  'calculates the pump and system curve operating point',
  () => {
    const analysis =
      calculatePumpSystemAnalysis(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      Math.abs(
        analysis
          .operatingPoint
          .flowRate -
        Math.sqrt(
          57.5 /
          2000,
        ),
      ) <
        1e-12,
    )

    assert.ok(
      Math.abs(
        analysis
          .operatingPoint
          .head -
        38.75,
      ) <
        1e-10,
    )

    assert.ok(
      analysis
        .operatingPoint
        .shaftPower >
      0,
    )
  },
)

test(
  'creates pump and system curve samples',
  () => {
    const analysis =
      calculatePumpSystemAnalysis(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    const points =
      createPumpCurvePoints(
        baseInput,
        analysis.affinity,
        analysis.operatingPoint,
        11,
      )

    assert.equal(
      points.length,
      11,
    )

    assert.equal(
      points[0].flowRate,
      0,
    )

    assert.ok(
      points[0].pumpHead >
      points[0].systemHead,
    )

    assert.ok(
      points[
        points.length -
        1
      ].systemHead >
      points[
        points.length -
        1
      ].pumpHead,
    )
  },
)

test(
  'rejects an invalid pump shutoff head',
  () => {
    assert.equal(
      calculatePumpSystemAnalysis({
        ...baseInput,
        referenceShutoffHead:
          15,
      }),
      null,
    )
  },
)

test(
  'replaces flow, head and speed in the Solver problem',
  () => {
    assert.equal(
      createPumpOperatingProblem(
        'Q=0.1 m3/s; H=20 m; N=1000 rpm; P=?',
        'Q',
        'H',
        'N',
        0.15,
        40,
        1500,
      ),
      'Q=0.15 m3/s; H=40 m; N=1500 rpm; P=?',
    )
  },
)

test(
  'exports pump and system curve analysis as CSV',
  () => {
    const analysis =
      calculatePumpSystemAnalysis(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    const csv =
      createPumpSystemCsv(
        analysis,
      )

    assert.ok(
      csv.includes(
        '"Affinity flow prediction, m3/s"',
      ),
    )

    assert.ok(
      csv.includes(
        '"System operating shaft power, W"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Pump minus system head, m"',
      ),
    )
  },
)
