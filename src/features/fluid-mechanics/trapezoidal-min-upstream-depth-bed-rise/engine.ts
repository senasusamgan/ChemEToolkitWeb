import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import {
  calculateTrapezoidalChannelAlternateDepth,
} from '../trapezoidal-channel-alternate-depth/engine.ts'

import {
  calculateTrapezoidalMaximumBedRiseBeforeChoking,
} from '../trapezoidal-max-bed-rise-choking/engine.ts'

import type {
  TrapezoidalMinimumUpstreamDepthBedRiseInput,
  TrapezoidalMinimumUpstreamDepthBedRiseResult,
} from './types.ts'

export const TRAPEZOIDAL_MINIMUM_UPSTREAM_DEPTH_BED_RISE_ENGINE_VERSION =
  'trapezoidal-minimum-upstream-depth-bed-rise-v1'

export type TrapezoidalMinimumUpstreamDepthBedRiseErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_BED_RISE'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMinimumUpstreamDepthBedRiseError
  extends Error {
  readonly code:
    TrapezoidalMinimumUpstreamDepthBedRiseErrorCode

  constructor(
    code:
      TrapezoidalMinimumUpstreamDepthBedRiseErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMinimumUpstreamDepthBedRiseError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalMinimumUpstreamDepthBedRise(
  input:
    TrapezoidalMinimumUpstreamDepthBedRiseInput,
): TrapezoidalMinimumUpstreamDepthBedRiseResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseError(
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
    throw new TrapezoidalMinimumUpstreamDepthBedRiseError(
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
    throw new TrapezoidalMinimumUpstreamDepthBedRiseError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.bedRise,
    ) ||
    input.bedRise <= 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseError(
      'INVALID_BED_RISE',
      'Bed rise must be a positive finite value so that the required upstream state is distinctly subcritical.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

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

  const criticalSpecificEnergy =
    critical.specificEnergy

  const requiredUpstreamSpecificEnergy =
    criticalSpecificEnergy +
    input.bedRise

  const alternate =
    calculateTrapezoidalChannelAlternateDepth({
      bottomWidth:
        input.bottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      specificEnergy:
        requiredUpstreamSpecificEnergy,

      fluidDensity:
        input.fluidDensity,
    })

  const minimumSubcriticalUpstreamDepth =
    alternate.deepDepth

  const alternateSupercriticalDepth =
    alternate.shallowDepth

  const upstreamFlowArea =
    alternate.deepFlowArea

  const upstreamTopWidth =
    alternate.deepTopWidth

  const upstreamHydraulicDepth =
    alternate.deepHydraulicDepth

  const upstreamVelocity =
    alternate.deepVelocity

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
    alternate.deepFroudeNumber

  const alternateVelocity =
    alternate.shallowVelocity

  const alternateFroudeNumber =
    alternate.shallowFroudeNumber

  const depthAboveCritical =
    minimumSubcriticalUpstreamDepth -
    criticalDepth

  const upstreamDepthToCriticalDepthRatio =
    minimumSubcriticalUpstreamDepth /
    criticalDepth

  const crestWaterSurfaceElevationChange =
    input.bedRise +
    criticalDepth -
    minimumSubcriticalUpstreamDepth

  const forward =
    calculateTrapezoidalMaximumBedRiseBeforeChoking({
      bottomWidth:
        input.bottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      upstreamFlowDepth:
        minimumSubcriticalUpstreamDepth,

      fluidDensity:
        input.fluidDensity,
    })

  const forwardMaximumBedRise =
    forward.maximumBedRise

  const bedRiseClosureResidual =
    forwardMaximumBedRise -
    input.bedRise

  const upstreamEnergyResidual =
    alternate.deepRecoveredSpecificEnergy -
    requiredUpstreamSpecificEnergy

  const alternateEnergyResidual =
    alternate.shallowRecoveredSpecificEnergy -
    requiredUpstreamSpecificEnergy

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    criticalDepth,

    criticalSpecificEnergy,

    requiredUpstreamSpecificEnergy,

    minimumSubcriticalUpstreamDepth,

    alternateSupercriticalDepth,

    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    alternateVelocity,

    alternateFroudeNumber,

    depthAboveCritical,

    upstreamDepthToCriticalDepthRatio,

    forwardMaximumBedRise,

    massFlowRate,
  ]

  const energyTolerance =
    Math.max(
      1e-10,
      requiredUpstreamSpecificEnergy *
      1e-9,
    )

  const bedRiseTolerance =
    Math.max(
      1e-10,
      input.bedRise *
      1e-8,
    )

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    minimumSubcriticalUpstreamDepth <=
      criticalDepth ||
    alternateSupercriticalDepth >=
      criticalDepth ||
    upstreamFroudeNumber >=
      1 ||
    alternateFroudeNumber <=
      1 ||
    !Number.isFinite(
      crestWaterSurfaceElevationChange,
    ) ||
    !Number.isFinite(
      bedRiseClosureResidual,
    ) ||
    Math.abs(
      bedRiseClosureResidual,
    ) >
      bedRiseTolerance ||
    !Number.isFinite(
      upstreamEnergyResidual,
    ) ||
    Math.abs(
      upstreamEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      alternateEnergyResidual,
    ) ||
    Math.abs(
      alternateEnergyResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseError(
      'NUMERICAL_FAILURE',
      'The minimum upstream-depth solution failed its specific-energy, Froude or forward choking closure checks.',
    )
  }

  return {
    criticalDepth,

    criticalSpecificEnergy,

    requiredUpstreamSpecificEnergy,

    minimumSubcriticalUpstreamDepth,

    alternateSupercriticalDepth,

    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    alternateVelocity,

    alternateFroudeNumber,

    depthAboveCritical,

    upstreamDepthToCriticalDepthRatio,

    crestWaterSurfaceElevationChange,

    forwardMaximumBedRise,

    bedRiseClosureResidual,

    upstreamEnergyResidual,

    alternateEnergyResidual,

    massFlowRate,

    modelName:
      'Minimum Upstream Depth for a Specified Bed Rise Before Choking',

    limitationDescription:
      'Inverse lossless hump design for a symmetric trapezoidal open channel. The calculator finds the minimum subcritical upstream depth whose specific energy is exactly sufficient for the specified bed rise to reach critical flow at the crest. Deeper subcritical approach states provide additional choking margin. Local losses and transition losses are neglected.',
  }
}

export function createTrapezoidalMinimumUpstreamDepthBedRiseCsv(
  input:
    TrapezoidalMinimumUpstreamDepthBedRiseInput,
  result:
    TrapezoidalMinimumUpstreamDepthBedRiseResult,
): string {
  const rows = [
    [
      'Minimum Upstream Depth for a Specified Bed Rise Before Choking',
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
      'Specified bed rise',
      input.bedRise,
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
      'Minimum subcritical upstream depth',
      result.minimumSubcriticalUpstreamDepth,
      'm',
    ],
    [
      'Critical crest depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Required upstream specific energy',
      result.requiredUpstreamSpecificEnergy,
      'm',
    ],
    [
      'Upstream flow area',
      result.upstreamFlowArea,
      'm2',
    ],
    [
      'Upstream velocity',
      result.upstreamVelocity,
      'm/s',
    ],
    [
      'Upstream Froude number',
      result.upstreamFroudeNumber,
      '-',
    ],
    [
      'Alternate supercritical depth',
      result.alternateSupercriticalDepth,
      'm',
    ],
    [
      'Alternate supercritical velocity',
      result.alternateVelocity,
      'm/s',
    ],
    [
      'Alternate supercritical Froude number',
      result.alternateFroudeNumber,
      '-',
    ],
    [
      'Depth above critical',
      result.depthAboveCritical,
      'm',
    ],
    [
      'Upstream depth / critical depth',
      result.upstreamDepthToCriticalDepthRatio,
      '-',
    ],
    [
      'Crest water-surface elevation change',
      result.crestWaterSurfaceElevationChange,
      'm',
    ],
    [
      'Forward maximum bed rise',
      result.forwardMaximumBedRise,
      'm',
    ],
    [
      'Bed-rise closure residual',
      result.bedRiseClosureResidual,
      'm',
    ],
    [
      'Upstream energy residual',
      result.upstreamEnergyResidual,
      'm',
    ],
    [
      'Alternate energy residual',
      result.alternateEnergyResidual,
      'm',
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
