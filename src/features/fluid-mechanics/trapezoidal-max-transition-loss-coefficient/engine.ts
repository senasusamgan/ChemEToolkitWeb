import {
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
} from '../trapezoidal-max-discharge-specific-energy/engine.ts'

import {
  calculateTrapezoidalContractionTransitionLoss,
} from '../trapezoidal-contraction-transition-loss/engine.ts'

import type {
  TrapezoidalMaximumTransitionLossCoefficientInput,
  TrapezoidalMaximumTransitionLossCoefficientResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_TRANSITION_LOSS_COEFFICIENT_ENGINE_VERSION =
  'trapezoidal-maximum-transition-loss-coefficient-v1'

export type TrapezoidalMaximumTransitionLossCoefficientErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'LOSSLESS_CONTRACTION_ALREADY_CHOKED'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumTransitionLossCoefficientError
  extends Error {
  readonly code:
    TrapezoidalMaximumTransitionLossCoefficientErrorCode

  constructor(
    code:
      TrapezoidalMaximumTransitionLossCoefficientErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumTransitionLossCoefficientError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalMaximumTransitionLossCoefficient(
  input:
    TrapezoidalMaximumTransitionLossCoefficientInput,
): TrapezoidalMaximumTransitionLossCoefficientResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <= 0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.contractedBottomWidth,
    ) ||
    input.contractedBottomWidth <= 0 ||
    input.contractedBottomWidth >=
      input.upstreamBottomWidth
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
      'INVALID_CONTRACTED_WIDTH',
      'Contracted bottom width must be positive and smaller than the upstream bottom width.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
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
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
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
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
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
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const y1 =
    input.upstreamFlowDepth

  const b1 =
    input.upstreamBottomWidth

  const z =
    input.sideSlopeHorizontalPerVertical

  const upstreamFlowArea =
    y1 *
    (
      b1 +
      z *
      y1
    )

  const upstreamTopWidth =
    b1 +
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
    upstreamVelocity *
    upstreamVelocity /
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

  if (
    upstreamFroudeNumber >=
    1 -
    1e-9
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'The maximum allowable transition-loss model requires a clearly subcritical upstream approach flow.',
    )
  }

  const upstreamSpecificEnergy =
    y1 +
    upstreamVelocityHead

  const contractedWidthReduction =
    input.upstreamBottomWidth -
    input.contractedBottomWidth

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const capacity =
    calculateTrapezoidalMaximumDischargeSpecificEnergy({
      bottomWidth:
        input.contractedBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      availableSpecificEnergy:
        upstreamSpecificEnergy,

      fluidDensity:
        input.fluidDensity,
    })

  const losslessMaximumFlowRate =
    capacity.maximumVolumetricFlowRate

  const losslessFlowCapacityMargin =
    losslessMaximumFlowRate -
    input.volumetricFlowRate

  const losslessCapacityRatio =
    losslessMaximumFlowRate /
    input.volumetricFlowRate

  const flowTolerance =
    Math.max(
      1e-10,
      input.volumetricFlowRate *
      1e-10,
    )

  if (
    losslessFlowCapacityMargin <
    -flowTolerance
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
      'LOSSLESS_CONTRACTION_ALREADY_CHOKED',
      'The specified contraction is already choked in the lossless limit, so no non-negative transition-loss coefficient is allowable.',
    )
  }

  const rawMaximumCoefficient =
    losslessCapacityRatio *
    losslessCapacityRatio -
    1

  const maximumAllowableTransitionLossCoefficient =
    Math.max(
      0,
      rawMaximumCoefficient,
    )

  const lossAdjustedControlDepth =
    capacity.criticalDepth

  const lossAdjustedControlFlowArea =
    capacity.criticalFlowArea

  const lossAdjustedControlTopWidth =
    capacity.criticalTopWidth

  const lossAdjustedControlHydraulicDepth =
    capacity.criticalHydraulicDepth

  const lossAdjustedControlVelocity =
    input.volumetricFlowRate /
    lossAdjustedControlFlowArea

  const lossAdjustedControlVelocityHead =
    lossAdjustedControlVelocity *
    lossAdjustedControlVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const lossAdjustedControlFroudeNumber =
    lossAdjustedControlVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      lossAdjustedControlHydraulicDepth,
    )

  const theoreticalControlFroudeNumber =
    1 /
    Math.sqrt(
      1 +
      maximumAllowableTransitionLossCoefficient,
    )

  const controlSpecificEnergyWithoutLoss =
    lossAdjustedControlDepth +
    lossAdjustedControlVelocityHead

  const maximumAllowableTransitionLossHead =
    maximumAllowableTransitionLossCoefficient *
    lossAdjustedControlVelocityHead

  const transitionLossHeadFractionOfUpstreamEnergy =
    maximumAllowableTransitionLossHead /
    upstreamSpecificEnergy

  const minimumRequiredUpstreamSpecificEnergy =
    controlSpecificEnergyWithoutLoss +
    maximumAllowableTransitionLossHead

  const energyClosureResidual =
    minimumRequiredUpstreamSpecificEnergy -
    upstreamSpecificEnergy

  const controlConditionResidual =
    (
      (
        (
          1 +
          maximumAllowableTransitionLossCoefficient
        ) *
        input.volumetricFlowRate *
        input.volumetricFlowRate *
        lossAdjustedControlTopWidth
      ) /
      (
        GRAVITATIONAL_ACCELERATION *
        lossAdjustedControlFlowArea **
          3
      )
    ) -
    1

  const forward =
    calculateTrapezoidalContractionTransitionLoss({
      upstreamBottomWidth:
        input.upstreamBottomWidth,

      contractedBottomWidth:
        input.contractedBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      upstreamFlowDepth:
        input.upstreamFlowDepth,

      transitionLossCoefficient:
        maximumAllowableTransitionLossCoefficient,

      fluidDensity:
        input.fluidDensity,
    })

  const forwardLossAdjustedMinimumWidth =
    forward.lossAdjustedMinimumContractedBottomWidth

  const forwardWidthClosureResidual =
    forwardLossAdjustedMinimumWidth -
    input.contractedBottomWidth

  const forwardAvailableEnergyMargin =
    forward.availableSpecificEnergyMargin

  const forwardThresholdStatus =
    forward.throatStatus

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const maximumAllowableDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    maximumAllowableTransitionLossHead

  const positiveValues = [
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    contractedWidthReduction,

    contractionRatio,

    losslessMaximumFlowRate,

    losslessCapacityRatio,

    lossAdjustedControlDepth,

    lossAdjustedControlFlowArea,

    lossAdjustedControlTopWidth,

    lossAdjustedControlHydraulicDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlVelocityHead,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    minimumRequiredUpstreamSpecificEnergy,

    massFlowRate,
  ]

  const nonNegativeValues = [
    losslessFlowCapacityMargin,

    maximumAllowableTransitionLossCoefficient,

    maximumAllowableTransitionLossHead,

    transitionLossHeadFractionOfUpstreamEnergy,

    maximumAllowableDissipationPower,
  ]

  const energyTolerance =
    Math.max(
      1e-10,
      upstreamSpecificEnergy *
      1e-9,
    )

  const widthTolerance =
    Math.max(
      1e-8,
      input.contractedBottomWidth *
      1e-7,
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
    !nonNegativeValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    nonNegativeValues.some(
      value =>
        value < 0,
    ) ||
    upstreamFroudeNumber >=
      1 ||
    contractionRatio >=
      1 ||
    !Number.isFinite(
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      controlConditionResidual,
    ) ||
    Math.abs(
      controlConditionResidual,
    ) >
      1e-9 ||
    Math.abs(
      lossAdjustedControlFroudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-9 ||
    !Number.isFinite(
      forwardLossAdjustedMinimumWidth,
    ) ||
    Math.abs(
      forwardWidthClosureResidual,
    ) >
      widthTolerance ||
    !Number.isFinite(
      forwardAvailableEnergyMargin,
    ) ||
    Math.abs(
      forwardAvailableEnergyMargin,
    ) >
      energyTolerance ||
    forwardThresholdStatus !==
      'Loss-adjusted choking threshold'
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientError(
      'NUMERICAL_FAILURE',
      'The maximum allowable transition-loss solution failed its control-state, energy or Calculator 441 forward closure checks.',
    )
  }

  return {
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    contractedWidthReduction,

    contractionRatio,

    losslessMaximumFlowRate,

    losslessFlowCapacityMargin,

    losslessCapacityRatio,

    maximumAllowableTransitionLossCoefficient,

    lossAdjustedControlDepth,

    lossAdjustedControlFlowArea,

    lossAdjustedControlTopWidth,

    lossAdjustedControlHydraulicDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlVelocityHead,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    maximumAllowableTransitionLossHead,

    transitionLossHeadFractionOfUpstreamEnergy,

    minimumRequiredUpstreamSpecificEnergy,

    energyClosureResidual,

    controlConditionResidual,

    forwardLossAdjustedMinimumWidth,

    forwardWidthClosureResidual,

    forwardAvailableEnergyMargin,

    forwardThresholdStatus,

    massFlowRate,

    maximumAllowableDissipationPower,

    modelName:
      'Maximum Allowable Transition-Loss Coefficient Before Choking',

    limitationDescription:
      'Inverse one-dimensional contraction-loss analysis for a subcritical trapezoidal-channel approach flow. The calculator determines the largest non-negative lumped coefficient KL in hL = KL·Vthroat²/(2g) that can be tolerated before the specified contraction reaches its minimum-energy choking state. The model assumes unchanged bed elevation, hydrostatic pressure and a constant loss coefficient.',
  }
}

export function createTrapezoidalMaximumTransitionLossCoefficientCsv(
  input:
    TrapezoidalMaximumTransitionLossCoefficientInput,
  result:
    TrapezoidalMaximumTransitionLossCoefficientResult,
): string {
  const rows = [
    [
      'Maximum Allowable Transition-Loss Coefficient Before Choking',
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
      'Maximum allowable transition-loss coefficient',
      result.maximumAllowableTransitionLossCoefficient,
      '-',
    ],
    [
      'Maximum allowable transition-loss head',
      result.maximumAllowableTransitionLossHead,
      'm',
    ],
    [
      'Maximum allowable dissipation power',
      result.maximumAllowableDissipationPower,
      'W',
    ],
    [
      'Lossless maximum flow rate',
      result.losslessMaximumFlowRate,
      'm3/s',
    ],
    [
      'Lossless flow-capacity margin',
      result.losslessFlowCapacityMargin,
      'm3/s',
    ],
    [
      'Lossless capacity ratio',
      result.losslessCapacityRatio,
      '-',
    ],
    [
      'Loss-adjusted control depth',
      result.lossAdjustedControlDepth,
      'm',
    ],
    [
      'Loss-adjusted control flow area',
      result.lossAdjustedControlFlowArea,
      'm2',
    ],
    [
      'Loss-adjusted control top width',
      result.lossAdjustedControlTopWidth,
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
      'Control specific energy without loss',
      result.controlSpecificEnergyWithoutLoss,
      'm',
    ],
    [
      'Minimum required upstream specific energy',
      result.minimumRequiredUpstreamSpecificEnergy,
      'm',
    ],
    [
      'Energy closure residual',
      result.energyClosureResidual,
      'm',
    ],
    [
      'Control-condition residual',
      result.controlConditionResidual,
      '-',
    ],
    [
      'Forward loss-adjusted minimum width',
      result.forwardLossAdjustedMinimumWidth,
      'm',
    ],
    [
      'Forward width closure residual',
      result.forwardWidthClosureResidual,
      'm',
    ],
    [
      'Forward threshold status',
      result.forwardThresholdStatus,
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
