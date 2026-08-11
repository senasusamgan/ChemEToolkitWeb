import {
  calculateTrapezoidalChannelManningFlow,
} from '../trapezoidal-channel-manning-flow/engine.ts'

import type {
  MostEconomicalTrapezoidalChannelInput,
  MostEconomicalTrapezoidalChannelResult,
} from './types.ts'

export const MOST_ECONOMICAL_TRAPEZOIDAL_CHANNEL_ENGINE_VERSION =
  'most-economical-trapezoidal-channel-v1'

export type MostEconomicalTrapezoidalChannelErrorCode =
  | 'INVALID_FLOW_RATE'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class MostEconomicalTrapezoidalChannelError
  extends Error {
  readonly code:
    MostEconomicalTrapezoidalChannelErrorCode

  constructor(
    code:
      MostEconomicalTrapezoidalChannelErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MostEconomicalTrapezoidalChannelError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateMostEconomicalTrapezoidalChannel(
  input:
    MostEconomicalTrapezoidalChannelInput,
): MostEconomicalTrapezoidalChannelResult {
  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new MostEconomicalTrapezoidalChannelError(
      'INVALID_FLOW_RATE',
      'Design volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <= 0
  ) {
    throw new MostEconomicalTrapezoidalChannelError(
      'INVALID_CHANNEL_SLOPE',
      'Channel energy slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <= 0
  ) {
    throw new MostEconomicalTrapezoidalChannelError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new MostEconomicalTrapezoidalChannelError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new MostEconomicalTrapezoidalChannelError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const z =
    input.sideSlopeHorizontalPerVertical

  const sideGeometry =
    Math.sqrt(
      1 +
      z *
      z,
    )

  const geometryFactor =
    2 *
    sideGeometry -
    z

  const depthBase =
    (
      input.volumetricFlowRate *
      input.manningRoughness *
      2 **
        (
          2 / 3
        )
    ) /
    (
      geometryFactor *
      Math.sqrt(
        input.channelSlope,
      )
    )

  const flowDepth =
    depthBase **
      (
        3 / 8
      )

  const bottomWidth =
    2 *
    flowDepth *
    (
      sideGeometry -
      z
    )

  const topWidth =
    bottomWidth +
    2 *
    z *
    flowDepth

  const flowArea =
    flowDepth *
    (
      bottomWidth +
      z *
      flowDepth
    )

  const sideLength =
    flowDepth *
    sideGeometry

  const wettedPerimeter =
    bottomWidth +
    2 *
    sideLength

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const halfTopWidth =
    topWidth /
    2

  const optimumGeometryResidual =
    halfTopWidth -
    sideLength

  const hydraulicRadiusResidual =
    hydraulicRadius -
    flowDepth /
    2

  const bottomWidthToDepthRatio =
    bottomWidth /
    flowDepth

  const meanVelocity =
    input.volumetricFlowRate /
    flowArea

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const flowRegime =
    Math.abs(
      froudeNumber -
      1,
    ) <=
    1e-9
      ? 'critical'
      : froudeNumber < 1
        ? 'subcritical'
        : 'supercritical'

  const specificEnergy =
    flowDepth +
    (
      meanVelocity *
      meanVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const boundaryShearStress =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    hydraulicRadius *
    input.channelSlope

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const hydraulicPowerDissipationPerLength =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    input.channelSlope

  const manningConveyance =
    (
      1 /
      input.manningRoughness
    ) *
    flowArea *
    hydraulicRadius **
      (
        2 / 3
      )

  const forward =
    calculateTrapezoidalChannelManningFlow({
      bottomWidth,

      flowDepth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      channelSlope:
        input.channelSlope,

      manningRoughness:
        input.manningRoughness,

      fluidDensity:
        input.fluidDensity,
    })

  const reconstructedFlowRate =
    forward.volumetricFlowRate

  const flowClosureResidual =
    reconstructedFlowRate -
    input.volumetricFlowRate

  const relativeFlowClosureResidual =
    flowClosureResidual /
    input.volumetricFlowRate

  const positiveValues = [
    flowDepth,

    bottomWidth,

    topWidth,

    flowArea,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    sideLength,

    halfTopWidth,

    bottomWidthToDepthRatio,

    meanVelocity,

    froudeNumber,

    specificEnergy,

    boundaryShearStress,

    massFlowRate,

    hydraulicPowerDissipationPerLength,

    manningConveyance,

    reconstructedFlowRate,

    geometryFactor,
  ]

  const lengthTolerance =
    Math.max(
      1e-12,
      flowDepth *
      1e-10,
    )

  const flowTolerance =
    Math.max(
      1e-12,
      input.volumetricFlowRate *
      1e-10,
    )

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      optimumGeometryResidual,
    ) ||
    Math.abs(
      optimumGeometryResidual,
    ) >
      lengthTolerance ||
    !Number.isFinite(
      hydraulicRadiusResidual,
    ) ||
    Math.abs(
      hydraulicRadiusResidual,
    ) >
      lengthTolerance ||
    !Number.isFinite(
      flowClosureResidual,
    ) ||
    Math.abs(
      flowClosureResidual,
    ) >
      flowTolerance ||
    !Number.isFinite(
      relativeFlowClosureResidual,
    ) ||
    Math.abs(
      relativeFlowClosureResidual,
    ) >
      1e-10
  ) {
    throw new MostEconomicalTrapezoidalChannelError(
      'NUMERICAL_FAILURE',
      'The economical-channel design failed its optimum-geometry or Manning-flow closure checks.',
    )
  }

  return {
    volumetricFlowRate:
      input.volumetricFlowRate,

    channelSlope:
      input.channelSlope,

    manningRoughness:
      input.manningRoughness,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    flowDepth,

    bottomWidth,

    topWidth,

    flowArea,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    sideLength,

    halfTopWidth,

    optimumGeometryResidual,

    hydraulicRadiusResidual,

    bottomWidthToDepthRatio,

    meanVelocity,

    froudeNumber,

    flowRegime,

    specificEnergy,

    boundaryShearStress,

    massFlowRate,

    hydraulicPowerDissipationPerLength,

    manningConveyance,

    reconstructedFlowRate,

    flowClosureResidual,

    relativeFlowClosureResidual,

    geometryFactor,

    modelName:
      'Most Economical Trapezoidal Channel Design — Manning',

    limitationDescription:
      'Analytical best-hydraulic trapezoidal section for a specified side slope, design discharge, Manning roughness and uniform energy slope. The section minimizes wetted perimeter for a given flow area. Freeboard, sediment transport, permissible velocity, lining stability, constructability and gradually varied flow must be checked separately.',
  }
}

export function createMostEconomicalTrapezoidalChannelCsv(
  input:
    MostEconomicalTrapezoidalChannelInput,
  result:
    MostEconomicalTrapezoidalChannelResult,
): string {
  const rows = [
    [
      'Most Economical Trapezoidal Channel Design — Manning',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Design volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Channel slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'Manning roughness',
      input.manningRoughness,
      's/m^(1/3)',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
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
      'Optimal flow depth',
      result.flowDepth,
      'm',
    ],
    [
      'Optimal bottom width',
      result.bottomWidth,
      'm',
    ],
    [
      'Top width',
      result.topWidth,
      'm',
    ],
    [
      'Flow area',
      result.flowArea,
      'm2',
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
      'Side length',
      result.sideLength,
      'm',
    ],
    [
      'Half top width',
      result.halfTopWidth,
      'm',
    ],
    [
      'Optimum geometry residual',
      result.optimumGeometryResidual,
      'm',
    ],
    [
      'Hydraulic radius residual',
      result.hydraulicRadiusResidual,
      'm',
    ],
    [
      'Bottom width to depth ratio',
      result.bottomWidthToDepthRatio,
      '-',
    ],
    [
      'Mean velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Froude number',
      result.froudeNumber,
      '-',
    ],
    [
      'Flow regime',
      result.flowRegime,
      '-',
    ],
    [
      'Specific energy',
      result.specificEnergy,
      'm',
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
    [
      'Hydraulic power dissipation per length',
      result.hydraulicPowerDissipationPerLength,
      'W/m',
    ],
    [
      'Manning conveyance',
      result.manningConveyance,
      'm3/s',
    ],
    [
      'Reconstructed flow rate',
      result.reconstructedFlowRate,
      'm3/s',
    ],
    [
      'Flow closure residual',
      result.flowClosureResidual,
      'm3/s',
    ],
    [
      'Relative flow closure residual',
      result.relativeFlowClosureResidual,
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
