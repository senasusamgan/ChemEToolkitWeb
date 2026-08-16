import {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError,
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
} from '../partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts'

import {
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError,
  calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy,
} from '../partially-full-circular-channel-minimum-required-specific-energy/engine.ts'

import type {
  PartiallyFullCircularChannelCapacityChokingMarginInput,
  PartiallyFullCircularChannelCapacityChokingMarginResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_CAPACITY_CHOKING_MARGIN_ENGINE_VERSION =
  'partially-full-circular-channel-capacity-choking-margin-v1'


export type PartiallyFullCircularChannelCapacityChokingMarginErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_DISCHARGE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'CAPACITY_SOLVER_FAILURE'
  | 'MINIMUM_ENERGY_SOLVER_FAILURE'
  | 'INVERSE_CONSISTENCY_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelCapacityChokingMarginError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelCapacityChokingMarginErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelCapacityChokingMarginErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelCapacityChokingMarginError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665


function validateInput(
  input:
    PartiallyFullCircularChannelCapacityChokingMarginInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.actualDischarge,
    ) ||
    input.actualDischarge <=
      0
  ) {
    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'INVALID_DISCHARGE',
      'Actual discharge must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.availableSpecificEnergy,
    ) ||
    input.availableSpecificEnergy <=
      0
  ) {
    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'INVALID_SPECIFIC_ENERGY',
      'Available specific energy must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }
}


export function calculatePartiallyFullCircularChannelCapacityChokingMargin(
  input:
    PartiallyFullCircularChannelCapacityChokingMarginInput,
): PartiallyFullCircularChannelCapacityChokingMarginResult {
  validateInput(
    input,
  )

  let capacity

  try {
    capacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          input.pipeDiameter,

        targetSpecificEnergy:
          input.availableSpecificEnergy,

        fluidDensity:
          input.fluidDensity,
      })
  } catch (error) {
    if (
      error instanceof
        PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError
    ) {
      throw new PartiallyFullCircularChannelCapacityChokingMarginError(
        'CAPACITY_SOLVER_FAILURE',
        `Calculator 470 capacity evaluation failed: ${error.message}`,
      )
    }

    throw error
  }

  let minimumEnergy

  try {
    minimumEnergy =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        pipeDiameter:
          input.pipeDiameter,

        requiredDischarge:
          input.actualDischarge,

        fluidDensity:
          input.fluidDensity,
      })
  } catch (error) {
    if (
      error instanceof
        PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError
    ) {
      throw new PartiallyFullCircularChannelCapacityChokingMarginError(
        'MINIMUM_ENERGY_SOLVER_FAILURE',
        `Calculator 472 minimum-energy evaluation failed: ${error.message}`,
      )
    }

    throw error
  }

  let inverseCapacity

  try {
    inverseCapacity =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter:
          input.pipeDiameter,

        targetSpecificEnergy:
          minimumEnergy.minimumSpecificEnergy,

        fluidDensity:
          input.fluidDensity,
      })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown inverse-capacity error.'

    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'INVERSE_CONSISTENCY_FAILURE',
      `Calculator 470 inverse-capacity closure failed: ${message}`,
    )
  }

  let inverseEnergy

  try {
    inverseEnergy =
      calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy({
        pipeDiameter:
          input.pipeDiameter,

        requiredDischarge:
          capacity.maximumDischarge,

        fluidDensity:
          input.fluidDensity,
      })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown inverse-energy error.'

    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'INVERSE_CONSISTENCY_FAILURE',
      `Calculator 472 inverse-energy closure failed: ${message}`,
    )
  }

  const maximumDischarge =
    capacity.maximumDischarge

  const minimumRequiredSpecificEnergy =
    minimumEnergy.minimumSpecificEnergy

  const dischargeMargin =
    maximumDischarge -
    input.actualDischarge

  const dischargeReserve =
    Math.max(
      0,
      dischargeMargin,
    )

  const dischargeOverload =
    Math.max(
      0,
      -dischargeMargin,
    )

  const dischargeUtilization =
    input.actualDischarge /
    maximumDischarge

  const dischargeReservePercent =
    dischargeMargin /
    maximumDischarge *
    100

  const capacityFactor =
    maximumDischarge /
    input.actualDischarge

  const specificEnergyMargin =
    input.availableSpecificEnergy -
    minimumRequiredSpecificEnergy

  const specificEnergyReserve =
    Math.max(
      0,
      specificEnergyMargin,
    )

  const specificEnergyDeficit =
    Math.max(
      0,
      -specificEnergyMargin,
    )

  const specificEnergyReservePercent =
    specificEnergyMargin /
    input.availableSpecificEnergy *
    100

  const energyAdequacyRatio =
    input.availableSpecificEnergy /
    minimumRequiredSpecificEnergy

  const chokingMarginIndex =
    1 -
    dischargeUtilization

  const dischargeTolerance =
    Math.max(
      1e-10,
      maximumDischarge *
      1e-8,
    )

  const energyTolerance =
    Math.max(
      1e-10,
      minimumRequiredSpecificEnergy *
      1e-8,
    )

  const isAtChokingLimit =
    Math.abs(
      dischargeMargin,
    ) <=
      dischargeTolerance &&
    Math.abs(
      specificEnergyMargin,
    ) <=
      energyTolerance

  const isChoked =
    dischargeMargin <
      -dischargeTolerance ||
    specificEnergyMargin <
      -energyTolerance

  const capacityState =
    isAtChokingLimit
      ? 'At choking limit'
      : isChoked
        ? 'Insufficient energy — choking risk'
        : 'Adequate capacity margin'

  const actualMassFlowRate =
    input.fluidDensity *
    input.actualDischarge

  const maximumMassFlowCapacity =
    input.fluidDensity *
    maximumDischarge

  const availableHydraulicPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.actualDischarge *
    input.availableSpecificEnergy

  const minimumRequiredHydraulicPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.actualDischarge *
    minimumRequiredSpecificEnergy

  const hydraulicPowerMargin =
    availableHydraulicPower -
    minimumRequiredHydraulicPower

  const inverseDischargeResidual =
    inverseCapacity.maximumDischarge -
    input.actualDischarge

  const inverseEnergyResidual =
    inverseEnergy.minimumSpecificEnergy -
    input.availableSpecificEnergy

  const dischargeClosureTolerance =
    Math.max(
      1e-8,
      input.actualDischarge *
      1e-7,
    )

  const inverseEnergyTolerance =
    Math.max(
      1e-8,
      input.availableSpecificEnergy *
      1e-7,
    )

  const finiteValues = [
    maximumDischarge,
    minimumRequiredSpecificEnergy,
    dischargeMargin,
    dischargeReserve,
    dischargeOverload,
    dischargeUtilization,
    dischargeReservePercent,
    capacityFactor,
    specificEnergyMargin,
    specificEnergyReserve,
    specificEnergyDeficit,
    specificEnergyReservePercent,
    energyAdequacyRatio,
    chokingMarginIndex,
    capacity.criticalDepth,
    capacity.depthRatio,
    minimumEnergy.criticalDepth,
    minimumEnergy.criticalDepthRatio,
    actualMassFlowRate,
    maximumMassFlowCapacity,
    availableHydraulicPower,
    minimumRequiredHydraulicPower,
    hydraulicPowerMargin,
    inverseDischargeResidual,
    inverseEnergyResidual,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    maximumDischarge <=
      0 ||
    minimumRequiredSpecificEnergy <=
      0 ||
    dischargeUtilization <=
      0 ||
    capacityFactor <=
      0 ||
    energyAdequacyRatio <=
      0 ||
    Math.abs(
      inverseDischargeResidual,
    ) >
      dischargeClosureTolerance ||
    Math.abs(
      inverseEnergyResidual,
    ) >
      inverseEnergyTolerance
  ) {
    throw new PartiallyFullCircularChannelCapacityChokingMarginError(
      'NUMERICAL_FAILURE',
      'Capacity/choking-margin analysis failed its inverse-capacity or numerical closure checks.',
    )
  }

  return {
    actualDischarge:
      input.actualDischarge,

    maximumDischarge,

    dischargeMargin,

    dischargeReserve,

    dischargeOverload,

    dischargeUtilization,

    dischargeReservePercent,

    capacityFactor,

    availableSpecificEnergy:
      input.availableSpecificEnergy,

    minimumRequiredSpecificEnergy,

    specificEnergyMargin,

    specificEnergyReserve,

    specificEnergyDeficit,

    specificEnergyReservePercent,

    energyAdequacyRatio,

    chokingMarginIndex,

    capacityState,

    isChoked,

    isAtChokingLimit,

    actualCriticalDepth:
      minimumEnergy.criticalDepth,

    actualCriticalDepthRatio:
      minimumEnergy.criticalDepthRatio,

    capacityCriticalDepth:
      capacity.criticalDepth,

    capacityCriticalDepthRatio:
      capacity.depthRatio,

    actualMassFlowRate,

    maximumMassFlowCapacity,

    availableHydraulicPower,

    minimumRequiredHydraulicPower,

    hydraulicPowerMargin,

    inverseDischargeResidual,

    inverseEnergyResidual,

    modelName:
      'Partially Full Circular Channel Capacity & Choking Margin',

    limitationDescription:
      'Calculator 473 combines Calculator 470 and Calculator 472. Qmax is the maximum theoretical discharge permitted by the available specific energy, while Emin is the minimum theoretical specific energy required by the actual discharge. Positive Q and E margins indicate hydraulic headroom; zero margin is the critical choking condition; negative margin indicates that the specified discharge-energy combination cannot pass the circular control section without a change in upstream state. This is an ideal open-channel energy analysis and does not include entrance, transition or local-loss allowances.',
  }
}


function csvCell(
  value:
    string | number,
): string {
  const text =
    String(
      value,
    )

  if (
    /[",\n]/.test(
      text,
    )
  ) {
    return (
      '"' +
      text.replaceAll(
        '"',
        '""',
      ) +
      '"'
    )
  }

  return text
}


export function createPartiallyFullCircularChannelCapacityChokingMarginCsv(
  input:
    PartiallyFullCircularChannelCapacityChokingMarginInput,
  result:
    PartiallyFullCircularChannelCapacityChokingMarginResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Capacity & Choking Margin',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe Diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Actual Discharge',
      input.actualDischarge,
      'm3/s',
    ],
    [
      'Available Specific Energy',
      input.availableSpecificEnergy,
      'm',
    ],
    [
      'Fluid Density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Capacity Status',
      result.capacityState,
      '-',
    ],
    [],
    [
      'Discharge Capacity',
      'Value',
      'Unit',
    ],
    [
      'Maximum Discharge',
      result.maximumDischarge,
      'm3/s',
    ],
    [
      'Discharge Margin',
      result.dischargeMargin,
      'm3/s',
    ],
    [
      'Discharge Reserve',
      result.dischargeReserve,
      'm3/s',
    ],
    [
      'Discharge Overload',
      result.dischargeOverload,
      'm3/s',
    ],
    [
      'Discharge Utilization',
      result.dischargeUtilization,
      '-',
    ],
    [
      'Discharge Reserve Percent',
      result.dischargeReservePercent,
      '%',
    ],
    [
      'Capacity Factor',
      result.capacityFactor,
      '-',
    ],
    [
      'Choking Margin Index',
      result.chokingMarginIndex,
      '-',
    ],
    [],
    [
      'Specific Energy',
      'Value',
      'Unit',
    ],
    [
      'Minimum Required Specific Energy',
      result.minimumRequiredSpecificEnergy,
      'm',
    ],
    [
      'Specific Energy Margin',
      result.specificEnergyMargin,
      'm',
    ],
    [
      'Specific Energy Reserve',
      result.specificEnergyReserve,
      'm',
    ],
    [
      'Specific Energy Deficit',
      result.specificEnergyDeficit,
      'm',
    ],
    [
      'Specific Energy Reserve Percent',
      result.specificEnergyReservePercent,
      '%',
    ],
    [
      'Energy Adequacy Ratio',
      result.energyAdequacyRatio,
      '-',
    ],
    [],
    [
      'Critical Control',
      'Value',
      'Unit',
    ],
    [
      'Critical Depth for Actual Discharge',
      result.actualCriticalDepth,
      'm',
    ],
    [
      'Actual Critical Depth Ratio',
      result.actualCriticalDepthRatio,
      '-',
    ],
    [
      'Critical Depth at Available-Energy Capacity',
      result.capacityCriticalDepth,
      'm',
    ],
    [
      'Capacity Critical Depth Ratio',
      result.capacityCriticalDepthRatio,
      '-',
    ],
    [],
    [
      'Mass & Power',
      'Value',
      'Unit',
    ],
    [
      'Actual Mass Flow Rate',
      result.actualMassFlowRate,
      'kg/s',
    ],
    [
      'Maximum Mass Flow Capacity',
      result.maximumMassFlowCapacity,
      'kg/s',
    ],
    [
      'Available Hydraulic Power',
      result.availableHydraulicPower,
      'W',
    ],
    [
      'Minimum Required Hydraulic Power',
      result.minimumRequiredHydraulicPower,
      'W',
    ],
    [
      'Hydraulic Power Margin',
      result.hydraulicPowerMargin,
      'W',
    ],
    [],
    [
      'Numerical Closure',
      'Value',
      'Unit',
    ],
    [
      'Inverse Discharge Residual',
      result.inverseDischargeResidual,
      'm3/s',
    ],
    [
      'Inverse Energy Residual',
      result.inverseEnergyResidual,
      'm',
    ],
    [],
    [
      'Model',
      result.modelName,
    ],
    [
      'Limitation',
      result.limitationDescription,
    ],
  ]

  return rows
    .map(
      row =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
