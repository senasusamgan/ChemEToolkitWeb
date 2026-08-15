import type {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput,
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_MAXIMUM_DISCHARGE_SPECIFIC_ENERGY_ENGINE_VERSION =
  'partially-full-circular-channel-maximum-discharge-specific-energy-v1'


export type PartiallyFullCircularChannelMaximumDischargeSpecificEnergyErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_SPECIFIC_ENERGY'
  | 'INVALID_DENSITY'
  | 'SPECIFIC_ENERGY_TOO_SMALL'
  | 'NO_PARTIAL_CRITICAL_CONTROL'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelMaximumDischargeSpecificEnergyErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665

const MAXIMUM_BISECTION_ITERATIONS =
  180


interface CircularGeometry {
  centralAngleRadians: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number
}


function circularGeometry(
  pipeDiameter: number,
  flowDepth: number,
): CircularGeometry {
  const radius =
    pipeDiameter /
    2

  const cosineArgument =
    (
      radius -
      flowDepth
    ) /
    radius

  const centralAngleRadians =
    2 *
    Math.acos(
      Math.min(
        1,
        Math.max(
          -1,
          cosineArgument,
        ),
      ),
    )

  const flowArea =
    radius *
    radius /
    2 *
    (
      centralAngleRadians -
      Math.sin(
        centralAngleRadians,
      )
    )

  const centerElevation =
    flowDepth -
    radius

  const halfTopWidth =
    Math.sqrt(
      Math.max(
        0,
        radius *
        radius -
        centerElevation *
        centerElevation,
      ),
    )

  const topWidth =
    2 *
    halfTopWidth

  const wettedPerimeter =
    radius *
    centralAngleRadians

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  return {
    centralAngleRadians,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,
  }
}


function criticalSpecificEnergyAtDepth(
  pipeDiameter: number,
  flowDepth: number,
): number {
  const geometry =
    circularGeometry(
      pipeDiameter,
      flowDepth,
    )

  return (
    flowDepth +
    geometry.flowArea /
    (
      2 *
      geometry.topWidth
    )
  )
}


function validateInput(
  input:
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput,
) {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.targetSpecificEnergy,
    ) ||
    input.targetSpecificEnergy <=
      0
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'INVALID_SPECIFIC_ENERGY',
      'Target specific energy must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }
}


export function calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
  input:
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput,
): PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult {
  validateInput(
    input,
  )

  const depthMargin =
    Math.max(
      input.pipeDiameter *
      1e-10,
      1e-12,
    )

  if (
    input.targetSpecificEnergy <=
      depthMargin *
      10
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'SPECIFIC_ENERGY_TOO_SMALL',
      'Target specific energy is too small relative to the conduit diameter for a numerically stable partially full critical-control solution.',
    )
  }

  let lowerDepth =
    depthMargin

  let upperDepth =
    Math.min(
      input.pipeDiameter -
      depthMargin,
      input.targetSpecificEnergy -
      depthMargin,
    )

  if (
    upperDepth <=
      lowerDepth
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'NO_PARTIAL_CRITICAL_CONTROL',
      'No positive partially full critical depth can be resolved for the specified energy.',
    )
  }

  function residual(
    flowDepth: number,
  ): number {
    return (
      criticalSpecificEnergyAtDepth(
        input.pipeDiameter,
        flowDepth,
      ) -
      input.targetSpecificEnergy
    )
  }

  let lowerResidual =
    residual(
      lowerDepth,
    )

  let upperResidual =
    residual(
      upperDepth,
    )

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    )
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'NUMERICAL_FAILURE',
      'Critical specific-energy bracket produced a non-finite value.',
    )
  }

  if (
    lowerResidual >=
      0
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'SPECIFIC_ENERGY_TOO_SMALL',
      'Target specific energy is below the numerically resolvable partially full critical-energy range.',
    )
  }

  if (
    upperResidual <=
      0
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'NO_PARTIAL_CRITICAL_CONTROL',
      'The required critical control lies too close to the conduit crown for the partially full open-channel model.',
    )
  }

  let criticalDepth =
    (
      lowerDepth +
      upperDepth
    ) /
    2

  let rootIterations =
    0

  const energyTolerance =
    Math.max(
      1e-12,
      input.targetSpecificEnergy *
      1e-12,
    )

  const depthTolerance =
    Math.max(
      1e-12,
      input.pipeDiameter *
      1e-12,
    )

  for (
    rootIterations = 1;
    rootIterations <=
      MAXIMUM_BISECTION_ITERATIONS;
    rootIterations +=
      1
  ) {
    criticalDepth =
      (
        lowerDepth +
        upperDepth
      ) /
      2

    const currentResidual =
      residual(
        criticalDepth,
      )

    if (
      !Number.isFinite(
        currentResidual,
      )
    ) {
      throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
        'NUMERICAL_FAILURE',
        'Critical-depth root iteration produced a non-finite residual.',
      )
    }

    if (
      Math.abs(
        currentResidual,
      ) <=
        energyTolerance ||
      Math.abs(
        upperDepth -
        lowerDepth
      ) <=
        depthTolerance
    ) {
      break
    }

    if (
      lowerResidual *
      currentResidual <=
        0
    ) {
      upperDepth =
        criticalDepth

      upperResidual =
        currentResidual
    } else {
      lowerDepth =
        criticalDepth

      lowerResidual =
        currentResidual
    }
  }

  if (
    rootIterations >
      MAXIMUM_BISECTION_ITERATIONS
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'ROOT_CONVERGENCE_FAILURE',
      'Critical-depth bisection failed to converge.',
    )
  }

  const geometry =
    circularGeometry(
      input.pipeDiameter,
      criticalDepth,
    )

  const maximumDischarge =
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      geometry.flowArea **
        3 /
      geometry.topWidth,
    )

  const meanVelocity =
    maximumDischarge /
    geometry.flowArea

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      geometry.hydraulicDepth,
    )

  const velocityHead =
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const calculatedSpecificEnergy =
    criticalDepth +
    velocityHead

  const energyResidual =
    calculatedSpecificEnergy -
    input.targetSpecificEnergy

  const criticalRelationResidual =
    maximumDischarge *
    maximumDischarge *
    geometry.topWidth /
    (
      GRAVITATIONAL_ACCELERATION *
      geometry.flowArea **
        3
    ) -
    1

  const massFlowRate =
    input.fluidDensity *
    maximumDischarge

  const hydraulicPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    maximumDischarge *
    input.targetSpecificEnergy

  const crownClearance =
    input.pipeDiameter -
    criticalDepth

  const depthRatio =
    criticalDepth /
    input.pipeDiameter

  const depthEnergyFraction =
    criticalDepth /
    input.targetSpecificEnergy

  const velocityEnergyFraction =
    velocityHead /
    input.targetSpecificEnergy

  const finiteValues = [
    criticalDepth,
    maximumDischarge,
    geometry.flowArea,
    geometry.topWidth,
    geometry.wettedPerimeter,
    geometry.hydraulicRadius,
    geometry.hydraulicDepth,
    meanVelocity,
    froudeNumber,
    velocityHead,
    calculatedSpecificEnergy,
    energyResidual,
    criticalRelationResidual,
    massFlowRate,
    hydraulicPower,
    crownClearance,
    depthRatio,
    depthEnergyFraction,
    velocityEnergyFraction,
  ]

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    criticalDepth <=
      0 ||
    criticalDepth >=
      input.pipeDiameter ||
    maximumDischarge <=
      0 ||
    Math.abs(
      froudeNumber -
      1
    ) >
      1e-9 ||
    Math.abs(
      energyResidual
    ) >
      Math.max(
        1e-10,
        input.targetSpecificEnergy *
        1e-9,
      ) ||
    Math.abs(
      criticalRelationResidual
    ) >
      1e-9
  ) {
    throw new PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError(
      'NUMERICAL_FAILURE',
      'Maximum-discharge critical-control solution failed its physical closure checks.',
    )
  }

  return {
    maximumDischarge,

    criticalDepth,

    depthRatio,

    crownClearance,

    flowArea:
      geometry.flowArea,

    topWidth:
      geometry.topWidth,

    wettedPerimeter:
      geometry.wettedPerimeter,

    hydraulicRadius:
      geometry.hydraulicRadius,

    hydraulicDepth:
      geometry.hydraulicDepth,

    meanVelocity,

    froudeNumber,

    velocityHead,

    targetSpecificEnergy:
      input.targetSpecificEnergy,

    calculatedSpecificEnergy,

    energyResidual,

    criticalRelationResidual,

    massFlowRate,

    hydraulicPower,

    depthEnergyFraction,

    velocityEnergyFraction,

    centralAngleRadians:
      geometry.centralAngleRadians,

    rootIterations,

    modelName:
      'Partially Full Circular Channel Maximum Discharge for Specified Specific Energy',

    limitationDescription:
      'For a fixed specific energy E, the discharge Q(y) = A(y)√[2g(E−y)] reaches its maximum at the critical-flow condition Fr = 1. The critical depth is obtained from E = y + A/(2T), then Qmax = √(gA³/T). The result assumes hydrostatic pressure, negligible local losses and a genuinely partially full circular conduit.',
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


export function createPartiallyFullCircularChannelMaximumDischargeSpecificEnergyCsv(
  input:
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput,
  result:
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Maximum Discharge for Specified Specific Energy',
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
      'Target Specific Energy',
      input.targetSpecificEnergy,
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
      'Maximum Discharge',
      result.maximumDischarge,
      'm3/s',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Depth Ratio',
      result.depthRatio,
      '-',
    ],
    [
      'Crown Clearance',
      result.crownClearance,
      'm',
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
      'Mean Velocity',
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
      'Depth Energy Fraction',
      result.depthEnergyFraction,
      '-',
    ],
    [
      'Velocity Energy Fraction',
      result.velocityEnergyFraction,
      '-',
    ],
    [
      'Central Angle',
      result.centralAngleRadians,
      'rad',
    ],
    [
      'Root Iterations',
      result.rootIterations,
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
