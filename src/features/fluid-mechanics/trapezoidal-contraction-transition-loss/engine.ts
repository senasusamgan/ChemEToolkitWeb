import {
  calculateTrapezoidalContractionThroatAnalysis,
} from '../trapezoidal-contraction-throat-analysis/engine.ts'

import type {
  TrapezoidalContractionTransitionLossInput,
  TrapezoidalContractionTransitionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_CONTRACTION_TRANSITION_LOSS_ENGINE_VERSION =
  'trapezoidal-contraction-transition-loss-v1'

export type TrapezoidalContractionTransitionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'NO_FEASIBLE_CONTRACTION_WITH_LOSS'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalContractionTransitionLossError
  extends Error {
  readonly code:
    TrapezoidalContractionTransitionLossErrorCode

  constructor(
    code:
      TrapezoidalContractionTransitionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalContractionTransitionLossError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface SectionState {
  flowArea: number

  topWidth: number

  hydraulicDepth: number

  velocity: number

  velocityHead: number

  froudeNumber: number

  specificEnergy: number

  transitionLossHead: number

  requiredSpecificEnergy: number
}

interface ControlState
  extends SectionState {
  depth: number

  controlConditionResidual: number
}

function sectionState(
  bottomWidth: number,

  sideSlopeHorizontalPerVertical: number,

  volumetricFlowRate: number,

  depth: number,

  transitionLossCoefficient: number,
): SectionState {
  const flowArea =
    depth *
    (
      bottomWidth +
      sideSlopeHorizontalPerVertical *
      depth
    )

  const topWidth =
    bottomWidth +
    2 *
    sideSlopeHorizontalPerVertical *
    depth

  const hydraulicDepth =
    flowArea /
    topWidth

  const velocity =
    volumetricFlowRate /
    flowArea

  const velocityHead =
    (
      velocity *
      velocity
    ) /
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

  const specificEnergy =
    depth +
    velocityHead

  const transitionLossHead =
    transitionLossCoefficient *
    velocityHead

  const requiredSpecificEnergy =
    specificEnergy +
    transitionLossHead

  return {
    flowArea,

    topWidth,

    hydraulicDepth,

    velocity,

    velocityHead,

    froudeNumber,

    specificEnergy,

    transitionLossHead,

    requiredSpecificEnergy,
  }
}

function controlStateForWidth(
  input:
    TrapezoidalContractionTransitionLossInput,

  bottomWidth: number,
): ControlState {
  const residualAt =
    (
      depth: number,
    ) => {
      const state =
        sectionState(
          bottomWidth,

          input.sideSlopeHorizontalPerVertical,

          input.volumetricFlowRate,

          depth,

          input.transitionLossCoefficient,
        )

      return (
        (
          (
            1 +
            input.transitionLossCoefficient
          ) *
          input.volumetricFlowRate *
          input.volumetricFlowRate *
          state.topWidth
        ) /
        (
          GRAVITATIONAL_ACCELERATION *
          state.flowArea **
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
    upper *= 2

    expansions += 1

    if (
      expansions >
      100 ||
      !Number.isFinite(
        upper,
      ) ||
      upper >
      1e12
    ) {
      throw new TrapezoidalContractionTransitionLossError(
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
    lowerResidual <= 0 ||
    upperResidual >= 0
  ) {
    throw new TrapezoidalContractionTransitionLossError(
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
      throw new TrapezoidalContractionTransitionLossError(
        'ROOT_CONVERGENCE_FAILURE',
        'Loss-adjusted control-depth solver did not converge within 250 iterations.',
      )
    }
  }

  const state =
    sectionState(
      bottomWidth,

      input.sideSlopeHorizontalPerVertical,

      input.volumetricFlowRate,

      depth,

      input.transitionLossCoefficient,
    )

  return {
    ...state,

    depth,

    controlConditionResidual:
      residualAt(
        depth,
      ),
  }
}

function solveMinimumWidth(
  input:
    TrapezoidalContractionTransitionLossInput,

  upstreamSpecificEnergy: number,
): number {
  const tinyWidth =
    Math.max(
      1e-10,
      input.upstreamBottomWidth *
      1e-10,
    )

  const energyTolerance =
    Math.max(
      1e-11,
      upstreamSpecificEnergy *
      1e-10,
    )

  const tinyControl =
    controlStateForWidth(
      input,
      tinyWidth,
    )

  if (
    tinyControl.requiredSpecificEnergy <=
    upstreamSpecificEnergy +
      energyTolerance
  ) {
    return 0
  }

  const upstreamWidthControl =
    controlStateForWidth(
      input,
      input.upstreamBottomWidth,
    )

  if (
    upstreamWidthControl.requiredSpecificEnergy >=
    upstreamSpecificEnergy -
      energyTolerance
  ) {
    throw new TrapezoidalContractionTransitionLossError(
      'NO_FEASIBLE_CONTRACTION_WITH_LOSS',
      'For the selected transition-loss coefficient, the available upstream specific energy is insufficient even at the upstream-width control minimum.',
    )
  }

  let lower =
    tinyWidth

  let upper =
    input.upstreamBottomWidth

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
      controlStateForWidth(
        input,
        width,
      )

    const residual =
      control.requiredSpecificEnergy -
      upstreamSpecificEnergy

    if (
      Math.abs(
        residual,
      ) <=
      energyTolerance
    ) {
      return width
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

  throw new TrapezoidalContractionTransitionLossError(
    'ROOT_CONVERGENCE_FAILURE',
    'Loss-adjusted minimum contraction-width solver did not converge within 250 iterations.',
  )
}

function solveThroatDepth(
  input:
    TrapezoidalContractionTransitionLossInput,

  upstreamSpecificEnergy: number,

  lowerInitial: number,

  upperInitial: number,

  expandUpper: boolean,
): number {
  const residualAt =
    (
      depth: number,
    ) =>
      sectionState(
        input.contractedBottomWidth,

        input.sideSlopeHorizontalPerVertical,

        input.volumetricFlowRate,

        depth,

        input.transitionLossCoefficient,
      ).requiredSpecificEnergy -
      upstreamSpecificEnergy

  let lower =
    lowerInitial

  let upper =
    upperInitial

  let lowerResidual =
    residualAt(
      lower,
    )

  let upperResidual =
    residualAt(
      upper,
    )

  if (
    expandUpper
  ) {
    let expansions =
      0

    while (
      upperResidual <
      0
    ) {
      upper *= 2

      expansions += 1

      if (
        expansions >
        100 ||
        !Number.isFinite(
          upper,
        ) ||
        upper >
        1e12
      ) {
        throw new TrapezoidalContractionTransitionLossError(
          'ROOT_BRACKETING_FAILURE',
          'Could not bracket the subcritical loss-adjusted throat depth.',
        )
      }

      upperResidual =
        residualAt(
          upper,
        )
    }
  }

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual *
      upperResidual >
      0
  ) {
    throw new TrapezoidalContractionTransitionLossError(
      'ROOT_BRACKETING_FAILURE',
      'Could not bracket the loss-adjusted throat-depth root.',
    )
  }

  const tolerance =
    Math.max(
      1e-13,
      upstreamSpecificEnergy *
      1e-12,
    )

  for (
    let iteration = 1;
    iteration <= 250;
    iteration += 1
  ) {
    const depth =
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
      tolerance
    ) {
      return depth
    }

    if (
      lowerResidual *
      residual <=
      0
    ) {
      upper =
        depth

      upperResidual =
        residual
    } else {
      lower =
        depth

      lowerResidual =
        residual
    }
  }

  throw new TrapezoidalContractionTransitionLossError(
    'ROOT_CONVERGENCE_FAILURE',
    'Loss-adjusted throat-depth solver did not converge within 250 iterations.',
  )
}

export function calculateTrapezoidalContractionTransitionLoss(
  input:
    TrapezoidalContractionTransitionLossInput,
): TrapezoidalContractionTransitionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <= 0
  ) {
    throw new TrapezoidalContractionTransitionLossError(
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
    throw new TrapezoidalContractionTransitionLossError(
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
    throw new TrapezoidalContractionTransitionLossError(
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
    throw new TrapezoidalContractionTransitionLossError(
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
    throw new TrapezoidalContractionTransitionLossError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.transitionLossCoefficient,
    ) ||
    input.transitionLossCoefficient < 0
  ) {
    throw new TrapezoidalContractionTransitionLossError(
      'INVALID_LOSS_COEFFICIENT',
      'Transition-loss coefficient KL must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalContractionTransitionLossError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const upstream =
    sectionState(
      input.upstreamBottomWidth,

      input.sideSlopeHorizontalPerVertical,

      input.volumetricFlowRate,

      input.upstreamFlowDepth,

      0,
    )

  if (
    upstream.froudeNumber >=
    1 -
    1e-9
  ) {
    throw new TrapezoidalContractionTransitionLossError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'The transition-loss contraction model requires a clearly subcritical upstream approach flow.',
    )
  }

  const lossless =
    calculateTrapezoidalContractionThroatAnalysis({
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

      fluidDensity:
        input.fluidDensity,
    })

  const losslessMinimumContractedBottomWidth =
    lossless.minimumContractedBottomWidth

  const lossAdjustedMinimumContractedBottomWidth =
    solveMinimumWidth(
      input,
      upstream.specificEnergy,
    )

  const lossPenaltyWidth =
    lossAdjustedMinimumContractedBottomWidth -
    losslessMinimumContractedBottomWidth

  const remainingWidthMargin =
    input.contractedBottomWidth -
    lossAdjustedMinimumContractedBottomWidth

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const widthLimitUtilizationPercent =
    lossAdjustedMinimumContractedBottomWidth >
    0
      ? (
          (
            input.upstreamBottomWidth -
            input.contractedBottomWidth
          ) /
          (
            input.upstreamBottomWidth -
            lossAdjustedMinimumContractedBottomWidth
          )
        ) *
        100
      : (
          (
            input.upstreamBottomWidth -
            input.contractedBottomWidth
          ) /
          input.upstreamBottomWidth
        ) *
        100

  const control =
    controlStateForWidth(
      input,
      input.contractedBottomWidth,
    )

  const lossAdjustedControlDepth =
    control.depth

  const lossAdjustedControlVelocity =
    control.velocity

  const lossAdjustedControlFroudeNumber =
    control.froudeNumber

  const theoreticalControlFroudeNumber =
    1 /
    Math.sqrt(
      1 +
      input.transitionLossCoefficient,
    )

  const controlSpecificEnergyWithoutLoss =
    control.specificEnergy

  const controlTransitionLossHead =
    control.transitionLossHead

  const minimumRequiredUpstreamSpecificEnergy =
    control.requiredSpecificEnergy

  const availableSpecificEnergyMargin =
    upstream.specificEnergy -
    minimumRequiredUpstreamSpecificEnergy

  const additionalSpecificEnergyRequired =
    Math.max(
      0,
      -availableSpecificEnergyMargin,
    )

  const thresholdTolerance =
    Math.max(
      1e-10,
      upstream.specificEnergy *
      1e-9,
    )

  let throatStatus =
    ''

  let subcriticalThroatDepth:
    number | null =
    null

  let subcriticalThroatVelocity:
    number | null =
    null

  let subcriticalThroatFroudeNumber:
    number | null =
    null

  let subcriticalTransitionLossHead:
    number | null =
    null

  let supercriticalAlternateDepth:
    number | null =
    null

  let supercriticalAlternateVelocity:
    number | null =
    null

  let supercriticalAlternateFroudeNumber:
    number | null =
    null

  let supercriticalTransitionLossHead:
    number | null =
    null

  let waterSurfaceElevationChange:
    number | null =
    null

  let subcriticalEnergyResidual:
    number | null =
    null

  let alternateEnergyResidual:
    number | null =
    null

  if (
    availableSpecificEnergyMargin <
    -thresholdTolerance
  ) {
    throatStatus =
      'Choked with transition loss — upstream adjustment required'
  } else if (
    Math.abs(
      availableSpecificEnergyMargin,
    ) <=
      thresholdTolerance
  ) {
    throatStatus =
      'Loss-adjusted choking threshold'

    subcriticalThroatDepth =
      control.depth

    subcriticalThroatVelocity =
      control.velocity

    subcriticalThroatFroudeNumber =
      control.froudeNumber

    subcriticalTransitionLossHead =
      control.transitionLossHead

    supercriticalAlternateDepth =
      control.depth

    supercriticalAlternateVelocity =
      control.velocity

    supercriticalAlternateFroudeNumber =
      control.froudeNumber

    supercriticalTransitionLossHead =
      control.transitionLossHead

    waterSurfaceElevationChange =
      control.depth -
      input.upstreamFlowDepth

    subcriticalEnergyResidual =
      control.requiredSpecificEnergy -
      upstream.specificEnergy

    alternateEnergyResidual =
      subcriticalEnergyResidual
  } else {
    throatStatus =
      'Unchoked with transition loss — two depth roots available'

    const tinyDepth =
      Math.max(
        1e-12,
        control.depth *
        1e-10,
      )

    const shallowDepth =
      solveThroatDepth(
        input,

        upstream.specificEnergy,

        tinyDepth,

        control.depth,

        false,
      )

    const deepDepth =
      solveThroatDepth(
        input,

        upstream.specificEnergy,

        control.depth,

        Math.max(
          upstream.specificEnergy *
          2,
          control.depth *
          2,
          1,
        ),

        true,
      )

    const shallow =
      sectionState(
        input.contractedBottomWidth,

        input.sideSlopeHorizontalPerVertical,

        input.volumetricFlowRate,

        shallowDepth,

        input.transitionLossCoefficient,
      )

    const deep =
      sectionState(
        input.contractedBottomWidth,

        input.sideSlopeHorizontalPerVertical,

        input.volumetricFlowRate,

        deepDepth,

        input.transitionLossCoefficient,
      )

    subcriticalThroatDepth =
      deepDepth

    subcriticalThroatVelocity =
      deep.velocity

    subcriticalThroatFroudeNumber =
      deep.froudeNumber

    subcriticalTransitionLossHead =
      deep.transitionLossHead

    supercriticalAlternateDepth =
      shallowDepth

    supercriticalAlternateVelocity =
      shallow.velocity

    supercriticalAlternateFroudeNumber =
      shallow.froudeNumber

    supercriticalTransitionLossHead =
      shallow.transitionLossHead

    waterSurfaceElevationChange =
      deepDepth -
      input.upstreamFlowDepth

    subcriticalEnergyResidual =
      deep.requiredSpecificEnergy -
      upstream.specificEnergy

    alternateEnergyResidual =
      shallow.requiredSpecificEnergy -
      upstream.specificEnergy
  }

  const controlConditionResidual =
    (
      (
        (
          1 +
          input.transitionLossCoefficient
        ) *
        input.volumetricFlowRate *
        input.volumetricFlowRate *
        control.topWidth
      ) /
      (
        GRAVITATIONAL_ACCELERATION *
        control.flowArea **
          3
      )
    ) -
    1

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const baseValues = [
    upstream.flowArea,

    upstream.velocity,

    upstream.froudeNumber,

    upstream.specificEnergy,

    lossAdjustedControlDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    minimumRequiredUpstreamSpecificEnergy,

    contractionRatio,

    widthLimitUtilizationPercent,

    massFlowRate,
  ]

  if (
    !baseValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    baseValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      losslessMinimumContractedBottomWidth,
    ) ||
    losslessMinimumContractedBottomWidth <
      0 ||
    !Number.isFinite(
      lossAdjustedMinimumContractedBottomWidth,
    ) ||
    lossAdjustedMinimumContractedBottomWidth <
      0 ||
    !Number.isFinite(
      lossPenaltyWidth,
    ) ||
    lossPenaltyWidth <
      -1e-8 ||
    !Number.isFinite(
      remainingWidthMargin,
    ) ||
    !Number.isFinite(
      controlTransitionLossHead,
    ) ||
    controlTransitionLossHead <
      0 ||
    !Number.isFinite(
      availableSpecificEnergyMargin,
    ) ||
    !Number.isFinite(
      additionalSpecificEnergyRequired,
    ) ||
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
    throw new TrapezoidalContractionTransitionLossError(
      'NUMERICAL_FAILURE',
      'The transition-loss contraction model failed its loss-adjusted control-state checks.',
    )
  }

  if (
    subcriticalThroatDepth !==
      null &&
    supercriticalAlternateDepth !==
      null &&
    subcriticalEnergyResidual !==
      null &&
    alternateEnergyResidual !==
      null
  ) {
    const rootPositiveValues = [
      subcriticalThroatDepth,

      supercriticalAlternateDepth,

      subcriticalThroatVelocity!,

      subcriticalThroatFroudeNumber!,

      supercriticalAlternateVelocity!,

      supercriticalAlternateFroudeNumber!,
    ]

    const rootNonNegativeValues = [
      subcriticalTransitionLossHead!,

      supercriticalTransitionLossHead!,
    ]

    if (
      !rootPositiveValues.every(
        value =>
          Number.isFinite(value),
      ) ||
      rootPositiveValues.some(
        value =>
          value <= 0,
      ) ||
      !rootNonNegativeValues.every(
        value =>
          Number.isFinite(value),
      ) ||
      rootNonNegativeValues.some(
        value =>
          value < 0,
      ) ||
      Math.abs(
        subcriticalEnergyResidual,
      ) >
        1e-8 ||
      Math.abs(
        alternateEnergyResidual,
      ) >
        1e-8
    ) {
      throw new TrapezoidalContractionTransitionLossError(
        'NUMERICAL_FAILURE',
        'The transition-loss throat roots failed their total specific-energy closure checks.',
      )
    }
  }

  return {
    upstreamFlowArea:
      upstream.flowArea,

    upstreamVelocity:
      upstream.velocity,

    upstreamFroudeNumber:
      upstream.froudeNumber,

    upstreamSpecificEnergy:
      upstream.specificEnergy,

    losslessMinimumContractedBottomWidth,

    lossAdjustedMinimumContractedBottomWidth,

    lossPenaltyWidth,

    remainingWidthMargin,

    contractionRatio,

    widthLimitUtilizationPercent,

    lossAdjustedControlDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    controlTransitionLossHead,

    minimumRequiredUpstreamSpecificEnergy,

    availableSpecificEnergyMargin,

    additionalSpecificEnergyRequired,

    throatStatus,

    subcriticalThroatDepth,

    subcriticalThroatVelocity,

    subcriticalThroatFroudeNumber,

    subcriticalTransitionLossHead,

    supercriticalAlternateDepth,

    supercriticalAlternateVelocity,

    supercriticalAlternateFroudeNumber,

    supercriticalTransitionLossHead,

    waterSurfaceElevationChange,

    subcriticalEnergyResidual,

    alternateEnergyResidual,

    controlConditionResidual,

    massFlowRate,

    modelName:
      'Trapezoidal Contraction with Transition Loss',

    limitationDescription:
      'One-dimensional trapezoidal-channel contraction analysis with a user-specified velocity-head transition-loss model hL = KL·Vthroat²/(2g). The loss-adjusted choking condition is obtained from the minimum of y + (1 + KL)V²/(2g). The model assumes unchanged bed elevation, hydrostatic pressure and a constant lumped loss coefficient.',
  }
}

export function createTrapezoidalContractionTransitionLossCsv(
  input:
    TrapezoidalContractionTransitionLossInput,
  result:
    TrapezoidalContractionTransitionLossResult,
): string {
  const rows = [
    [
      'Trapezoidal Contraction with Transition Loss',
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
      'Throat status',
      result.throatStatus,
      '-',
    ],
    [
      'Lossless minimum contracted width',
      result.losslessMinimumContractedBottomWidth,
      'm',
    ],
    [
      'Loss-adjusted minimum contracted width',
      result.lossAdjustedMinimumContractedBottomWidth,
      'm',
    ],
    [
      'Loss penalty width',
      result.lossPenaltyWidth,
      'm',
    ],
    [
      'Remaining width margin',
      result.remainingWidthMargin,
      'm',
    ],
    [
      'Width-limit utilization',
      result.widthLimitUtilizationPercent,
      '%',
    ],
    [
      'Loss-adjusted control depth',
      result.lossAdjustedControlDepth,
      'm',
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
      'Control transition-loss head',
      result.controlTransitionLossHead,
      'm',
    ],
    [
      'Minimum required upstream specific energy',
      result.minimumRequiredUpstreamSpecificEnergy,
      'm',
    ],
    [
      'Available specific-energy margin',
      result.availableSpecificEnergyMargin,
      'm',
    ],
    [
      'Additional specific energy required',
      result.additionalSpecificEnergyRequired,
      'm',
    ],
    [
      'Subcritical throat depth',
      result.subcriticalThroatDepth ?? '',
      'm',
    ],
    [
      'Subcritical throat velocity',
      result.subcriticalThroatVelocity ?? '',
      'm/s',
    ],
    [
      'Subcritical throat Froude number',
      result.subcriticalThroatFroudeNumber ?? '',
      '-',
    ],
    [
      'Subcritical transition-loss head',
      result.subcriticalTransitionLossHead ?? '',
      'm',
    ],
    [
      'Supercritical alternate depth',
      result.supercriticalAlternateDepth ?? '',
      'm',
    ],
    [
      'Supercritical alternate Froude number',
      result.supercriticalAlternateFroudeNumber ?? '',
      '-',
    ],
    [
      'Supercritical transition-loss head',
      result.supercriticalTransitionLossHead ?? '',
      'm',
    ],
    [
      'Water-surface elevation change',
      result.waterSurfaceElevationChange ?? '',
      'm',
    ],
    [
      'Subcritical energy residual',
      result.subcriticalEnergyResidual ?? '',
      'm',
    ],
    [
      'Alternate energy residual',
      result.alternateEnergyResidual ?? '',
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
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
