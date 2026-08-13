import {
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
} from '../trapezoidal-max-discharge-specific-energy/engine.ts'

import type {
  TrapezoidalMaximumTransitionLossCoefficientBedRiseInput,
  TrapezoidalMaximumTransitionLossCoefficientBedRiseResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_TRANSITION_LOSS_COEFFICIENT_BED_RISE_ENGINE_VERSION =
  'trapezoidal-maximum-transition-loss-coefficient-bed-rise-v1'

export type TrapezoidalMaximumTransitionLossCoefficientBedRiseErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_BED_RISE'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'NO_AVAILABLE_THROAT_ENERGY'
  | 'LOSSLESS_RAISED_CONTRACTION_ALREADY_CHOKED'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumTransitionLossCoefficientBedRiseError
  extends Error {
  readonly code:
    TrapezoidalMaximumTransitionLossCoefficientBedRiseErrorCode

  constructor(
    code:
      TrapezoidalMaximumTransitionLossCoefficientBedRiseErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumTransitionLossCoefficientBedRiseError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
  input:
    TrapezoidalMaximumTransitionLossCoefficientBedRiseInput,
): TrapezoidalMaximumTransitionLossCoefficientBedRiseResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <=
      0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
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
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
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
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
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
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamFlowDepth,
    ) ||
    input.upstreamFlowDepth <=
      0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.specifiedBedRise,
    ) ||
    input.specifiedBedRise <
      0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'INVALID_BED_RISE',
      'Specified bed rise must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const y1 =
    input.upstreamFlowDepth

  const z =
    input.sideSlopeHorizontalPerVertical

  const upstreamFlowArea =
    y1 *
    (
      input.upstreamBottomWidth +
      z *
      y1
    )

  const upstreamTopWidth =
    input.upstreamBottomWidth +
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
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'The maximum transition-loss design requires a clearly subcritical upstream approach flow.',
    )
  }

  const upstreamSpecificEnergy =
    y1 +
    upstreamVelocityHead

  const availableThroatSpecificEnergy =
    upstreamSpecificEnergy -
    input.specifiedBedRise

  if (
    availableThroatSpecificEnergy <=
    0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'NO_AVAILABLE_THROAT_ENERGY',
      'The specified bed rise consumes all available upstream specific energy.',
    )
  }

  const specifiedBedRiseFractionOfUpstreamEnergy =
    input.specifiedBedRise /
    upstreamSpecificEnergy

  /*
   * At the loss-adjusted choking threshold:
   *
   * (1 + KL) Q² T / (g A³) = 1
   *
   * The lossless capacity calculator evaluates:
   *
   * Qmax,0² T / (g A³) = 1
   *
   * at the same available throat energy.
   *
   * Therefore:
   *
   * 1 + KL,max = (Qmax,0 / Q)²
   */
  const capacity =
    calculateTrapezoidalMaximumDischargeSpecificEnergy({
      bottomWidth:
        input.contractedBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      availableSpecificEnergy:
        availableThroatSpecificEnergy,

      fluidDensity:
        input.fluidDensity,
    })

  const losslessMaximumVolumetricFlowRate =
    capacity.maximumVolumetricFlowRate

  const losslessFlowCapacityMargin =
    losslessMaximumVolumetricFlowRate -
    input.volumetricFlowRate

  const flowTolerance =
    Math.max(
      1e-10,
      input.volumetricFlowRate *
      1e-9,
    )

  if (
    losslessFlowCapacityMargin <
    -flowTolerance
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'LOSSLESS_RAISED_CONTRACTION_ALREADY_CHOKED',
      'The raised contraction is already choked in the lossless limit, so no non-negative transition-loss coefficient is allowable.',
    )
  }

  const losslessCapacityRatio =
    losslessMaximumVolumetricFlowRate /
    input.volumetricFlowRate

  const rawMaximumAllowableTransitionLossCoefficient =
    losslessCapacityRatio *
    losslessCapacityRatio -
    1

  const coefficientRoundoffTolerance =
    Math.max(
      1e-10,
      Math.abs(
        rawMaximumAllowableTransitionLossCoefficient
      ) *
      1e-9,
    )

  const maximumAllowableTransitionLossCoefficient =
    rawMaximumAllowableTransitionLossCoefficient <
      0 &&
    Math.abs(
      rawMaximumAllowableTransitionLossCoefficient,
    ) <=
      coefficientRoundoffTolerance
      ? 0
      : rawMaximumAllowableTransitionLossCoefficient

  if (
    maximumAllowableTransitionLossCoefficient <
    0
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'LOSSLESS_RAISED_CONTRACTION_ALREADY_CHOKED',
      'No non-negative transition-loss coefficient can satisfy the specified raised-contraction flow condition.',
    )
  }

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

  const transitionLossHeadFractionOfAvailableThroatEnergy =
    maximumAllowableTransitionLossHead /
    availableThroatSpecificEnergy

  const minimumRequiredThroatEnergy =
    controlSpecificEnergyWithoutLoss +
    maximumAllowableTransitionLossHead

  const crestWaterSurfaceElevationRelativeToUpstreamBed =
    input.specifiedBedRise +
    lossAdjustedControlDepth

  const waterSurfaceElevationChangeAtThreshold =
    crestWaterSurfaceElevationRelativeToUpstreamBed -
    input.upstreamFlowDepth

  const throatEnergyClosureResidual =
    availableThroatSpecificEnergy -
    minimumRequiredThroatEnergy

  const totalEnergyClosureResidual =
    upstreamSpecificEnergy -
    (
      input.specifiedBedRise +
      minimumRequiredThroatEnergy
    )

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

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const contractedWidthReduction =
    input.upstreamBottomWidth -
    input.contractedBottomWidth

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const maximumTransitionLossDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    maximumAllowableTransitionLossHead

  const bedRisePotentialPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    input.specifiedBedRise

  const combinedBedRiseAndLossPower =
    bedRisePotentialPower +
    maximumTransitionLossDissipationPower

  const positiveValues = [
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    availableThroatSpecificEnergy,

    losslessMaximumVolumetricFlowRate,

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

    minimumRequiredThroatEnergy,

    contractionRatio,

    contractedWidthReduction,

    massFlowRate,
  ]

  const nonNegativeValues = [
    specifiedBedRiseFractionOfUpstreamEnergy,

    losslessFlowCapacityMargin,

    maximumAllowableTransitionLossCoefficient,

    maximumAllowableTransitionLossHead,

    transitionLossHeadFractionOfAvailableThroatEnergy,

    maximumTransitionLossDissipationPower,

    bedRisePotentialPower,

    combinedBedRiseAndLossPower,
  ]

  const energyTolerance =
    Math.max(
      1e-10,
      upstreamSpecificEnergy *
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
    upstreamFroudeNumber >=
      1 ||
    contractionRatio >=
      1 ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtThreshold,
    ) ||
    !Number.isFinite(
      throatEnergyClosureResidual,
    ) ||
    Math.abs(
      throatEnergyClosureResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      totalEnergyClosureResidual,
    ) ||
    Math.abs(
      totalEnergyClosureResidual,
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
      1e-9
  ) {
    throw new TrapezoidalMaximumTransitionLossCoefficientBedRiseError(
      'NUMERICAL_FAILURE',
      'The maximum transition-loss coefficient solution failed its local energy, capacity or loss-adjusted control-state checks.',
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

    availableThroatSpecificEnergy,

    specifiedBedRiseFractionOfUpstreamEnergy,

    losslessMaximumVolumetricFlowRate,

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

    transitionLossHeadFractionOfAvailableThroatEnergy,

    minimumRequiredThroatEnergy,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    waterSurfaceElevationChangeAtThreshold,

    throatEnergyClosureResidual,

    totalEnergyClosureResidual,

    controlConditionResidual,

    contractionRatio,

    contractedWidthReduction,

    massFlowRate,

    maximumTransitionLossDissipationPower,

    bedRisePotentialPower,

    combinedBedRiseAndLossPower,

    capacitySolverIterations:
      capacity.solverIterations,

    modelName:
      'Maximum Allowable Transition-Loss Coefficient with Bed Rise Before Choking',

    limitationDescription:
      'Inverse one-dimensional choking analysis for a subcritical trapezoidal-channel approach with specified lateral contraction and positive bed rise. The calculator determines the largest non-negative lumped coefficient KL in hL = KL·Vthroat²/(2g) that can be tolerated before the raised contracted section reaches its loss-adjusted control state.',
  }
}

export function createTrapezoidalMaximumTransitionLossCoefficientBedRiseCsv(
  input:
    TrapezoidalMaximumTransitionLossCoefficientBedRiseInput,
  result:
    TrapezoidalMaximumTransitionLossCoefficientBedRiseResult,
): string {
  const rows = [
    [
      'Maximum Allowable Transition-Loss Coefficient with Bed Rise Before Choking',
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
      'Specified bed rise',
      input.specifiedBedRise,
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
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Available throat specific energy',
      result.availableThroatSpecificEnergy,
      'm',
    ],
    [
      'Lossless maximum volumetric flow rate',
      result.losslessMaximumVolumetricFlowRate,
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
      'Minimum required throat energy',
      result.minimumRequiredThroatEnergy,
      'm',
    ],
    [
      'Crest water-surface elevation relative to upstream bed',
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      'm',
    ],
    [
      'Water-surface elevation change at threshold',
      result.waterSurfaceElevationChangeAtThreshold,
      'm',
    ],
    [
      'Throat energy closure residual',
      result.throatEnergyClosureResidual,
      'm',
    ],
    [
      'Total energy closure residual',
      result.totalEnergyClosureResidual,
      'm',
    ],
    [
      'Control-condition residual',
      result.controlConditionResidual,
      '-',
    ],
    [
      'Maximum transition-loss dissipation power',
      result.maximumTransitionLossDissipationPower,
      'W',
    ],
    [
      'Bed-rise potential power',
      result.bedRisePotentialPower,
      'W',
    ],
    [
      'Combined bed-rise and loss power',
      result.combinedBedRiseAndLossPower,
      'W',
    ],
    [
      'Capacity solver iterations',
      result.capacitySolverIterations,
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
