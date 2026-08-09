import type {
  PitotFlowRegime,
  PitotTubeVelocityFlowInput,
  PitotTubeVelocityFlowResult,
} from './types.ts'

export const PITOT_TUBE_VELOCITY_FLOW_ENGINE_VERSION =
  'pitot-tube-velocity-flow-v1'

export type PitotTubeVelocityFlowErrorCode =
  | 'INVALID_PIPE_DIAMETER'
  | 'INVALID_DIFFERENTIAL_PRESSURE'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'INVALID_PITOT_COEFFICIENT'
  | 'NUMERICAL_FAILURE'

export class PitotTubeVelocityFlowError
  extends Error {
  readonly code:
    PitotTubeVelocityFlowErrorCode

  constructor(
    code:
      PitotTubeVelocityFlowErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PitotTubeVelocityFlowError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

function determineFlowRegime(
  reynoldsNumber: number,
): PitotFlowRegime {
  if (
    reynoldsNumber < 2300
  ) {
    return 'laminar'
  }

  if (
    reynoldsNumber < 4000
  ) {
    return 'transitional'
  }

  return 'turbulent'
}

export function calculatePitotTubeVelocityFlow(
  input:
    PitotTubeVelocityFlowInput,
): PitotTubeVelocityFlowResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <= 0
  ) {
    throw new PitotTubeVelocityFlowError(
      'INVALID_PIPE_DIAMETER',
      'Pipe diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.differentialPressure,
    ) ||
    input.differentialPressure <= 0
  ) {
    throw new PitotTubeVelocityFlowError(
      'INVALID_DIFFERENTIAL_PRESSURE',
      'Pitot stagnation-to-static differential pressure must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new PitotTubeVelocityFlowError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dynamicViscosity,
    ) ||
    input.dynamicViscosity <= 0
  ) {
    throw new PitotTubeVelocityFlowError(
      'INVALID_VISCOSITY',
      'Dynamic viscosity must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.pitotCoefficient,
    ) ||
    input.pitotCoefficient <= 0
  ) {
    throw new PitotTubeVelocityFlowError(
      'INVALID_PITOT_COEFFICIENT',
      'Pitot coefficient must be a positive finite value.',
    )
  }

  const pipeCrossSectionalArea =
    Math.PI *
    input.pipeDiameter *
    input.pipeDiameter /
    4

  const idealVelocity =
    Math.sqrt(
      2 *
      input.differentialPressure /
      input.fluidDensity,
    )

  const correctedVelocity =
    input.pitotCoefficient *
    idealVelocity

  const volumetricFlowRate =
    pipeCrossSectionalArea *
    correctedVelocity

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const reynoldsNumber =
    input.fluidDensity *
    correctedVelocity *
    input.pipeDiameter /
    input.dynamicViscosity

  const flowRegime =
    determineFlowRegime(
      reynoldsNumber,
    )

  const measuredVelocityHead =
    input.differentialPressure /
    (
      input.fluidDensity *
      GRAVITATIONAL_ACCELERATION
    )

  const correctedVelocityHead =
    correctedVelocity *
    correctedVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const correctedDynamicPressure =
    0.5 *
    input.fluidDensity *
    correctedVelocity *
    correctedVelocity

  const values = [
    pipeCrossSectionalArea,

    idealVelocity,
    correctedVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    measuredVelocityHead,

    correctedVelocityHead,

    correctedDynamicPressure,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    values.some(
      value =>
        value <= 0,
    )
  ) {
    throw new PitotTubeVelocityFlowError(
      'NUMERICAL_FAILURE',
      'The Pitot-tube calculation did not produce positive finite results.',
    )
  }

  return {
    pipeDiameter:
      input.pipeDiameter,

    pipeCrossSectionalArea,

    differentialPressure:
      input.differentialPressure,

    pitotCoefficient:
      input.pitotCoefficient,

    idealVelocity,

    correctedVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    reynoldsNumber,

    flowRegime,

    measuredVelocityHead,

    correctedVelocityHead,

    correctedDynamicPressure,

    modelName:
      'Pitot Tube Velocity & Volumetric Flow',

    limitationDescription:
      'Steady incompressible single-phase flow. The measured stagnation-to-static pressure difference is converted to local velocity using Bernoulli dynamic pressure with a user-specified Pitot coefficient. Pipe-average flow rate assumes the corrected Pitot velocity is representative of the cross-sectional mean velocity; use an appropriate traverse or profile correction when required.',
  }
}

export function createPitotTubeVelocityFlowCsv(
  input:
    PitotTubeVelocityFlowInput,
  result:
    PitotTubeVelocityFlowResult,
): string {
  const rows = [
    [
      'Pitot Tube Velocity & Volumetric Flow',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Differential pressure',
      input.differentialPressure,
      'Pa',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [
      'Dynamic viscosity',
      input.dynamicViscosity,
      'Pa s',
    ],
    [
      'Pitot coefficient',
      input.pitotCoefficient,
      '-',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Ideal Pitot velocity',
      result.idealVelocity,
      'm/s',
    ],
    [
      'Corrected velocity',
      result.correctedVelocity,
      'm/s',
    ],
    [
      'Pipe cross-sectional area',
      result.pipeCrossSectionalArea,
      'm2',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Volumetric flow rate',
      result.volumetricFlowRateLitersPerSecond,
      'L/s',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Reynolds number',
      result.reynoldsNumber,
      '-',
    ],
    [
      'Flow regime',
      result.flowRegime,
      '-',
    ],
    [
      'Measured velocity head',
      result.measuredVelocityHead,
      'm',
    ],
    [
      'Corrected dynamic pressure',
      result.correctedDynamicPressure,
      'Pa',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
