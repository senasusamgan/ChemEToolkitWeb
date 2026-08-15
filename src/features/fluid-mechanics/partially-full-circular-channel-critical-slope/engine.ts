import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import type {
  PartiallyFullCircularChannelCriticalSlopeInput,
  PartiallyFullCircularChannelCriticalSlopeResult,
} from './types.ts'

export const PARTIALLY_FULL_CIRCULAR_CHANNEL_CRITICAL_SLOPE_ENGINE_VERSION =
  'partially-full-circular-channel-critical-slope-v1'

export type PartiallyFullCircularChannelCriticalSlopeErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class PartiallyFullCircularChannelCriticalSlopeError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelCriticalSlopeErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelCriticalSlopeErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelCriticalSlopeError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665


export function calculatePartiallyFullCircularChannelCriticalSlope(
  input:
    PartiallyFullCircularChannelCriticalSlopeInput,
): PartiallyFullCircularChannelCriticalSlopeResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalSlopeError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalSlopeError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalSlopeError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelCriticalSlopeError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }

  const critical =
    calculatePartiallyFullCircularChannelCriticalDepth({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      fluidDensity:
        input.fluidDensity,
    })

  const criticalFlowArea =
    critical.criticalFlowArea

  const criticalHydraulicRadius =
    critical.criticalHydraulicRadius

  const manningConveyance =
    (
      criticalFlowArea *
      criticalHydraulicRadius **
        (
          2 / 3
        )
    ) /
    input.manningRoughness

  const criticalSlope =
    (
      input.volumetricFlowRate /
      manningConveyance
    ) **
    2

  const criticalSlopePercent =
    criticalSlope *
    100

  const criticalSlopePerMille =
    criticalSlope *
    1000

  const fullFlowArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

  const fullFlowHydraulicRadius =
    input.pipeDiameter /
    4

  const fullFlowCapacityAtCriticalSlope =
    (
      1 /
      input.manningRoughness
    ) *
    fullFlowArea *
    fullFlowHydraulicRadius **
      (
        2 / 3
      ) *
    Math.sqrt(
      criticalSlope,
    )

  const flowToFullCapacityRatio =
    input.volumetricFlowRate /
    fullFlowCapacityAtCriticalSlope

  const averageBoundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    criticalHydraulicRadius *
    criticalSlope

  const hydraulicPowerDissipationPerUnitLength =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    criticalSlope

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    criticalSlope,

    criticalSlopePercent,

    criticalSlopePerMille,

    critical.criticalDepth,

    critical.criticalDepthRatio,

    critical.criticalSpecificEnergy,

    criticalFlowArea,

    critical.criticalTopWidth,

    critical.criticalWettedPerimeter,

    criticalHydraulicRadius,

    critical.criticalHydraulicDepth,

    critical.criticalVelocity,

    critical.criticalWaveCelerity,

    critical.criticalFroudeNumber,

    manningConveyance,

    fullFlowCapacityAtCriticalSlope,

    flowToFullCapacityRatio,

    averageBoundaryShearStress,

    hydraulicPowerDissipationPerUnitLength,

    massFlowRate,
  ]

  const reconstructedFlow =
    manningConveyance *
    Math.sqrt(
      criticalSlope,
    )

  const flowClosureTolerance =
    Math.max(
      1e-10,
      input.volumetricFlowRate *
      1e-9,
    )

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <=
        0,
    ) ||
    Math.abs(
      reconstructedFlow -
      input.volumetricFlowRate
    ) >
      flowClosureTolerance ||
    Math.abs(
      critical.criticalFroudeNumber -
      1
    ) >
      1e-9
  ) {
    throw new PartiallyFullCircularChannelCriticalSlopeError(
      'NUMERICAL_FAILURE',
      'Circular-channel critical-slope solution failed its Manning-flow or critical-state closure checks.',
    )
  }

  return {
    criticalSlope,

    criticalSlopePercent,

    criticalSlopePerMille,

    criticalDepth:
      critical.criticalDepth,

    criticalDepthRatio:
      critical.criticalDepthRatio,

    criticalSpecificEnergy:
      critical.criticalSpecificEnergy,

    criticalFlowArea,

    criticalTopWidth:
      critical.criticalTopWidth,

    criticalWettedPerimeter:
      critical.criticalWettedPerimeter,

    criticalHydraulicRadius,

    criticalHydraulicDepth:
      critical.criticalHydraulicDepth,

    criticalVelocity:
      critical.criticalVelocity,

    criticalWaveCelerity:
      critical.criticalWaveCelerity,

    criticalFroudeNumber:
      critical.criticalFroudeNumber,

    manningConveyance,

    fullFlowCapacityAtCriticalSlope,

    flowToFullCapacityRatio,

    averageBoundaryShearStress,

    hydraulicPowerDissipationPerUnitLength,

    massFlowRate,

    slopeClassificationRule:
      'For the same D, Q and n: S0 < Sc gives a mild slope, S0 = Sc gives a critical slope, and S0 > Sc gives a steep slope.',

    modelName:
      'Critical Manning Slope for a Partially Full Circular Channel',

    limitationDescription:
      'Critical slope is the bed slope at which uniform-flow normal depth equals critical depth for the specified circular conduit, discharge and Manning roughness. The calculation assumes steady free-surface flow and excludes pressurized full-pipe conditions.',
  }
}


export function createPartiallyFullCircularChannelCriticalSlopeCsv(
  input:
    PartiallyFullCircularChannelCriticalSlopeInput,
  result:
    PartiallyFullCircularChannelCriticalSlopeResult,
): string {
  const rows = [
    [
      'Partially Full Circular Channel Critical Slope - Manning',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Manning roughness',
      input.manningRoughness,
      '-',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Critical Slope',
      'Value',
      'Unit',
    ],
    [
      'Critical slope',
      result.criticalSlope,
      '-',
    ],
    [
      'Critical slope',
      result.criticalSlopePercent,
      '%',
    ],
    [
      'Critical slope',
      result.criticalSlopePerMille,
      'per mille',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical depth ratio',
      result.criticalDepthRatio,
      '-',
    ],
    [
      'Critical specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Critical flow area',
      result.criticalFlowArea,
      'm2',
    ],
    [
      'Critical hydraulic radius',
      result.criticalHydraulicRadius,
      'm',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Critical Froude number',
      result.criticalFroudeNumber,
      '-',
    ],
    [
      'Manning conveyance',
      result.manningConveyance,
      'm3/s',
    ],
    [
      'Full-flow capacity at critical slope',
      result.fullFlowCapacityAtCriticalSlope,
      'm3/s',
    ],
    [
      'Q / Qfull',
      result.flowToFullCapacityRatio,
      '-',
    ],
    [
      'Average boundary shear stress',
      result.averageBoundaryShearStress,
      'Pa',
    ],
    [
      'Hydraulic power dissipation per unit length',
      result.hydraulicPowerDissipationPerUnitLength,
      'W/m',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Slope classification rule',
      result.slopeClassificationRule,
      '-',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
