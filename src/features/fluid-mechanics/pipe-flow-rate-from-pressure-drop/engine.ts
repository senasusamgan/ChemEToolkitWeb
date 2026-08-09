import {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
} from '../shared/pipeHydraulicsCore.ts'

import type {
  PipeFlowRateFromPressureDropInput,
  PipeFlowRateFromPressureDropResult,
} from './types.ts'

export {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
}

export const PIPE_FLOW_RATE_FROM_PRESSURE_DROP_ENGINE_VERSION =
  'pipe-flow-rate-from-pressure-drop-v1'

export type PipeFlowRateFromPressureDropErrorCode =
  | 'INVALID_AVAILABLE_PRESSURE_DROP'
  | 'FLOW_RATE_NOT_BRACKETED'
  | 'NUMERICAL_FAILURE'

export class PipeFlowRateFromPressureDropError
  extends Error {
  readonly code:
    PipeFlowRateFromPressureDropErrorCode

  constructor(
    code:
      PipeFlowRateFromPressureDropErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PipeFlowRateFromPressureDropError'

    this.code =
      code
  }
}

const MINIMUM_FLOW_RATE =
  1e-12

const MAXIMUM_FLOW_RATE =
  1000

const BISECTION_ITERATIONS =
  100

function evaluate(
  input:
    PipeFlowRateFromPressureDropInput,
  volumetricFlowRate: number,
) {
  return calculatePipeHydraulicsState({
    diameter:
      input.diameter,

    volumetricFlowRate,

    pipeLength:
      input.pipeLength,

    fluidDensity:
      input.fluidDensity,

    dynamicViscosity:
      input.dynamicViscosity,

    absoluteRoughness:
      input.absoluteRoughness,

    minorLossCoefficient:
      input.minorLossCoefficient,
  })
}

export function calculatePipeFlowRateFromPressureDrop(
  input:
    PipeFlowRateFromPressureDropInput,
): PipeFlowRateFromPressureDropResult {
  if (
    !Number.isFinite(
      input.availablePressureDrop,
    ) ||
    input.availablePressureDrop <= 0
  ) {
    throw new PipeFlowRateFromPressureDropError(
      'INVALID_AVAILABLE_PRESSURE_DROP',
      'Available pressure drop must be a positive finite value.',
    )
  }

  /*
   These two evaluations also validate
   diameter, length, density, viscosity,
   roughness and minor-loss coefficient
   through the shared 401 hydraulic core.
  */

  const minimumState =
    evaluate(
      input,
      MINIMUM_FLOW_RATE,
    )

  const maximumState =
    evaluate(
      input,
      MAXIMUM_FLOW_RATE,
    )

  if (
    minimumState.totalPressureDrop >
      input.availablePressureDrop ||
    maximumState.totalPressureDrop <
      input.availablePressureDrop
  ) {
    throw new PipeFlowRateFromPressureDropError(
      'FLOW_RATE_NOT_BRACKETED',
      'The available pressure drop cannot be bracketed within the supported positive flow-rate search range.',
    )
  }

  let lowerFlowRate =
    MINIMUM_FLOW_RATE

  let upperFlowRate =
    MAXIMUM_FLOW_RATE

  for (
    let iteration = 0;
    iteration <
      BISECTION_ITERATIONS;
    iteration += 1
  ) {
    const midpoint =
      (
        lowerFlowRate +
        upperFlowRate
      ) /
      2

    const midpointState =
      evaluate(
        input,
        midpoint,
      )

    if (
      midpointState.totalPressureDrop <
      input.availablePressureDrop
    ) {
      lowerFlowRate =
        midpoint
    } else {
      upperFlowRate =
        midpoint
    }
  }

  const volumetricFlowRate =
    upperFlowRate

  const finalState =
    evaluate(
      input,
      volumetricFlowRate,
    )

  const pressureDropResidual =
    finalState.totalPressureDrop -
    input.availablePressureDrop

  const pressureDropResidualPercent =
    Math.abs(
      pressureDropResidual,
    ) /
    input.availablePressureDrop *
    100

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    volumetricFlowRate *
    input.fluidDensity

  const values = [
    volumetricFlowRate,
    volumetricFlowRateCubicMetersPerHour,
    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    pressureDropResidual,
    pressureDropResidualPercent,

    finalState.totalPressureDrop,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    volumetricFlowRate <= 0 ||
    massFlowRate <= 0 ||
    pressureDropResidualPercent >
      1e-6
  ) {
    throw new PipeFlowRateFromPressureDropError(
      'NUMERICAL_FAILURE',
      'The flow-rate solver did not converge to the available pressure drop.',
    )
  }

  return {
    ...finalState,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,
    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    availablePressureDrop:
      input.availablePressureDrop,

    pressureDropResidual,
    pressureDropResidualPercent,

    iterationCount:
      BISECTION_ITERATIONS,

    modelName:
      'Pipe Flow Rate from Available Pressure Drop',

    limitationDescription:
      'Steady incompressible single-phase pipe flow solved from an available pressure-drop budget. Darcy-Weisbach major loss and a lumped minor-loss coefficient are evaluated with the shared pipe-hydraulics core. Friction factor changes with Reynolds number and relative roughness during every flow-rate trial.',
  }
}

export function createPipeFlowRateFromPressureDropCsv(
  input:
    PipeFlowRateFromPressureDropInput,
  result:
    PipeFlowRateFromPressureDropResult,
): string {
  const rows = [
    [
      'Pipe Flow Rate from Available Pressure Drop',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe diameter',
      input.diameter,
      'm',
    ],
    [
      'Pipe length',
      input.pipeLength,
      'm',
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
      'Absolute roughness',
      input.absoluteRoughness,
      'm',
    ],
    [
      'Minor-loss coefficient',
      input.minorLossCoefficient,
      '-',
    ],
    [
      'Available pressure drop',
      input.availablePressureDrop,
      'Pa',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
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
      'Mean velocity',
      result.velocity,
      'm/s',
    ],
    [
      'Reynolds number',
      result.reynoldsNumber,
      '-',
    ],
    [
      'Darcy friction factor',
      result.frictionFactor,
      '-',
    ],
    [
      'Friction pressure drop',
      result.frictionPressureDrop,
      'Pa',
    ],
    [
      'Minor-loss pressure drop',
      result.minorPressureDrop,
      'Pa',
    ],
    [
      'Total pressure drop',
      result.totalPressureDrop,
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
