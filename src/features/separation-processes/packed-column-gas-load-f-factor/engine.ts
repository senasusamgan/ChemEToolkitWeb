import type {
  PackedColumnGasLoadInput,
  PackedColumnGasLoadResult,
  PackedColumnGasLoadScenario,
  PackedColumnGasLoadStatus,
} from './types.ts'

export const PACKED_COLUMN_GAS_LOAD_F_FACTOR_ENGINE_VERSION =
  'packed-column-gas-load-f-factor-v1'

export type PackedColumnGasLoadErrorCode =
  | 'INVALID_GAS_FLOW'
  | 'INVALID_COLUMN_DIAMETER'
  | 'INVALID_GAS_DENSITY'
  | 'INVALID_MINIMUM_F_FACTOR'
  | 'INVALID_MAXIMUM_F_FACTOR'
  | 'INVALID_F_FACTOR_WINDOW'

export class PackedColumnGasLoadError extends Error {
  readonly code: PackedColumnGasLoadErrorCode

  constructor(
    code: PackedColumnGasLoadErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'PackedColumnGasLoadError'
    this.code = code
  }
}

const scenarioMultipliers = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  2,
]

function requirePositiveFinite(
  value: number,
  code: PackedColumnGasLoadErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new PackedColumnGasLoadError(
      code,
      `${label} must be a positive finite number.`,
    )
  }
}

function classifyStatus(
  fFactor: number,
  minimumOperatingFFactor: number,
  maximumDesignFFactor: number,
): PackedColumnGasLoadStatus {
  if (
    fFactor <
    minimumOperatingFFactor
  ) {
    return 'underloaded'
  }

  if (
    fFactor >
    maximumDesignFFactor
  ) {
    return 'overloaded'
  }

  if (
    fFactor >=
    0.85 * maximumDesignFFactor
  ) {
    return 'marginal'
  }

  return 'stable'
}

export function calculatePackedColumnGasLoadScenario(
  input: PackedColumnGasLoadInput,
  multiplier = 1,
): PackedColumnGasLoadScenario {
  requirePositiveFinite(
    multiplier,
    'INVALID_GAS_FLOW',
    'Scenario multiplier',
  )

  const columnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const gasVolumetricFlowRate =
    input.gasVolumetricFlowRate *
    multiplier

  const superficialGasVelocity =
    gasVolumetricFlowRate /
    columnArea

  const gasMassFlowRate =
    input.gasDensity *
    gasVolumetricFlowRate

  const gasMassFlux =
    gasMassFlowRate /
    columnArea

  const fFactor =
    superficialGasVelocity *
    Math.sqrt(
      input.gasDensity,
    )

  const kineticPressure =
    0.5 *
    input.gasDensity *
    superficialGasVelocity ** 2

  const minimumFFactorRatio =
    fFactor /
    input.minimumOperatingFFactor

  const maximumFFactorRatio =
    fFactor /
    input.maximumDesignFFactor

  const marginToMaximumPercent =
    (
      1 -
      maximumFFactorRatio
    ) *
    100

  return {
    multiplier,
    gasVolumetricFlowRate,
    superficialGasVelocity,
    gasMassFlowRate,
    gasMassFlux,
    fFactor,
    kineticPressure,
    minimumFFactorRatio,
    maximumFFactorRatio,
    marginToMaximumPercent,
    status: classifyStatus(
      fFactor,
      input.minimumOperatingFFactor,
      input.maximumDesignFFactor,
    ),
  }
}

export function calculatePackedColumnGasLoad(
  input: PackedColumnGasLoadInput,
): PackedColumnGasLoadResult {
  requirePositiveFinite(
    input.gasVolumetricFlowRate,
    'INVALID_GAS_FLOW',
    'Gas volumetric flow rate',
  )

  requirePositiveFinite(
    input.columnDiameter,
    'INVALID_COLUMN_DIAMETER',
    'Column diameter',
  )

  requirePositiveFinite(
    input.gasDensity,
    'INVALID_GAS_DENSITY',
    'Gas density',
  )

  requirePositiveFinite(
    input.minimumOperatingFFactor,
    'INVALID_MINIMUM_F_FACTOR',
    'Minimum operating F-factor',
  )

  requirePositiveFinite(
    input.maximumDesignFFactor,
    'INVALID_MAXIMUM_F_FACTOR',
    'Maximum design F-factor',
  )

  if (
    input.minimumOperatingFFactor >=
    input.maximumDesignFFactor
  ) {
    throw new PackedColumnGasLoadError(
      'INVALID_F_FACTOR_WINDOW',
      'Minimum operating F-factor must be below maximum design F-factor.',
    )
  }

  const columnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const densityRoot =
    Math.sqrt(
      input.gasDensity,
    )

  const minimumSuperficialGasVelocity =
    input.minimumOperatingFFactor /
    densityRoot

  const maximumSuperficialGasVelocity =
    input.maximumDesignFFactor /
    densityRoot

  const minimumGasFlowByFFactor =
    minimumSuperficialGasVelocity *
    columnArea

  const maximumGasFlowByFFactor =
    maximumSuperficialGasVelocity *
    columnArea

  const scenarios =
    scenarioMultipliers.map(
      multiplier =>
        calculatePackedColumnGasLoadScenario(
          input,
          multiplier,
        ),
    )

  const selectedScenario =
    scenarios.find(
      scenario =>
        scenario.multiplier === 1,
    )

  if (!selectedScenario) {
    throw new Error(
      'Selected gas-load scenario was not generated.',
    )
  }

  return {
    modelName:
      'Packed Column Gas Load & F-Factor Operating Window',
    limitationDescription:
      'This calculator uses gas superficial velocity and the conventional F-factor, uG sqrt(rhoG), as screening criteria. Actual packed-column capacity also depends on packing type and size, liquid load, pressure, surface tension, viscosity, pressure drop, flooding correlation and vendor hydraulic data.',
    columnArea,
    minimumSuperficialGasVelocity,
    maximumSuperficialGasVelocity,
    minimumGasFlowByFFactor,
    maximumGasFlowByFFactor,
    selectedScenario,
    scenarios,
  }
}

export function createPackedColumnGasLoadCsv(
  input: PackedColumnGasLoadInput,
  result: PackedColumnGasLoadResult,
): string {
  const lines = [
    [
      'Packed Column Gas Load & F-Factor Operating Window',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Gas volumetric flow rate',
      input.gasVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Column diameter',
      input.columnDiameter,
      'm',
    ],
    [
      'Gas density',
      input.gasDensity,
      'kg/m3',
    ],
    [
      'Minimum operating F-factor',
      input.minimumOperatingFFactor,
      'm/s*sqrt(kg/m3)',
    ],
    [
      'Maximum design F-factor',
      input.maximumDesignFFactor,
      'm/s*sqrt(kg/m3)',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Column area',
      result.columnArea,
      'm2',
    ],
    [
      'Minimum gas flow by F-factor',
      result.minimumGasFlowByFFactor,
      'm3/s',
    ],
    [
      'Maximum gas flow by F-factor',
      result.maximumGasFlowByFFactor,
      'm3/s',
    ],
    [],
    [
      'Multiplier',
      'Gas flow (m3/s)',
      'Superficial velocity (m/s)',
      'Gas mass flow (kg/s)',
      'Gas mass flux (kg/m2/s)',
      'F-factor',
      'Kinetic pressure (Pa)',
      'F/Fmin',
      'F/Fmax',
      'Margin to Fmax (%)',
      'Status',
    ],
  ]

  for (
    const scenario
    of result.scenarios
  ) {
    lines.push([
      scenario.multiplier,
      scenario.gasVolumetricFlowRate,
      scenario.superficialGasVelocity,
      scenario.gasMassFlowRate,
      scenario.gasMassFlux,
      scenario.fFactor,
      scenario.kineticPressure,
      scenario.minimumFFactorRatio,
      scenario.maximumFFactorRatio,
      scenario.marginToMaximumPercent,
      scenario.status,
    ])
  }

  return lines
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
