import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateMultistageCompressor,
  calculateSingleStageCompression,
  createCompressorDischargeProblem,
  createMultistageCompressorCsv,
} from '../../src/features/problem-solver/multistageCompressorEngine.ts'

const baseInput = {
  inletPressure:
    100000,
  outletPressure:
    800000,
  inletTemperature:
    300,
  massFlowRate:
    1,
  heatCapacityRatio:
    1.4,
  specificGasConstant:
    287,
  isentropicEfficiency:
    0.8,
  mechanicalEfficiency:
    0.95,
  stageCount:
    3,
  intercoolerOutletTemperature:
    300,
}

test(
  'calculates ideal single-stage compressor discharge temperature',
  () => {
    const input = {
      ...baseInput,
      outletPressure:
        400000,
      isentropicEfficiency:
        1,
      mechanicalEfficiency:
        1,
      stageCount:
        1,
    }

    const result =
      calculateSingleStageCompression(
        input,
      )

    assert.ok(
      result,
    )

    const expectedTemperature =
      300 *
      4 **
        (
          0.4 /
          1.4
        )

    assert.ok(
      Math.abs(
        result
          .actualOutletTemperature -
        expectedTemperature,
      ) <
        1e-10,
    )

    assert.ok(
      result.shaftPower >
      0,
    )
  },
)

test(
  'uses equal pressure ratios through all compressor stages',
  () => {
    const analysis =
      calculateMultistageCompressor(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      Math.abs(
        analysis.stagePressureRatio -
        2,
      ) <
        1e-12,
    )

    const expectedPressures = [
      200000,
      400000,
      800000,
    ]

    analysis.stages.forEach(
      (
        stage,
        index,
      ) => {
        assert.ok(
          Math.abs(
            stage.outletPressure -
            expectedPressures[
              index
            ],
          ) <
            1e-7,
        )

        assert.ok(
          Math.abs(
            stage.pressureRatio -
            2,
          ) <
            1e-12,
        )
      },
    )
  },
)

test(
  'multistage compression reduces shaft power with intercooling',
  () => {
    const analysis =
      calculateMultistageCompressor(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      analysis.totalShaftPower <
      analysis
        .singleStage
        .shaftPower,
    )

    assert.ok(
      analysis.shaftPowerSaving >
      0,
    )

    assert.ok(
      analysis.shaftPowerSavingPercent >
      0,
    )
  },
)

test(
  'calculates positive interstage cooling duty',
  () => {
    const analysis =
      calculateMultistageCompressor(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    assert.ok(
      analysis.totalIntercoolerDuty >
      0,
    )

    assert.equal(
      analysis
        .stages[
          analysis.stages.length -
          1
        ]
        .intercoolerHeatRemoved,
      0,
    )
  },
)

test(
  'single-stage configuration has no intercooler duty',
  () => {
    const analysis =
      calculateMultistageCompressor({
        ...baseInput,
        stageCount:
          1,
      })

    assert.ok(
      analysis,
    )

    assert.equal(
      analysis.totalIntercoolerDuty,
      0,
    )

    assert.ok(
      Math.abs(
        analysis.totalShaftPower -
        analysis
          .singleStage
          .shaftPower,
      ) <
        1e-8,
    )
  },
)

test(
  'rejects invalid compressor operating conditions',
  () => {
    assert.equal(
      calculateMultistageCompressor({
        ...baseInput,
        outletPressure:
          50000,
      }),
      null,
    )

    assert.equal(
      calculateMultistageCompressor({
        ...baseInput,
        isentropicEfficiency:
          1.2,
      }),
      null,
    )

    assert.equal(
      calculateMultistageCompressor({
        ...baseInput,
        stageCount:
          2.5,
      }),
      null,
    )
  },
)

test(
  'replaces pressure and temperature with the discharge state',
  () => {
    assert.equal(
      createCompressorDischargeProblem(
        'P=100000 Pa; T=300 K; mdot=1 kg/s',
        'P',
        'T',
        800000,
        450,
      ),
      'P=800000 Pa; T=450 K; mdot=1 kg/s',
    )
  },
)

test(
  'exports compressor stage data as CSV',
  () => {
    const analysis =
      calculateMultistageCompressor(
        baseInput,
      )

    assert.ok(
      analysis,
    )

    const csv =
      createMultistageCompressorCsv(
        analysis,
      )

    assert.ok(
      csv.includes(
        '"Multistage shaft power, W"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Shaft-power saving, percent"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Intercooler heat removed, W"',
      ),
    )
  },
)
