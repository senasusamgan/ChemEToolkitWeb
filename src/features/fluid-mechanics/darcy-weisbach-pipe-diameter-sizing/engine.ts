import {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
} from '../shared/pipeHydraulicsCore.ts'

import type {
  DarcyWeisbachPipeDiameterSizingInput,
  DarcyWeisbachPipeDiameterSizingResult,
} from './types.ts'

export {
  PipeHydraulicsCoreError,
  calculatePipeHydraulicsState,
}

export const DARCY_WEISBACH_PIPE_DIAMETER_SIZING_ENGINE_VERSION =
  'darcy-weisbach-pipe-diameter-sizing-v1'

export type DarcyWeisbachPipeDiameterSizingErrorCode =
  | 'INVALID_TARGET_PRESSURE_DROP'
  | 'TARGET_OUTSIDE_DIAMETER_RANGE'
  | 'NUMERICAL_FAILURE'

export class DarcyWeisbachPipeDiameterSizingError
  extends Error {
  readonly code:
    DarcyWeisbachPipeDiameterSizingErrorCode

  constructor(
    code:
      DarcyWeisbachPipeDiameterSizingErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'DarcyWeisbachPipeDiameterSizingError'

    this.code =
      code
  }
}

const MINIMUM_DIAMETER =
  1e-4

const MAXIMUM_DIAMETER =
  10

const BISECTION_ITERATIONS =
  100

function evaluate(
  input:
    DarcyWeisbachPipeDiameterSizingInput,
  diameter: number,
) {
  return calculatePipeHydraulicsState({
    diameter,

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
      input.minorLossCoefficient,
  })
}

export function calculateDarcyWeisbachPipeDiameterSizing(
  input:
    DarcyWeisbachPipeDiameterSizingInput,
): DarcyWeisbachPipeDiameterSizingResult {
  if (
    !Number.isFinite(
      input.targetPressureDrop,
    ) ||
    input.targetPressureDrop <= 0
  ) {
    throw new DarcyWeisbachPipeDiameterSizingError(
      'INVALID_TARGET_PRESSURE_DROP',
      'Target pressure drop must be a positive finite value.',
    )
  }

  const minimumDiameterState =
    evaluate(
      input,
      MINIMUM_DIAMETER,
    )

  const maximumDiameterState =
    evaluate(
      input,
      MAXIMUM_DIAMETER,
    )

  if (
    minimumDiameterState.totalPressureDrop <
      input.targetPressureDrop ||
    maximumDiameterState.totalPressureDrop >
      input.targetPressureDrop
  ) {
    throw new DarcyWeisbachPipeDiameterSizingError(
      'TARGET_OUTSIDE_DIAMETER_RANGE',
      'The specified target pressure drop cannot be bracketed between 0.1 mm and 10 m pipe diameter.',
    )
  }

  let lowerDiameter =
    MINIMUM_DIAMETER

  let upperDiameter =
    MAXIMUM_DIAMETER

  for (
    let iteration = 0;
    iteration <
      BISECTION_ITERATIONS;
    iteration += 1
  ) {
    const midpoint =
      (
        lowerDiameter +
        upperDiameter
      ) /
      2

    const state =
      evaluate(
        input,
        midpoint,
      )

    if (
      state.totalPressureDrop >
      input.targetPressureDrop
    ) {
      lowerDiameter =
        midpoint
    } else {
      upperDiameter =
        midpoint
    }
  }

  const requiredDiameter =
    upperDiameter

  const finalState =
    evaluate(
      input,
      requiredDiameter,
    )

  const pressureDropResidual =
    finalState.totalPressureDrop -
    input.targetPressureDrop

  const pressureDropResidualPercent =
    Math.abs(
      pressureDropResidual,
    ) /
    input.targetPressureDrop *
    100

  const requiredDiameterMillimeters =
    requiredDiameter *
    1000

  const requiredDiameterInches =
    requiredDiameter /
    0.0254

  const values = [
    requiredDiameter,
    requiredDiameterMillimeters,
    requiredDiameterInches,

    pressureDropResidual,
    pressureDropResidualPercent,

    finalState.totalPressureDrop,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    requiredDiameter <= 0 ||
    pressureDropResidualPercent >
      1e-6
  ) {
    throw new DarcyWeisbachPipeDiameterSizingError(
      'NUMERICAL_FAILURE',
      'The pipe-diameter solver did not converge to the requested pressure drop.',
    )
  }

  return {
    ...finalState,

    requiredDiameter,
    requiredDiameterMillimeters,
    requiredDiameterInches,

    targetPressureDrop:
      input.targetPressureDrop,

    pressureDropResidual,
    pressureDropResidualPercent,

    iterationCount:
      BISECTION_ITERATIONS,

    modelName:
      'Darcy-Weisbach Pipe Diameter Sizing',

    limitationDescription:
      'Steady incompressible single-phase pipe-flow sizing using Darcy-Weisbach major loss and a lumped minor-loss coefficient. Laminar flow uses f = 64/Re; turbulent flow uses the Haaland explicit approximation, with interpolation through the transition range.',
  }
}

export function createDarcyWeisbachPipeDiameterSizingCsv(
  input:
    DarcyWeisbachPipeDiameterSizingInput,
  result:
    DarcyWeisbachPipeDiameterSizingResult,
): string {
  const rows = [
    [
      'Darcy-Weisbach Pipe Diameter Sizing',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
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
      'Minor-loss coefficient',
      input.minorLossCoefficient,
      '-',
    ],
    [
      'Target pressure drop',
      input.targetPressureDrop,
      'Pa',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Required diameter',
      result.requiredDiameter,
      'm',
    ],
    [
      'Required diameter',
      result.requiredDiameterMillimeters,
      'mm',
    ],
    [
      'Velocity',
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
