import {
  calculateTrapezoidalChannelAlternateDepth,
} from '../trapezoidal-channel-alternate-depth/engine.ts'

import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalMinimumUpstreamDepthContractionLossInput,
  TrapezoidalMinimumUpstreamDepthContractionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_MINIMUM_UPSTREAM_DEPTH_CONTRACTION_LOSS_ENGINE_VERSION =
  'trapezoidal-minimum-upstream-depth-contraction-loss-v1'

export type TrapezoidalMinimumUpstreamDepthContractionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NO_DISTINCT_SUBCRITICAL_APPROACH'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMinimumUpstreamDepthContractionLossError
  extends Error {
  readonly code:
    TrapezoidalMinimumUpstreamDepthContractionLossErrorCode

  constructor(
    code:
      TrapezoidalMinimumUpstreamDepthContractionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMinimumUpstreamDepthContractionLossError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface ControlState {
  depth: number

  flowArea: number

  topWidth: number

  hydraulicDepth: number

  velocity: number

  velocityHead: number

  froudeNumber: number

  specificEnergyWithoutLoss: number

  transitionLossHead: number

  requiredSpecificEnergy: number

  controlConditionResidual: number
}

function calculateLossAdjustedControlState(
  input:
    TrapezoidalMinimumUpstreamDepthContractionLossInput,
): ControlState {
  const residualAt =
    (
      depth: number,
    ) => {
      const flowArea =
        depth *
        (
          input.contractedBottomWidth +
          input.sideSlopeHorizontalPerVertical *
          depth
        )

      const topWidth =
        input.contractedBottomWidth +
        2 *
        input.sideSlopeHorizontalPerVertical *
        depth

      return (
        (
          (
            1 +
            input.transitionLossCoefficient
          ) *
          input.volumetricFlowRate *
          input.volumetricFlowRate *
          topWidth
        ) /
        (
          GRAVITATIONAL_ACCELERATION *
          flowArea **
            3
        ) -
        1
      )
    }

  let lower =
    1e-12

  let upper =
    1

  let lowerResidual =
    residualAt(
      lower,
    )

  let upperResidual =
    residualAt(
      upper,
    )

  let expansions =
    0

  while (
    upperResidual >
    0
  ) {
    upper *=
      2

    expansions +=
      1

    if (
      expansions >
        100 ||
      !Number.isFinite(
        upper,
      ) ||
      upper >
        1e12
    ) {
      throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
        'ROOT_BRACKETING_FAILURE',
        'Could not bracket the loss-adjusted contraction control depth.',
      )
    }

    upperResidual =
      residualAt(
        upper,
      )
  }

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual <=
      0 ||
    upperResidual >=
      0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'ROOT_BRACKETING_FAILURE',
      'The loss-adjusted control-depth bracket is invalid.',
    )
  }

  let depth =
    (
      lower +
      upper
    ) /
    2

  for (
    let iteration = 1;
    iteration <= 250;
    iteration += 1
  ) {
    depth =
      (
        lower +
        upper
      ) /
      2

    const residual =
      residualAt(
        depth,
      )

    if (
      Math.abs(
        residual,
      ) <=
      1e-13
    ) {
      break
    }

    if (
      residual >
      0
    ) {
      lower =
        depth

      lowerResidual =
        residual
    } else {
      upper =
        depth

      upperResidual =
        residual
    }

    if (
      iteration ===
      250
    ) {
      throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
        'ROOT_CONVERGENCE_FAILURE',
        'The loss-adjusted control-depth solver did not converge within 250 iterations.',
      )
    }
  }

  const flowArea =
    depth *
    (
      input.contractedBottomWidth +
      input.sideSlopeHorizontalPerVertical *
      depth
    )

  const topWidth =
    input.contractedBottomWidth +
    2 *
    input.sideSlopeHorizontalPerVertical *
    depth

  const hydraulicDepth =
    flowArea /
    topWidth

  const velocity =
    input.volumetricFlowRate /
    flowArea

  const velocityHead =
    velocity *
    velocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const froudeNumber =
    velocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const specificEnergyWithoutLoss =
    depth +
    velocityHead

  const transitionLossHead =
    input.transitionLossCoefficient *
    velocityHead

  const requiredSpecificEnergy =
    specificEnergyWithoutLoss +
    transitionLossHead

  return {
    depth,

    flowArea,

    topWidth,

    hydraulicDepth,

    velocity,

    velocityHead,

    froudeNumber,

    specificEnergyWithoutLoss,

    transitionLossHead,

    requiredSpecificEnergy,

    controlConditionResidual:
      residualAt(
        depth,
      ),
  }
}

export function calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
  input:
    TrapezoidalMinimumUpstreamDepthContractionLossInput,
): TrapezoidalMinimumUpstreamDepthContractionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <=
      0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.contractedBottomWidth,
    ) ||
    input.contractedBottomWidth <=
      0 ||
    input.contractedBottomWidth >=
      input.upstreamBottomWidth
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'INVALID_CONTRACTED_WIDTH',
      'Contracted bottom width must be positive and smaller than the upstream bottom width.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical <
      0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.transitionLossCoefficient,
    ) ||
    input.transitionLossCoefficient <
      0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'INVALID_LOSS_COEFFICIENT',
      'Transition-loss coefficient KL must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const upstreamCritical =
    calculateTrapezoidalChannelCriticalDepth({
      bottomWidth:
        input.upstreamBottomWidth,

      volumetricFlowRate:
        input.volumetricFlowRate,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  const upstreamCriticalDepth =
    upstreamCritical.criticalDepth

  const upstreamCriticalSpecificEnergy =
    upstreamCritical.specificEnergy

  const control =
    calculateLossAdjustedControlState(
      input,
    )

  const requiredUpstreamSpecificEnergy =
    control.requiredSpecificEnergy

  const energySeparationTolerance =
    Math.max(
      1e-10,
      upstreamCriticalSpecificEnergy *
      1e-9,
    )

  if (
    requiredUpstreamSpecificEnergy <=
    upstreamCriticalSpecificEnergy +
      energySeparationTolerance
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'NO_DISTINCT_SUBCRITICAL_APPROACH',
      'The required contraction energy does not produce a distinct subcritical upstream approach-depth root.',
    )
  }

  const alternate =
    calculateTrapezoidalChannelAlternateDepth({
      bottomWidth:
        input.upstreamBottomWidth,

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

  const alternateSupercriticalUpstreamDepth =
    alternate.shallowDepth

  const requiredUpstreamFlowArea =
    alternate.deepFlowArea

  const requiredUpstreamTopWidth =
    alternate.deepTopWidth

  const requiredUpstreamHydraulicDepth =
    alternate.deepHydraulicDepth

  const requiredUpstreamVelocity =
    alternate.deepVelocity

  const requiredUpstreamVelocityHead =
    requiredUpstreamVelocity *
    requiredUpstreamVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const requiredUpstreamFroudeNumber =
    alternate.deepFroudeNumber

  const alternateUpstreamVelocity =
    alternate.shallowVelocity

  const alternateUpstreamFroudeNumber =
    alternate.shallowFroudeNumber

  const depthAboveUpstreamCritical =
    minimumSubcriticalUpstreamDepth -
    upstreamCriticalDepth

  const upstreamDepthToCriticalDepthRatio =
    minimumSubcriticalUpstreamDepth /
    upstreamCriticalDepth

  const contractedWidthReduction =
    input.upstreamBottomWidth -
    input.contractedBottomWidth

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const theoreticalControlFroudeNumber =
    1 /
    Math.sqrt(
      1 +
      input.transitionLossCoefficient,
    )

  const waterSurfaceElevationChangeAtThreshold =
    control.depth -
    minimumSubcriticalUpstreamDepth

  const subcriticalEnergyResidual =
    alternate.deepRecoveredSpecificEnergy -
    requiredUpstreamSpecificEnergy

  const alternateEnergyResidual =
    alternate.shallowRecoveredSpecificEnergy -
    requiredUpstreamSpecificEnergy

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const transitionLossDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    control.transitionLossHead

  const positiveValues = [
    upstreamCriticalDepth,

    upstreamCriticalSpecificEnergy,

    minimumSubcriticalUpstreamDepth,

    alternateSupercriticalUpstreamDepth,

    requiredUpstreamFlowArea,

    requiredUpstreamTopWidth,

    requiredUpstreamHydraulicDepth,

    requiredUpstreamVelocity,

    requiredUpstreamVelocityHead,

    requiredUpstreamFroudeNumber,

    alternateUpstreamVelocity,

    alternateUpstreamFroudeNumber,

    depthAboveUpstreamCritical,

    upstreamDepthToCriticalDepthRatio,

    contractedWidthReduction,

    contractionRatio,

    control.depth,

    control.flowArea,

    control.topWidth,

    control.hydraulicDepth,

    control.velocity,

    control.velocityHead,

    control.froudeNumber,

    theoreticalControlFroudeNumber,

    control.specificEnergyWithoutLoss,

    requiredUpstreamSpecificEnergy,

    massFlowRate,
  ]

  const nonNegativeValues = [
    control.transitionLossHead,

    transitionLossDissipationPower,
  ]

  const energyTolerance =
    Math.max(
      1e-10,
      requiredUpstreamSpecificEnergy *
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
    !nonNegativeValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    nonNegativeValues.some(
      value =>
        value <
        0,
    ) ||
    minimumSubcriticalUpstreamDepth <=
      upstreamCriticalDepth ||
    alternateSupercriticalUpstreamDepth >=
      upstreamCriticalDepth ||
    requiredUpstreamFroudeNumber >=
      1 ||
    alternateUpstreamFroudeNumber <=
      1 ||
    contractionRatio >=
      1 ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtThreshold,
    ) ||
    !Number.isFinite(
      subcriticalEnergyResidual,
    ) ||
    Math.abs(
      subcriticalEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      alternateEnergyResidual,
    ) ||
    Math.abs(
      alternateEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      control.controlConditionResidual,
    ) ||
    Math.abs(
      control.controlConditionResidual,
    ) >
      1e-9 ||
    Math.abs(
      control.froudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-9
  ) {
    throw new TrapezoidalMinimumUpstreamDepthContractionLossError(
      'NUMERICAL_FAILURE',
      'The minimum upstream-depth solution failed its energy, alternate-depth or loss-adjusted control-state checks.',
    )
  }

  return {
    upstreamCriticalDepth,

    upstreamCriticalSpecificEnergy,

    minimumSubcriticalUpstreamDepth,

    alternateSupercriticalUpstreamDepth,

    requiredUpstreamFlowArea,

    requiredUpstreamTopWidth,

    requiredUpstreamHydraulicDepth,

    requiredUpstreamVelocity,

    requiredUpstreamVelocityHead,

    requiredUpstreamFroudeNumber,

    alternateUpstreamVelocity,

    alternateUpstreamFroudeNumber,

    depthAboveUpstreamCritical,

    upstreamDepthToCriticalDepthRatio,

    contractedWidthReduction,

    contractionRatio,

    lossAdjustedControlDepth:
      control.depth,

    lossAdjustedControlFlowArea:
      control.flowArea,

    lossAdjustedControlTopWidth:
      control.topWidth,

    lossAdjustedControlHydraulicDepth:
      control.hydraulicDepth,

    lossAdjustedControlVelocity:
      control.velocity,

    lossAdjustedControlVelocityHead:
      control.velocityHead,

    lossAdjustedControlFroudeNumber:
      control.froudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss:
      control.specificEnergyWithoutLoss,

    transitionLossHeadAtThreshold:
      control.transitionLossHead,

    requiredUpstreamSpecificEnergy,

    waterSurfaceElevationChangeAtThreshold,

    subcriticalEnergyResidual,

    alternateEnergyResidual,

    controlConditionResidual:
      control.controlConditionResidual,

    massFlowRate,

    transitionLossDissipationPower,

    modelName:
      'Minimum Upstream Depth for a Trapezoidal Contraction with Transition Loss',

    limitationDescription:
      'Inverse one-dimensional choking analysis for a specified trapezoidal-channel contraction. The calculator finds the minimum subcritical upstream depth whose specific energy exactly supplies the loss-adjusted minimum-energy throat state, using hL = KL·Vthroat²/(2g). Bed elevation is unchanged and KL is treated as a constant lumped transition-loss coefficient.',
  }
}

export function createTrapezoidalMinimumUpstreamDepthContractionLossCsv(
  input:
    TrapezoidalMinimumUpstreamDepthContractionLossInput,
  result:
    TrapezoidalMinimumUpstreamDepthContractionLossResult,
): string {
  const rows = [
    [
      'Minimum Upstream Depth for a Trapezoidal Contraction with Transition Loss',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Upstream bottom width',
      input.upstreamBottomWidth,
      'm',
    ],
    [
      'Contracted bottom width',
      input.contractedBottomWidth,
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
      'Transition-loss coefficient',
      input.transitionLossCoefficient,
      '-',
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
      'Alternate supercritical upstream depth',
      result.alternateSupercriticalUpstreamDepth,
      'm',
    ],
    [
      'Upstream critical depth',
      result.upstreamCriticalDepth,
      'm',
    ],
    [
      'Upstream critical specific energy',
      result.upstreamCriticalSpecificEnergy,
      'm',
    ],
    [
      'Required upstream specific energy',
      result.requiredUpstreamSpecificEnergy,
      'm',
    ],
    [
      'Required upstream velocity',
      result.requiredUpstreamVelocity,
      'm/s',
    ],
    [
      'Required upstream Froude number',
      result.requiredUpstreamFroudeNumber,
      '-',
    ],
    [
      'Loss-adjusted control depth',
      result.lossAdjustedControlDepth,
      'm',
    ],
    [
      'Loss-adjusted control velocity',
      result.lossAdjustedControlVelocity,
      'm/s',
    ],
    [
      'Loss-adjusted control Froude number',
      result.lossAdjustedControlFroudeNumber,
      '-',
    ],
    [
      'Theoretical control Froude number',
      result.theoreticalControlFroudeNumber,
      '-',
    ],
    [
      'Transition-loss head at threshold',
      result.transitionLossHeadAtThreshold,
      'm',
    ],
    [
      'Water-surface elevation change at threshold',
      result.waterSurfaceElevationChangeAtThreshold,
      'm',
    ],
    [
      'Subcritical energy residual',
      result.subcriticalEnergyResidual,
      'm',
    ],
    [
      'Alternate energy residual',
      result.alternateEnergyResidual,
      'm',
    ],
    [
      'Control-condition residual',
      result.controlConditionResidual,
      '-',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Transition-loss dissipation power',
      result.transitionLossDissipationPower,
      'W',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
