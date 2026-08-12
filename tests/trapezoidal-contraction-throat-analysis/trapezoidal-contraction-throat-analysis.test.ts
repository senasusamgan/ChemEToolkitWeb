import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalContractionThroatAnalysisError,
  calculateTrapezoidalContractionThroatAnalysis,
  createTrapezoidalContractionThroatAnalysisCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-contraction-throat-analysis/engine.ts'

const CALCULATOR_ID =
  'trapezoidalContractionThroatAnalysis'

const input = {
  upstreamBottomWidth:
    3,

  contractedBottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  upstreamFlowDepth:
    1.2,

  fluidDensity:
    998,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-8,
): void {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  )
}

test(
  'analyzes a specified unchoked trapezoidal contraction',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalContractionThroatAnalysis',
    )

    const result =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    assert.equal(
      result.throatStatus,
      'Unchoked — two throat-depth roots available',
    )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2501797235694763,
      1e-10,
    )

    closeTo(
      result.minimumContractedBottomWidth,
      1.215361679294872,
      4e-8,
    )

    closeTo(
      result.remainingWidthMargin,
      0.784638320705128,
      4e-8,
    )
  },
)

test(
  'solves the physical subcritical throat depth',
  () => {
    const result =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    closeTo(
      result.subcriticalThroatDepth!,
      1.1539510020114632,
      1e-8,
    )

    closeTo(
      result.subcriticalThroatVelocity!,
      1.373813227674627,
      1e-8,
    )

    closeTo(
      result.subcriticalThroatFroudeNumber!,
      0.47728645345531384,
      1e-8,
    )

    assert.ok(
      result.subcriticalThroatFroudeNumber! <
      1,
    )
  },
)

test(
  'solves the alternate supercritical throat depth',
  () => {
    const result =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    closeTo(
      result.supercriticalAlternateDepth!,
      0.5250731110636344,
      1e-8,
    )

    closeTo(
      result.supercriticalAlternateVelocity!,
      3.771171372804586,
      1e-8,
    )

    closeTo(
      result.supercriticalAlternateFroudeNumber!,
      1.8265408626693997,
      1e-8,
    )

    assert.ok(
      result.supercriticalAlternateFroudeNumber! >
      1,
    )
  },
)

test(
  'both throat roots close to the upstream specific energy',
  () => {
    const result =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    assert.ok(
      Math.abs(
        result.subcriticalEnergyResidual!,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.alternateEnergyResidual!,
      ) <=
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChange!,
      -0.04604899798853679,
      1e-8,
    )
  },
)

test(
  'reports available critical-energy and flow-capacity margin',
  () => {
    const result =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    closeTo(
      result.throatCriticalDepth,
      0.7537303008605118,
      1e-8,
    )

    closeTo(
      result.throatCriticalSpecificEnergy,
      1.0496095998521915,
      1e-8,
    )

    closeTo(
      result.availableSpecificEnergyMargin,
      0.20057012371728478,
      1e-8,
    )

    closeTo(
      result.maximumPassableFlowAtAvailableEnergy,
      6.8405765662590206,
      1e-8,
    )

    closeTo(
      result.flowCapacityMargin,
      1.8405765662590206,
      1e-8,
    )
  },
)

test(
  'width equal to Calculator 439 limit reaches critical contraction threshold',
  () => {
    const base =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    const threshold =
      calculateTrapezoidalContractionThroatAnalysis({
        ...input,

        contractedBottomWidth:
          base.minimumContractedBottomWidth,
      })

    assert.equal(
      threshold.throatStatus,
      'Critical contraction threshold',
    )

    closeTo(
      threshold.subcriticalThroatDepth!,
      threshold.throatCriticalDepth,
      1e-8,
    )

    closeTo(
      threshold.subcriticalThroatFroudeNumber!,
      1,
      1e-8,
    )
  },
)

test(
  'width below choking limit is reported as choked',
  () => {
    const result =
      calculateTrapezoidalContractionThroatAnalysis({
        ...input,

        contractedBottomWidth:
          1,
      })

    assert.equal(
      result.throatStatus,
      'Choked — upstream adjustment required',
    )

    assert.equal(
      result.subcriticalThroatDepth,
      null,
    )

    assert.equal(
      result.supercriticalAlternateDepth,
      null,
    )

    closeTo(
      result.additionalSpecificEnergyRequired,
      0.06822209809177049,
      1e-8,
    )

    closeTo(
      result.maximumPassableFlowAtAvailableEnergy,
      4.498285864265186,
      1e-8,
    )
  },
)

test(
  'narrower unchoked contraction reduces the remaining width margin',
  () => {
    const base =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    const narrower =
      calculateTrapezoidalContractionThroatAnalysis({
        ...input,

        contractedBottomWidth:
          1.5,
      })

    assert.ok(
      narrower.remainingWidthMargin <
      base.remainingWidthMargin,
    )

    assert.ok(
      narrower.widthLimitUtilizationPercent >
      base.widthLimitUtilizationPercent,
    )
  },
)

test(
  'density affects mass flow but not contraction hydraulics',
  () => {
    const base =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    const denser =
      calculateTrapezoidalContractionThroatAnalysis({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.subcriticalThroatDepth!,
      base.subcriticalThroatDepth!,
      1e-8,
    )

    closeTo(
      denser.minimumContractedBottomWidth,
      base.minimumContractedBottomWidth,
      1e-8,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'rejects contracted width equal to upstream width',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalContractionThroatAnalysis({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalContractionThroatAnalysisError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'rejects supercritical upstream flow',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalContractionThroatAnalysis({
          ...input,

          upstreamFlowDepth:
            0.3,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalContractionThroatAnalysisError &&
        error.code ===
          'UPSTREAM_NOT_SUBCRITICAL',
    )
  },
)

test(
  'exports specified-contraction analysis as CSV',
  () => {
    const result =
      calculateTrapezoidalContractionThroatAnalysis(
        input,
      )

    const csv =
      createTrapezoidalContractionThroatAnalysisCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Throat status/,
    )

    assert.match(
      csv,
      /Minimum contracted bottom width/,
    )

    assert.match(
      csv,
      /Subcritical throat depth/,
    )

    assert.match(
      csv,
      /Maximum passable flow at available energy/,
    )
  },
)
