import {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
} from '../shared/pipeHydraulicsCore.ts'

import type {
  MaximumPipeLengthFromPressureDropInput,
  MaximumPipeLengthFromPressureDropResult,
} from './types.ts'

export {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
}

export const MAXIMUM_PIPE_LENGTH_FROM_PRESSURE_DROP_ENGINE_VERSION =
  'maximum-pipe-length-pressure-drop-v1'

export type MaximumPipeLengthFromPressureDropErrorCode =
  | 'INVALID_AVAILABLE_PRESSURE_DROP'
  | 'PRESSURE_BUDGET_CONSUMED_BY_MINOR_LOSSES'
  | 'NUMERICAL_FAILURE'

export class MaximumPipeLengthFromPressureDropError
  extends Error {
  readonly code:
    MaximumPipeLengthFromPressureDropErrorCode

  constructor(
    code:
      MaximumPipeLengthFromPressureDropErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MaximumPipeLengthFromPressureDropError'

    this.code =
      code
  }
}

const REFERENCE_PIPE_LENGTH =
  1

export function calculateMaximumPipeLengthFromPressureDrop(
  input:
    MaximumPipeLengthFromPressureDropInput,
): MaximumPipeLengthFromPressureDropResult {
  if (
    !Number.isFinite(
      input.availablePressureDrop,
    ) ||
    input.availablePressureDrop <= 0
  ) {
    throw new MaximumPipeLengthFromPressureDropError(
      'INVALID_AVAILABLE_PRESSURE_DROP',
      'Available pressure drop must be a positive finite value.',
    )
  }

  /*
   Evaluate the shared hydraulics model at exactly 1 m.

   Because D and Q are fixed:
   - velocity is fixed
   - Reynolds number is fixed
   - friction factor is fixed
   - minor loss is independent of L
   - Darcy friction loss scales linearly with L

   Therefore the 1 m friction loss is also
   the friction-pressure-drop gradient in Pa/m.
  */

  const referenceState =
    calculatePipeHydraulicsState({
      diameter:
        input.diameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      pipeLength:
        REFERENCE_PIPE_LENGTH,

      fluidDensity:
        input.fluidDensity,

      dynamicViscosity:
        input.dynamicViscosity,

      absoluteRoughness:
        input.absoluteRoughness,

      minorLossCoefficient:
        input.minorLossCoefficient,
    })

  const frictionPressureDropPerUnitLength =
    referenceState.frictionPressureDrop /
    REFERENCE_PIPE_LENGTH

  const pressureAvailableForPipeFriction =
    input.availablePressureDrop -
    referenceState.minorPressureDrop

  if (
    pressureAvailableForPipeFriction <= 0
  ) {
    throw new MaximumPipeLengthFromPressureDropError(
      'PRESSURE_BUDGET_CONSUMED_BY_MINOR_LOSSES',
      'Minor losses alone consume or exceed the available pressure-drop budget, leaving no positive pipe length for distributed friction.',
    )
  }

  const maximumPipeLength =
    pressureAvailableForPipeFriction /
    frictionPressureDropPerUnitLength

  if (
    !Number.isFinite(
      maximumPipeLength,
    ) ||
    maximumPipeLength <= 0
  ) {
    throw new MaximumPipeLengthFromPressureDropError(
      'NUMERICAL_FAILURE',
      'The maximum pipe length calculation did not produce a positive finite result.',
    )
  }

  /*
   Verify the explicit inverse solution with the
   exact same shared hydraulics model.
  */

  const finalState =
    calculatePipeHydraulicsState({
      diameter:
        input.diameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      pipeLength:
        maximumPipeLength,

      fluidDensity:
        input.fluidDensity,

      dynamicViscosity:
        input.dynamicViscosity,

      absoluteRoughness:
        input.absoluteRoughness,

      minorLossCoefficient:
        input.minorLossCoefficient,
    })

  const pressureDropResidual =
    finalState.totalPressureDrop -
    input.availablePressureDrop

  const pressureDropResidualPercent =
    Math.abs(
      pressureDropResidual,
    ) /
    input.availablePressureDrop *
    100

  const minorLossBudgetFraction =
    referenceState.minorPressureDrop /
    input.availablePressureDrop

  const values = [
    maximumPipeLength,

    pressureAvailableForPipeFriction,
    frictionPressureDropPerUnitLength,
    minorLossBudgetFraction,

    pressureDropResidual,
    pressureDropResidualPercent,

    finalState.totalPressureDrop,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    pressureDropResidualPercent >
      1e-8
  ) {
    throw new MaximumPipeLengthFromPressureDropError(
      'NUMERICAL_FAILURE',
      'The solved pipe length failed the pressure-drop closure check.',
    )
  }

  return {
    ...finalState,

    maximumPipeLength,

    availablePressureDrop:
      input.availablePressureDrop,

    pressureAvailableForPipeFriction,

    frictionPressureDropPerUnitLength,
    minorLossBudgetFraction,

    pressureDropResidual,
    pressureDropResidualPercent,

    modelName:
      'Maximum Pipe Length from Pressure-Drop Budget',

    limitationDescription:
      'Steady incompressible single-phase pipe-flow design using the shared Darcy-Weisbach hydraulic model. Diameter and flow rate are fixed, so velocity, Reynolds number and Darcy friction factor remain constant while pipe length is solved explicitly. A lumped minor-loss coefficient is included.',
  }
}

export function createMaximumPipeLengthFromPressureDropCsv(
  input:
    MaximumPipeLengthFromPressureDropInput,
  result:
    MaximumPipeLengthFromPressureDropResult,
): string {
  const rows = [
    [
      'Maximum Pipe Length from Pressure-Drop Budget',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Internal pipe diameter',
      input.diameter,
      'm',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
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
      'Maximum pipe length',
      result.maximumPipeLength,
      'm',
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
      'Friction pressure drop per unit length',
      result.frictionPressureDropPerUnitLength,
      'Pa/m',
    ],
    [
      'Minor-loss pressure drop',
      result.minorPressureDrop,
      'Pa',
    ],
    [
      'Pressure available for pipe friction',
      result.pressureAvailableForPipeFriction,
      'Pa',
    ],
    [
      'Total pressure drop',
      result.totalPressureDrop,
      'Pa',
    ],
    [
      'Total head loss',
      result.totalHeadLoss,
      'm',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
