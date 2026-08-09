export type PipeFlowRegime =
  | 'laminar'
  | 'transitional'
  | 'turbulent'

export interface PipeHydraulicsStateInput {
  diameter: number
  volumetricFlowRate: number
  pipeLength: number

  fluidDensity: number
  dynamicViscosity: number

  absoluteRoughness: number
  minorLossCoefficient: number
}

export interface PipeHydraulicsStateResult {
  crossSectionalArea: number
  velocity: number

  reynoldsNumber: number
  relativeRoughness: number

  frictionFactor: number
  flowRegime: PipeFlowRegime

  dynamicPressure: number

  frictionPressureDrop: number
  minorPressureDrop: number
  totalPressureDrop: number

  totalHeadLoss: number
}

export type PipeHydraulicsCoreErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_PIPE_LENGTH'
  | 'INVALID_DENSITY'
  | 'INVALID_VISCOSITY'
  | 'INVALID_ROUGHNESS'
  | 'INVALID_MINOR_LOSS'
  | 'NUMERICAL_FAILURE'

export class PipeHydraulicsCoreError
  extends Error {
  readonly code:
    PipeHydraulicsCoreErrorCode

  constructor(
    code:
      PipeHydraulicsCoreErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PipeHydraulicsCoreError'

    this.code =
      code
  }
}

function requirePositive(
  value: number,
  code:
    PipeHydraulicsCoreErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new PipeHydraulicsCoreError(
      code,
      `${label} must be a positive finite value.`,
    )
  }
}

function calculateFrictionFactor(
  reynoldsNumber: number,
  relativeRoughness: number,
): {
  frictionFactor: number
  flowRegime: PipeFlowRegime
} {
  if (
    reynoldsNumber <
    2300
  ) {
    return {
      frictionFactor:
        64 /
        reynoldsNumber,

      flowRegime:
        'laminar',
    }
  }

  const turbulentFactor =
    1 /
    (
      -1.8 *
      Math.log10(
        (
          relativeRoughness /
          3.7
        ) **
          1.11 +
        6.9 /
          reynoldsNumber,
      )
    ) **
      2

  if (
    reynoldsNumber >=
    4000
  ) {
    return {
      frictionFactor:
        turbulentFactor,

      flowRegime:
        'turbulent',
    }
  }

  const laminarFactor =
    64 /
    reynoldsNumber

  const blendFraction =
    (
      reynoldsNumber -
      2300
    ) /
    (
      4000 -
      2300
    )

  return {
    frictionFactor:
      laminarFactor *
        (
          1 -
          blendFraction
        ) +
      turbulentFactor *
        blendFraction,

    flowRegime:
      'transitional',
  }
}

export function calculatePipeHydraulicsState(
  input:
    PipeHydraulicsStateInput,
): PipeHydraulicsStateResult {
  requirePositive(
    input.diameter,
    'INVALID_DIAMETER',
    'Pipe diameter',
  )

  requirePositive(
    input.volumetricFlowRate,
    'INVALID_FLOW_RATE',
    'Volumetric flow rate',
  )

  requirePositive(
    input.pipeLength,
    'INVALID_PIPE_LENGTH',
    'Pipe length',
  )

  requirePositive(
    input.fluidDensity,
    'INVALID_DENSITY',
    'Fluid density',
  )

  requirePositive(
    input.dynamicViscosity,
    'INVALID_VISCOSITY',
    'Dynamic viscosity',
  )

  if (
    !Number.isFinite(
      input.absoluteRoughness,
    ) ||
    input.absoluteRoughness < 0
  ) {
    throw new PipeHydraulicsCoreError(
      'INVALID_ROUGHNESS',
      'Absolute roughness must be a non-negative finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.minorLossCoefficient,
    ) ||
    input.minorLossCoefficient < 0
  ) {
    throw new PipeHydraulicsCoreError(
      'INVALID_MINOR_LOSS',
      'Minor-loss coefficient must be a non-negative finite value.',
    )
  }

  const crossSectionalArea =
    Math.PI *
    input.diameter **
      2 /
    4

  const velocity =
    input.volumetricFlowRate /
    crossSectionalArea

  const reynoldsNumber =
    input.fluidDensity *
    velocity *
    input.diameter /
    input.dynamicViscosity

  const relativeRoughness =
    input.absoluteRoughness /
    input.diameter

  const {
    frictionFactor,
    flowRegime,
  } =
    calculateFrictionFactor(
      reynoldsNumber,
      relativeRoughness,
    )

  const dynamicPressure =
    input.fluidDensity *
    velocity **
      2 /
    2

  const frictionPressureDrop =
    frictionFactor *
    input.pipeLength /
    input.diameter *
    dynamicPressure

  const minorPressureDrop =
    input.minorLossCoefficient *
    dynamicPressure

  const totalPressureDrop =
    frictionPressureDrop +
    minorPressureDrop

  const gravitationalAcceleration =
    9.80665

  const totalHeadLoss =
    totalPressureDrop /
    (
      input.fluidDensity *
      gravitationalAcceleration
    )

  const values = [
    crossSectionalArea,
    velocity,

    reynoldsNumber,
    relativeRoughness,

    frictionFactor,
    dynamicPressure,

    frictionPressureDrop,
    minorPressureDrop,
    totalPressureDrop,

    totalHeadLoss,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    frictionFactor <= 0 ||
    totalPressureDrop <= 0
  ) {
    throw new PipeHydraulicsCoreError(
      'NUMERICAL_FAILURE',
      'The pipe-hydraulics calculation did not produce finite physical results.',
    )
  }

  return {
    crossSectionalArea,
    velocity,

    reynoldsNumber,
    relativeRoughness,

    frictionFactor,
    flowRegime,

    dynamicPressure,

    frictionPressureDrop,
    minorPressureDrop,
    totalPressureDrop,

    totalHeadLoss,
  }
}
