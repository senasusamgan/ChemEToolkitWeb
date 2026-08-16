import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import type {
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput,
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_MINIMUM_REQUIRED_SPECIFIC_ENERGY_ENGINE_VERSION =
  'partially-full-circular-channel-minimum-required-specific-energy-v1'


export type PartiallyFullCircularChannelMinimumRequiredSpecificEnergyErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_REQUIRED_DISCHARGE'
  | 'INVALID_DENSITY'
  | 'CRITICAL_DEPTH_SOLVER_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelMinimumRequiredSpecificEnergyErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665


function validateInput(
  input:
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.requiredDischarge,
    ) ||
    input.requiredDischarge <=
      0
  ) {
    throw new PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError(
      'INVALID_REQUIRED_DISCHARGE',
      'Required discharge must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }
}


export function calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
  input:
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput,
): PartiallyFullCircularChannelMinimumRequiredSpecificEnergyResult {
  validateInput(
    input,
  )

  let critical

  try {
    critical =
      calculatePartiallyFullCircularChannelCriticalDepth({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.requiredDischarge,

        fluidDensity:
          input.fluidDensity,
      })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown critical-depth solver error.'

    throw new PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError(
      'CRITICAL_DEPTH_SOLVER_FAILURE',
      `Calculator 457 critical-depth solution failed: ${message}`,
    )
  }

  const criticalDepth =
    critical.criticalDepth

  const radius =
    input.pipeDiameter /
    2

  const centralAngleRadians =
    2 *
    Math.acos(
      Math.min(
        1,
        Math.max(
          -1,
          (
            radius -
            criticalDepth
          ) /
          radius,
        ),
      ),
    )

  const flowArea =
    radius *
    radius /
    2 *
    (
      centralAngleRadians -
      Math.sin(
        centralAngleRadians,
      )
    )

  const centerElevation =
    criticalDepth -
    radius

  const topWidth =
    2 *
    Math.sqrt(
      Math.max(
        0,
        radius *
        radius -
        centerElevation *
        centerElevation,
      ),
    )

  const wettedPerimeter =
    radius *
    centralAngleRadians

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const meanVelocity =
    input.requiredDischarge /
    flowArea

  const velocityHead =
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const minimumSpecificEnergy =
    criticalDepth +
    velocityHead

  const criticalGeometrySpecificEnergy =
    criticalDepth +
    flowArea /
    (
      2 *
      topWidth
    )

  const specificEnergyClosureResidual =
    minimumSpecificEnergy -
    criticalGeometrySpecificEnergy

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const criticalRelationResidual =
    input.requiredDischarge *
    input.requiredDischarge *
    topWidth /
    (
      GRAVITATIONAL_ACCELERATION *
      flowArea *
      flowArea *
      flowArea
    ) -
    1

  const massFlowRate =
    input.fluidDensity *
    input.requiredDischarge

  const hydraulicPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.requiredDischarge *
    minimumSpecificEnergy

  const criticalDepthRatio =
    criticalDepth /
    input.pipeDiameter

  const crownClearance =
    input.pipeDiameter -
    criticalDepth

  const depthEnergyFraction =
    criticalDepth /
    minimumSpecificEnergy

  const velocityEnergyFraction =
    velocityHead /
    minimumSpecificEnergy

  const centralAngleDegrees =
    centralAngleRadians *
    180 /
    Math.PI

  const finiteValues = [
    minimumSpecificEnergy,
    criticalDepth,
    criticalDepthRatio,
    crownClearance,
    flowArea,
    topWidth,
    wettedPerimeter,
    hydraulicRadius,
    hydraulicDepth,
    meanVelocity,
    velocityHead,
    criticalGeometrySpecificEnergy,
    specificEnergyClosureResidual,
    froudeNumber,
    criticalRelationResidual,
    massFlowRate,
    hydraulicPower,
    depthEnergyFraction,
    velocityEnergyFraction,
    centralAngleRadians,
    centralAngleDegrees,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    criticalDepth <=
      0 ||
    criticalDepth >=
      input.pipeDiameter ||
    flowArea <=
      0 ||
    topWidth <=
      0 ||
    minimumSpecificEnergy <=
      criticalDepth ||
    Math.abs(
      froudeNumber -
      1
    ) >
      1e-8 ||
    Math.abs(
      criticalRelationResidual
    ) >
      1e-8 ||
    Math.abs(
      specificEnergyClosureResidual
    ) >
      Math.max(
        1e-10,
        minimumSpecificEnergy *
        1e-8,
      )
  ) {
    throw new PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError(
      'NUMERICAL_FAILURE',
      'Minimum-specific-energy solution failed its critical-flow or energy-closure checks.',
    )
  }

  return {
    minimumSpecificEnergy,

    criticalDepth,

    criticalDepthRatio,

    crownClearance,

    requiredDischarge:
      input.requiredDischarge,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    froudeNumber,

    velocityHead,

    criticalGeometrySpecificEnergy,

    specificEnergyClosureResidual,

    criticalRelationResidual,

    massFlowRate,

    hydraulicPower,

    depthEnergyFraction,

    velocityEnergyFraction,

    centralAngleRadians,

    centralAngleDegrees,

    modelName:
      'Partially Full Circular Channel Minimum Specific Energy for Required Discharge',

    limitationDescription:
      'For a fixed circular-channel diameter and discharge, specific energy is minimized at critical flow. Calculator 457 supplies the critical depth. The minimum energy is then evaluated as Emin = yc + Vc²/(2g), with the independent critical relation Emin = yc + A/(2T) used as a closure check. The result represents ideal open-channel specific energy before additional entrance, transition or local-loss allowances.',
  }
}


function csvCell(
  value:
    string | number,
): string {
  const text =
    String(
      value,
    )

  if (
    /[",\n]/.test(
      text,
    )
  ) {
    return (
      '"' +
      text.replaceAll(
        '"',
        '""',
      ) +
      '"'
    )
  }

  return text
}


export function createPartiallyFullCircularChannelMinimumRequiredSpecificEnergyCsv(
  input:
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput,
  result:
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Minimum Specific Energy for Required Discharge',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe Diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Required Discharge',
      input.requiredDischarge,
      'm3/s',
    ],
    [
      'Fluid Density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Minimum Specific Energy',
      result.minimumSpecificEnergy,
      'm',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical Depth Ratio',
      result.criticalDepthRatio,
      '-',
    ],
    [
      'Crown Clearance',
      result.crownClearance,
      'm',
    ],
    [
      'Flow Area',
      result.flowArea,
      'm2',
    ],
    [
      'Top Width',
      result.topWidth,
      'm',
    ],
    [
      'Wetted Perimeter',
      result.wettedPerimeter,
      'm',
    ],
    [
      'Hydraulic Radius',
      result.hydraulicRadius,
      'm',
    ],
    [
      'Hydraulic Depth',
      result.hydraulicDepth,
      'm',
    ],
    [
      'Critical Velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Froude Number',
      result.froudeNumber,
      '-',
    ],
    [
      'Velocity Head',
      result.velocityHead,
      'm',
    ],
    [
      'Critical Geometry Specific Energy',
      result.criticalGeometrySpecificEnergy,
      'm',
    ],
    [
      'Specific Energy Closure Residual',
      result.specificEnergyClosureResidual,
      'm',
    ],
    [
      'Critical Relation Residual',
      result.criticalRelationResidual,
      '-',
    ],
    [
      'Mass Flow Rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Hydraulic Power',
      result.hydraulicPower,
      'W',
    ],
    [
      'Depth Energy Fraction',
      result.depthEnergyFraction,
      '-',
    ],
    [
      'Velocity Energy Fraction',
      result.velocityEnergyFraction,
      '-',
    ],
    [
      'Central Angle',
      result.centralAngleDegrees,
      'deg',
    ],
    [],
    [
      'Model',
      result.modelName,
    ],
    [
      'Limitation',
      result.limitationDescription,
    ],
  ]

  return rows
    .map(
      row =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
