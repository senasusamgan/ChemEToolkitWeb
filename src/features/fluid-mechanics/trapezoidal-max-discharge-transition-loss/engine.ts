import {
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
} from '../trapezoidal-max-discharge-specific-energy/engine.ts'

import {
  calculateTrapezoidalContractionTransitionLoss,
} from '../trapezoidal-contraction-transition-loss/engine.ts'

import type {
  TrapezoidalMaximumDischargeTransitionLossInput,
  TrapezoidalMaximumDischargeTransitionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_DISCHARGE_TRANSITION_LOSS_ENGINE_VERSION =
  'trapezoidal-maximum-discharge-transition-loss-v1'

export type TrapezoidalMaximumDischargeTransitionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumDischargeTransitionLossError
  extends Error {
  readonly code:
    TrapezoidalMaximumDischargeTransitionLossErrorCode

  constructor(
    code:
      TrapezoidalMaximumDischargeTransitionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumDischargeTransitionLossError'

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

interface MaximumFlowSolution {
  flowRate: number

  control: ControlState

  upstreamSpecificEnergy: number

  energyResidual: number

  iterations: number
}

function calculateControlState(
  input:
    TrapezoidalMaximumDischargeTransitionLossInput,

  flowRate: number,

  transitionLossCoefficient: number,
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
            transitionLossCoefficient
          ) *
          flowRate *
          flowRate *
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
    Math.max(
      1e-12,
      input.upstreamFlowDepth *
      1e-12,
    )

  let upper =
    Math.max(
      1,
      input.upstreamFlowDepth,
    )

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
      throw new TrapezoidalMaximumDischargeTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'ROOT_BRACKETING_FAILURE',
      'Loss-adjusted control-depth bracket is invalid.',
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
      throw new TrapezoidalMaximumDischargeTransitionLossError(
        'ROOT_CONVERGENCE_FAILURE',
        'Loss-adjusted control-depth solver did not converge within 250 iterations.',
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
    flowRate /
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
    transitionLossCoefficient *
    velocityHead

  const requiredSpecificEnergy =
    specificEnergyWithoutLoss +
    transitionLossHead

  const controlConditionResidual =
    residualAt(
      depth,
    )

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

    controlConditionResidual,
  }
}

function solveMaximumFlow(
  input:
    TrapezoidalMaximumDischargeTransitionLossInput,

  upstreamFlowArea: number,

  upstreamCriticalFlowRate: number,

  transitionLossCoefficient: number,
): MaximumFlowSolution {
  const upstreamSpecificEnergyFor =
    (
      flowRate: number,
    ) =>
      input.upstreamFlowDepth +
      flowRate *
      flowRate /
      (
        2 *
        GRAVITATIONAL_ACCELERATION *
        upstreamFlowArea *
        upstreamFlowArea
      )

  const balanceFor =
    (
      flowRate: number,
    ) => {
      const upstreamSpecificEnergy =
        upstreamSpecificEnergyFor(
          flowRate,
        )

      const control =
        calculateControlState(
          input,

          flowRate,

          transitionLossCoefficient,
        )

      return {
        upstreamSpecificEnergy,

        control,

        residual:
          upstreamSpecificEnergy -
          control.requiredSpecificEnergy,
      }
    }

  let lower =
    Math.max(
      1e-10,
      upstreamCriticalFlowRate *
      1e-10,
    )

  let upper =
    upstreamCriticalFlowRate

  const lowerState =
    balanceFor(
      lower,
    )

  const upperState =
    balanceFor(
      upper,
    )

  if (
    !Number.isFinite(
      lowerState.residual,
    ) ||
    !Number.isFinite(
      upperState.residual,
    ) ||
    lowerState.residual <=
      0 ||
    upperState.residual >=
      0
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'ROOT_BRACKETING_FAILURE',
      'Could not bracket the maximum discharge below the upstream critical-flow limit.',
    )
  }

  let finalState =
    lowerState

  let iterations =
    0

  for (
    let iteration = 1;
    iteration <= 220;
    iteration += 1
  ) {
    iterations =
      iteration

    const flowRate =
      (
        lower +
        upper
      ) /
      2

    const state =
      balanceFor(
        flowRate,
      )

    finalState =
      state

    const tolerance =
      Math.max(
        1e-12,
        state.upstreamSpecificEnergy *
        1e-11,
      )

    if (
      Math.abs(
        state.residual,
      ) <=
      tolerance
    ) {
      return {
        flowRate,

        control:
          state.control,

        upstreamSpecificEnergy:
          state.upstreamSpecificEnergy,

        energyResidual:
          state.residual,

        iterations,
      }
    }

    if (
      state.residual >
      0
    ) {
      lower =
        flowRate
    } else {
      upper =
        flowRate
    }
  }

  const flowRate =
    (
      lower +
      upper
    ) /
    2

  finalState =
    balanceFor(
      flowRate,
    )

  if (
    Math.abs(
      finalState.residual,
    ) >
      Math.max(
        1e-10,
        finalState.upstreamSpecificEnergy *
        1e-9,
      )
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'ROOT_CONVERGENCE_FAILURE',
      'Maximum-discharge solver did not converge within 220 iterations.',
    )
  }

  return {
    flowRate,

    control:
      finalState.control,

    upstreamSpecificEnergy:
      finalState.upstreamSpecificEnergy,

    energyResidual:
      finalState.residual,

    iterations,
  }
}

export function calculateTrapezoidalMaximumDischargeTransitionLoss(
  input:
    TrapezoidalMaximumDischargeTransitionLossInput,
): TrapezoidalMaximumDischargeTransitionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <=
      0
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamFlowDepth,
    ) ||
    input.upstreamFlowDepth <=
      0
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.transitionLossCoefficient,
    ) ||
    input.transitionLossCoefficient <
      0
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeTransitionLossError(
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

  const upstreamCriticalFlowRate =
    upstreamFlowArea *
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      upstreamHydraulicDepth,
    )

  const solution =
    solveMaximumFlow(
      input,

      upstreamFlowArea,

      upstreamCriticalFlowRate,

      input.transitionLossCoefficient,
    )

  const maximumVolumetricFlowRate =
    solution.flowRate

  const upstreamVelocityAtMaximumFlow =
    maximumVolumetricFlowRate /
    upstreamFlowArea

  const upstreamVelocityHeadAtMaximumFlow =
    upstreamVelocityAtMaximumFlow *
    upstreamVelocityAtMaximumFlow /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const upstreamFroudeNumberAtMaximumFlow =
    upstreamVelocityAtMaximumFlow /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      upstreamHydraulicDepth,
    )

  const upstreamSpecificEnergyAtMaximumFlow =
    solution.upstreamSpecificEnergy

  const upstreamCriticalFlowMargin =
    upstreamCriticalFlowRate -
    maximumVolumetricFlowRate

  const losslessSolution =
    solveMaximumFlow(
      input,

      upstreamFlowArea,

      upstreamCriticalFlowRate,

      0,
    )

  const losslessMaximumVolumetricFlowRate =
    losslessSolution.flowRate

  const transitionLossFlowPenalty =
    losslessMaximumVolumetricFlowRate -
    maximumVolumetricFlowRate

  const transitionLossCapacityRatio =
    maximumVolumetricFlowRate /
    losslessMaximumVolumetricFlowRate

  const transitionLossFlowReductionPercent =
    (
      1 -
      transitionLossCapacityRatio
    ) *
    100

  const control =
    solution.control

  const theoreticalControlFroudeNumber =
    1 /
    Math.sqrt(
      1 +
      input.transitionLossCoefficient,
    )

  const transitionLossHeadFractionOfUpstreamEnergy =
    control.transitionLossHead /
    upstreamSpecificEnergyAtMaximumFlow

  const minimumRequiredSpecificEnergy =
    control.requiredSpecificEnergy

  const energyClosureResidual =
    solution.energyResidual

  const controlConditionResidual =
    control.controlConditionResidual

  /*
   * Calculator 442 uses the analytical inverse
   *
   * KL,max =
   * (Qmax,lossless(E) / Q)^2 - 1
   *
   * Recompute that relation directly here rather
   * than nesting Calculator 442, whose final
   * threshold verifier is intentionally very strict.
   */
  const inverseCapacity =
    calculateTrapezoidalMaximumDischargeSpecificEnergy({
      bottomWidth:
        input.contractedBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      availableSpecificEnergy:
        upstreamSpecificEnergyAtMaximumFlow,

      fluidDensity:
        input.fluidDensity,
    })

  const losslessCapacityAtSolvedEnergy =
    inverseCapacity.maximumVolumetricFlowRate

  const rawBackCalculatedMaximumTransitionLossCoefficient =
    (
      losslessCapacityAtSolvedEnergy /
      maximumVolumetricFlowRate
    ) **
      2 -
    1

  /*
   * The analytical inverse should return KL = 0
   * exactly in the lossless limit. Independent
   * iterative solvers can differ by a few ULPs,
   * producing a tiny negative value such as
   * -1e-10. Normalize only that round-off region;
   * materially negative coefficients remain invalid.
   */
  const inverseCoefficientRoundoffTolerance =
    Math.max(
      1e-9,
      (
        1 +
        input.transitionLossCoefficient
      ) *
      1e-8,
    )

  const backCalculatedMaximumTransitionLossCoefficient =
    rawBackCalculatedMaximumTransitionLossCoefficient <
      0 &&
    Math.abs(
      rawBackCalculatedMaximumTransitionLossCoefficient,
    ) <=
      inverseCoefficientRoundoffTolerance
      ? 0
      : rawBackCalculatedMaximumTransitionLossCoefficient

  const lossCoefficientClosureResidual =
    backCalculatedMaximumTransitionLossCoefficient -
    input.transitionLossCoefficient

  /*
   * Forward closure is checked with Calculator 441,
   * which is the underlying physical loss model.
   */
  const forward =
    calculateTrapezoidalContractionTransitionLoss({
      upstreamBottomWidth:
        input.upstreamBottomWidth,

      contractedBottomWidth:
        input.contractedBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        maximumVolumetricFlowRate,

      upstreamFlowDepth:
        input.upstreamFlowDepth,

      transitionLossCoefficient:
        input.transitionLossCoefficient,

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

  const maximumMassFlowRate =
    input.fluidDensity *
    maximumVolumetricFlowRate

  const maximumDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    maximumVolumetricFlowRate *
    control.transitionLossHead

  const positiveValues = [
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    maximumVolumetricFlowRate,

    maximumMassFlowRate,

    upstreamVelocityAtMaximumFlow,

    upstreamVelocityHeadAtMaximumFlow,

    upstreamFroudeNumberAtMaximumFlow,

    upstreamSpecificEnergyAtMaximumFlow,

    upstreamCriticalFlowRate,

    upstreamCriticalFlowMargin,

    losslessMaximumVolumetricFlowRate,

    transitionLossCapacityRatio,

    control.depth,

    control.flowArea,

    control.topWidth,

    control.hydraulicDepth,

    control.velocity,

    control.velocityHead,

    control.froudeNumber,

    theoreticalControlFroudeNumber,

    control.specificEnergyWithoutLoss,

    minimumRequiredSpecificEnergy,

    forwardLossAdjustedMinimumWidth,
  ]

  const nonNegativeValues = [
    transitionLossFlowPenalty,

    transitionLossFlowReductionPercent,

    control.transitionLossHead,

    transitionLossHeadFractionOfUpstreamEnergy,

    backCalculatedMaximumTransitionLossCoefficient,

    maximumDissipationPower,
  ]

  const energyTolerance =
    Math.max(
      1e-9,
      upstreamSpecificEnergyAtMaximumFlow *
      1e-8,
    )

  /*
   * Local physical and numerical validity checks.
   *
   * Cross-calculator inverse/forward quantities are intentionally
   * returned for verification by the Calculator 443 test suite
   * rather than being used as fatal runtime guards here.
   *
   * This prevents harmless differences in nested solver stopping
   * tolerances from masking the actual hydraulic solution behind
   * a generic NUMERICAL_FAILURE.
   */
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
    )
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'NUMERICAL_FAILURE',
      'The maximum-discharge solution produced a non-finite or physically invalid result.',
    )
  }

  if (
    maximumVolumetricFlowRate >=
      upstreamCriticalFlowRate ||
    upstreamFroudeNumberAtMaximumFlow >=
      1 ||
    transitionLossCapacityRatio >
      1 +
      1e-10
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'NUMERICAL_FAILURE',
      'The maximum-discharge solution violates the required subcritical upstream or capacity conditions.',
    )
  }

  if (
    !Number.isFinite(
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'NUMERICAL_FAILURE',
      `Maximum-discharge energy closure failed: residual=${energyClosureResidual}.`,
    )
  }

  if (
    !Number.isFinite(
      controlConditionResidual,
    ) ||
    Math.abs(
      controlConditionResidual,
    ) >
      1e-8
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'NUMERICAL_FAILURE',
      `Loss-adjusted control condition failed: residual=${controlConditionResidual}.`,
    )
  }

  if (
    Math.abs(
      control.froudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-8
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'NUMERICAL_FAILURE',
      `Loss-adjusted Froude closure failed: calculated=${control.froudeNumber}, theoretical=${theoreticalControlFroudeNumber}.`,
    )
  }

  /*
   * The following cross-checks must remain finite.
   * Their actual closure tolerances are tested independently.
   */
  const crossCheckValues = [
    backCalculatedMaximumTransitionLossCoefficient,

    lossCoefficientClosureResidual,

    forwardLossAdjustedMinimumWidth,

    forwardWidthClosureResidual,

    forwardAvailableEnergyMargin,
  ]

  if (
    !crossCheckValues.every(
      value =>
        Number.isFinite(value),
    )
  ) {
    throw new TrapezoidalMaximumDischargeTransitionLossError(
      'NUMERICAL_FAILURE',
      'A Calculator 443 inverse or forward cross-check produced a non-finite value.',
    )
  }

  return {
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    maximumVolumetricFlowRate,

    maximumMassFlowRate,

    upstreamVelocityAtMaximumFlow,

    upstreamVelocityHeadAtMaximumFlow,

    upstreamFroudeNumberAtMaximumFlow,

    upstreamSpecificEnergyAtMaximumFlow,

    upstreamCriticalFlowRate,

    upstreamCriticalFlowMargin,

    losslessMaximumVolumetricFlowRate,

    transitionLossFlowPenalty,

    transitionLossCapacityRatio,

    transitionLossFlowReductionPercent,

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

    transitionLossHeadAtMaximumFlow:
      control.transitionLossHead,

    transitionLossHeadFractionOfUpstreamEnergy,

    minimumRequiredSpecificEnergy,

    energyClosureResidual,

    controlConditionResidual,

    backCalculatedMaximumTransitionLossCoefficient,

    lossCoefficientClosureResidual,

    forwardLossAdjustedMinimumWidth,

    forwardWidthClosureResidual,

    forwardAvailableEnergyMargin,

    forwardThresholdStatus,

    maximumDissipationPower,

    flowSolverIterations:
      solution.iterations,

    modelName:
      'Maximum Discharge Through a Trapezoidal Contraction with Transition Loss',

    limitationDescription:
      'One-dimensional maximum-capacity analysis for a subcritical trapezoidal-channel approach and a specified contracted width. The contraction loss is modeled as hL = KL·Vthroat²/(2g). Maximum discharge occurs when the contracted section reaches the loss-adjusted minimum-energy control state. Bed elevations are assumed equal and the lumped KL is treated as constant.',
  }
}

export function createTrapezoidalMaximumDischargeTransitionLossCsv(
  input:
    TrapezoidalMaximumDischargeTransitionLossInput,
  result:
    TrapezoidalMaximumDischargeTransitionLossResult,
): string {
  const rows = [
    [
      'Maximum Discharge Through a Trapezoidal Contraction with Transition Loss',
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
      'Upstream flow depth',
      input.upstreamFlowDepth,
      'm',
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
      'Maximum volumetric flow rate',
      result.maximumVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Maximum mass flow rate',
      result.maximumMassFlowRate,
      'kg/s',
    ],
    [
      'Lossless maximum volumetric flow rate',
      result.losslessMaximumVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Transition-loss flow penalty',
      result.transitionLossFlowPenalty,
      'm3/s',
    ],
    [
      'Transition-loss capacity ratio',
      result.transitionLossCapacityRatio,
      '-',
    ],
    [
      'Transition-loss flow reduction',
      result.transitionLossFlowReductionPercent,
      '%',
    ],
    [
      'Upstream critical flow rate',
      result.upstreamCriticalFlowRate,
      'm3/s',
    ],
    [
      'Upstream critical-flow margin',
      result.upstreamCriticalFlowMargin,
      'm3/s',
    ],
    [
      'Upstream Froude number at maximum flow',
      result.upstreamFroudeNumberAtMaximumFlow,
      '-',
    ],
    [
      'Upstream specific energy at maximum flow',
      result.upstreamSpecificEnergyAtMaximumFlow,
      'm',
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
      'Transition-loss head at maximum flow',
      result.transitionLossHeadAtMaximumFlow,
      'm',
    ],
    [
      'Minimum required specific energy',
      result.minimumRequiredSpecificEnergy,
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
      'Back-calculated maximum transition-loss coefficient',
      result.backCalculatedMaximumTransitionLossCoefficient,
      '-',
    ],
    [
      'Loss-coefficient closure residual',
      result.lossCoefficientClosureResidual,
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
      'Maximum dissipation power',
      result.maximumDissipationPower,
      'W',
    ],
    [
      'Flow solver iterations',
      result.flowSolverIterations,
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
