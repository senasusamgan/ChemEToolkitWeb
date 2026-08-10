import type {
  SharpCrestedRectangularWeirInput,
  SharpCrestedRectangularWeirResult,
} from './types.ts'

export const SHARP_CRESTED_RECTANGULAR_WEIR_ENGINE_VERSION =
  'sharp-crested-rectangular-weir-v1'

export type SharpCrestedRectangularWeirErrorCode =
  | 'INVALID_CREST_WIDTH'
  | 'INVALID_HEAD'
  | 'INVALID_DISCHARGE_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NUMERICAL_FAILURE'

export class SharpCrestedRectangularWeirError
  extends Error {
  readonly code:
    SharpCrestedRectangularWeirErrorCode

  constructor(
    code:
      SharpCrestedRectangularWeirErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'SharpCrestedRectangularWeirError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

const WEIR_CONSTANT =
  2 / 3

export function calculateSharpCrestedRectangularWeir(
  input:
    SharpCrestedRectangularWeirInput,
): SharpCrestedRectangularWeirResult {
  if (
    !Number.isFinite(
      input.crestWidth,
    ) ||
    input.crestWidth <= 0
  ) {
    throw new SharpCrestedRectangularWeirError(
      'INVALID_CREST_WIDTH',
      'Weir crest width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.headOverCrest,
    ) ||
    input.headOverCrest <= 0
  ) {
    throw new SharpCrestedRectangularWeirError(
      'INVALID_HEAD',
      'Head above the weir crest must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dischargeCoefficient,
    ) ||
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1
  ) {
    throw new SharpCrestedRectangularWeirError(
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
    throw new SharpCrestedRectangularWeirError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const idealVolumetricFlowRate =
    WEIR_CONSTANT *
    input.crestWidth *
    Math.sqrt(
      2 *
      GRAVITATIONAL_ACCELERATION,
    ) *
    input.headOverCrest **
      1.5

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

  const unitDischarge =
    volumetricFlowRate /
    input.crestWidth

  const equivalentFlowArea =
    input.crestWidth *
    input.headOverCrest

  const equivalentMeanVelocity =
    volumetricFlowRate /
    equivalentFlowArea

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
    (
      WEIR_CONSTANT *
      input.dischargeCoefficient *
      input.crestWidth *
      Math.sqrt(
        2 *
        GRAVITATIONAL_ACCELERATION,
      )
    )

  const recoveredHeadOverCrest =
    (
      volumetricFlowRate /
      flowCoefficient
    ) **
    (
      2 / 3
    )

  const headClosureResidual =
    recoveredHeadOverCrest -
    input.headOverCrest

  const dischargeRatio =
    volumetricFlowRate /
    idealVolumetricFlowRate

  const positiveValues = [
    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    unitDischarge,

    equivalentFlowArea,

    equivalentMeanVelocity,

    equivalentVelocityHead,

    recoveredHeadOverCrest,

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
        input.headOverCrest *
          1e-10,
      )
  ) {
    throw new SharpCrestedRectangularWeirError(
      'NUMERICAL_FAILURE',
      'The rectangular-weir calculation failed its recovered-head closure check.',
    )
  }

  return {
    crestWidth:
      input.crestWidth,

    headOverCrest:
      input.headOverCrest,

    dischargeCoefficient:
      input.dischargeCoefficient,

    idealVolumetricFlowRate,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    unitDischarge,

    equivalentFlowArea,

    equivalentMeanVelocity,

    equivalentVelocityHead,

    recoveredHeadOverCrest,

    headClosureResidual,

    dischargeRatio,

    modelName:
      'Sharp-Crested Rectangular Weir Flow Rate',

    limitationDescription:
      'Free-flow sharp-crested rectangular weir model using Q = (2/3)Cd b sqrt(2g) H^(3/2). The supplied crest width is treated as the effective discharge width. The model assumes a fully aerated free nappe and neglects explicit approach-velocity, end-contraction and downstream-submergence corrections.',
  }
}

export function createSharpCrestedRectangularWeirCsv(
  input:
    SharpCrestedRectangularWeirInput,
  result:
    SharpCrestedRectangularWeirResult,
): string {
  const rows = [
    [
      'Sharp-Crested Rectangular Weir Flow Rate',
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
      'Head over crest',
      input.headOverCrest,
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
      'Unit discharge',
      result.unitDischarge,
      'm2/s',
    ],
    [
      'Equivalent flow area',
      result.equivalentFlowArea,
      'm2',
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
      'Recovered head over crest',
      result.recoveredHeadOverCrest,
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
