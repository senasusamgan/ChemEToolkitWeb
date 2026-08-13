import type {
  TrapezoidalMinimumWidthBedRiseTransitionLossInput,
  TrapezoidalMinimumWidthBedRiseTransitionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_MINIMUM_WIDTH_BED_RISE_TRANSITION_LOSS_ENGINE_VERSION =
  'trapezoidal-minimum-width-bed-rise-transition-loss-v1'

export type TrapezoidalMinimumWidthBedRiseTransitionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_BED_RISE'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'NO_AVAILABLE_THROAT_ENERGY'
  | 'NO_FEASIBLE_CONTRACTED_WIDTH'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMinimumWidthBedRiseTransitionLossError
  extends Error {
  readonly code:
    TrapezoidalMinimumWidthBedRiseTransitionLossErrorCode

  constructor(
    code:
      TrapezoidalMinimumWidthBedRiseTransitionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMinimumWidthBedRiseTransitionLossError'

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

interface WidthSolution {
  bottomWidth: number

  control: ControlState

  iterations: number
}

function calculateControlState(
  input:
    TrapezoidalMinimumWidthBedRiseTransitionLossInput,

  bottomWidth: number,

  transitionLossCoefficient: number,
): ControlState {
  if (
    bottomWidth < 0
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'ROOT_BRACKETING_FAILURE',
      'Internal contracted bottom width cannot be negative.',
    )
  }

  if (
    bottomWidth === 0 &&
    input.sideSlopeHorizontalPerVertical === 0
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'ROOT_BRACKETING_FAILURE',
      'A rectangular section cannot have zero bottom width.',
    )
  }

  const residualAt =
    (
      depth: number,
    ) => {
      const flowArea =
        depth *
        (
          bottomWidth +
          input.sideSlopeHorizontalPerVertical *
          depth
        )

      const topWidth =
        bottomWidth +
        2 *
        input.sideSlopeHorizontalPerVertical *
        depth

      return (
        (
          (
            1 +
            transitionLossCoefficient
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
      throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
        'ROOT_BRACKETING_FAILURE',
        'Could not bracket the loss-adjusted control depth.',
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
      throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
        'ROOT_CONVERGENCE_FAILURE',
        'Loss-adjusted control-depth solver did not converge within 250 iterations.',
      )
    }
  }

  const flowArea =
    depth *
    (
      bottomWidth +
      input.sideSlopeHorizontalPerVertical *
      depth
    )

  const topWidth =
    bottomWidth +
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

function solveMinimumWidth(
  input:
    TrapezoidalMinimumWidthBedRiseTransitionLossInput,

  availableThroatSpecificEnergy: number,

  transitionLossCoefficient: number,
): WidthSolution {
  const energyTolerance =
    Math.max(
      1e-11,
      availableThroatSpecificEnergy *
      1e-10,
    )

  const fullWidthControl =
    calculateControlState(
      input,

      input.upstreamBottomWidth,

      transitionLossCoefficient,
    )

  if (
    fullWidthControl.requiredSpecificEnergy >
    availableThroatSpecificEnergy +
      energyTolerance
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'NO_FEASIBLE_CONTRACTED_WIDTH',
      'The specified bed rise leaves insufficient throat energy even before any lateral contraction is applied.',
    )
  }

  const lowerWidth =
    input.sideSlopeHorizontalPerVertical >
    0
      ? 0
      : Math.max(
          1e-10,
          input.upstreamBottomWidth *
          1e-10,
        )

  const lowerControl =
    calculateControlState(
      input,

      lowerWidth,

      transitionLossCoefficient,
    )

  if (
    lowerControl.requiredSpecificEnergy <=
    availableThroatSpecificEnergy +
      energyTolerance
  ) {
    return {
      bottomWidth:
        lowerWidth,

      control:
        lowerControl,

      iterations:
        0,
    }
  }

  let lower =
    lowerWidth

  let upper =
    input.upstreamBottomWidth

  let finalControl =
    fullWidthControl

  for (
    let iteration = 1;
    iteration <= 250;
    iteration += 1
  ) {
    const width =
      (
        lower +
        upper
      ) /
      2

    const control =
      calculateControlState(
        input,

        width,

        transitionLossCoefficient,
      )

    finalControl =
      control

    const residual =
      control.requiredSpecificEnergy -
      availableThroatSpecificEnergy

    if (
      Math.abs(
        residual,
      ) <=
      energyTolerance
    ) {
      return {
        bottomWidth:
          width,

        control,

        iterations:
          iteration,
      }
    }

    if (
      residual >
      0
    ) {
      lower =
        width
    } else {
      upper =
        width
    }
  }

  const width =
    (
      lower +
      upper
    ) /
    2

  finalControl =
    calculateControlState(
      input,

      width,

      transitionLossCoefficient,
    )

  if (
    Math.abs(
      finalControl.requiredSpecificEnergy -
      availableThroatSpecificEnergy
    ) >
      Math.max(
        1e-9,
        availableThroatSpecificEnergy *
        1e-8,
      )
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'ROOT_CONVERGENCE_FAILURE',
      'Minimum contracted-width solver did not converge within 250 iterations.',
    )
  }

  return {
    bottomWidth:
      width,

    control:
      finalControl,

    iterations:
      250,
  }
}

export function calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
  input:
    TrapezoidalMinimumWidthBedRiseTransitionLossInput,
): TrapezoidalMinimumWidthBedRiseTransitionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <=
      0
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical <
      0
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
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
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'The minimum-width design requires a clearly subcritical upstream approach flow.',
    )
  }

  const upstreamSpecificEnergy =
    y1 +
    upstreamVelocity *
    upstreamVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const availableThroatSpecificEnergy =
    upstreamSpecificEnergy -
    input.specifiedBedRise

  if (
    availableThroatSpecificEnergy <=
    0
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'NO_AVAILABLE_THROAT_ENERGY',
      'The specified bed rise consumes all available upstream specific energy.',
    )
  }

  const solution =
    solveMinimumWidth(
      input,

      availableThroatSpecificEnergy,

      input.transitionLossCoefficient,
    )

  const losslessSolution =
    solveMinimumWidth(
      input,

      availableThroatSpecificEnergy,

      0,
    )

  const minimumContractedBottomWidth =
    solution.bottomWidth

  const losslessMinimumContractedBottomWidth =
    losslessSolution.bottomWidth

  const rawTransitionLossWidthPenalty =
    minimumContractedBottomWidth -
    losslessMinimumContractedBottomWidth

  const transitionLossWidthPenalty =
    rawTransitionLossWidthPenalty <
      0 &&
    Math.abs(
      rawTransitionLossWidthPenalty,
    ) <=
      1e-8
      ? 0
      : rawTransitionLossWidthPenalty

  const maximumAllowableWidthReduction =
    input.upstreamBottomWidth -
    minimumContractedBottomWidth

  const maximumContractionPercent =
    (
      maximumAllowableWidthReduction /
      input.upstreamBottomWidth
    ) *
    100

  const contractionRatioAtLimit =
    minimumContractedBottomWidth /
    input.upstreamBottomWidth

  const control =
    solution.control

  const theoreticalControlFroudeNumber =
    1 /
    Math.sqrt(
      1 +
      input.transitionLossCoefficient,
    )

  const crestWaterSurfaceElevationRelativeToUpstreamBed =
    input.specifiedBedRise +
    control.depth

  const waterSurfaceElevationChangeAtThreshold =
    crestWaterSurfaceElevationRelativeToUpstreamBed -
    input.upstreamFlowDepth

  const energyClosureResidual =
    upstreamSpecificEnergy -
    (
      input.specifiedBedRise +
      control.requiredSpecificEnergy
    )

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const transitionLossDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    control.transitionLossHead

  const bedRisePotentialPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    input.specifiedBedRise

  const positiveValues = [
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    availableThroatSpecificEnergy,

    control.depth,

    control.flowArea,

    control.topWidth,

    control.hydraulicDepth,

    control.velocity,

    control.velocityHead,

    control.froudeNumber,

    theoreticalControlFroudeNumber,

    control.specificEnergyWithoutLoss,

    control.requiredSpecificEnergy,

    massFlowRate,
  ]

  const nonNegativeValues = [
    minimumContractedBottomWidth,

    losslessMinimumContractedBottomWidth,

    transitionLossWidthPenalty,

    maximumAllowableWidthReduction,

    maximumContractionPercent,

    contractionRatioAtLimit,

    control.transitionLossHead,

    transitionLossDissipationPower,

    bedRisePotentialPower,
  ]

  const energyTolerance =
    Math.max(
      1e-9,
      upstreamSpecificEnergy *
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
    minimumContractedBottomWidth >
      input.upstreamBottomWidth ||
    contractionRatioAtLimit >
      1 +
      1e-10 ||
    upstreamFroudeNumber >=
      1 ||
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
      1e-9 ||
    Math.abs(
      control.froudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-9
  ) {
    throw new TrapezoidalMinimumWidthBedRiseTransitionLossError(
      'NUMERICAL_FAILURE',
      'The minimum contracted-width solution failed its energy or loss-adjusted control-state checks.',
    )
  }

  return {
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    availableThroatSpecificEnergy,

    minimumContractedBottomWidth,

    losslessMinimumContractedBottomWidth,

    transitionLossWidthPenalty,

    maximumAllowableWidthReduction,

    maximumContractionPercent,

    contractionRatioAtLimit,

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

    minimumRequiredThroatEnergy:
      control.requiredSpecificEnergy,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    waterSurfaceElevationChangeAtThreshold,

    energyClosureResidual,

    controlConditionResidual:
      control.controlConditionResidual,

    massFlowRate,

    transitionLossDissipationPower,

    bedRisePotentialPower,

    widthSolverIterations:
      solution.iterations,

    modelName:
      'Minimum Contracted Width for a Specified Bed Rise with Transition Loss',

    limitationDescription:
      'Inverse choking-limit design for a trapezoidal channel with simultaneous bed rise, lateral contraction and lumped transition loss hL = KL·Vthroat²/(2g). The result is the minimum contracted bottom width that preserves the specified subcritical upstream energy exactly at the loss-adjusted control condition.',
  }
}

export function createTrapezoidalMinimumWidthBedRiseTransitionLossCsv(
  input:
    TrapezoidalMinimumWidthBedRiseTransitionLossInput,
  result:
    TrapezoidalMinimumWidthBedRiseTransitionLossResult,
): string {
  const rows = [
    [
      'Minimum Contracted Width for a Specified Bed Rise with Transition Loss',
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
      'Minimum contracted bottom width',
      result.minimumContractedBottomWidth,
      'm',
    ],
    [
      'Lossless minimum contracted bottom width',
      result.losslessMinimumContractedBottomWidth,
      'm',
    ],
    [
      'Transition-loss width penalty',
      result.transitionLossWidthPenalty,
      'm',
    ],
    [
      'Maximum allowable width reduction',
      result.maximumAllowableWidthReduction,
      'm',
    ],
    [
      'Maximum contraction',
      result.maximumContractionPercent,
      '%',
    ],
    [
      'Contraction ratio at limit',
      result.contractionRatioAtLimit,
      '-',
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
      'Width solver iterations',
      result.widthSolverIterations,
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
