import type {
  TrayHydraulicStatus,
  TrayHydraulicsInput,
  TrayHydraulicsResult,
  TrayHydraulicsScenario,
} from './types.ts'

export const TRAY_HYDRAULICS_WEEPING_ENGINE_VERSION =
  'tray-hydraulics-weeping-v1' as const

export type TrayHydraulicsErrorCode =
  | 'nonFiniteInput'
  | 'invalidFlowRate'
  | 'invalidDiameter'
  | 'invalidAreaFraction'
  | 'invalidDischargeCoefficient'
  | 'invalidDensity'
  | 'invalidDensityOrder'
  | 'invalidWeirGeometry'
  | 'invalidCapacityFactor'
  | 'numericalFailure'

const GRAVITY = 9.80665
const FRANCIS_WEIR_COEFFICIENT = 1.84

const errorMessages: Record<
  TrayHydraulicsErrorCode,
  string
> = {
  nonFiniteInput:
    'All tray-hydraulic inputs must be finite numbers.',
  invalidFlowRate:
    'Vapor and liquid volumetric flow rates must be greater than zero.',
  invalidDiameter:
    'Column diameter must be greater than zero.',
  invalidAreaFraction:
    'Active-area fraction must satisfy 0 < fraction ≤ 1 and hole-area fraction must satisfy 0 < fraction < 0.5.',
  invalidDischargeCoefficient:
    'The tray-hole discharge coefficient must satisfy 0 < coefficient ≤ 1.',
  invalidDensity:
    'Vapor and liquid densities must be greater than zero.',
  invalidDensityOrder:
    'Liquid density must be greater than vapor density.',
  invalidWeirGeometry:
    'Weir length must be positive and no greater than the column circumference. Weir height must satisfy 0 ≤ height < column diameter.',
  invalidCapacityFactor:
    'The Souders–Brown capacity factor must be greater than zero.',
  numericalFailure:
    'The tray-hydraulic calculation did not produce finite physical results.',
}

export class TrayHydraulicsCalculationError extends Error {
  readonly code: TrayHydraulicsErrorCode

  constructor(code: TrayHydraulicsErrorCode) {
    super(errorMessages[code])
    this.name = 'TrayHydraulicsCalculationError'
    this.code = code
  }
}

function validateInput(input: TrayHydraulicsInput) {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new TrayHydraulicsCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.vaporVolumetricFlowRate <= 0 ||
    input.liquidVolumetricFlowRate <= 0
  ) {
    throw new TrayHydraulicsCalculationError(
      'invalidFlowRate',
    )
  }

  if (input.columnDiameter <= 0) {
    throw new TrayHydraulicsCalculationError(
      'invalidDiameter',
    )
  }

  if (
    input.activeAreaFraction <= 0 ||
    input.activeAreaFraction > 1 ||
    input.holeAreaFraction <= 0 ||
    input.holeAreaFraction >= 0.5
  ) {
    throw new TrayHydraulicsCalculationError(
      'invalidAreaFraction',
    )
  }

  if (
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1
  ) {
    throw new TrayHydraulicsCalculationError(
      'invalidDischargeCoefficient',
    )
  }

  if (
    input.vaporDensity <= 0 ||
    input.liquidDensity <= 0
  ) {
    throw new TrayHydraulicsCalculationError(
      'invalidDensity',
    )
  }

  if (input.liquidDensity <= input.vaporDensity) {
    throw new TrayHydraulicsCalculationError(
      'invalidDensityOrder',
    )
  }

  if (
    input.weirLength <= 0 ||
    input.weirLength >
      Math.PI * input.columnDiameter ||
    input.weirHeight < 0 ||
    input.weirHeight >= input.columnDiameter
  ) {
    throw new TrayHydraulicsCalculationError(
      'invalidWeirGeometry',
    )
  }

  if (input.capacityFactor <= 0) {
    throw new TrayHydraulicsCalculationError(
      'invalidCapacityFactor',
    )
  }
}

export function calculateWeirOverflowHeight(
  liquidVolumetricFlowRate: number,
  weirLength: number,
): number {
  return (
    liquidVolumetricFlowRate /
    (
      FRANCIS_WEIR_COEFFICIENT *
      weirLength
    )
  ) ** (2 / 3)
}

function determineStatus(
  weepingVelocityRatio: number,
  floodFraction: number,
): TrayHydraulicStatus {
  if (floodFraction >= 1) {
    return 'flooded'
  }

  if (weepingVelocityRatio < 1) {
    return 'weepingRisk'
  }

  if (floodFraction >= 0.85) {
    return 'highFlooding'
  }

  if (weepingVelocityRatio < 1.2) {
    return 'marginal'
  }

  return 'stable'
}

export function calculateTrayHydraulicsScenario({
  input,
  vaporFlowMultiplier,
  activeTrayArea,
  holeArea,
  clearLiquidHead,
}: {
  input: TrayHydraulicsInput
  vaporFlowMultiplier: number
  activeTrayArea: number
  holeArea: number
  clearLiquidHead: number
}): TrayHydraulicsScenario {
  const vaporVolumetricFlowRate =
    input.vaporVolumetricFlowRate *
    vaporFlowMultiplier

  const superficialVaporVelocity =
    vaporVolumetricFlowRate /
    activeTrayArea

  const holeVelocity =
    vaporVolumetricFlowRate /
    holeArea

  const dryTrayPressureDrop =
    input.vaporDensity *
    holeVelocity ** 2 /
    (
      2 *
      input.dischargeCoefficient ** 2
    )

  const liquidHeadPressureDrop =
    input.liquidDensity *
    GRAVITY *
    clearLiquidHead

  const totalTrayPressureDrop =
    dryTrayPressureDrop +
    liquidHeadPressureDrop

  const minimumHoleVelocity =
    input.dischargeCoefficient *
    Math.sqrt(
      2 *
      liquidHeadPressureDrop /
      input.vaporDensity,
    )

  const weepingVelocityRatio =
    holeVelocity /
    minimumHoleVelocity

  const floodingVelocity =
    input.capacityFactor *
    Math.sqrt(
      (
        input.liquidDensity -
        input.vaporDensity
      ) /
      input.vaporDensity,
    )

  const floodFraction =
    superficialVaporVelocity /
    floodingVelocity

  const capacityMarginPercent =
    (
      1 -
      floodFraction
    ) *
    100

  const values = [
    vaporVolumetricFlowRate,
    superficialVaporVelocity,
    holeVelocity,
    dryTrayPressureDrop,
    liquidHeadPressureDrop,
    totalTrayPressureDrop,
    minimumHoleVelocity,
    weepingVelocityRatio,
    floodingVelocity,
    floodFraction,
    capacityMarginPercent,
  ]

  if (
    !values.every(Number.isFinite) ||
    values.some((value) => value <= 0)
  ) {
    throw new TrayHydraulicsCalculationError(
      'numericalFailure',
    )
  }

  return {
    vaporFlowMultiplier,
    vaporVolumetricFlowRate,
    superficialVaporVelocity,
    holeVelocity,
    dryTrayPressureDrop,
    liquidHeadPressureDrop,
    totalTrayPressureDrop,
    minimumHoleVelocity,
    weepingVelocityRatio,
    floodingVelocity,
    floodFraction,
    capacityMarginPercent,
    status: determineStatus(
      weepingVelocityRatio,
      floodFraction,
    ),
  }
}

export function calculateTrayHydraulics(
  input: TrayHydraulicsInput,
): TrayHydraulicsResult {
  validateInput(input)

  const grossColumnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const activeTrayArea =
    grossColumnArea *
    input.activeAreaFraction

  const holeArea =
    activeTrayArea *
    input.holeAreaFraction

  const weirOverflowHeight =
    calculateWeirOverflowHeight(
      input.liquidVolumetricFlowRate,
      input.weirLength,
    )

  const clearLiquidHead =
    input.weirHeight +
    weirOverflowHeight

  const scenarios = [
    0.6,
    0.8,
    1,
    1.2,
  ].map((vaporFlowMultiplier) =>
    calculateTrayHydraulicsScenario({
      input,
      vaporFlowMultiplier,
      activeTrayArea,
      holeArea,
      clearLiquidHead,
    }),
  )

  const selectedScenario =
    scenarios.find(
      (scenario) =>
        scenario.vaporFlowMultiplier === 1,
    )

  if (
    !selectedScenario ||
    !Number.isFinite(grossColumnArea) ||
    !Number.isFinite(activeTrayArea) ||
    !Number.isFinite(holeArea) ||
    !Number.isFinite(weirOverflowHeight) ||
    !Number.isFinite(clearLiquidHead) ||
    grossColumnArea <= 0 ||
    activeTrayArea <= 0 ||
    holeArea <= 0 ||
    clearLiquidHead <= 0
  ) {
    throw new TrayHydraulicsCalculationError(
      'numericalFailure',
    )
  }

  return {
    grossColumnArea,
    activeTrayArea,
    holeArea,
    weirOverflowHeight,
    clearLiquidHead,
    selectedScenario,
    scenarios,
    modelName:
      'Sieve-tray pressure-drop and operating-window check',
    limitationDescription:
      'This shortcut uses a Francis rectangular-weir estimate, an orifice dry-tray pressure-drop model and a simplified liquid-head support criterion for weeping. Final tray design still requires vendor correlations for aeration, froth density, entrainment, downcomer backup, residence time, seal height and service-specific tray geometry.',
  }
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function createTrayHydraulicsCsv(
  input: TrayHydraulicsInput,
  result: TrayHydraulicsResult,
): string {
  const rows: (string | number)[][] = [
    [
      'Tray Hydraulic Pressure Drop and Weeping Check',
      '',
    ],
    [],
    [
      'Input',
      'Value',
    ],
    [
      'Vapor volumetric flow rate, m3/s',
      input.vaporVolumetricFlowRate,
    ],
    [
      'Liquid volumetric flow rate, m3/s',
      input.liquidVolumetricFlowRate,
    ],
    [
      'Column diameter, m',
      input.columnDiameter,
    ],
    [
      'Active tray area fraction',
      input.activeAreaFraction,
    ],
    [
      'Hole area fraction',
      input.holeAreaFraction,
    ],
    [
      'Discharge coefficient',
      input.dischargeCoefficient,
    ],
    [
      'Vapor density, kg/m3',
      input.vaporDensity,
    ],
    [
      'Liquid density, kg/m3',
      input.liquidDensity,
    ],
    [
      'Weir length, m',
      input.weirLength,
    ],
    [
      'Weir height, m',
      input.weirHeight,
    ],
    [
      'Capacity factor, m/s',
      input.capacityFactor,
    ],
    [],
    [
      'Selected operating result',
      'Value',
    ],
    [
      'Gross column area, m2',
      result.grossColumnArea,
    ],
    [
      'Active tray area, m2',
      result.activeTrayArea,
    ],
    [
      'Hole area, m2',
      result.holeArea,
    ],
    [
      'Weir overflow height, m',
      result.weirOverflowHeight,
    ],
    [
      'Clear liquid head, m',
      result.clearLiquidHead,
    ],
    [
      'Dry tray pressure drop, Pa',
      result.selectedScenario.dryTrayPressureDrop,
    ],
    [
      'Liquid head pressure drop, Pa',
      result.selectedScenario.liquidHeadPressureDrop,
    ],
    [
      'Total tray pressure drop, Pa',
      result.selectedScenario.totalTrayPressureDrop,
    ],
    [
      'Weeping velocity ratio',
      result.selectedScenario.weepingVelocityRatio,
    ],
    [
      'Flood fraction',
      result.selectedScenario.floodFraction,
    ],
    [
      'Operating status',
      result.selectedScenario.status,
    ],
    [],
    [
      'Vapor flow multiplier',
      'Vapor flow, m3/s',
      'Superficial velocity, m/s',
      'Hole velocity, m/s',
      'Dry pressure drop, Pa',
      'Total pressure drop, Pa',
      'Weeping velocity ratio',
      'Flood fraction',
      'Capacity margin, percent',
      'Status',
    ],
    ...result.scenarios.map((scenario) => [
      scenario.vaporFlowMultiplier,
      scenario.vaporVolumetricFlowRate,
      scenario.superficialVaporVelocity,
      scenario.holeVelocity,
      scenario.dryTrayPressureDrop,
      scenario.totalTrayPressureDrop,
      scenario.weepingVelocityRatio,
      scenario.floodFraction,
      scenario.capacityMarginPercent,
      scenario.status,
    ]),
  ]

  return rows
    .map((row) => row.map(csvCell).join(','))
    .join('\n')
}
