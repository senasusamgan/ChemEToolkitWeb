import type {
  PackedColumnHydraulicStatus,
  PackedColumnPressureDropInput,
  PackedColumnPressureDropResult,
  PackedColumnPressureDropScenario,
} from './types.ts'

export const PACKED_COLUMN_PRESSURE_DROP_ENGINE_VERSION =
  'packed-column-pressure-drop-v1' as const

export type PackedColumnPressureDropErrorCode =
  | 'nonFiniteInput'
  | 'invalidGasFlow'
  | 'invalidColumnGeometry'
  | 'invalidVoidFraction'
  | 'invalidPackingDiameter'
  | 'invalidGasProperties'
  | 'invalidLiquidDensity'
  | 'invalidDensityOrder'
  | 'invalidCapacityFactor'
  | 'invalidDesignFloodFraction'
  | 'numericalFailure'

const messages: Record<
  PackedColumnPressureDropErrorCode,
  string
> = {
  nonFiniteInput:
    'All packed-column hydraulic inputs must be finite numbers.',
  invalidGasFlow:
    'Gas volumetric flow rate must be greater than zero.',
  invalidColumnGeometry:
    'Column diameter and packing height must be greater than zero.',
  invalidVoidFraction:
    'Bed void fraction must satisfy 0 < void fraction < 1.',
  invalidPackingDiameter:
    'Packing equivalent diameter must be greater than zero.',
  invalidGasProperties:
    'Gas density and viscosity must be greater than zero.',
  invalidLiquidDensity:
    'Liquid density must be greater than zero.',
  invalidDensityOrder:
    'Liquid density must be greater than gas density.',
  invalidCapacityFactor:
    'Packing capacity factor must be greater than zero.',
  invalidDesignFloodFraction:
    'Design flooding fraction must satisfy 0 < fraction < 1.',
  numericalFailure:
    'The packed-column hydraulic calculation did not produce finite physical results.',
}

export class PackedColumnPressureDropError extends Error {
  readonly code: PackedColumnPressureDropErrorCode

  constructor(code: PackedColumnPressureDropErrorCode) {
    super(messages[code])
    this.name = 'PackedColumnPressureDropError'
    this.code = code
  }
}

function validateInput(
  input: PackedColumnPressureDropInput,
) {
  if (!Object.values(input).every(Number.isFinite)) {
    throw new PackedColumnPressureDropError(
      'nonFiniteInput',
    )
  }

  if (input.gasVolumetricFlowRate <= 0) {
    throw new PackedColumnPressureDropError(
      'invalidGasFlow',
    )
  }

  if (
    input.columnDiameter <= 0 ||
    input.packingHeight <= 0
  ) {
    throw new PackedColumnPressureDropError(
      'invalidColumnGeometry',
    )
  }

  if (
    input.bedVoidFraction <= 0 ||
    input.bedVoidFraction >= 1
  ) {
    throw new PackedColumnPressureDropError(
      'invalidVoidFraction',
    )
  }

  if (input.packingEquivalentDiameter <= 0) {
    throw new PackedColumnPressureDropError(
      'invalidPackingDiameter',
    )
  }

  if (
    input.gasDensity <= 0 ||
    input.gasViscosity <= 0
  ) {
    throw new PackedColumnPressureDropError(
      'invalidGasProperties',
    )
  }

  if (input.liquidDensity <= 0) {
    throw new PackedColumnPressureDropError(
      'invalidLiquidDensity',
    )
  }

  if (input.liquidDensity <= input.gasDensity) {
    throw new PackedColumnPressureDropError(
      'invalidDensityOrder',
    )
  }

  if (input.packingCapacityFactor <= 0) {
    throw new PackedColumnPressureDropError(
      'invalidCapacityFactor',
    )
  }

  if (
    input.designFloodFraction <= 0 ||
    input.designFloodFraction >= 1
  ) {
    throw new PackedColumnPressureDropError(
      'invalidDesignFloodFraction',
    )
  }
}

export function calculatePackedColumnFloodingVelocity(
  input: PackedColumnPressureDropInput,
): number {
  const floodingVelocity =
    input.packingCapacityFactor *
    Math.sqrt(
      (input.liquidDensity - input.gasDensity) /
        input.gasDensity,
    )

  if (
    !Number.isFinite(floodingVelocity) ||
    floodingVelocity <= 0
  ) {
    throw new PackedColumnPressureDropError(
      'numericalFailure',
    )
  }

  return floodingVelocity
}

function determineStatus({
  floodFraction,
  designFloodFraction,
}: {
  floodFraction: number
  designFloodFraction: number
}): PackedColumnHydraulicStatus {
  if (floodFraction >= 1) {
    return 'flooded'
  }

  if (floodFraction >= designFloodFraction) {
    return 'highLoad'
  }

  if (
    floodFraction <
    0.5 * designFloodFraction
  ) {
    return 'lowLoad'
  }

  return 'stable'
}

export function calculatePackedColumnPressureScenario({
  input,
  columnArea,
  floodingVelocity,
  gasFlowMultiplier,
}: {
  input: PackedColumnPressureDropInput
  columnArea: number
  floodingVelocity: number
  gasFlowMultiplier: number
}): PackedColumnPressureDropScenario {
  const gasVolumetricFlowRate =
    input.gasVolumetricFlowRate *
    gasFlowMultiplier

  const superficialGasVelocity =
    gasVolumetricFlowRate /
    columnArea

  const packingReynoldsNumber =
    input.gasDensity *
    superficialGasVelocity *
    input.packingEquivalentDiameter /
    input.gasViscosity

  const voidFractionCubed =
    input.bedVoidFraction ** 3

  const solidFraction =
    1 - input.bedVoidFraction

  const viscousPressureGradient =
    150 *
    input.gasViscosity *
    superficialGasVelocity *
    solidFraction ** 2 /
    (
      voidFractionCubed *
      input.packingEquivalentDiameter ** 2
    )

  const inertialPressureGradient =
    1.75 *
    input.gasDensity *
    superficialGasVelocity ** 2 *
    solidFraction /
    (
      voidFractionCubed *
      input.packingEquivalentDiameter
    )

  const dryPressureDropPerLength =
    viscousPressureGradient +
    inertialPressureGradient

  const totalDryPressureDrop =
    dryPressureDropPerLength *
    input.packingHeight

  const floodFraction =
    superficialGasVelocity /
    floodingVelocity

  const designSuperficialGasVelocity =
    input.designFloodFraction *
    floodingVelocity

  const designCapacityMarginPercent =
    (
      designSuperficialGasVelocity -
      superficialGasVelocity
    ) /
    designSuperficialGasVelocity *
    100

  const values = [
    gasVolumetricFlowRate,
    superficialGasVelocity,
    packingReynoldsNumber,
    viscousPressureGradient,
    inertialPressureGradient,
    dryPressureDropPerLength,
    totalDryPressureDrop,
    floodingVelocity,
    floodFraction,
  ]

  if (
    !values.every(
      (value) =>
        Number.isFinite(value) &&
        value > 0,
    ) ||
    !Number.isFinite(
      designCapacityMarginPercent,
    )
  ) {
    throw new PackedColumnPressureDropError(
      'numericalFailure',
    )
  }

  return {
    gasFlowMultiplier,
    gasVolumetricFlowRate,
    superficialGasVelocity,
    packingReynoldsNumber,
    viscousPressureGradient,
    inertialPressureGradient,
    dryPressureDropPerLength,
    totalDryPressureDrop,
    floodingVelocity,
    floodFraction,
    designCapacityMarginPercent,
    status: determineStatus({
      floodFraction,
      designFloodFraction:
        input.designFloodFraction,
    }),
  }
}

export function calculatePackedColumnPressureDrop(
  input: PackedColumnPressureDropInput,
): PackedColumnPressureDropResult {
  validateInput(input)

  const columnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const floodingVelocity =
    calculatePackedColumnFloodingVelocity(
      input,
    )

  const designSuperficialGasVelocity =
    input.designFloodFraction *
    floodingVelocity

  const maximumGasFlowAtDesign =
    designSuperficialGasVelocity *
    columnArea

  const currentDesignCapacityFraction =
    input.gasVolumetricFlowRate /
    maximumGasFlowAtDesign

  const scenarios = [
    0.5,
    1,
    1.5,
    2,
    3,
  ].map((gasFlowMultiplier) =>
    calculatePackedColumnPressureScenario({
      input,
      columnArea,
      floodingVelocity,
      gasFlowMultiplier,
    }),
  )

  const selectedScenario =
    scenarios.find(
      (scenario) =>
        scenario.gasFlowMultiplier === 1,
    )

  if (!selectedScenario) {
    throw new PackedColumnPressureDropError(
      'numericalFailure',
    )
  }

  return {
    columnArea,
    floodingVelocity,
    designSuperficialGasVelocity,
    maximumGasFlowAtDesign,
    currentDesignCapacityFraction,
    selectedScenario,
    scenarios,
    modelName:
      'Dry Ergun pressure-drop and packed-column flooding-capacity screening',
    limitationDescription:
      'The Ergun result is a dry-gas screening estimate. Irrigated pressure drop and flooding require packing-specific wet correlations or supplier data.',
  }
}

function csvCell(
  value: string | number,
): string {
  return `"${String(value).replace(
    /"/g,
    '""',
  )}"`
}

export function createPackedColumnPressureDropCsv(
  input: PackedColumnPressureDropInput,
  result: PackedColumnPressureDropResult,
): string {
  const rows: (string | number)[][] = [
    [
      'Packed Column Pressure Drop and Flooding Check',
      '',
    ],
    [
      'Gas volumetric flow rate, m3/s',
      input.gasVolumetricFlowRate,
    ],
    [
      'Column diameter, m',
      input.columnDiameter,
    ],
    [
      'Packing height, m',
      input.packingHeight,
    ],
    [
      'Dry pressure drop, Pa/m',
      result
        .selectedScenario
        .dryPressureDropPerLength,
    ],
    [
      'Total dry pressure drop, Pa',
      result
        .selectedScenario
        .totalDryPressureDrop,
    ],
    [
      'Flooding velocity, m/s',
      result.floodingVelocity,
    ],
    [
      'Maximum gas flow at design, m3/s',
      result.maximumGasFlowAtDesign,
    ],
    [],
    [
      'Gas flow multiplier',
      'Gas flow, m3/s',
      'Pressure drop, Pa/m',
      'Flood fraction',
      'Status',
    ],
    ...result.scenarios.map(
      (scenario) => [
        scenario.gasFlowMultiplier,
        scenario.gasVolumetricFlowRate,
        scenario.dryPressureDropPerLength,
        scenario.floodFraction,
        scenario.status,
      ],
    ),
  ]

  return rows
    .map(
      (row) =>
        row.map(csvCell).join(','),
    )
    .join('\n')
}
