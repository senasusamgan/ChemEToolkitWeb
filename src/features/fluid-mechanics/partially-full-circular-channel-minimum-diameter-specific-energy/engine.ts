import {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError,
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
} from '../partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts'

import type {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult,
} from '../partially-full-circular-channel-maximum-discharge-specific-energy/types.ts'

import type {
  PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput,
  PartiallyFullCircularChannelMinimumDiameterSpecificEnergyResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_MINIMUM_DIAMETER_SPECIFIC_ENERGY_ENGINE_VERSION =
  'partially-full-circular-channel-minimum-diameter-specific-energy-v1'


export type PartiallyFullCircularChannelMinimumDiameterSpecificEnergyErrorCode =
  | 'INVALID_REQUIRED_DISCHARGE'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'DIAMETER_BRACKET_FAILURE'
  | 'CAPACITY_SOLVER_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelMinimumDiameterSpecificEnergyErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665

const MAXIMUM_DIAMETER_EXPANSIONS =
  100

const MAXIMUM_DIAMETER_ITERATIONS =
  140


interface CapacityEvaluation {
  capacity: number

  result:
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult | null
}


function validateInput(
  input:
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput,
) {
  if (
    !Number.isFinite(
      input.requiredDischarge,
    ) ||
    input.requiredDischarge <=
      0
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'INVALID_REQUIRED_DISCHARGE',
      'Required discharge must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.availableSpecificEnergy,
    ) ||
    input.availableSpecificEnergy <=
      0
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
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
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }
}


function evaluateCapacity(
  input:
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput,
  pipeDiameter: number,
): CapacityEvaluation {
  try {
    const result =
      calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy({
        pipeDiameter,

        targetSpecificEnergy:
          input.availableSpecificEnergy,

        fluidDensity:
          input.fluidDensity,
      })

    return {
      capacity:
        result.maximumDischarge,

      result,
    }
  } catch (error) {
    if (
      error instanceof
        PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError &&
      error.code ===
        'NO_PARTIAL_CRITICAL_CONTROL'
    ) {
      return {
        capacity:
          0,

        result:
          null,
      }
    }

    if (
      error instanceof
        PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError
    ) {
      throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
        'CAPACITY_SOLVER_FAILURE',
        `Calculator 470 capacity evaluation failed at D = ${pipeDiameter}: ${error.message}`,
      )
    }

    throw error
  }
}


export function calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
  input:
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput,
): PartiallyFullCircularChannelMinimumDiameterSpecificEnergyResult {
  validateInput(
    input,
  )

  let capacitySolverCalls =
    0

  function capacityAt(
    pipeDiameter: number,
  ): CapacityEvaluation {
    capacitySolverCalls +=
      1

    return evaluateCapacity(
      input,
      pipeDiameter,
    )
  }

  let lowerDiameter =
    Math.max(
      input.availableSpecificEnergy *
      1e-4,
      1e-9,
    )

  let lowerEvaluation =
    capacityAt(
      lowerDiameter,
    )

  let lowerExpansionCount =
    0

  while (
    lowerEvaluation.capacity >=
      input.requiredDischarge &&
    lowerExpansionCount <
      MAXIMUM_DIAMETER_EXPANSIONS
  ) {
    lowerDiameter *=
      0.25

    lowerEvaluation =
      capacityAt(
        lowerDiameter,
      )

    lowerExpansionCount +=
      1
  }

  if (
    lowerEvaluation.capacity >=
      input.requiredDischarge
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'DIAMETER_BRACKET_FAILURE',
      'Could not establish a lower diameter whose critical-flow capacity is below the required discharge.',
    )
  }

  let upperDiameter =
    Math.max(
      input.availableSpecificEnergy,
      lowerDiameter *
      2,
    )

  let upperEvaluation =
    capacityAt(
      upperDiameter,
    )

  let upperExpansionCount =
    0

  while (
    upperEvaluation.capacity <
      input.requiredDischarge &&
    upperExpansionCount <
      MAXIMUM_DIAMETER_EXPANSIONS
  ) {
    upperDiameter *=
      2

    upperEvaluation =
      capacityAt(
        upperDiameter,
      )

    upperExpansionCount +=
      1
  }

  if (
    upperEvaluation.capacity <
      input.requiredDischarge ||
    upperEvaluation.result ===
      null
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'DIAMETER_BRACKET_FAILURE',
      'Could not establish an upper diameter capable of carrying the required discharge at the available specific energy.',
    )
  }

  const dischargeTolerance =
    Math.max(
      1e-11,
      input.requiredDischarge *
      1e-10,
    )

  let diameterIterations =
    0

  for (
    diameterIterations = 1;
    diameterIterations <=
      MAXIMUM_DIAMETER_ITERATIONS;
    diameterIterations +=
      1
  ) {
    const middleDiameter =
      (
        lowerDiameter +
        upperDiameter
      ) /
      2

    const middleEvaluation =
      capacityAt(
        middleDiameter,
      )

    if (
      middleEvaluation.capacity >=
        input.requiredDischarge
    ) {
      upperDiameter =
        middleDiameter

      upperEvaluation =
        middleEvaluation
    } else {
      lowerDiameter =
        middleDiameter

      lowerEvaluation =
        middleEvaluation
    }

    const diameterTolerance =
      Math.max(
        1e-12,
        upperDiameter *
        1e-10,
      )

    if (
      upperEvaluation.result !==
        null &&
      (
        Math.abs(
          upperEvaluation.capacity -
          input.requiredDischarge
        ) <=
          dischargeTolerance ||
        Math.abs(
          upperDiameter -
          lowerDiameter
        ) <=
          diameterTolerance
      )
    ) {
      break
    }
  }

  if (
    diameterIterations >
      MAXIMUM_DIAMETER_ITERATIONS
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'ROOT_CONVERGENCE_FAILURE',
      'Minimum-diameter bisection failed to converge.',
    )
  }

  const design =
    upperEvaluation.result ??
    capacityAt(
      upperDiameter,
    ).result

  if (
    design ===
      null
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'CAPACITY_SOLVER_FAILURE',
      'Calculator 470 did not return a valid design-point critical-control solution.',
    )
  }

  const minimumDiameter =
    upperDiameter

  const designCapacity =
    design.maximumDischarge

  const capacityResidual =
    designCapacity -
    input.requiredDischarge

  const capacityUtilization =
    input.requiredDischarge /
    designCapacity

  const diameterSpecificEnergyRatio =
    minimumDiameter /
    input.availableSpecificEnergy

  const massFlowRate =
    input.fluidDensity *
    input.requiredDischarge

  const hydraulicPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.requiredDischarge *
    input.availableSpecificEnergy

  const finiteValues = [
    minimumDiameter,
    designCapacity,
    capacityResidual,
    capacityUtilization,
    design.criticalDepth,
    design.depthRatio,
    design.crownClearance,
    diameterSpecificEnergyRatio,
    design.flowArea,
    design.topWidth,
    design.wettedPerimeter,
    design.hydraulicRadius,
    design.hydraulicDepth,
    design.meanVelocity,
    design.froudeNumber,
    design.velocityHead,
    design.calculatedSpecificEnergy,
    design.energyResidual,
    design.criticalRelationResidual,
    massFlowRate,
    hydraulicPower,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    minimumDiameter <=
      0 ||
    designCapacity <
      input.requiredDischarge -
      dischargeTolerance ||
    Math.abs(
      design.froudeNumber -
      1
    ) >
      1e-9 ||
    Math.abs(
      design.energyResidual
    ) >
      Math.max(
        1e-10,
        input.availableSpecificEnergy *
        1e-9,
      ) ||
    capacityUtilization <=
      0 ||
    capacityUtilization >
      1 +
      1e-9
  ) {
    throw new PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError(
      'NUMERICAL_FAILURE',
      'Minimum-diameter design failed its capacity, critical-flow or specific-energy closure checks.',
    )
  }

  return {
    minimumDiameter,

    requiredDischarge:
      input.requiredDischarge,

    designCapacity,

    capacityResidual,

    capacityUtilization,

    availableSpecificEnergy:
      input.availableSpecificEnergy,

    criticalDepth:
      design.criticalDepth,

    criticalDepthRatio:
      design.depthRatio,

    crownClearance:
      design.crownClearance,

    diameterSpecificEnergyRatio,

    flowArea:
      design.flowArea,

    topWidth:
      design.topWidth,

    wettedPerimeter:
      design.wettedPerimeter,

    hydraulicRadius:
      design.hydraulicRadius,

    hydraulicDepth:
      design.hydraulicDepth,

    meanVelocity:
      design.meanVelocity,

    froudeNumber:
      design.froudeNumber,

    velocityHead:
      design.velocityHead,

    calculatedSpecificEnergy:
      design.calculatedSpecificEnergy,

    energyResidual:
      design.energyResidual,

    criticalRelationResidual:
      design.criticalRelationResidual,

    massFlowRate,

    hydraulicPower,

    diameterIterations,

    capacitySolverCalls,

    innerCriticalIterations:
      design.rootIterations,

    modelName:
      'Partially Full Circular Channel Minimum Diameter for Required Discharge & Specific Energy',

    limitationDescription:
      'The minimum diameter is obtained by inverting Calculator 470. For each trial diameter, the available specific-energy capacity is evaluated at critical flow. Diameter is then bisected until the critical-flow capacity equals the required discharge. The result is therefore the theoretical minimum open-channel diameter before any engineering design margin is applied.',
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


export function createPartiallyFullCircularChannelMinimumDiameterSpecificEnergyCsv(
  input:
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput,
  result:
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Minimum Diameter for Required Discharge & Specific Energy',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Required Discharge',
      input.requiredDischarge,
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
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Minimum Diameter',
      result.minimumDiameter,
      'm',
    ],
    [
      'Design Critical-Flow Capacity',
      result.designCapacity,
      'm3/s',
    ],
    [
      'Capacity Residual',
      result.capacityResidual,
      'm3/s',
    ],
    [
      'Capacity Utilization',
      result.capacityUtilization,
      '-',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical Depth Ratio',
      result.criticalDepthRatio,
      '-',
    ],
    [
      'Crown Clearance',
      result.crownClearance,
      'm',
    ],
    [
      'Diameter / Specific Energy',
      result.diameterSpecificEnergyRatio,
      '-',
    ],
    [
      'Flow Area',
      result.flowArea,
      'm2',
    ],
    [
      'Top Width',
      result.topWidth,
      'm',
    ],
    [
      'Wetted Perimeter',
      result.wettedPerimeter,
      'm',
    ],
    [
      'Hydraulic Radius',
      result.hydraulicRadius,
      'm',
    ],
    [
      'Hydraulic Depth',
      result.hydraulicDepth,
      'm',
    ],
    [
      'Critical Velocity',
      result.meanVelocity,
      'm/s',
    ],
    [
      'Froude Number',
      result.froudeNumber,
      '-',
    ],
    [
      'Velocity Head',
      result.velocityHead,
      'm',
    ],
    [
      'Calculated Specific Energy',
      result.calculatedSpecificEnergy,
      'm',
    ],
    [
      'Energy Residual',
      result.energyResidual,
      'm',
    ],
    [
      'Critical Relation Residual',
      result.criticalRelationResidual,
      '-',
    ],
    [
      'Mass Flow Rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Hydraulic Power',
      result.hydraulicPower,
      'W',
    ],
    [
      'Diameter Iterations',
      result.diameterIterations,
      '-',
    ],
    [
      'Capacity Solver Calls',
      result.capacitySolverCalls,
      '-',
    ],
    [
      'Inner Critical Iterations',
      result.innerCriticalIterations,
      '-',
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
