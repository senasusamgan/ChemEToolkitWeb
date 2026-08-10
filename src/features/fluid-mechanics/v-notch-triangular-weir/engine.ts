import type {
  VNotchTriangularWeirInput,
  VNotchTriangularWeirResult,
} from './types.ts'

export const V_NOTCH_TRIANGULAR_WEIR_ENGINE_VERSION =
  'v-notch-triangular-weir-v1'

export type VNotchTriangularWeirErrorCode =
  | 'INVALID_NOTCH_ANGLE'
  | 'INVALID_HEAD'
  | 'INVALID_DISCHARGE_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class VNotchTriangularWeirError
  extends Error {
  readonly code:
    VNotchTriangularWeirErrorCode

  constructor(
    code:
      VNotchTriangularWeirErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'VNotchTriangularWeirError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

const TRIANGULAR_WEIR_CONSTANT =
  8 / 15

export function calculateVNotchTriangularWeir(
  input:
    VNotchTriangularWeirInput,
): VNotchTriangularWeirResult {
  if (
    !Number.isFinite(
      input.notchAngleDegrees,
    ) ||
    input.notchAngleDegrees <= 0 ||
    input.notchAngleDegrees >= 180
  ) {
    throw new VNotchTriangularWeirError(
      'INVALID_NOTCH_ANGLE',
      'V-notch included angle must be greater than 0° and less than 180°.',
    )
  }

  if (
    !Number.isFinite(
      input.headOverVertex,
    ) ||
    input.headOverVertex <= 0
  ) {
    throw new VNotchTriangularWeirError(
      'INVALID_HEAD',
      'Head above the V-notch vertex must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dischargeCoefficient,
    ) ||
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1
  ) {
    throw new VNotchTriangularWeirError(
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
    throw new VNotchTriangularWeirError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const notchAngleRadians =
    input.notchAngleDegrees *
    Math.PI /
    180

  const halfAngleTangent =
    Math.tan(
      notchAngleRadians /
      2,
    )

  if (
    !Number.isFinite(
      halfAngleTangent,
    ) ||
    halfAngleTangent <= 0
  ) {
    throw new VNotchTriangularWeirError(
      'INVALID_NOTCH_ANGLE',
      'V-notch angle does not produce a valid positive half-angle tangent.',
    )
  }

  const topWidthAtHead =
    2 *
    input.headOverVertex *
    halfAngleTangent

  const wettedTriangularArea =
    input.headOverVertex *
    input.headOverVertex *
    halfAngleTangent

  const idealVolumetricFlowRate =
    TRIANGULAR_WEIR_CONSTANT *
    halfAngleTangent *
    Math.sqrt(
      2 *
      GRAVITATIONAL_ACCELERATION,
    ) *
    input.headOverVertex **
      2.5

  const volumetricFlowRate =
    input.dischargeCoefficient *
    idealVolumetricFlowRate

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const equivalentMeanVelocity =
    volumetricFlowRate /
    wettedTriangularArea

  const equivalentVelocityHead =
    (
      equivalentMeanVelocity *
      equivalentMeanVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const flowCoefficient =
    TRIANGULAR_WEIR_CONSTANT *
    input.dischargeCoefficient *
    halfAngleTangent *
    Math.sqrt(
      2 *
      GRAVITATIONAL_ACCELERATION,
    )

  const recoveredHeadOverVertex =
    (
      volumetricFlowRate /
      flowCoefficient
    ) **
    (
      1 / 2.5
    )

  const headClosureResidual =
    recoveredHeadOverVertex -
    input.headOverVertex

  const dischargeRatio =
    volumetricFlowRate /
    idealVolumetricFlowRate

  const positiveValues = [
    notchAngleRadians,

    halfAngleTangent,

    topWidthAtHead,

    wettedTriangularArea,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    equivalentMeanVelocity,

    equivalentVelocityHead,

    recoveredHeadOverVertex,

    dischargeRatio,
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
      headClosureResidual,
    ) ||
    Math.abs(
      headClosureResidual,
    ) >
      Math.max(
        1e-12,
        input.headOverVertex *
          1e-10,
      )
  ) {
    throw new VNotchTriangularWeirError(
      'NUMERICAL_FAILURE',
      'The V-notch weir calculation failed its recovered-head closure check.',
    )
  }

  return {
    notchAngleDegrees:
      input.notchAngleDegrees,

    notchAngleRadians,

    halfAngleTangent,

    headOverVertex:
      input.headOverVertex,

    dischargeCoefficient:
      input.dischargeCoefficient,

    topWidthAtHead,

    wettedTriangularArea,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    equivalentMeanVelocity,

    equivalentVelocityHead,

    recoveredHeadOverVertex,

    headClosureResidual,

    dischargeRatio,

    modelName:
      'V-Notch / Triangular Weir Flow Rate',

    limitationDescription:
      'Free-flow sharp-crested triangular-weir model using Q = (8/15)Cd tan(theta/2) sqrt(2g) H^(5/2). The upstream head is measured above the notch vertex. The model assumes a fully aerated free nappe and does not automatically apply approach-velocity, viscosity, surface-tension or downstream-submergence corrections.',
  }
}

export function createVNotchTriangularWeirCsv(
  input:
    VNotchTriangularWeirInput,
  result:
    VNotchTriangularWeirResult,
): string {
  const rows = [
    [
      'V-Notch / Triangular Weir Flow Rate',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'V-notch included angle',
      input.notchAngleDegrees,
      'deg',
    ],
    [
      'Head over notch vertex',
      input.headOverVertex,
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
      'Top width at measured head',
      result.topWidthAtHead,
      'm',
    ],
    [
      'Wetted triangular area',
      result.wettedTriangularArea,
      'm2',
    ],
    [
      'Ideal volumetric flow rate',
      result.idealVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Actual volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Actual volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Actual volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Equivalent mean velocity',
      result.equivalentMeanVelocity,
      'm/s',
    ],
    [
      'Equivalent velocity head',
      result.equivalentVelocityHead,
      'm',
    ],
    [
      'Recovered head over vertex',
      result.recoveredHeadOverVertex,
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
