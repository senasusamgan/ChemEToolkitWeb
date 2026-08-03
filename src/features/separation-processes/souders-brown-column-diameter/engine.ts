import type {
  SoudersBrownColumnInput,
  SoudersBrownColumnResult,
  SoudersBrownScenario,
} from './types.ts'

export const
  SOUDERS_BROWN_COLUMN_DIAMETER_ENGINE_VERSION =
    'souders-brown-column-diameter-v1' as const

export type SoudersBrownErrorCode =
  | 'nonFiniteInput'
  | 'invalidFlowRate'
  | 'invalidDensity'
  | 'invalidDensityOrder'
  | 'invalidCapacityFactor'
  | 'invalidFloodFraction'
  | 'invalidDowncomerFraction'
  | 'invalidDiameterIncrement'
  | 'numericalFailure'

const messages: Record<
  SoudersBrownErrorCode,
  string
> = {
  nonFiniteInput:
    'All column-diameter inputs must be finite numbers.',
  invalidFlowRate:
    'Vapor volumetric flow rate must be greater than zero.',
  invalidDensity:
    'Vapor and liquid densities must be greater than zero.',
  invalidDensityOrder:
    'Liquid density must be greater than vapor density.',
  invalidCapacityFactor:
    'The Souders–Brown capacity factor must be greater than zero.',
  invalidFloodFraction:
    'Design flood fraction must satisfy 0 < fraction < 1.',
  invalidDowncomerFraction:
    'Downcomer area fraction must satisfy 0 ≤ fraction < 0.5.',
  invalidDiameterIncrement:
    'Diameter rounding increment must be greater than zero.',
  numericalFailure:
    'The column-diameter calculation did not produce finite physical results.',
}

export class SoudersBrownCalculationError
  extends Error {
  readonly code:
    SoudersBrownErrorCode

  constructor(
    code:
      SoudersBrownErrorCode,
  ) {
    super(
      messages[
        code
      ],
    )

    this.name =
      'SoudersBrownCalculationError'

    this.code =
      code
  }
}

function validateInput(
  input:
    SoudersBrownColumnInput,
) {
  const values = [
    input.vaporVolumetricFlowRate,
    input.vaporDensity,
    input.liquidDensity,
    input.capacityFactor,
    input.designFloodFraction,
    input.downcomerAreaFraction,
    input.diameterIncrement,
  ]

  if (
    !values.every(
      Number.isFinite,
    )
  ) {
    throw new SoudersBrownCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.vaporVolumetricFlowRate <=
    0
  ) {
    throw new SoudersBrownCalculationError(
      'invalidFlowRate',
    )
  }

  if (
    input.vaporDensity <=
      0 ||
    input.liquidDensity <=
      0
  ) {
    throw new SoudersBrownCalculationError(
      'invalidDensity',
    )
  }

  if (
    input.liquidDensity <=
    input.vaporDensity
  ) {
    throw new SoudersBrownCalculationError(
      'invalidDensityOrder',
    )
  }

  if (
    input.capacityFactor <=
    0
  ) {
    throw new SoudersBrownCalculationError(
      'invalidCapacityFactor',
    )
  }

  if (
    input.designFloodFraction <=
      0 ||
    input.designFloodFraction >=
      1
  ) {
    throw new SoudersBrownCalculationError(
      'invalidFloodFraction',
    )
  }

  if (
    input.downcomerAreaFraction <
      0 ||
    input.downcomerAreaFraction >=
      0.5
  ) {
    throw new SoudersBrownCalculationError(
      'invalidDowncomerFraction',
    )
  }

  if (
    input.diameterIncrement <=
    0
  ) {
    throw new SoudersBrownCalculationError(
      'invalidDiameterIncrement',
    )
  }
}

export function calculateSoudersBrownFloodingVelocity({
  vaporDensity,
  liquidDensity,
  capacityFactor,
}: Pick<
  SoudersBrownColumnInput,
  | 'vaporDensity'
  | 'liquidDensity'
  | 'capacityFactor'
>): number {
  return (
    capacityFactor *
    Math.sqrt(
      (
        liquidDensity -
        vaporDensity
      ) /
      vaporDensity,
    )
  )
}

function roundDiameterUp(
  diameter: number,
  increment: number,
): number {
  return (
    Math.ceil(
      (
        diameter -
        1e-12
      ) /
      increment,
    ) *
    increment
  )
}

export function calculateSoudersBrownScenario({
  input,
  floodingVelocity,
  designFloodFraction,
}: {
  input:
    SoudersBrownColumnInput
  floodingVelocity: number
  designFloodFraction: number
}): SoudersBrownScenario {
  const designVelocity =
    floodingVelocity *
    designFloodFraction

  const requiredNetArea =
    input.vaporVolumetricFlowRate /
    designVelocity

  const requiredGrossArea =
    requiredNetArea /
    (
      1 -
      input.downcomerAreaFraction
    )

  const rawColumnDiameter =
    Math.sqrt(
      4 *
      requiredGrossArea /
      Math.PI,
    )

  const roundedColumnDiameter =
    roundDiameterUp(
      rawColumnDiameter,
      input.diameterIncrement,
    )

  const roundedGrossArea =
    Math.PI *
    roundedColumnDiameter **
      2 /
    4

  const roundedNetArea =
    roundedGrossArea *
    (
      1 -
      input.downcomerAreaFraction
    )

  const actualVaporVelocity =
    input.vaporVolumetricFlowRate /
    roundedNetArea

  const actualFloodFraction =
    actualVaporVelocity /
    floodingVelocity

  const capacityMarginPercent =
    (
      1 -
      actualFloodFraction
    ) *
    100

  const vaporFfactor =
    actualVaporVelocity *
    Math.sqrt(
      input.vaporDensity,
    )

  const values = [
    designVelocity,
    requiredNetArea,
    requiredGrossArea,
    rawColumnDiameter,
    roundedColumnDiameter,
    roundedGrossArea,
    roundedNetArea,
    actualVaporVelocity,
    actualFloodFraction,
    capacityMarginPercent,
    vaporFfactor,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    designVelocity <=
      0 ||
    requiredNetArea <=
      0 ||
    requiredGrossArea <=
      0 ||
    rawColumnDiameter <=
      0 ||
    roundedColumnDiameter <
      rawColumnDiameter ||
    roundedNetArea <=
      0 ||
    actualVaporVelocity <=
      0 ||
    actualFloodFraction <=
      0 ||
    actualFloodFraction >=
      1
  ) {
    throw new SoudersBrownCalculationError(
      'numericalFailure',
    )
  }

  return {
    designFloodFraction,
    floodingVelocity,
    designVelocity,
    requiredNetArea,
    requiredGrossArea,
    rawColumnDiameter,
    roundedColumnDiameter,
    roundedGrossArea,
    roundedNetArea,
    actualVaporVelocity,
    actualFloodFraction,
    capacityMarginPercent,
    vaporFfactor,
  }
}

export function calculateSoudersBrownColumnDiameter(
  input:
    SoudersBrownColumnInput,
): SoudersBrownColumnResult {
  validateInput(
    input,
  )

  const densityDifference =
    input.liquidDensity -
    input.vaporDensity

  const densityRatioTerm =
    densityDifference /
    input.vaporDensity

  const floodingVelocity =
    calculateSoudersBrownFloodingVelocity(
      input,
    )

  const scenarioFractions = [
    0.7,
    input.designFloodFraction,
    0.85,
    0.9,
  ]
    .filter(
      (
        value,
      ) =>
        value >
          0 &&
        value <
          1,
    )
    .filter(
      (
        value,
        index,
        values,
      ) =>
        values.findIndex(
          (
            candidate,
          ) =>
            Math.abs(
              candidate -
              value
            ) <
            1e-12,
        ) ===
        index,
    )
    .sort(
      (
        first,
        second,
      ) =>
        first -
        second,
    )

  const scenarios =
    scenarioFractions.map(
      (
        designFloodFraction,
      ) =>
        calculateSoudersBrownScenario({
          input,
          floodingVelocity,
          designFloodFraction,
        }),
    )

  const selectedScenario =
    scenarios.find(
      (
        scenario,
      ) =>
        Math.abs(
          scenario.designFloodFraction -
          input.designFloodFraction
        ) <
        1e-12,
    )

  const vaporMassFlowRate =
    input.vaporVolumetricFlowRate *
    input.vaporDensity

  if (
    !selectedScenario ||
    !Number.isFinite(
      floodingVelocity,
    ) ||
    floodingVelocity <=
      0 ||
    !Number.isFinite(
      vaporMassFlowRate,
    ) ||
    vaporMassFlowRate <=
      0
  ) {
    throw new SoudersBrownCalculationError(
      'numericalFailure',
    )
  }

  return {
    floodingVelocity,
    vaporMassFlowRate,
    densityDifference,
    densityRatioTerm,
    selectedScenario,
    scenarios,
    modelName:
      'Souders–Brown vapor-capacity column sizing',
    limitationDescription:
      'This shortcut estimates the diameter from vapor capacity only. The selected capacity factor must already represent tray type, tray spacing, surface tension, foaming tendency and service-specific corrections. Final design still requires tray or packing hydraulics, pressure-drop, entrainment, weeping and mechanical checks.',
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

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createSoudersBrownColumnCsv(
  input:
    SoudersBrownColumnInput,
  result:
    SoudersBrownColumnResult,
): string {
  const rows:
    (
      string |
      number
    )[][] = [
      [
        'Souders–Brown Distillation Column Diameter',
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
        'Vapor density, kg/m3',
        input.vaporDensity,
      ],
      [
        'Liquid density, kg/m3',
        input.liquidDensity,
      ],
      [
        'Capacity factor K, m/s',
        input.capacityFactor,
      ],
      [
        'Selected design flood fraction',
        input.designFloodFraction,
      ],
      [
        'Downcomer area fraction',
        input.downcomerAreaFraction,
      ],
      [
        'Diameter increment, m',
        input.diameterIncrement,
      ],
      [],
      [
        'Primary result',
        'Value',
      ],
      [
        'Flooding velocity, m/s',
        result.floodingVelocity,
      ],
      [
        'Vapor mass flow rate, kg/s',
        result.vaporMassFlowRate,
      ],
      [
        'Selected design velocity, m/s',
        result
          .selectedScenario
          .designVelocity,
      ],
      [
        'Required net area, m2',
        result
          .selectedScenario
          .requiredNetArea,
      ],
      [
        'Required gross area, m2',
        result
          .selectedScenario
          .requiredGrossArea,
      ],
      [
        'Raw column diameter, m',
        result
          .selectedScenario
          .rawColumnDiameter,
      ],
      [
        'Rounded column diameter, m',
        result
          .selectedScenario
          .roundedColumnDiameter,
      ],
      [
        'Actual operating flood fraction',
        result
          .selectedScenario
          .actualFloodFraction,
      ],
      [
        'Capacity margin, percent',
        result
          .selectedScenario
          .capacityMarginPercent,
      ],
      [
        'Vapor F-factor',
        result
          .selectedScenario
          .vaporFfactor,
      ],
      [],
      [
        'Design flood fraction',
        'Design velocity, m/s',
        'Net area, m2',
        'Gross area, m2',
        'Raw diameter, m',
        'Rounded diameter, m',
        'Actual vapor velocity, m/s',
        'Actual flood fraction',
        'Capacity margin, percent',
      ],
      ...result.scenarios.map(
        (
          scenario,
        ) => [
          scenario.designFloodFraction,
          scenario.designVelocity,
          scenario.requiredNetArea,
          scenario.requiredGrossArea,
          scenario.rawColumnDiameter,
          scenario.roundedColumnDiameter,
          scenario.actualVaporVelocity,
          scenario.actualFloodFraction,
          scenario.capacityMarginPercent,
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
