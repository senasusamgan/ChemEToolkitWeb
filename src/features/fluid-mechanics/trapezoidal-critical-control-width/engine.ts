import {
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
} from '../trapezoidal-max-discharge-specific-energy/engine.ts'

import type {
  TrapezoidalCriticalControlWidthInput,
  TrapezoidalCriticalControlWidthResult,
} from './types.ts'

export const TRAPEZOIDAL_CRITICAL_CONTROL_WIDTH_ENGINE_VERSION =
  'trapezoidal-critical-control-width-v1'

export type TrapezoidalCriticalControlWidthErrorCode =
  | 'INVALID_FLOW_RATE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_DENSITY'
  | 'FLOW_BELOW_ZERO_WIDTH_LIMIT'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalCriticalControlWidthError
  extends Error {
  readonly code:
    TrapezoidalCriticalControlWidthErrorCode

  constructor(
    code:
      TrapezoidalCriticalControlWidthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalCriticalControlWidthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

function capacityAtWidth(
  input:
    TrapezoidalCriticalControlWidthInput,
  bottomWidth: number,
) {
  return (
    calculateTrapezoidalMaximumDischargeSpecificEnergy({
      bottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      availableSpecificEnergy:
        input.availableSpecificEnergy,

      fluidDensity:
        input.fluidDensity,
    })
  )
}

export function calculateTrapezoidalCriticalControlWidth(
  input:
    TrapezoidalCriticalControlWidthInput,
): TrapezoidalCriticalControlWidthResult {
  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalCriticalControlWidthError(
      'INVALID_FLOW_RATE',
      'Design volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.availableSpecificEnergy,
    ) ||
    input.availableSpecificEnergy <= 0
  ) {
    throw new TrapezoidalCriticalControlWidthError(
      'INVALID_SPECIFIC_ENERGY',
      'Available specific energy must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalCriticalControlWidthError(
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
    throw new TrapezoidalCriticalControlWidthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const z =
    input.sideSlopeHorizontalPerVertical

  const triangularCriticalDepth =
    (
      4 /
      5
    ) *
    input.availableSpecificEnergy

  const zeroBottomWidthCapacity =
    z === 0
      ? 0
      : z *
        Math.sqrt(
          GRAVITATIONAL_ACCELERATION /
          2,
        ) *
        triangularCriticalDepth **
          (
            5 / 2
          )

  const flowTolerance =
    Math.max(
      1e-10,
      input.volumetricFlowRate *
      1e-10,
    )

  if (
    z > 0 &&
    input.volumetricFlowRate <=
      zeroBottomWidthCapacity +
      flowTolerance
  ) {
    throw new TrapezoidalCriticalControlWidthError(
      'FLOW_BELOW_ZERO_WIDTH_LIMIT',
      'For the specified side slope and specific energy, a zero-bottom-width triangular section already carries at least the requested critical discharge. No strictly positive trapezoidal bottom width exists for this critical-control design.',
    )
  }

  let lowerWidth =
    Math.max(
      1e-10,
      input.availableSpecificEnergy *
      1e-10,
    )

  const lower =
    capacityAtWidth(
      input,
      lowerWidth,
    )

  if (
    lower.maximumVolumetricFlowRate >
    input.volumetricFlowRate +
    flowTolerance
  ) {
    throw new TrapezoidalCriticalControlWidthError(
      'BRACKETING_FAILURE',
      'The lower positive-width capacity already exceeds the target discharge.',
    )
  }

  let upperWidth =
    Math.max(
      1,
      input.availableSpecificEnergy,
    )

  let upper =
    capacityAtWidth(
      input,
      upperWidth,
    )

  let expansions =
    0

  while (
    upper.maximumVolumetricFlowRate <
    input.volumetricFlowRate
  ) {
    upperWidth *=
      2

    expansions +=
      1

    if (
      expansions >
      100 ||
      !Number.isFinite(
        upperWidth,
      ) ||
      upperWidth >
      1e12
    ) {
      throw new TrapezoidalCriticalControlWidthError(
        'BRACKETING_FAILURE',
        'Could not establish an upper bottom-width bracket for the required critical discharge.',
      )
    }

    upper =
      capacityAtWidth(
        input,
        upperWidth,
      )
  }

  let finalForward =
    upper

  let requiredBottomWidth =
    upperWidth

  let solverIterations =
    0

  for (
    let iteration = 1;
    iteration <= 200;
    iteration += 1
  ) {
    const width =
      (
        lowerWidth +
        upperWidth
      ) /
      2

    const forward =
      capacityAtWidth(
        input,
        width,
      )

    const residual =
      forward.maximumVolumetricFlowRate -
      input.volumetricFlowRate

    finalForward =
      forward

    requiredBottomWidth =
      width

    solverIterations =
      iteration

    if (
      Math.abs(
        residual,
      ) <=
      flowTolerance
    ) {
      break
    }

    if (
      residual <
      0
    ) {
      lowerWidth =
        width
    } else {
      upperWidth =
        width
    }

    if (
      iteration ===
      200
    ) {
      throw new TrapezoidalCriticalControlWidthError(
        'CONVERGENCE_FAILURE',
        'Critical-control bottom-width solver did not converge within 200 iterations.',
      )
    }
  }

  const reconstructedMaximumFlowRate =
    finalForward.maximumVolumetricFlowRate

  const flowClosureResidual =
    reconstructedMaximumFlowRate -
    input.volumetricFlowRate

  const relativeFlowClosureResidual =
    flowClosureResidual /
    input.volumetricFlowRate

  const criticalDepth =
    finalForward.criticalDepth

  const criticalFlowArea =
    finalForward.criticalFlowArea

  const criticalTopWidth =
    finalForward.criticalTopWidth

  const criticalHydraulicDepth =
    finalForward.criticalHydraulicDepth

  const criticalVelocity =
    finalForward.criticalVelocity

  const criticalVelocityHead =
    finalForward.criticalVelocityHead

  const criticalFroudeNumber =
    finalForward.criticalFroudeNumber

  const recoveredSpecificEnergy =
    finalForward.recoveredSpecificEnergy

  const specificEnergyResidual =
    recoveredSpecificEnergy -
    input.availableSpecificEnergy

  const criticalConditionResidual =
    (
      input.volumetricFlowRate *
      input.volumetricFlowRate *
      criticalTopWidth
    ) /
    (
      GRAVITATIONAL_ACCELERATION *
      criticalFlowArea **
        3
    ) -
    1

  const bottomWidthToCriticalDepthRatio =
    requiredBottomWidth /
    criticalDepth

  const capacityMarginAboveZeroWidthLimit =
    input.volumetricFlowRate -
    zeroBottomWidthCapacity

  const designMassFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    requiredBottomWidth,

    criticalDepth,

    criticalFlowArea,

    criticalTopWidth,

    criticalHydraulicDepth,

    criticalVelocity,

    criticalVelocityHead,

    criticalFroudeNumber,

    bottomWidthToCriticalDepthRatio,

    capacityMarginAboveZeroWidthLimit,

    reconstructedMaximumFlowRate,

    recoveredSpecificEnergy,

    designMassFlowRate,
  ]

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      zeroBottomWidthCapacity,
    ) ||
    zeroBottomWidthCapacity < 0 ||
    Math.abs(
      criticalFroudeNumber -
      1
    ) >
      1e-10 ||
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
      1e-10 ||
    !Number.isFinite(
      specificEnergyResidual,
    ) ||
    Math.abs(
      specificEnergyResidual,
    ) >
      Math.max(
        1e-10,
        input.availableSpecificEnergy *
        1e-9,
      ) ||
    !Number.isFinite(
      criticalConditionResidual,
    ) ||
    Math.abs(
      criticalConditionResidual,
    ) >
      1e-9
  ) {
    throw new TrapezoidalCriticalControlWidthError(
      'NUMERICAL_FAILURE',
      'The critical-control width solution failed its discharge, specific-energy or Froude closure checks.',
    )
  }

  return {
    requiredBottomWidth,

    availableSpecificEnergy:
      input.availableSpecificEnergy,

    volumetricFlowRate:
      input.volumetricFlowRate,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    criticalDepth,

    criticalFlowArea,

    criticalTopWidth,

    criticalHydraulicDepth,

    criticalVelocity,

    criticalVelocityHead,

    criticalFroudeNumber,

    bottomWidthToCriticalDepthRatio,

    zeroBottomWidthCapacity,

    capacityMarginAboveZeroWidthLimit,

    reconstructedMaximumFlowRate,

    flowClosureResidual,

    relativeFlowClosureResidual,

    recoveredSpecificEnergy,

    specificEnergyResidual,

    criticalConditionResidual,

    designMassFlowRate,

    solverIterations,

    modelName:
      'Required Trapezoidal Critical-Control Bottom Width',

    limitationDescription:
      'Inverse critical-flow control-section design using the maximum-discharge specific-energy model. A strictly positive bottom width is solved so that the requested discharge equals the section critical-flow capacity at the specified specific energy. For sloped sides, requested flow must exceed the zero-bottom-width triangular limiting capacity.',
  }
}

export function createTrapezoidalCriticalControlWidthCsv(
  input:
    TrapezoidalCriticalControlWidthInput,
  result:
    TrapezoidalCriticalControlWidthResult,
): string {
  const rows = [
    [
      'Required Trapezoidal Critical-Control Bottom Width',
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
      'Available specific energy',
      input.availableSpecificEnergy,
      'm',
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
      'Required bottom width',
      result.requiredBottomWidth,
      'm',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical flow area',
      result.criticalFlowArea,
      'm2',
    ],
    [
      'Critical top width',
      result.criticalTopWidth,
      'm',
    ],
    [
      'Critical hydraulic depth',
      result.criticalHydraulicDepth,
      'm',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Critical velocity head',
      result.criticalVelocityHead,
      'm',
    ],
    [
      'Critical Froude number',
      result.criticalFroudeNumber,
      '-',
    ],
    [
      'Bottom width / critical depth',
      result.bottomWidthToCriticalDepthRatio,
      '-',
    ],
    [
      'Zero-bottom-width limiting capacity',
      result.zeroBottomWidthCapacity,
      'm3/s',
    ],
    [
      'Capacity margin above zero-width limit',
      result.capacityMarginAboveZeroWidthLimit,
      'm3/s',
    ],
    [
      'Reconstructed maximum flow rate',
      result.reconstructedMaximumFlowRate,
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
    [
      'Recovered specific energy',
      result.recoveredSpecificEnergy,
      'm',
    ],
    [
      'Specific energy residual',
      result.specificEnergyResidual,
      'm',
    ],
    [
      'Critical condition residual',
      result.criticalConditionResidual,
      '-',
    ],
    [
      'Design mass flow rate',
      result.designMassFlowRate,
      'kg/s',
    ],
    [
      'Solver iterations',
      result.solverIterations,
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
