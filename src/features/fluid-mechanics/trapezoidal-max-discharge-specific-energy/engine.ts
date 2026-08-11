import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalMaximumDischargeSpecificEnergyInput,
  TrapezoidalMaximumDischargeSpecificEnergyResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_DISCHARGE_SPECIFIC_ENERGY_ENGINE_VERSION =
  'trapezoidal-maximum-discharge-specific-energy-v1'

export type TrapezoidalMaximumDischargeSpecificEnergyErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'BRACKETING_FAILURE'
  | 'CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumDischargeSpecificEnergyError
  extends Error {
  readonly code:
    TrapezoidalMaximumDischargeSpecificEnergyErrorCode

  constructor(
    code:
      TrapezoidalMaximumDischargeSpecificEnergyErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumDischargeSpecificEnergyError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface GeometryState {
  depth: number

  flowArea: number

  topWidth: number

  hydraulicDepth: number

  criticalSpecificEnergy: number
}

function geometryAtDepth(
  input:
    TrapezoidalMaximumDischargeSpecificEnergyInput,
  depth: number,
): GeometryState {
  const b =
    input.bottomWidth

  const z =
    input.sideSlopeHorizontalPerVertical

  const flowArea =
    depth *
    (
      b +
      z *
      depth
    )

  const topWidth =
    b +
    2 *
    z *
    depth

  const hydraulicDepth =
    flowArea /
    topWidth

  const criticalSpecificEnergy =
    depth +
    hydraulicDepth /
    2

  return {
    depth,

    flowArea,

    topWidth,

    hydraulicDepth,

    criticalSpecificEnergy,
  }
}

function solveCriticalDepthFromEnergy(
  input:
    TrapezoidalMaximumDischargeSpecificEnergyInput,
): {
  state: GeometryState
  iterations: number
} {
  const target =
    input.availableSpecificEnergy

  let lower =
    Math.max(
      1e-12,
      target *
      1e-12,
    )

  let upper =
    target

  let lowerState =
    geometryAtDepth(
      input,
      lower,
    )

  let upperState =
    geometryAtDepth(
      input,
      upper,
    )

  let lowerResidual =
    lowerState.criticalSpecificEnergy -
    target

  let upperResidual =
    upperState.criticalSpecificEnergy -
    target

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual >= 0 ||
    upperResidual <= 0
  ) {
    throw new TrapezoidalMaximumDischargeSpecificEnergyError(
      'BRACKETING_FAILURE',
      'Could not establish the critical-depth bracket from the available specific energy.',
    )
  }

  const energyTolerance =
    Math.max(
      1e-13,
      target *
      1e-12,
    )

  for (
    let iteration = 1;
    iteration <= 200;
    iteration += 1
  ) {
    const depth =
      (
        lower +
        upper
      ) /
      2

    const state =
      geometryAtDepth(
        input,
        depth,
      )

    const residual =
      state.criticalSpecificEnergy -
      target

    if (
      Math.abs(
        residual,
      ) <=
      energyTolerance
    ) {
      return {
        state,

        iterations:
          iteration,
      }
    }

    if (
      residual <
      0
    ) {
      lower =
        depth

      lowerState =
        state

      lowerResidual =
        residual
    } else {
      upper =
        depth

      upperState =
        state

      upperResidual =
        residual
    }
  }

  throw new TrapezoidalMaximumDischargeSpecificEnergyError(
    'CONVERGENCE_FAILURE',
    'Critical-depth specific-energy solver did not converge within 200 iterations.',
  )
}

export function calculateTrapezoidalMaximumDischargeSpecificEnergy(
  input:
    TrapezoidalMaximumDischargeSpecificEnergyInput,
): TrapezoidalMaximumDischargeSpecificEnergyResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalMaximumDischargeSpecificEnergyError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalMaximumDischargeSpecificEnergyError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.availableSpecificEnergy,
    ) ||
    input.availableSpecificEnergy <= 0
  ) {
    throw new TrapezoidalMaximumDischargeSpecificEnergyError(
      'INVALID_SPECIFIC_ENERGY',
      'Available specific energy must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalMaximumDischargeSpecificEnergyError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const solution =
    solveCriticalDepthFromEnergy(
      input,
    )

  const critical =
    solution.state

  const criticalVelocity =
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      critical.hydraulicDepth,
    )

  const maximumVolumetricFlowRate =
    Math.sqrt(
      (
        GRAVITATIONAL_ACCELERATION *
        critical.flowArea **
          3
      ) /
      critical.topWidth,
    )

  const criticalVelocityHead =
    (
      criticalVelocity *
      criticalVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const criticalFroudeNumber =
    criticalVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      critical.hydraulicDepth,
    )

  const maximumVolumetricFlowRateCubicMetersPerHour =
    maximumVolumetricFlowRate *
    3600

  const maximumMassFlowRate =
    input.fluidDensity *
    maximumVolumetricFlowRate

  const dischargePerUnitTopWidth =
    maximumVolumetricFlowRate /
    critical.topWidth

  const criticalDepthToEnergyRatio =
    critical.depth /
    input.availableSpecificEnergy

  const recoveredSpecificEnergy =
    critical.depth +
    criticalVelocityHead

  const specificEnergyResidual =
    recoveredSpecificEnergy -
    input.availableSpecificEnergy

  const criticalConditionResidual =
    (
      maximumVolumetricFlowRate *
      maximumVolumetricFlowRate *
      critical.topWidth
    ) /
    (
      GRAVITATIONAL_ACCELERATION *
      critical.flowArea **
        3
    ) -
    1

  const forwardCritical =
    calculateTrapezoidalChannelCriticalDepth({
      bottomWidth:
        input.bottomWidth,

      volumetricFlowRate:
        maximumVolumetricFlowRate,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  const forwardCriticalDepth =
    forwardCritical.criticalDepth

  const criticalDepthClosureResidual =
    forwardCriticalDepth -
    critical.depth

  const positiveValues = [
    critical.depth,

    critical.flowArea,

    critical.topWidth,

    critical.hydraulicDepth,

    criticalVelocity,

    criticalVelocityHead,

    criticalFroudeNumber,

    maximumVolumetricFlowRate,

    maximumVolumetricFlowRateCubicMetersPerHour,

    maximumMassFlowRate,

    dischargePerUnitTopWidth,

    criticalDepthToEnergyRatio,

    recoveredSpecificEnergy,

    forwardCriticalDepth,
  ]

  const energyTolerance =
    Math.max(
      1e-11,
      input.availableSpecificEnergy *
      1e-10,
    )

  const depthTolerance =
    Math.max(
      1e-10,
      critical.depth *
      1e-9,
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
      criticalFroudeNumber -
      1
    ) >
      1e-12 ||
    !Number.isFinite(
      specificEnergyResidual,
    ) ||
    Math.abs(
      specificEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      criticalConditionResidual,
    ) ||
    Math.abs(
      criticalConditionResidual,
    ) >
      1e-10 ||
    !Number.isFinite(
      criticalDepthClosureResidual,
    ) ||
    Math.abs(
      criticalDepthClosureResidual,
    ) >
      depthTolerance
  ) {
    throw new TrapezoidalMaximumDischargeSpecificEnergyError(
      'NUMERICAL_FAILURE',
      'The maximum-discharge solution failed its critical-flow, specific-energy or forward critical-depth closure checks.',
    )
  }

  return {
    bottomWidth:
      input.bottomWidth,

    sideSlopeHorizontalPerVertical:
      input.sideSlopeHorizontalPerVertical,

    availableSpecificEnergy:
      input.availableSpecificEnergy,

    criticalDepth:
      critical.depth,

    criticalFlowArea:
      critical.flowArea,

    criticalTopWidth:
      critical.topWidth,

    criticalHydraulicDepth:
      critical.hydraulicDepth,

    criticalVelocity,

    criticalVelocityHead,

    criticalFroudeNumber,

    maximumVolumetricFlowRate,

    maximumVolumetricFlowRateCubicMetersPerHour,

    maximumMassFlowRate,

    dischargePerUnitTopWidth,

    criticalDepthToEnergyRatio,

    recoveredSpecificEnergy,

    specificEnergyResidual,

    criticalConditionResidual,

    forwardCriticalDepth,

    criticalDepthClosureResidual,

    solverIterations:
      solution.iterations,

    modelName:
      'Maximum Trapezoidal Channel Discharge from Specific Energy',

    limitationDescription:
      'Critical-flow choking analysis for a symmetric trapezoidal open channel. The result is the maximum discharge compatible with the specified specific energy and section geometry. The model assumes hydrostatic pressure, one-dimensional flow and negligible local energy loss at the control section.',
  }
}

export function createTrapezoidalMaximumDischargeSpecificEnergyCsv(
  input:
    TrapezoidalMaximumDischargeSpecificEnergyInput,
  result:
    TrapezoidalMaximumDischargeSpecificEnergyResult,
): string {
  const rows = [
    [
      'Maximum Trapezoidal Channel Discharge from Specific Energy',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Bottom width',
      input.bottomWidth,
      'm',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Available specific energy',
      input.availableSpecificEnergy,
      'm',
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
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical flow area',
      result.criticalFlowArea,
      'm2',
    ],
    [
      'Critical top width',
      result.criticalTopWidth,
      'm',
    ],
    [
      'Critical hydraulic depth',
      result.criticalHydraulicDepth,
      'm',
    ],
    [
      'Critical velocity',
      result.criticalVelocity,
      'm/s',
    ],
    [
      'Critical velocity head',
      result.criticalVelocityHead,
      'm',
    ],
    [
      'Critical Froude number',
      result.criticalFroudeNumber,
      '-',
    ],
    [
      'Maximum volumetric flow rate',
      result.maximumVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Maximum volumetric flow rate',
      result.maximumVolumetricFlowRateCubicMetersPerHour,
      'm3/h',
    ],
    [
      'Maximum mass flow rate',
      result.maximumMassFlowRate,
      'kg/s',
    ],
    [
      'Discharge per unit top width',
      result.dischargePerUnitTopWidth,
      'm2/s',
    ],
    [
      'Critical depth / specific energy',
      result.criticalDepthToEnergyRatio,
      '-',
    ],
    [
      'Recovered specific energy',
      result.recoveredSpecificEnergy,
      'm',
    ],
    [
      'Specific energy residual',
      result.specificEnergyResidual,
      'm',
    ],
    [
      'Critical condition residual',
      result.criticalConditionResidual,
      '-',
    ],
    [
      'Forward critical depth',
      result.forwardCriticalDepth,
      'm',
    ],
    [
      'Critical depth closure residual',
      result.criticalDepthClosureResidual,
      'm',
    ],
    [
      'Solver iterations',
      result.solverIterations,
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
