import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelAlternateDepthsError,
  calculatePartiallyFullCircularChannelAlternateDepths,
  createPartiallyFullCircularChannelAlternateDepthsCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-alternate-depths/engine.ts'

import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/engine.ts'

const CALCULATOR_ID =
  'partiallyFullCircularChannelAlternateDepths'

const input = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    1.2,

  specificEnergy:
    1,

  fluidDensity:
    998,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-9,
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
  'solves the two alternate depths for the reference specific energy',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'partiallyFullCircularChannelAlternateDepths',
    )

    const result =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    assert.equal(
      result.solutionMultiplicity,
      'Two alternate depths',
    )

    assert.ok(
      result.deepSolution,
    )

    closeTo(
      result.shallowSolution.flowDepth,
      0.4236010655180221,
      2e-9,
    )

    closeTo(
      result.deepSolution!.flowDepth,
      0.9140765045737536,
      2e-9,
    )
  },
)


test(
  'shallow root is supercritical and deep root is subcritical',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    assert.ok(
      result.deepSolution,
    )

    closeTo(
      result.shallowSolution.froudeNumber,
      1.9247747424585127,
      2e-9,
    )

    closeTo(
      result.deepSolution!.froudeNumber,
      0.43598253289608774,
      2e-9,
    )

    assert.equal(
      result.shallowSolution.flowRegime,
      'Supercritical',
    )

    assert.equal(
      result.deepSolution!.flowRegime,
      'Subcritical',
    )
  },
)


test(
  'both alternate roots recover the specified energy',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    assert.ok(
      result.deepSolution,
    )

    closeTo(
      result.shallowSolution.recoveredSpecificEnergy,
      input.specificEnergy,
      1e-9,
    )

    closeTo(
      result.deepSolution!.recoveredSpecificEnergy,
      input.specificEnergy,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.shallowSolution.specificEnergyResidual,
      ) <
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.deepSolution!.specificEnergyResidual,
      ) <
      1e-9,
    )
  },
)


test(
  'Calculator 457 critical state separates the two alternate roots',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    const critical =
      calculatePartiallyFullCircularChannelCriticalDepth({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      result.criticalDepth,
      critical.criticalDepth,
      1e-12,
    )

    closeTo(
      result.criticalSpecificEnergy,
      critical.criticalSpecificEnergy,
      1e-12,
    )

    assert.ok(
      result.shallowSolution.flowDepth <
      critical.criticalDepth,
    )

    assert.ok(
      result.deepSolution!.flowDepth >
      critical.criticalDepth,
    )
  },
)


test(
  'reports critical and crown-limit energy metrics',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    closeTo(
      result.criticalSpecificEnergy,
      0.8295453770389906,
      2e-10,
    )

    closeTo(
      result.energyExcessAboveCritical,
      0.1704546229610094,
      2e-10,
    )

    closeTo(
      result.fullDepthLimitSpecificEnergy,
      1.2573993631545588,
      2e-10,
    )

    closeTo(
      result.alternateDepthSeparation!,
      0.4904754390557315,
      3e-9,
    )
  },
)


test(
  'critical specific energy collapses the alternate roots into one critical depth',
  () => {
    const critical =
      calculatePartiallyFullCircularChannelCriticalDepth({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        fluidDensity:
          input.fluidDensity,
      })

    const result =
      calculatePartiallyFullCircularChannelAlternateDepths({
        ...input,

        specificEnergy:
          critical.criticalSpecificEnergy,
      })

    assert.equal(
      result.solutionMultiplicity,
      'Critical depth only',
    )

    assert.equal(
      result.deepSolution,
      null,
    )

    closeTo(
      result.shallowSolution.flowDepth,
      critical.criticalDepth,
      1e-12,
    )

    closeTo(
      result.shallowSolution.froudeNumber,
      1,
      1e-9,
    )
  },
)


test(
  'specific energy above the crown-limit energy has only one partial-depth root',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAlternateDepths({
        ...input,

        specificEnergy:
          1.3,
      })

    assert.equal(
      result.solutionMultiplicity,
      'Single partial-depth solution',
    )

    assert.equal(
      result.deepSolution,
      null,
    )

    closeTo(
      result.shallowSolution.flowDepth,
      0.35379653960732016,
      3e-9,
    )

    assert.ok(
      result.shallowSolution.froudeNumber >
      1,
    )
  },
)


test(
  'lower above-critical energy brings alternate roots closer together',
  () => {
    const lowExcess =
      calculatePartiallyFullCircularChannelAlternateDepths({
        ...input,

        specificEnergy:
          0.9,
      })

    const reference =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    assert.ok(
      lowExcess.deepSolution,
    )

    assert.ok(
      reference.deepSolution,
    )

    assert.ok(
      lowExcess.alternateDepthSeparation! <
      reference.alternateDepthSeparation!,
    )

    closeTo(
      lowExcess.shallowSolution.flowDepth,
      0.4736222434006566,
      3e-9,
    )

    closeTo(
      lowExcess.deepSolution!.flowDepth,
      0.7780753068615294,
      3e-9,
    )
  },
)


test(
  'density changes mass flow but not alternate depths',
  () => {
    const base =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    const denser =
      calculatePartiallyFullCircularChannelAlternateDepths({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.shallowSolution.flowDepth,
      base.shallowSolution.flowDepth,
      1e-12,
    )

    closeTo(
      denser.deepSolution!.flowDepth,
      base.deepSolution!.flowDepth,
      1e-12,
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
  'rejects specific energy below Calculator 457 minimum energy',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAlternateDepths({
          ...input,

          specificEnergy:
            0.8,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelAlternateDepthsError &&
        error.code ===
          'SPECIFIC_ENERGY_BELOW_CRITICAL',
    )
  },
)


test(
  'rejects non-positive specific energy',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAlternateDepths({
          ...input,

          specificEnergy:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelAlternateDepthsError &&
        error.code ===
          'INVALID_SPECIFIC_ENERGY',
    )
  },
)


test(
  'exports alternate depths as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAlternateDepths(
        input,
      )

    const csv =
      createPartiallyFullCircularChannelAlternateDepthsCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Solution multiplicity/,
    )

    assert.match(
      csv,
      /Critical specific energy/,
    )

    assert.match(
      csv,
      /Shallow Solution/,
    )

    assert.match(
      csv,
      /Deep Solution/,
    )
  },
)
