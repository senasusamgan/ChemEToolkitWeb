import type {
  PackedColumnHoldupStatus,
  PackedColumnLiquidHoldupInput,
  PackedColumnLiquidHoldupResult,
  PackedColumnLiquidHoldupScenario,
} from './types.ts'

export const PACKED_COLUMN_LIQUID_HOLDUP_ENGINE_VERSION =
  'packed-column-liquid-holdup-v1' as const

export type PackedColumnLiquidHoldupErrorCode =
  | 'nonFiniteInput'
  | 'invalidLiquidFlow'
  | 'invalidColumnGeometry'
  | 'invalidVoidFraction'
  | 'invalidHoldupFraction'
  | 'invalidLiquidDensity'
  | 'invalidResidenceTime'
  | 'numericalFailure'

const errorMessages: Record<
  PackedColumnLiquidHoldupErrorCode,
  string
> = {
  nonFiniteInput:
    'All packed-column liquid-holdup inputs must be finite numbers.',
  invalidLiquidFlow:
    'Liquid volumetric flow rate must be greater than zero.',
  invalidColumnGeometry:
    'Column diameter and packing height must be greater than zero.',
  invalidVoidFraction:
    'Packed-bed void fraction must satisfy 0 < void fraction < 1.',
  invalidHoldupFraction:
    'Liquid holdup fraction must be greater than zero and less than the packed-bed void fraction.',
  invalidLiquidDensity:
    'Liquid density must be greater than zero.',
  invalidResidenceTime:
    'Minimum liquid residence time must be greater than zero.',
  numericalFailure:
    'The liquid-holdup calculation did not produce finite physical results.',
}

export class PackedColumnLiquidHoldupError
  extends Error {
  readonly code:
    PackedColumnLiquidHoldupErrorCode

  constructor(
    code:
      PackedColumnLiquidHoldupErrorCode,
  ) {
    super(
      errorMessages[code],
    )

    this.name =
      'PackedColumnLiquidHoldupError'

    this.code =
      code
  }
}

function validateInput(
  input:
    PackedColumnLiquidHoldupInput,
) {
  if (
    !Object.values(
      input,
    ).every(
      Number.isFinite,
    )
  ) {
    throw new PackedColumnLiquidHoldupError(
      'nonFiniteInput',
    )
  }

  if (
    input.liquidVolumetricFlowRate <= 0
  ) {
    throw new PackedColumnLiquidHoldupError(
      'invalidLiquidFlow',
    )
  }

  if (
    input.columnDiameter <= 0 ||
    input.packingHeight <= 0
  ) {
    throw new PackedColumnLiquidHoldupError(
      'invalidColumnGeometry',
    )
  }

  if (
    input.bedVoidFraction <= 0 ||
    input.bedVoidFraction >= 1
  ) {
    throw new PackedColumnLiquidHoldupError(
      'invalidVoidFraction',
    )
  }

  if (
    input.liquidHoldupFraction <= 0 ||
    input.liquidHoldupFraction >=
      input.bedVoidFraction
  ) {
    throw new PackedColumnLiquidHoldupError(
      'invalidHoldupFraction',
    )
  }

  if (
    input.liquidDensity <= 0
  ) {
    throw new PackedColumnLiquidHoldupError(
      'invalidLiquidDensity',
    )
  }

  if (
    input.minimumResidenceTime <= 0
  ) {
    throw new PackedColumnLiquidHoldupError(
      'invalidResidenceTime',
    )
  }
}

function determineStatus({
  residenceTime,
  minimumResidenceTime,
  voidSaturationFraction,
}: {
  residenceTime: number
  minimumResidenceTime: number
  voidSaturationFraction: number
}): PackedColumnHoldupStatus {
  if (
    residenceTime <
    minimumResidenceTime
  ) {
    return 'shortResidence'
  }

  if (
    voidSaturationFraction >=
    0.85
  ) {
    return 'highHoldup'
  }

  if (
    residenceTime <
      1.25 *
      minimumResidenceTime ||
    voidSaturationFraction >=
      0.7
  ) {
    return 'marginal'
  }

  return 'stable'
}

export function calculatePackedColumnHoldupScenario({
  input,
  columnArea,
  liquidHoldupVolume,
  voidSaturationFraction,
  liquidFlowMultiplier,
}: {
  input:
    PackedColumnLiquidHoldupInput
  columnArea: number
  liquidHoldupVolume: number
  voidSaturationFraction: number
  liquidFlowMultiplier: number
}): PackedColumnLiquidHoldupScenario {
  const liquidVolumetricFlowRate =
    input.liquidVolumetricFlowRate *
    liquidFlowMultiplier

  const superficialLiquidVelocity =
    liquidVolumetricFlowRate /
    columnArea

  const interstitialLiquidVelocity =
    liquidVolumetricFlowRate /
    (
      columnArea *
      input.liquidHoldupFraction
    )

  const liquidMassFlux =
    input.liquidDensity *
    superficialLiquidVelocity

  const residenceTime =
    liquidHoldupVolume /
    liquidVolumetricFlowRate

  const turnoverRatePerHour =
    liquidVolumetricFlowRate /
    liquidHoldupVolume *
    3600

  const residenceMarginPercent =
    (
      residenceTime -
      input.minimumResidenceTime
    ) /
    input.minimumResidenceTime *
    100

  const positiveValues = [
    liquidVolumetricFlowRate,
    superficialLiquidVelocity,
    interstitialLiquidVelocity,
    liquidMassFlux,
    residenceTime,
    turnoverRatePerHour,
  ]

  if (
    !positiveValues.every(
      (
        value,
      ) =>
        Number.isFinite(
          value,
        ) &&
        value > 0,
    ) ||
    !Number.isFinite(
      residenceMarginPercent,
    )
  ) {
    throw new PackedColumnLiquidHoldupError(
      'numericalFailure',
    )
  }

  return {
    liquidFlowMultiplier,
    liquidVolumetricFlowRate,
    superficialLiquidVelocity,
    interstitialLiquidVelocity,
    liquidMassFlux,
    residenceTime,
    turnoverRatePerHour,
    residenceMarginPercent,
    status:
      determineStatus({
        residenceTime,
        minimumResidenceTime:
          input.minimumResidenceTime,
        voidSaturationFraction,
      }),
  }
}

export function calculatePackedColumnLiquidHoldup(
  input:
    PackedColumnLiquidHoldupInput,
): PackedColumnLiquidHoldupResult {
  validateInput(
    input,
  )

  const columnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const packedBedVolume =
    columnArea *
    input.packingHeight

  const packedBedVoidVolume =
    packedBedVolume *
    input.bedVoidFraction

  const liquidHoldupVolume =
    packedBedVolume *
    input.liquidHoldupFraction

  const liquidInventoryMass =
    liquidHoldupVolume *
    input.liquidDensity

  const voidSaturationFraction =
    input.liquidHoldupFraction /
    input.bedVoidFraction

  const minimumHoldupVolume =
    input.liquidVolumetricFlowRate *
    input.minimumResidenceTime

  const minimumHoldupFraction =
    minimumHoldupVolume /
    packedBedVolume

  const maximumLiquidFlowByResidence =
    liquidHoldupVolume /
    input.minimumResidenceTime

  const currentResidenceCapacityFraction =
    input.liquidVolumetricFlowRate /
    maximumLiquidFlowByResidence

  const scenarios = [
    0.5,
    1,
    1.5,
    2,
    3,
  ].map(
    (
      liquidFlowMultiplier,
    ) =>
      calculatePackedColumnHoldupScenario({
        input,
        columnArea,
        liquidHoldupVolume,
        voidSaturationFraction,
        liquidFlowMultiplier,
      }),
  )

  const selectedScenario =
    scenarios.find(
      (
        scenario,
      ) =>
        scenario.liquidFlowMultiplier ===
        1,
    )

  const resultValues = [
    columnArea,
    packedBedVolume,
    packedBedVoidVolume,
    liquidHoldupVolume,
    liquidInventoryMass,
    voidSaturationFraction,
    minimumHoldupVolume,
    minimumHoldupFraction,
    maximumLiquidFlowByResidence,
    currentResidenceCapacityFraction,
  ]

  if (
    !selectedScenario ||
    !resultValues.every(
      (
        value,
      ) =>
        Number.isFinite(
          value,
        ) &&
        value > 0,
    )
  ) {
    throw new PackedColumnLiquidHoldupError(
      'numericalFailure',
    )
  }

  return {
    columnArea,
    packedBedVolume,
    packedBedVoidVolume,
    liquidHoldupVolume,
    liquidInventoryMass,
    voidSaturationFraction,
    minimumHoldupVolume,
    minimumHoldupFraction,
    maximumLiquidFlowByResidence,
    currentResidenceCapacityFraction,
    selectedScenario,
    scenarios,
    modelName:
      'Packed-column liquid inventory and residence-time screening',
    limitationDescription:
      'The entered liquid holdup fraction is treated as uniform over the packed bed. Actual static and dynamic holdup depend on packing type, liquid and gas loads, wetting, viscosity, surface tension, distributor quality and operating proximity to loading or flooding.',
  }
}

function csvCell(
  value:
    string |
    number,
): string {
  return `"${String(
    value,
  ).replace(
    /"/g,
    '""',
  )}"`
}

export function createPackedColumnLiquidHoldupCsv(
  input:
    PackedColumnLiquidHoldupInput,
  result:
    PackedColumnLiquidHoldupResult,
): string {
  const rows: (
    string |
    number
  )[][] = [
    [
      'Packed Column Liquid Holdup and Residence Time',
      '',
    ],
    [],
    [
      'Input',
      'Value',
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
      'Packing height, m',
      input.packingHeight,
    ],
    [
      'Bed void fraction',
      input.bedVoidFraction,
    ],
    [
      'Liquid holdup fraction',
      input.liquidHoldupFraction,
    ],
    [
      'Liquid density, kg/m3',
      input.liquidDensity,
    ],
    [
      'Minimum residence time, s',
      input.minimumResidenceTime,
    ],
    [],
    [
      'Result',
      'Value',
    ],
    [
      'Column area, m2',
      result.columnArea,
    ],
    [
      'Packed-bed volume, m3',
      result.packedBedVolume,
    ],
    [
      'Packed-bed void volume, m3',
      result.packedBedVoidVolume,
    ],
    [
      'Liquid holdup volume, m3',
      result.liquidHoldupVolume,
    ],
    [
      'Liquid inventory mass, kg',
      result.liquidInventoryMass,
    ],
    [
      'Void saturation fraction',
      result.voidSaturationFraction,
    ],
    [
      'Minimum holdup volume, m3',
      result.minimumHoldupVolume,
    ],
    [
      'Minimum holdup fraction',
      result.minimumHoldupFraction,
    ],
    [
      'Maximum liquid flow by residence, m3/s',
      result.maximumLiquidFlowByResidence,
    ],
    [],
    [
      'Liquid flow multiplier',
      'Liquid flow, m3/s',
      'Superficial velocity, m/s',
      'Interstitial velocity, m/s',
      'Liquid mass flux, kg/m2 s',
      'Residence time, s',
      'Turnover rate, 1/h',
      'Residence margin, percent',
      'Status',
    ],
    ...result.scenarios.map(
      (
        scenario,
      ) => [
        scenario.liquidFlowMultiplier,
        scenario.liquidVolumetricFlowRate,
        scenario.superficialLiquidVelocity,
        scenario.interstitialLiquidVelocity,
        scenario.liquidMassFlux,
        scenario.residenceTime,
        scenario.turnoverRatePerHour,
        scenario.residenceMarginPercent,
        scenario.status,
      ],
    ),
  ]

  return rows
    .map(
      (
        row,
      ) =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
