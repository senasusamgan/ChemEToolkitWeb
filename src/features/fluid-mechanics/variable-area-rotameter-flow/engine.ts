import type {
  VariableAreaRotameterFlowInput,
  VariableAreaRotameterFlowResult,
} from './types.ts'

export const VARIABLE_AREA_ROTAMETER_FLOW_ENGINE_VERSION =
  'variable-area-rotameter-flow-v1'

export type VariableAreaRotameterFlowErrorCode =
  | 'INVALID_FLUID_DENSITY'
  | 'INVALID_FLOAT_DENSITY'
  | 'FLOAT_NOT_DENSER_THAN_FLUID'
  | 'INVALID_FLOAT_VOLUME'
  | 'INVALID_FLOAT_PROJECTED_AREA'
  | 'INVALID_ANNULAR_FLOW_AREA'
  | 'INVALID_DRAG_COEFFICIENT'
  | 'NUMERICAL_FAILURE'

export class VariableAreaRotameterFlowError
  extends Error {
  readonly code:
    VariableAreaRotameterFlowErrorCode

  constructor(
    code:
      VariableAreaRotameterFlowErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'VariableAreaRotameterFlowError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateVariableAreaRotameterFlow(
  input:
    VariableAreaRotameterFlowInput,
): VariableAreaRotameterFlowResult {
  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new VariableAreaRotameterFlowError(
      'INVALID_FLUID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.floatDensity,
    ) ||
    input.floatDensity <= 0
  ) {
    throw new VariableAreaRotameterFlowError(
      'INVALID_FLOAT_DENSITY',
      'Float density must be a positive finite value.',
    )
  }

  if (
    input.floatDensity <=
    input.fluidDensity
  ) {
    throw new VariableAreaRotameterFlowError(
      'FLOAT_NOT_DENSER_THAN_FLUID',
      'The float density must exceed the process-fluid density for this upward-flow rotameter force-balance model.',
    )
  }

  if (
    !Number.isFinite(
      input.floatVolume,
    ) ||
    input.floatVolume <= 0
  ) {
    throw new VariableAreaRotameterFlowError(
      'INVALID_FLOAT_VOLUME',
      'Float volume must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.floatProjectedArea,
    ) ||
    input.floatProjectedArea <= 0
  ) {
    throw new VariableAreaRotameterFlowError(
      'INVALID_FLOAT_PROJECTED_AREA',
      'Float projected area must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.annularFlowArea,
    ) ||
    input.annularFlowArea <= 0
  ) {
    throw new VariableAreaRotameterFlowError(
      'INVALID_ANNULAR_FLOW_AREA',
      'Available annular flow area at the float position must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.dragCoefficient,
    ) ||
    input.dragCoefficient <= 0
  ) {
    throw new VariableAreaRotameterFlowError(
      'INVALID_DRAG_COEFFICIENT',
      'Float drag coefficient must be a positive finite value.',
    )
  }

  const floatWeight =
    input.floatDensity *
    input.floatVolume *
    GRAVITATIONAL_ACCELERATION

  const buoyancyForce =
    input.fluidDensity *
    input.floatVolume *
    GRAVITATIONAL_ACCELERATION

  const effectiveFloatWeight =
    floatWeight -
    buoyancyForce

  const equilibriumVelocity =
    Math.sqrt(
      (
        2 *
        effectiveFloatWeight
      ) /
      (
        input.dragCoefficient *
        input.fluidDensity *
        input.floatProjectedArea
      ),
    )

  const volumetricFlowRate =
    input.annularFlowArea *
    equilibriumVelocity

  const volumetricFlowRateCubicMetersPerHour =
    volumetricFlowRate *
    3600

  const volumetricFlowRateLitersPerSecond =
    volumetricFlowRate *
    1000

  const massFlowRate =
    input.fluidDensity *
    volumetricFlowRate

  const fluidDynamicPressure =
    0.5 *
    input.fluidDensity *
    equilibriumVelocity *
    equilibriumVelocity

  const dragForce =
    input.dragCoefficient *
    fluidDynamicPressure *
    input.floatProjectedArea

  const forceBalanceResidual =
    dragForce -
    effectiveFloatWeight

  const values = [
    floatWeight,

    buoyancyForce,

    effectiveFloatWeight,

    equilibriumVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    fluidDynamicPressure,

    dragForce,

    forceBalanceResidual,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    values
      .slice(
        0,
        -1,
      )
      .some(
        value =>
          value <= 0,
      ) ||
    Math.abs(
      forceBalanceResidual,
    ) >
      Math.max(
        1e-10,
        effectiveFloatWeight *
          1e-10,
      )
  ) {
    throw new VariableAreaRotameterFlowError(
      'NUMERICAL_FAILURE',
      'The rotameter float-force balance did not close numerically.',
    )
  }

  return {
    fluidDensity:
      input.fluidDensity,

    floatDensity:
      input.floatDensity,

    floatVolume:
      input.floatVolume,

    floatProjectedArea:
      input.floatProjectedArea,

    annularFlowArea:
      input.annularFlowArea,

    dragCoefficient:
      input.dragCoefficient,

    floatWeight,

    buoyancyForce,

    effectiveFloatWeight,

    equilibriumVelocity,

    volumetricFlowRate,

    volumetricFlowRateCubicMetersPerHour,

    volumetricFlowRateLitersPerSecond,

    massFlowRate,

    fluidDynamicPressure,

    dragForce,

    forceBalanceResidual,

    modelName:
      'Variable-Area Rotameter Flow Rate — Float Force Balance',

    limitationDescription:
      'Idealized steady upward-flow variable-area meter model. The float is assumed stationary and centered. Buoyancy-corrected float weight is balanced against quadratic fluid drag using a user-specified drag coefficient and projected float area. The annular flow area must correspond to the float reading position. Manufacturer calibration should be preferred for precision metering.',
  }
}

export function createVariableAreaRotameterFlowCsv(
  input:
    VariableAreaRotameterFlowInput,
  result:
    VariableAreaRotameterFlowResult,
): string {
  const rows = [
    [
      'Variable-Area Rotameter Flow Rate',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [
      'Float density',
      input.floatDensity,
      'kg/m3',
    ],
    [
      'Float volume',
      input.floatVolume,
      'm3',
    ],
    [
      'Float projected area',
      input.floatProjectedArea,
      'm2',
    ],
    [
      'Annular flow area',
      input.annularFlowArea,
      'm2',
    ],
    [
      'Drag coefficient',
      input.dragCoefficient,
      '-',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Float weight',
      result.floatWeight,
      'N',
    ],
    [
      'Buoyancy force',
      result.buoyancyForce,
      'N',
    ],
    [
      'Effective float weight',
      result.effectiveFloatWeight,
      'N',
    ],
    [
      'Equilibrium annular velocity',
      result.equilibriumVelocity,
      'm/s',
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
      'Fluid dynamic pressure',
      result.fluidDynamicPressure,
      'Pa',
    ],
    [
      'Drag force',
      result.dragForce,
      'N',
    ],
    [
      'Force-balance residual',
      result.forceBalanceResidual,
      'N',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
