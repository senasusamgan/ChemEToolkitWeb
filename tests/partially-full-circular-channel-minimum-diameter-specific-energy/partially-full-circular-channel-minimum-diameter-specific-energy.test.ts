import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError,
  calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy,
  createPartiallyFullCircularChannelMinimumDiameterSpecificEnergyCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-minimum-diameter-specific-energy/engine.ts'

import {
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelMinimumDiameterSpecificEnergy'


const exampleInput = {
  requiredDischarge:
    1,

  availableSpecificEnergy:
    0.8,

  fluidDensity:
    998,
}


function closeTo(
  actual: number,
  expected: number,
  tolerance: number,
) {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <=
      tolerance,
    `Expected ${actual} within ${tolerance} of ${expected}`,
  )
}


test(
  'exposes Calculator 471 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelMinimumDiameterSpecificEnergy',
    )
  },
)


test(
  'solves reference minimum circular-channel diameter',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.minimumDiameter,
      1.0233877101315807,
      2e-8,
    )

    closeTo(
      result.criticalDepth,
      0.5690077897910895,
      2e-8,
    )

    closeTo(
      result.criticalDepthRatio,
      0.5560041264497206,
      2e-8,
    )

    closeTo(
      result.crownClearance,
      0.45437992034049124,
      2e-8,
    )

    closeTo(
      result.flowArea,
      0.4698140465354845,
      2e-8,
    )

    closeTo(
      result.topWidth,
      1.0169478141938144,
      2e-8,
    )

    closeTo(
      result.meanVelocity,
      2.1285017069502863,
      2e-8,
    )
  },
)


test(
  'matches required discharge at critical-flow design capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.designCapacity,
      exampleInput.requiredDischarge,
      2e-8,
    )

    assert.ok(
      result.capacityResidual >=
        -1e-10,
    )

    assert.ok(
      Math.abs(
        result.capacityResidual,
      ) <
        2e-8,
    )

    closeTo(
      result.capacityUtilization,
      1,
      2e-8,
    )

    closeTo(
      result.froudeNumber,
      1,
      1e-9,
    )
  },
)


test(
  'is the inverse of Calculator 470',
  () => {
    const design =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    const capacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          design.minimumDiameter,

        targetSpecificEnergy:
          exampleInput.availableSpecificEnergy,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    closeTo(
      capacity.maximumDischarge,
      exampleInput.requiredDischarge,
      2e-8,
    )

    closeTo(
      capacity.criticalDepth,
      design.criticalDepth,
      1e-10,
    )
  },
)


test(
  'diameters below design are insufficient and larger diameters have spare capacity',
  () => {
    const design =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    const smaller =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          design.minimumDiameter *
          0.99,

        targetSpecificEnergy:
          exampleInput.availableSpecificEnergy,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    const larger =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          design.minimumDiameter *
          1.01,

        targetSpecificEnergy:
          exampleInput.availableSpecificEnergy,

        fluidDensity:
          exampleInput.fluidDensity,
      })

    assert.ok(
      smaller.maximumDischarge <
        exampleInput.requiredDischarge,
    )

    assert.ok(
      larger.maximumDischarge >
        exampleInput.requiredDischarge,
    )
  },
)


test(
  'closes specific-energy relation at the design point',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.velocityHead,
      0.2309922102089033,
      2e-8,
    )

    closeTo(
      result.calculatedSpecificEnergy,
      exampleInput.availableSpecificEnergy,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.energyResidual,
      ) <
        1e-9,
    )

    assert.ok(
      Math.abs(
        result.criticalRelationResidual,
      ) <
        1e-9,
    )
  },
)


test(
  'reports required mass flow and hydraulic power',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    closeTo(
      result.massFlowRate,
      998,
      1e-10,
    )

    closeTo(
      result.hydraulicPower,
      7829.62936,
      1e-7,
    )
  },
)


test(
  'density does not change hydraulic minimum diameter',
  () => {
    const first =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    const second =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
        ...exampleInput,

        fluidDensity:
          1200,
      })

    closeTo(
      first.minimumDiameter,
      second.minimumDiameter,
      1e-10,
    )

    closeTo(
      first.criticalDepth,
      second.criticalDepth,
      1e-10,
    )

    closeTo(
      second.massFlowRate /
      first.massFlowRate,
      1200 /
      998,
      1e-12,
    )
  },
)


test(
  'greater required discharge requires a larger diameter',
  () => {
    const lower =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
        ...exampleInput,

        requiredDischarge:
          0.8,
      })

    const higher =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
        ...exampleInput,

        requiredDischarge:
          1.2,
      })

    assert.ok(
      higher.minimumDiameter >
        lower.minimumDiameter,
    )
  },
)


test(
  'greater available specific energy reduces required diameter',
  () => {
    const lowerEnergy =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
        ...exampleInput,

        availableSpecificEnergy:
          0.6,
      })

    const higherEnergy =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
        ...exampleInput,

        availableSpecificEnergy:
          1.0,
      })

    assert.ok(
      higherEnergy.minimumDiameter <
        lowerEnergy.minimumDiameter,
    )
  },
)


test(
  'rejects invalid required discharge',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
          ...exampleInput,

          requiredDischarge:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError &&
        error.code ===
          'INVALID_REQUIRED_DISCHARGE',
    )
  },
)


test(
  'rejects invalid available specific energy',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy({
          ...exampleInput,

          availableSpecificEnergy:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError &&
        error.code ===
          'INVALID_SPECIFIC_ENERGY',
    )
  },
)


test(
  'exports minimum-diameter design diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelMinimumDiameterSpecificEnergyCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Minimum Diameter for Required Discharge/,
    )

    assert.match(
      csv,
      /Design Critical-Flow Capacity/,
    )

    assert.match(
      csv,
      /Capacity Utilization/,
    )

    assert.match(
      csv,
      /Diameter Iterations/,
    )
  },
)
