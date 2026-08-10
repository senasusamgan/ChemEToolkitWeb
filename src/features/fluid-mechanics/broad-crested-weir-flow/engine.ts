import type {
  BroadCrestedWeirFlowInput,
  BroadCrestedWeirFlowResult,
} from './types.ts'

export const BROAD_CRESTED_WEIR_FLOW_ENGINE_VERSION =
  'broad-crested-weir-flow-v1'

export type BroadCrestedWeirFlowErrorCode =
  | 'INVALID_CREST_WIDTH'
  | 'INVALID_HEAD'
  | 'INVALID_DISCHARGE_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class BroadCrestedWeirFlowError
  extends Error {
  readonly code:
    BroadCrestedWeirFlowErrorCode

  constructor(
    code:
      BroadCrestedWeirFlowErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'BroadCrestedWeirFlowError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateBroadCrestedWeirFlow(
  input:
    BroadCrestedWeirFlowInput,
): BroadCrestedWeirFlowResult {
  if (
    !Number.isFinite(
      input.crestWidth,
    ) ||
    input.crestWidth <= 0
  ) {
    throw new BroadCrestedWeirFlowError(
      'INVALID_CREST_WIDTH',
      'Broad-crested weir width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamHeadAboveCrest,
    ) ||
    input.upstreamHeadAboveCrest <= 0
  ) {
    throw new BroadCrestedWeirFlowError(
      'INVALID_HEAD',
      'Upstream head above the crest must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dischargeCoefficient,
    ) ||
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1
  ) {
    throw new BroadCrestedWeirFlowError(
      'INVALID_DISCHARGE_COEFFICIENT',
      'Discharge coefficient must be greater than 0 and no greater than 1.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new BroadCrestedWeirFlowError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const theoreticalCriticalDepth =
    (
      2 /
      3
    ) *
    input.upstreamHeadAboveCrest

  const theoreticalCriticalVelocity =
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      theoreticalCriticalDepth,
    )

  const theoreticalCriticalFroudeNumber =
    theoreticalCriticalVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      theoreticalCriticalDepth,
    )

  const theoreticalCriticalFlowArea =
    input.crestWidth *
    theoreticalCriticalDepth

  const idealUnitDischarge =
    theoreticalCriticalVelocity *
    theoreticalCriticalDepth

  const correctedUnitDischarge =
    input.dischargeCoefficient *
    idealUnitDischarge

  const idealVolumetricFlowRate =
    input.crestWidth *
    idealUnitDischarge

  const volumetricFlowRate =
    input.crestWidth *
    correctedUnitDischarge

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const theoreticalSpecificEnergy =
    theoreticalCriticalDepth +
    (
      theoreticalCriticalVelocity *
      theoreticalCriticalVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergyResidual =
    theoreticalSpecificEnergy -
    input.upstreamHeadAboveCrest

  const recoveredCriticalDepth =
    (
      volumetricFlowRate /
      (
        input.dischargeCoefficient *
        input.crestWidth *
        Math.sqrt(
          GRAVITATIONAL_ACCELERATION,
        )
      )
    ) **
    (
      2 / 3
    )

  const recoveredUpstreamHead =
    (
      3 /
      2
    ) *
    recoveredCriticalDepth

  const headClosureResidual =
    recoveredUpstreamHead -
    input.upstreamHeadAboveCrest

  const dischargeRatio =
    volumetricFlowRate /
    idealVolumetricFlowRate

  const positiveValues = [
    theoreticalCriticalDepth,

    theoreticalCriticalVelocity,

    theoreticalCriticalFroudeNumber,

    theoreticalCriticalFlowArea,

    idealUnitDischarge,

    correctedUnitDischarge,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    theoreticalSpecificEnergy,

    recoveredUpstreamHead,

    dischargeRatio,
  ]

  const headTolerance =
    Math.max(
      1e-12,
      input.upstreamHeadAboveCrest *
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
    Math.abs(
      theoreticalCriticalFroudeNumber -
      1
    ) >
      1e-12 ||
    !Number.isFinite(
      specificEnergyResidual,
    ) ||
    Math.abs(
      specificEnergyResidual,
    ) >
      headTolerance ||
    !Number.isFinite(
      headClosureResidual,
    ) ||
    Math.abs(
      headClosureResidual,
    ) >
      headTolerance
  ) {
    throw new BroadCrestedWeirFlowError(
      'NUMERICAL_FAILURE',
      'The broad-crested-weir calculation failed its critical-flow or recovered-head closure check.',
    )
  }

  return {
    crestWidth:
      input.crestWidth,

    upstreamHeadAboveCrest:
      input.upstreamHeadAboveCrest,

    dischargeCoefficient:
      input.dischargeCoefficient,

    theoreticalCriticalDepth,

    theoreticalCriticalVelocity,

    theoreticalCriticalFroudeNumber,

    theoreticalCriticalFlowArea,

    idealUnitDischarge,

    correctedUnitDischarge,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    theoreticalSpecificEnergy,

    specificEnergyResidual,

    recoveredUpstreamHead,

    headClosureResidual,

    dischargeRatio,

    modelName:
      'Broad-Crested Weir Flow Rate',

    limitationDescription:
      'Free-flow broad-crested weir model based on ideal critical-flow control over a sufficiently long horizontal crest. The supplied discharge coefficient corrects the theoretical discharge. Approach-velocity, submergence, crest-shape and nonhydrostatic corrections are not modeled explicitly.',
  }
}

export function createBroadCrestedWeirFlowCsv(
  input:
    BroadCrestedWeirFlowInput,
  result:
    BroadCrestedWeirFlowResult,
): string {
  const rows = [
    [
      'Broad-Crested Weir Flow Rate',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Crest width',
      input.crestWidth,
      'm',
    ],
    [
      'Upstream head above crest',
      input.upstreamHeadAboveCrest,
      'm',
    ],
    [
      'Discharge coefficient',
      input.dischargeCoefficient,
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
      'Theoretical critical depth',
      result.theoreticalCriticalDepth,
      'm',
    ],
    [
      'Theoretical critical velocity',
      result.theoreticalCriticalVelocity,
      'm/s',
    ],
    [
      'Theoretical critical Froude number',
      result.theoreticalCriticalFroudeNumber,
      '-',
    ],
    [
      'Ideal unit discharge',
      result.idealUnitDischarge,
      'm2/s',
    ],
    [
      'Corrected unit discharge',
      result.correctedUnitDischarge,
      'm2/s',
    ],
    [
      'Ideal volumetric flow rate',
      result.idealVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Corrected volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Corrected volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Corrected volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Theoretical specific energy',
      result.theoreticalSpecificEnergy,
      'm',
    ],
    [
      'Specific energy residual',
      result.specificEnergyResidual,
      'm',
    ],
    [
      'Recovered upstream head',
      result.recoveredUpstreamHead,
      'm',
    ],
    [
      'Head closure residual',
      result.headClosureResidual,
      'm',
    ],
    [
      'Actual/ideal discharge ratio',
      result.dischargeRatio,
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
