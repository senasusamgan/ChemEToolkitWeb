import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalMaximumBedRiseBeforeChokingInput,
  TrapezoidalMaximumBedRiseBeforeChokingResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_BED_RISE_BEFORE_CHOKING_ENGINE_VERSION =
  'trapezoidal-maximum-bed-rise-before-choking-v1'

export type TrapezoidalMaximumBedRiseBeforeChokingErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'NO_POSITIVE_BED_RISE_MARGIN'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumBedRiseBeforeChokingError
  extends Error {
  readonly code:
    TrapezoidalMaximumBedRiseBeforeChokingErrorCode

  constructor(
    code:
      TrapezoidalMaximumBedRiseBeforeChokingErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumBedRiseBeforeChokingError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalMaximumBedRiseBeforeChoking(
  input:
    TrapezoidalMaximumBedRiseBeforeChokingInput,
): TrapezoidalMaximumBedRiseBeforeChokingResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamFlowDepth,
    ) ||
    input.upstreamFlowDepth <= 0
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const b =
    input.bottomWidth

  const z =
    input.sideSlopeHorizontalPerVertical

  const y1 =
    input.upstreamFlowDepth

  const upstreamFlowArea =
    y1 *
    (
      b +
      z *
      y1
    )

  const upstreamTopWidth =
    b +
    2 *
    z *
    y1

  const upstreamHydraulicDepth =
    upstreamFlowArea /
    upstreamTopWidth

  const upstreamVelocity =
    input.volumetricFlowRate /
    upstreamFlowArea

  const upstreamVelocityHead =
    (
      upstreamVelocity *
      upstreamVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const upstreamFroudeNumber =
    upstreamVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      upstreamHydraulicDepth,
    )

  const upstreamSpecificEnergy =
    y1 +
    upstreamVelocityHead

  const critical =
    calculateTrapezoidalChannelCriticalDepth({
      bottomWidth:
        input.bottomWidth,

      volumetricFlowRate:
        input.volumetricFlowRate,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  const criticalDepth =
    critical.criticalDepth

  const criticalFlowArea =
    criticalDepth *
    (
      b +
      z *
      criticalDepth
    )

  const criticalTopWidth =
    b +
    2 *
    z *
    criticalDepth

  const criticalHydraulicDepth =
    criticalFlowArea /
    criticalTopWidth

  const criticalVelocity =
    input.volumetricFlowRate /
    criticalFlowArea

  const criticalVelocityHead =
    (
      criticalVelocity *
      criticalVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const criticalFroudeNumber =
    criticalVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      criticalHydraulicDepth,
    )

  const criticalSpecificEnergy =
    criticalDepth +
    criticalVelocityHead

  if (
    upstreamFroudeNumber >=
    1 -
    1e-9
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'This hump-choking model requires a clearly subcritical upstream approach flow.',
    )
  }

  const maximumBedRise =
    upstreamSpecificEnergy -
    criticalSpecificEnergy

  const bedRiseTolerance =
    Math.max(
      1e-12,
      upstreamSpecificEnergy *
      1e-10,
    )

  if (
    maximumBedRise <=
    bedRiseTolerance
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'NO_POSITIVE_BED_RISE_MARGIN',
      'The upstream state has no positive bed-rise margin before reaching critical flow.',
    )
  }

  const maximumBedRiseToUpstreamDepthRatio =
    maximumBedRise /
    y1

  const availableEnergyMarginFraction =
    maximumBedRise /
    upstreamSpecificEnergy

  const crestWaterSurfaceElevationRelativeToUpstreamBed =
    maximumBedRise +
    criticalDepth

  const waterSurfaceElevationChangeAtChoking =
    crestWaterSurfaceElevationRelativeToUpstreamBed -
    y1

  const specificEnergyClosureResidual =
    (
      upstreamSpecificEnergy -
      maximumBedRise
    ) -
    criticalSpecificEnergy

  const criticalConditionResidual =
    (
      input.volumetricFlowRate *
      input.volumetricFlowRate *
      criticalTopWidth
    ) /
    (
      GRAVITATIONAL_ACCELERATION *
      criticalFlowArea **
        3
    ) -
    1

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    criticalDepth,

    criticalFlowArea,

    criticalTopWidth,

    criticalHydraulicDepth,

    criticalVelocity,

    criticalVelocityHead,

    criticalFroudeNumber,

    criticalSpecificEnergy,

    maximumBedRise,

    maximumBedRiseToUpstreamDepthRatio,

    availableEnergyMarginFraction,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    massFlowRate,
  ]

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    upstreamFroudeNumber >=
      1 ||
    Math.abs(
      criticalFroudeNumber -
      1
    ) >
      1e-8 ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtChoking,
    ) ||
    !Number.isFinite(
      specificEnergyClosureResidual,
    ) ||
    Math.abs(
      specificEnergyClosureResidual,
    ) >
      1e-10 ||
    !Number.isFinite(
      criticalConditionResidual,
    ) ||
    Math.abs(
      criticalConditionResidual,
    ) >
      1e-8
  ) {
    throw new TrapezoidalMaximumBedRiseBeforeChokingError(
      'NUMERICAL_FAILURE',
      'The bed-rise choking calculation failed its critical-flow or specific-energy closure checks.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    volumetricFlowRate:
      input.volumetricFlowRate,

    upstreamFlowDepth:
      input.upstreamFlowDepth,

    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    criticalDepth,

    criticalFlowArea,

    criticalTopWidth,

    criticalHydraulicDepth,

    criticalVelocity,

    criticalVelocityHead,

    criticalFroudeNumber,

    criticalSpecificEnergy,

    maximumBedRise,

    maximumBedRiseToUpstreamDepthRatio,

    availableEnergyMarginFraction,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    waterSurfaceElevationChangeAtChoking,

    specificEnergyClosureResidual,

    criticalConditionResidual,

    massFlowRate,

    modelName:
      'Maximum Trapezoidal Channel Bed Rise Before Choking',

    limitationDescription:
      'One-dimensional lossless hump/control-section analysis for a subcritical approach flow in a symmetric trapezoidal channel. The maximum bed rise equals the difference between upstream specific energy and the minimum critical specific energy for the same discharge and geometry. Local losses, transitions, sediment effects and non-hydrostatic pressure are neglected.',
  }
}

export function createTrapezoidalMaximumBedRiseBeforeChokingCsv(
  input:
    TrapezoidalMaximumBedRiseBeforeChokingInput,
  result:
    TrapezoidalMaximumBedRiseBeforeChokingResult,
): string {
  const rows = [
    [
      'Maximum Trapezoidal Channel Bed Rise Before Choking',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Bottom width',
      input.bottomWidth,
      'm',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Upstream flow depth',
      input.upstreamFlowDepth,
      'm',
    ],
    [
      'Fluid density',
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
      'Maximum bed rise before choking',
      result.maximumBedRise,
      'm',
    ],
    [
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Critical specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Upstream Froude number',
      result.upstreamFroudeNumber,
      '-',
    ],
    [
      'Critical Froude number',
      result.criticalFroudeNumber,
      '-',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical flow area',
      result.criticalFlowArea,
      'm2',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Bed rise / upstream depth',
      result.maximumBedRiseToUpstreamDepthRatio,
      '-',
    ],
    [
      'Available energy margin fraction',
      result.availableEnergyMarginFraction,
      '-',
    ],
    [
      'Crest water-surface elevation relative to upstream bed',
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      'm',
    ],
    [
      'Water-surface elevation change at choking',
      result.waterSurfaceElevationChangeAtChoking,
      'm',
    ],
    [
      'Specific-energy closure residual',
      result.specificEnergyClosureResidual,
      'm',
    ],
    [
      'Critical-condition residual',
      result.criticalConditionResidual,
      '-',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
