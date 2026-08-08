import type {
  PackedColumnDistributorStatus,
  PackedColumnLiquidDistributorInput,
  PackedColumnLiquidDistributorResult,
  PackedColumnLiquidDistributorScenario,
} from './types.ts'

export const PACKED_COLUMN_LIQUID_DISTRIBUTOR_ENGINE_VERSION =
  'packed-column-liquid-distributor-irrigation-v1' as const

export type PackedColumnLiquidDistributorErrorCode =
  | 'nonFiniteInput'
  | 'invalidLiquidFlow'
  | 'invalidColumnDiameter'
  | 'invalidLiquidDensity'
  | 'invalidDistributorPointCount'
  | 'invalidMinimumIrrigationDensity'
  | 'invalidMinimumPointDensity'
  | 'numericalFailure'

const errorMessages: Record<
  PackedColumnLiquidDistributorErrorCode,
  string
> = {
  nonFiniteInput:
    'All packed-column liquid-distributor inputs must be finite numbers.',
  invalidLiquidFlow:
    'Liquid volumetric flow rate must be greater than zero.',
  invalidColumnDiameter:
    'Column diameter must be greater than zero.',
  invalidLiquidDensity:
    'Liquid density must be greater than zero.',
  invalidDistributorPointCount:
    'Distributor point count must be a positive integer.',
  invalidMinimumIrrigationDensity:
    'Minimum irrigation density must be greater than zero.',
  invalidMinimumPointDensity:
    'Minimum distributor point density must be greater than zero.',
  numericalFailure:
    'The liquid-distributor calculation did not produce finite physical results.',
}

export class PackedColumnLiquidDistributorError
  extends Error {
  readonly code:
    PackedColumnLiquidDistributorErrorCode

  constructor(
    code:
      PackedColumnLiquidDistributorErrorCode,
  ) {
    super(
      errorMessages[code],
    )

    this.name =
      'PackedColumnLiquidDistributorError'

    this.code =
      code
  }
}

function validateInput(
  input:
    PackedColumnLiquidDistributorInput,
) {
  const numericValues = [
    input.liquidVolumetricFlowRate,
    input.columnDiameter,
    input.liquidDensity,
    input.distributorPointCount,
    input.minimumIrrigationDensity,
    input.minimumPointDensity,
  ]

  if (
    !numericValues.every(
      Number.isFinite,
    )
  ) {
    throw new PackedColumnLiquidDistributorError(
      'nonFiniteInput',
    )
  }

  if (
    input.liquidVolumetricFlowRate <= 0
  ) {
    throw new PackedColumnLiquidDistributorError(
      'invalidLiquidFlow',
    )
  }

  if (
    input.columnDiameter <= 0
  ) {
    throw new PackedColumnLiquidDistributorError(
      'invalidColumnDiameter',
    )
  }

  if (
    input.liquidDensity <= 0
  ) {
    throw new PackedColumnLiquidDistributorError(
      'invalidLiquidDensity',
    )
  }

  if (
    input.distributorPointCount <= 0 ||
    !Number.isInteger(
      input.distributorPointCount,
    )
  ) {
    throw new PackedColumnLiquidDistributorError(
      'invalidDistributorPointCount',
    )
  }

  if (
    input.minimumIrrigationDensity <= 0
  ) {
    throw new PackedColumnLiquidDistributorError(
      'invalidMinimumIrrigationDensity',
    )
  }

  if (
    input.minimumPointDensity <= 0
  ) {
    throw new PackedColumnLiquidDistributorError(
      'invalidMinimumPointDensity',
    )
  }
}

function determineStatus({
  irrigationRatio,
  pointDensityRatio,
}: {
  irrigationRatio: number
  pointDensityRatio: number
}): PackedColumnDistributorStatus {
  if (
    irrigationRatio < 1 ||
    pointDensityRatio < 1
  ) {
    return 'inadequate'
  }

  if (
    irrigationRatio < 1.25 ||
    pointDensityRatio < 1.25
  ) {
    return 'marginal'
  }

  return 'stable'
}

export function calculatePackedColumnDistributorScenario({
  input,
  columnArea,
  distributorPointDensity,
  liquidFlowMultiplier,
}: {
  input:
    PackedColumnLiquidDistributorInput
  columnArea: number
  distributorPointDensity: number
  liquidFlowMultiplier: number
}): PackedColumnLiquidDistributorScenario {
  const liquidVolumetricFlowRate =
    input.liquidVolumetricFlowRate *
    liquidFlowMultiplier

  const superficialLiquidVelocity =
    liquidVolumetricFlowRate /
    columnArea

  const irrigationDensity =
    liquidVolumetricFlowRate *
    3600 /
    columnArea

  const liquidMassFlux =
    input.liquidDensity *
    superficialLiquidVelocity

  const flowPerDistributorPoint =
    liquidVolumetricFlowRate *
    3600 /
    input.distributorPointCount

  const irrigationRatio =
    irrigationDensity /
    input.minimumIrrigationDensity

  const pointDensityRatio =
    distributorPointDensity /
    input.minimumPointDensity

  const irrigationMarginPercent =
    (
      irrigationRatio -
      1
    ) *
    100

  const pointDensityMarginPercent =
    (
      pointDensityRatio -
      1
    ) *
    100

  const positiveValues = [
    liquidVolumetricFlowRate,
    superficialLiquidVelocity,
    irrigationDensity,
    liquidMassFlux,
    flowPerDistributorPoint,
    irrigationRatio,
    pointDensityRatio,
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
      irrigationMarginPercent,
    ) ||
    !Number.isFinite(
      pointDensityMarginPercent,
    )
  ) {
    throw new PackedColumnLiquidDistributorError(
      'numericalFailure',
    )
  }

  return {
    liquidFlowMultiplier,
    liquidVolumetricFlowRate,
    superficialLiquidVelocity,
    irrigationDensity,
    liquidMassFlux,
    flowPerDistributorPoint,
    irrigationRatio,
    pointDensityRatio,
    irrigationMarginPercent,
    pointDensityMarginPercent,
    status:
      determineStatus({
        irrigationRatio,
        pointDensityRatio,
      }),
  }
}

export function calculatePackedColumnLiquidDistributor(
  input:
    PackedColumnLiquidDistributorInput,
): PackedColumnLiquidDistributorResult {
  validateInput(
    input,
  )

  const columnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const distributorPointDensity =
    input.distributorPointCount /
    columnArea

  const areaPerDistributorPoint =
    columnArea /
    input.distributorPointCount

  const equivalentSquarePitch =
    Math.sqrt(
      areaPerDistributorPoint,
    )

  const minimumLiquidFlowByIrrigation =
    input.minimumIrrigationDensity *
    columnArea /
    3600

  const minimumDistributorPointCount =
    Math.ceil(
      input.minimumPointDensity *
      columnArea,
    )

  const positiveValues = [
    columnArea,
    distributorPointDensity,
    areaPerDistributorPoint,
    equivalentSquarePitch,
    minimumLiquidFlowByIrrigation,
    minimumDistributorPointCount,
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
    )
  ) {
    throw new PackedColumnLiquidDistributorError(
      'numericalFailure',
    )
  }

  const scenarioMultipliers = [
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2,
  ]

  const scenarios =
    scenarioMultipliers.map(
      (
        liquidFlowMultiplier,
      ) =>
        calculatePackedColumnDistributorScenario({
          input,
          columnArea,
          distributorPointDensity,
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

  if (!selectedScenario) {
    throw new PackedColumnLiquidDistributorError(
      'numericalFailure',
    )
  }

  return {
    modelName:
      'Packed Column Liquid Distributor Screening v1',
    limitationDescription:
      'This calculator treats liquid irrigation and distributor point density as screening criteria. Actual packed-column distributor design also depends on packing type, liquid properties, turndown, gas load, orifice hydraulics, distributor geometry, maldistribution sensitivity and vendor recommendations.',
    columnArea,
    distributorPointDensity,
    areaPerDistributorPoint,
    equivalentSquarePitch,
    minimumLiquidFlowByIrrigation,
    minimumDistributorPointCount,
    selectedScenario,
    scenarios,
  }
}

function csvCell(
  value:
    string | number,
) {
  const text =
    String(
      value,
    )

  return `"${text.replaceAll(
    '"',
    '""',
  )}"`
}

export function createPackedColumnLiquidDistributorCsv(
  input:
    PackedColumnLiquidDistributorInput,
  result:
    PackedColumnLiquidDistributorResult,
) {
  const rows: Array<
    Array<string | number>
  > = [
    [
      'Metric',
      'Value',
      'Unit',
    ],
    [
      'Model',
      result.modelName,
      '',
    ],
    [
      'Liquid volumetric flow rate',
      input.liquidVolumetricFlowRate,
      'm3/s',
    ],
    [
      'Column diameter',
      input.columnDiameter,
      'm',
    ],
    [
      'Column area',
      result.columnArea,
      'm2',
    ],
    [
      'Liquid density',
      input.liquidDensity,
      'kg/m3',
    ],
    [
      'Distributor point count',
      input.distributorPointCount,
      'points',
    ],
    [
      'Distributor point density',
      result.distributorPointDensity,
      'points/m2',
    ],
    [
      'Area per distributor point',
      result.areaPerDistributorPoint,
      'm2/point',
    ],
    [
      'Equivalent square pitch',
      result.equivalentSquarePitch,
      'm',
    ],
    [
      'Irrigation density',
      result.selectedScenario.irrigationDensity,
      'm3/(m2 h)',
    ],
    [
      'Superficial liquid velocity',
      result.selectedScenario.superficialLiquidVelocity,
      'm/s',
    ],
    [
      'Liquid mass flux',
      result.selectedScenario.liquidMassFlux,
      'kg/(m2 s)',
    ],
    [
      'Flow per distributor point',
      result.selectedScenario.flowPerDistributorPoint,
      'm3/h/point',
    ],
    [
      'Minimum irrigation density',
      input.minimumIrrigationDensity,
      'm3/(m2 h)',
    ],
    [
      'Minimum liquid flow by irrigation',
      result.minimumLiquidFlowByIrrigation,
      'm3/s',
    ],
    [
      'Minimum point density',
      input.minimumPointDensity,
      'points/m2',
    ],
    [
      'Minimum distributor point count',
      result.minimumDistributorPointCount,
      'points',
    ],
    [
      'Operating status',
      result.selectedScenario.status,
      '',
    ],
    [],
    [
      'Flow multiplier',
      'Liquid flow, m3/s',
      'Irrigation density, m3/(m2 h)',
      'Flow per point, m3/h/point',
      'Irrigation margin, %',
      'Point-density margin, %',
      'Status',
    ],
  ]

  for (
    const scenario
    of result.scenarios
  ) {
    rows.push([
      scenario.liquidFlowMultiplier,
      scenario.liquidVolumetricFlowRate,
      scenario.irrigationDensity,
      scenario.flowPerDistributorPoint,
      scenario.irrigationMarginPercent,
      scenario.pointDensityMarginPercent,
      scenario.status,
    ])
  }

  return rows
    .map(
      (
        row,
      ) =>
        row
          .map(
            csvCell,
          )
          .join(
            ',',
          ),
    )
    .join(
      '\n',
    )
}
