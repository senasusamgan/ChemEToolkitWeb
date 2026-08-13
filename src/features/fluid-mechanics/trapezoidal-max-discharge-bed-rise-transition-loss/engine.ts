import type {
  TrapezoidalMaximumDischargeBedRiseTransitionLossInput,
  TrapezoidalMaximumDischargeBedRiseTransitionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_DISCHARGE_BED_RISE_TRANSITION_LOSS_ENGINE_VERSION =
  'trapezoidal-maximum-discharge-bed-rise-transition-loss-v1'

export type TrapezoidalMaximumDischargeBedRiseTransitionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_BED_RISE'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NO_FEASIBLE_SUBCRITICAL_FLOW'
  | 'NO_DISTINCT_CONTRACTION_LIMIT'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumDischargeBedRiseTransitionLossError
  extends Error {
  readonly code:
    TrapezoidalMaximumDischargeBedRiseTransitionLossErrorCode

  constructor(
    code:
      TrapezoidalMaximumDischargeBedRiseTransitionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumDischargeBedRiseTransitionLossError'

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

interface FlowSolution {
  flowRate: number

  upstreamSpecificEnergy: number

  availableThroatSpecificEnergy: number

  control: ControlState

  energyResidual: number

  iterations: number
}

function calculateControlState(
  input:
    TrapezoidalMaximumDischargeBedRiseTransitionLossInput,

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
    1e-12

  let upper =
    Math.max(
      1,
      input.upstreamFlowDepth,
    )

  const lowerResidual =
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
      throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
        'ROOT_BRACKETING_FAILURE',
        'Could not bracket the loss-adjusted throat control depth.',
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
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
      'ROOT_BRACKETING_FAILURE',
      'The loss-adjusted throat control-depth bracket is invalid.',
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
    } else {
      upper =
        depth
    }

    if (
      iteration ===
      250
    ) {
      throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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

function solveMaximumFlow(
  input:
    TrapezoidalMaximumDischargeBedRiseTransitionLossInput,

  upstreamFlowArea: number,

  upstreamCriticalFlowRate: number,

  transitionLossCoefficient: number,

  specifiedBedRise: number,
): FlowSolution {
  const stateAt =
    (
      flowRate: number,
    ) => {
      const upstreamSpecificEnergy =
        input.upstreamFlowDepth +
        flowRate *
        flowRate /
        (
          2 *
          GRAVITATIONAL_ACCELERATION *
          upstreamFlowArea *
          upstreamFlowArea
        )

      const availableThroatSpecificEnergy =
        upstreamSpecificEnergy -
        specifiedBedRise

      const control =
        calculateControlState(
          input,

          flowRate,

          transitionLossCoefficient,
        )

      return {
        upstreamSpecificEnergy,

        availableThroatSpecificEnergy,

        control,

        residual:
          availableThroatSpecificEnergy -
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
    upstreamCriticalFlowRate *
    (
      1 -
      1e-10
    )

  const lowerState =
    stateAt(
      lower,
    )

  const upperState =
    stateAt(
      upper,
    )

  if (
    !Number.isFinite(
      lowerState.residual,
    ) ||
    lowerState.residual <=
      0
  ) {
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
      'NO_FEASIBLE_SUBCRITICAL_FLOW',
      'The specified bed rise leaves no feasible low-flow subcritical energy state.',
    )
  }

  if (
    !Number.isFinite(
      upperState.residual,
    ) ||
    upperState.residual >=
      0
  ) {
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
      'NO_DISTINCT_CONTRACTION_LIMIT',
      'The specified contraction does not produce a distinct choking limit below the upstream critical-flow condition.',
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
      stateAt(
        flowRate,
      )

    finalState =
      state

    const tolerance =
      Math.max(
        1e-11,
        Math.abs(
          state.upstreamSpecificEnergy
        ) *
        1e-10,
      )

    if (
      Math.abs(
        state.residual,
      ) <=
      tolerance
    ) {
      return {
        flowRate,

        upstreamSpecificEnergy:
          state.upstreamSpecificEnergy,

        availableThroatSpecificEnergy:
          state.availableThroatSpecificEnergy,

        control:
          state.control,

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
    stateAt(
      flowRate,
    )

  if (
    Math.abs(
      finalState.residual,
    ) >
      Math.max(
        1e-9,
        Math.abs(
          finalState.upstreamSpecificEnergy
        ) *
        1e-8,
      )
  ) {
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
      'ROOT_CONVERGENCE_FAILURE',
      'The maximum-discharge solver did not converge within 220 iterations.',
    )
  }

  return {
    flowRate,

    upstreamSpecificEnergy:
      finalState.upstreamSpecificEnergy,

    availableThroatSpecificEnergy:
      finalState.availableThroatSpecificEnergy,

    control:
      finalState.control,

    energyResidual:
      finalState.residual,

    iterations,
  }
}

function normalizeNonNegative(
  value: number,
  tolerance = 1e-8,
): number {
  if (
    value <
      0 &&
    Math.abs(
      value,
    ) <=
      tolerance
  ) {
    return 0
  }

  return value
}

export function calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
  input:
    TrapezoidalMaximumDischargeBedRiseTransitionLossInput,
): TrapezoidalMaximumDischargeBedRiseTransitionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <=
      0
  ) {
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
      'INVALID_BED_RISE',
      'Specified bed rise must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.transitionLossCoefficient,
    ) ||
    input.transitionLossCoefficient <
      0
  ) {
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
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

      input.specifiedBedRise,
    )

  const losslessSolution =
    solveMaximumFlow(
      input,

      upstreamFlowArea,

      upstreamCriticalFlowRate,

      0,

      input.specifiedBedRise,
    )

  const zeroBedRiseSolution =
    solveMaximumFlow(
      input,

      upstreamFlowArea,

      upstreamCriticalFlowRate,

      input.transitionLossCoefficient,

      0,
    )

  const maximumVolumetricFlowRate =
    solution.flowRate

  const maximumMassFlowRate =
    input.fluidDensity *
    maximumVolumetricFlowRate

  const upstreamVelocityAtMaximumFlow =
    maximumVolumetricFlowRate /
    upstreamFlowArea

  const upstreamFroudeNumberAtMaximumFlow =
    upstreamVelocityAtMaximumFlow /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      upstreamHydraulicDepth,
    )

  const upstreamSpecificEnergyAtMaximumFlow =
    solution.upstreamSpecificEnergy

  const availableThroatSpecificEnergyAtMaximumFlow =
    solution.availableThroatSpecificEnergy

  const upstreamCriticalFlowMargin =
    upstreamCriticalFlowRate -
    maximumVolumetricFlowRate

  const losslessMaximumVolumetricFlowRate =
    losslessSolution.flowRate

  const transitionLossFlowPenalty =
    normalizeNonNegative(
      losslessMaximumVolumetricFlowRate -
      maximumVolumetricFlowRate,
    )

  const transitionLossCapacityRatio =
    maximumVolumetricFlowRate /
    losslessMaximumVolumetricFlowRate

  const transitionLossFlowReductionPercent =
    normalizeNonNegative(
      (
        1 -
        transitionLossCapacityRatio
      ) *
      100,
    )

  const zeroBedRiseMaximumVolumetricFlowRate =
    zeroBedRiseSolution.flowRate

  const bedRiseFlowPenalty =
    normalizeNonNegative(
      zeroBedRiseMaximumVolumetricFlowRate -
      maximumVolumetricFlowRate,
    )

  const bedRiseCapacityRatio =
    maximumVolumetricFlowRate /
    zeroBedRiseMaximumVolumetricFlowRate

  const bedRiseFlowReductionPercent =
    normalizeNonNegative(
      (
        1 -
        bedRiseCapacityRatio
      ) *
      100,
    )

  const control =
    solution.control

  const theoreticalControlFroudeNumber =
    1 /
    Math.sqrt(
      1 +
      input.transitionLossCoefficient,
    )

  const minimumRequiredThroatEnergy =
    control.requiredSpecificEnergy

  const crestWaterSurfaceElevationRelativeToUpstreamBed =
    input.specifiedBedRise +
    control.depth

  const waterSurfaceElevationChangeAtThreshold =
    crestWaterSurfaceElevationRelativeToUpstreamBed -
    input.upstreamFlowDepth

  const energyClosureResidual =
    solution.energyResidual

  const transitionLossDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    maximumVolumetricFlowRate *
    control.transitionLossHead

  const bedRisePotentialPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    maximumVolumetricFlowRate *
    input.specifiedBedRise

  const positiveValues = [
    maximumVolumetricFlowRate,

    maximumMassFlowRate,

    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocityAtMaximumFlow,

    upstreamFroudeNumberAtMaximumFlow,

    upstreamSpecificEnergyAtMaximumFlow,

    availableThroatSpecificEnergyAtMaximumFlow,

    upstreamCriticalFlowRate,

    upstreamCriticalFlowMargin,

    losslessMaximumVolumetricFlowRate,

    transitionLossCapacityRatio,

    zeroBedRiseMaximumVolumetricFlowRate,

    bedRiseCapacityRatio,

    control.depth,

    control.flowArea,

    control.topWidth,

    control.hydraulicDepth,

    control.velocity,

    control.velocityHead,

    control.froudeNumber,

    theoreticalControlFroudeNumber,

    control.specificEnergyWithoutLoss,

    minimumRequiredThroatEnergy,
  ]

  const nonNegativeValues = [
    transitionLossFlowPenalty,

    transitionLossFlowReductionPercent,

    bedRiseFlowPenalty,

    bedRiseFlowReductionPercent,

    control.transitionLossHead,

    transitionLossDissipationPower,

    bedRisePotentialPower,
  ]

  const energyTolerance =
    Math.max(
      1e-9,
      upstreamSpecificEnergyAtMaximumFlow *
      1e-8,
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
    maximumVolumetricFlowRate >=
      upstreamCriticalFlowRate ||
    upstreamFroudeNumberAtMaximumFlow >=
      1 ||
    transitionLossCapacityRatio >
      1 +
      1e-10 ||
    bedRiseCapacityRatio >
      1 +
      1e-10 ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtThreshold,
    ) ||
    !Number.isFinite(
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      control.controlConditionResidual,
    ) ||
    Math.abs(
      control.controlConditionResidual,
    ) >
      1e-8 ||
    Math.abs(
      control.froudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-8
  ) {
    throw new TrapezoidalMaximumDischargeBedRiseTransitionLossError(
      'NUMERICAL_FAILURE',
      'The maximum-discharge solution failed its local energy, capacity or loss-adjusted control-state checks.',
    )
  }

  return {
    maximumVolumetricFlowRate,

    maximumMassFlowRate,

    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocityAtMaximumFlow,

    upstreamFroudeNumberAtMaximumFlow,

    upstreamSpecificEnergyAtMaximumFlow,

    availableThroatSpecificEnergyAtMaximumFlow,

    upstreamCriticalFlowRate,

    upstreamCriticalFlowMargin,

    losslessMaximumVolumetricFlowRate,

    transitionLossFlowPenalty,

    transitionLossCapacityRatio,

    transitionLossFlowReductionPercent,

    zeroBedRiseMaximumVolumetricFlowRate,

    bedRiseFlowPenalty,

    bedRiseCapacityRatio,

    bedRiseFlowReductionPercent,

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

    minimumRequiredThroatEnergy,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    waterSurfaceElevationChangeAtThreshold,

    energyClosureResidual,

    controlConditionResidual:
      control.controlConditionResidual,

    transitionLossDissipationPower,

    bedRisePotentialPower,

    flowSolverIterations:
      solution.iterations,

    modelName:
      'Maximum Discharge Through a Trapezoidal Contraction with Bed Rise and Transition Loss',

    limitationDescription:
      'One-dimensional capacity analysis for a subcritical trapezoidal-channel approach with simultaneous lateral contraction, positive bed rise and lumped transition loss hL = KL·Vthroat²/(2g). Maximum discharge occurs when the raised contracted section reaches its loss-adjusted minimum-energy control state.',
  }
}

export function createTrapezoidalMaximumDischargeBedRiseTransitionLossCsv(
  input:
    TrapezoidalMaximumDischargeBedRiseTransitionLossInput,
  result:
    TrapezoidalMaximumDischargeBedRiseTransitionLossResult,
): string {
  const rows = [
    [
      'Maximum Discharge Through a Trapezoidal Contraction with Bed Rise and Transition Loss',
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
      'Specified bed rise',
      input.specifiedBedRise,
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
      'Available throat specific energy',
      result.availableThroatSpecificEnergyAtMaximumFlow,
      'm',
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
      'Lossless maximum flow rate',
      result.losslessMaximumVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Transition-loss flow penalty',
      result.transitionLossFlowPenalty,
      'm3/s',
    ],
    [
      'Transition-loss flow reduction',
      result.transitionLossFlowReductionPercent,
      '%',
    ],
    [
      'Zero-bed-rise maximum flow rate',
      result.zeroBedRiseMaximumVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Bed-rise flow penalty',
      result.bedRiseFlowPenalty,
      'm3/s',
    ],
    [
      'Bed-rise flow reduction',
      result.bedRiseFlowReductionPercent,
      '%',
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
      'Transition-loss head at maximum flow',
      result.transitionLossHeadAtMaximumFlow,
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
      'Transition-loss dissipation power',
      result.transitionLossDissipationPower,
      'W',
    ],
    [
      'Bed-rise potential power',
      result.bedRisePotentialPower,
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
