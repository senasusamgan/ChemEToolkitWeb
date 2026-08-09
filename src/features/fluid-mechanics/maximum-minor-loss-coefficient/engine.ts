import {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
} from '../shared/pipeHydraulicsCore.ts'

import type {
  MaximumMinorLossCoefficientInput,
  MaximumMinorLossCoefficientResult,
} from './types.ts'

export {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
}

export const MAXIMUM_MINOR_LOSS_COEFFICIENT_ENGINE_VERSION =
  'maximum-minor-loss-coefficient-v1'

export type MaximumMinorLossCoefficientErrorCode =
  | 'INVALID_AVAILABLE_PRESSURE_DROP'
  | 'NO_MINOR_LOSS_BUDGET'
  | 'NUMERICAL_FAILURE'

export class MaximumMinorLossCoefficientError
  extends Error {
  readonly code:
    MaximumMinorLossCoefficientErrorCode

  constructor(
    code:
      MaximumMinorLossCoefficientErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'MaximumMinorLossCoefficientError'

    this.code =
      code
  }
}

export function calculateMaximumMinorLossCoefficient(
  input:
    MaximumMinorLossCoefficientInput,
): MaximumMinorLossCoefficientResult {
  if (
    !Number.isFinite(
      input.availablePressureDrop,
    ) ||
    input.availablePressureDrop <= 0
  ) {
    throw new MaximumMinorLossCoefficientError(
      'INVALID_AVAILABLE_PRESSURE_DROP',
      'Available pressure drop must be a positive finite value.',
    )
  }

  /*
   First evaluate the straight pipe with
   zero minor-loss coefficient.

   This validates all hydraulic inputs and
   provides:
   - velocity
   - Reynolds number
   - friction factor
   - distributed friction pressure drop
   - dynamic pressure
  */

  const zeroMinorLossState =
    calculatePipeHydraulicsState({
      diameter:
        input.diameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      pipeLength:
        input.pipeLength,

      fluidDensity:
        input.fluidDensity,

      dynamicViscosity:
        input.dynamicViscosity,

      absoluteRoughness:
        input.absoluteRoughness,

      minorLossCoefficient:
        0,
    })

  const pressureDropAvailableForMinorLosses =
    input.availablePressureDrop -
    zeroMinorLossState.frictionPressureDrop

  if (
    pressureDropAvailableForMinorLosses <= 0
  ) {
    throw new MaximumMinorLossCoefficientError(
      'NO_MINOR_LOSS_BUDGET',
      'Distributed pipe friction alone consumes or exceeds the available pressure-drop budget, leaving no positive minor-loss allowance.',
    )
  }

  const maximumMinorLossCoefficient =
    pressureDropAvailableForMinorLosses /
    zeroMinorLossState.dynamicPressure

  if (
    !Number.isFinite(
      maximumMinorLossCoefficient,
    ) ||
    maximumMinorLossCoefficient <= 0
  ) {
    throw new MaximumMinorLossCoefficientError(
      'NUMERICAL_FAILURE',
      'The calculated maximum minor-loss coefficient is not positive and finite.',
    )
  }

  /*
   Verify the explicit solution using the
   exact same shared hydraulic model.
  */

  const finalState =
    calculatePipeHydraulicsState({
      diameter:
        input.diameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      pipeLength:
        input.pipeLength,

      fluidDensity:
        input.fluidDensity,

      dynamicViscosity:
        input.dynamicViscosity,

      absoluteRoughness:
        input.absoluteRoughness,

      minorLossCoefficient:
        maximumMinorLossCoefficient,
    })

  const frictionBudgetFraction =
    finalState.frictionPressureDrop /
    input.availablePressureDrop

  const minorLossBudgetFraction =
    finalState.minorPressureDrop /
    input.availablePressureDrop

  const frictionBudgetPercent =
    frictionBudgetFraction *
    100

  const minorLossBudgetPercent =
    minorLossBudgetFraction *
    100

  const pressureDropResidual =
    finalState.totalPressureDrop -
    input.availablePressureDrop

  const pressureDropResidualPercent =
    Math.abs(
      pressureDropResidual,
    ) /
    input.availablePressureDrop *
    100

  const values = [
    maximumMinorLossCoefficient,

    pressureDropAvailableForMinorLosses,

    frictionBudgetFraction,
    minorLossBudgetFraction,

    frictionBudgetPercent,
    minorLossBudgetPercent,

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
    throw new MaximumMinorLossCoefficientError(
      'NUMERICAL_FAILURE',
      'The solved minor-loss coefficient failed the pressure-drop closure check.',
    )
  }

  return {
    ...finalState,

    maximumMinorLossCoefficient,

    availablePressureDrop:
      input.availablePressureDrop,

    pressureDropAvailableForMinorLosses,

    frictionBudgetFraction,
    minorLossBudgetFraction,

    frictionBudgetPercent,
    minorLossBudgetPercent,

    pressureDropResidual,
    pressureDropResidualPercent,

    modelName:
      'Maximum Minor-Loss Coefficient / Fittings Budget',

    limitationDescription:
      'Steady incompressible single-phase pipe-flow design using the shared Darcy-Weisbach hydraulic model. Pipe diameter, flow rate and straight-pipe length are fixed. The remaining pressure-drop budget is converted directly into the maximum allowable lumped minor-loss coefficient ΣK.',
  }
}

export function createMaximumMinorLossCoefficientCsv(
  input:
    MaximumMinorLossCoefficientInput,
  result:
    MaximumMinorLossCoefficientResult,
): string {
  const rows = [
    [
      'Maximum Minor-Loss Coefficient / Fittings Budget',
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
      'Maximum total minor-loss coefficient',
      result.maximumMinorLossCoefficient,
      '-',
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
      'Distributed friction pressure drop',
      result.frictionPressureDrop,
      'Pa',
    ],
    [
      'Pressure available for minor losses',
      result.pressureDropAvailableForMinorLosses,
      'Pa',
    ],
    [
      'Minor-loss pressure drop',
      result.minorPressureDrop,
      'Pa',
    ],
    [
      'Friction budget',
      result.frictionBudgetPercent,
      '%',
    ],
    [
      'Minor-loss budget',
      result.minorLossBudgetPercent,
      '%',
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
