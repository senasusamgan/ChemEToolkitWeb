import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import {
  calculateTrapezoidalChannelManningFlow,
} from '../trapezoidal-channel-manning-flow/engine.ts'

import type {
  TrapezoidalChannelCriticalSlopeInput,
  TrapezoidalChannelCriticalSlopeResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_CRITICAL_SLOPE_ENGINE_VERSION =
  'trapezoidal-channel-critical-slope-v1'

export type TrapezoidalChannelCriticalSlopeErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelCriticalSlopeError
  extends Error {
  readonly code:
    TrapezoidalChannelCriticalSlopeErrorCode

  constructor(
    code:
      TrapezoidalChannelCriticalSlopeErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelCriticalSlopeError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalChannelCriticalSlope(
  input:
    TrapezoidalChannelCriticalSlopeInput,
): TrapezoidalChannelCriticalSlopeResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelCriticalSlopeError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalChannelCriticalSlopeError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalChannelCriticalSlopeError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <= 0
  ) {
    throw new TrapezoidalChannelCriticalSlopeError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelCriticalSlopeError(
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

  const geometryTerm =
    critical.flowArea *
    critical.hydraulicRadius **
      (
        2 / 3
      )

  const criticalSlope =
    (
      (
        input.volumetricFlowRate *
        input.manningRoughness
      ) /
      geometryTerm
    ) **
    2

  const criticalSlopePercent =
    criticalSlope *
    100

  const criticalSlopeAngleDegrees =
    Math.atan(
      criticalSlope,
    ) *
    180 /
    Math.PI

  const bedDropPer100m =
    criticalSlope *
    100

  const manningConveyance =
    (
      1 /
      input.manningRoughness
    ) *
    geometryTerm

  const forward =
    calculateTrapezoidalChannelManningFlow({
      bottomWidth:
        input.bottomWidth,

      flowDepth:
        critical.criticalDepth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      channelSlope:
        criticalSlope,

      manningRoughness:
        input.manningRoughness,

      fluidDensity:
        input.fluidDensity,
    })

  const reconstructedVolumetricFlowRate =
    forward.volumetricFlowRate

  const dischargeResidual =
    reconstructedVolumetricFlowRate -
    input.volumetricFlowRate

  const relativeDischargeResidual =
    dischargeResidual /
    input.volumetricFlowRate

  const boundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    critical.hydraulicRadius *
    criticalSlope

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    critical.criticalDepth,

    criticalSlope,

    criticalSlopePercent,

    criticalSlopeAngleDegrees,

    bedDropPer100m,

    critical.flowArea,

    critical.topWidth,

    critical.wettedPerimeter,

    critical.hydraulicRadius,

    critical.hydraulicDepth,

    critical.criticalVelocity,

    critical.froudeNumber,

    critical.specificEnergy,

    manningConveyance,

    reconstructedVolumetricFlowRate,

    boundaryShearStress,

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
    Math.abs(
      critical.froudeNumber -
      1
    ) >
      1e-8 ||
    Math.abs(
      forward.froudeNumber -
      1
    ) >
      1e-8 ||
    !Number.isFinite(
      dischargeResidual,
    ) ||
    !Number.isFinite(
      relativeDischargeResidual,
    ) ||
    Math.abs(
      relativeDischargeResidual,
    ) >
      1e-9
  ) {
    throw new TrapezoidalChannelCriticalSlopeError(
      'NUMERICAL_FAILURE',
      'The critical-slope solution failed its Manning-flow or Froude closure check.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    volumetricFlowRate:
      input.volumetricFlowRate,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    manningRoughness:
      input.manningRoughness,

    criticalDepth:
      critical.criticalDepth,

    criticalSlope,

    criticalSlopePercent,

    criticalSlopeAngleDegrees,

    bedDropPer100m,

    flowArea:
      critical.flowArea,

    topWidth:
      critical.topWidth,

    wettedPerimeter:
      critical.wettedPerimeter,

    hydraulicRadius:
      critical.hydraulicRadius,

    hydraulicDepth:
      critical.hydraulicDepth,

    criticalVelocity:
      critical.criticalVelocity,

    froudeNumber:
      critical.froudeNumber,

    criticalSpecificEnergy:
      critical.specificEnergy,

    manningConveyance,

    reconstructedVolumetricFlowRate,

    dischargeResidual,

    relativeDischargeResidual,

    boundaryShearStress,

    massFlowRate,

    modelName:
      'Trapezoidal Channel Critical Slope',

    limitationDescription:
      'Critical slope is defined here as the Manning energy slope for which uniform-flow normal depth equals the critical depth at the specified discharge. The channel is assumed prismatic and the SI Manning equation is used. Backwater effects, controls, transitions and spatially varying roughness are not included.',
  }
}

export function createTrapezoidalChannelCriticalSlopeCsv(
  input:
    TrapezoidalChannelCriticalSlopeInput,
  result:
    TrapezoidalChannelCriticalSlopeResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Critical Slope',
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
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Manning roughness',
      input.manningRoughness,
      's/m^(1/3)',
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
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical slope',
      result.criticalSlope,
      'm/m',
    ],
    [
      'Critical slope',
      result.criticalSlopePercent,
      '%',
    ],
    [
      'Critical slope angle',
      result.criticalSlopeAngleDegrees,
      'deg',
    ],
    [
      'Bed drop per 100 m',
      result.bedDropPer100m,
      'm/100m',
    ],
    [
      'Flow area',
      result.flowArea,
      'm2',
    ],
    [
      'Top width',
      result.topWidth,
      'm',
    ],
    [
      'Wetted perimeter',
      result.wettedPerimeter,
      'm',
    ],
    [
      'Hydraulic radius',
      result.hydraulicRadius,
      'm',
    ],
    [
      'Hydraulic depth',
      result.hydraulicDepth,
      'm',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Froude number',
      result.froudeNumber,
      '-',
    ],
    [
      'Critical specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Manning conveyance',
      result.manningConveyance,
      'm3/s',
    ],
    [
      'Reconstructed volumetric flow rate',
      result.reconstructedVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Discharge residual',
      result.dischargeResidual,
      'm3/s',
    ],
    [
      'Relative discharge residual',
      result.relativeDischargeResidual,
      '-',
    ],
    [
      'Boundary shear stress',
      result.boundaryShearStress,
      'Pa',
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
