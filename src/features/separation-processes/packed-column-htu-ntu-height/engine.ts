import type {
  PackedColumnInput,
  PackedColumnResult,
  PackedColumnScenario,
} from './types.ts'

export const
  PACKED_COLUMN_HTU_NTU_ENGINE_VERSION =
    'packed-column-htu-ntu-v1' as const

export type PackedColumnErrorCode =
  | 'nonFiniteInput'
  | 'invalidInletFraction'
  | 'invalidOutletFraction'
  | 'invalidEquilibriumFraction'
  | 'invalidHtu'
  | 'invalidDesignMargin'
  | 'insufficientDrivingForce'
  | 'numericalFailure'

const errorMessages: Record<
  PackedColumnErrorCode,
  string
> = {
  nonFiniteInput:
    'All packed-column inputs must be finite numbers.',
  invalidInletFraction:
    'Inlet gas solute fraction must satisfy 0 < yin < 1.',
  invalidOutletFraction:
    'Outlet gas solute fraction must satisfy 0 < yout < yin.',
  invalidEquilibriumFraction:
    'Equilibrium gas fraction must satisfy 0 ≤ y* < yout.',
  invalidHtu:
    'Overall gas-phase HTU must be greater than zero.',
  invalidDesignMargin:
    'Design margin must satisfy 0 ≤ margin ≤ 100%.',
  insufficientDrivingForce:
    'The selected outlet target does not provide a positive mass-transfer driving force.',
  numericalFailure:
    'The packed-column calculation did not produce finite physical results.',
}

export class PackedColumnCalculationError
  extends Error {
  readonly code: PackedColumnErrorCode

  constructor(
    code: PackedColumnErrorCode,
  ) {
    super(
      errorMessages[code],
    )

    this.name =
      'PackedColumnCalculationError'

    this.code =
      code
  }
}

function validateInput(
  input: PackedColumnInput,
) {
  const values =
    Object.values(input)

  if (
    !values.every(
      Number.isFinite,
    )
  ) {
    throw new PackedColumnCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.inletGasSoluteFraction <= 0 ||
    input.inletGasSoluteFraction >= 1
  ) {
    throw new PackedColumnCalculationError(
      'invalidInletFraction',
    )
  }

  if (
    input.outletGasSoluteFraction <= 0 ||
    input.outletGasSoluteFraction >=
      input.inletGasSoluteFraction
  ) {
    throw new PackedColumnCalculationError(
      'invalidOutletFraction',
    )
  }

  if (
    input.equilibriumGasFraction < 0 ||
    input.equilibriumGasFraction >=
      input.outletGasSoluteFraction
  ) {
    throw new PackedColumnCalculationError(
      'invalidEquilibriumFraction',
    )
  }

  if (
    input.overallGasHtu <= 0
  ) {
    throw new PackedColumnCalculationError(
      'invalidHtu',
    )
  }

  if (
    input.designMarginFraction < 0 ||
    input.designMarginFraction > 1
  ) {
    throw new PackedColumnCalculationError(
      'invalidDesignMargin',
    )
  }
}

export function calculateLogarithmicMeanDrivingForce({
  inletDrivingForce,
  outletDrivingForce,
}: {
  inletDrivingForce: number
  outletDrivingForce: number
}): number {
  if (
    inletDrivingForce <= 0 ||
    outletDrivingForce <= 0 ||
    inletDrivingForce <=
      outletDrivingForce
  ) {
    throw new PackedColumnCalculationError(
      'insufficientDrivingForce',
    )
  }

  const ratio =
    inletDrivingForce /
    outletDrivingForce

  const logarithmicMean =
    (
      inletDrivingForce -
      outletDrivingForce
    ) /
    Math.log(ratio)

  if (
    !Number.isFinite(
      logarithmicMean,
    ) ||
    logarithmicMean <= 0
  ) {
    throw new PackedColumnCalculationError(
      'numericalFailure',
    )
  }

  return logarithmicMean
}

export function calculatePackedColumnScenario({
  input,
  outletGasSoluteFraction,
}: {
  input: PackedColumnInput
  outletGasSoluteFraction: number
}): PackedColumnScenario {
  const inletDrivingForce =
    input.inletGasSoluteFraction -
    input.equilibriumGasFraction

  const outletDrivingForce =
    outletGasSoluteFraction -
    input.equilibriumGasFraction

  if (
    outletDrivingForce <= 0 ||
    inletDrivingForce <=
      outletDrivingForce
  ) {
    throw new PackedColumnCalculationError(
      'insufficientDrivingForce',
    )
  }

  const logarithmicMeanDrivingForce =
    calculateLogarithmicMeanDrivingForce({
      inletDrivingForce,
      outletDrivingForce,
    })

  const overallGasNtu =
    Math.log(
      inletDrivingForce /
      outletDrivingForce,
    )

  const theoreticalPackingHeight =
    input.overallGasHtu *
    overallGasNtu

  const designPackingHeight =
    theoreticalPackingHeight *
    (
      1 +
      input.designMarginFraction
    )

  const removalPercent =
    (
      input.inletGasSoluteFraction -
      outletGasSoluteFraction
    ) /
    input.inletGasSoluteFraction *
    100

  const equilibriumApproachPercent =
    outletDrivingForce /
    inletDrivingForce *
    100

  const values = [
    inletDrivingForce,
    outletDrivingForce,
    logarithmicMeanDrivingForce,
    overallGasNtu,
    theoreticalPackingHeight,
    designPackingHeight,
    removalPercent,
    equilibriumApproachPercent,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    overallGasNtu <= 0 ||
    theoreticalPackingHeight <= 0 ||
    designPackingHeight <= 0 ||
    removalPercent <= 0 ||
    equilibriumApproachPercent <= 0
  ) {
    throw new PackedColumnCalculationError(
      'numericalFailure',
    )
  }

  return {
    outletGasSoluteFraction,
    removalPercent,
    inletDrivingForce,
    outletDrivingForce,
    logarithmicMeanDrivingForce,
    overallGasNtu,
    theoreticalPackingHeight,
    designPackingHeight,
    equilibriumApproachPercent,
  }
}

function createOutletTargets(
  input: PackedColumnInput,
): number[] {
  const selectedDrivingForce =
    input.outletGasSoluteFraction -
    input.equilibriumGasFraction

  const candidates = [
    input.equilibriumGasFraction +
      selectedDrivingForce *
      0.5,
    input.outletGasSoluteFraction,
    input.equilibriumGasFraction +
      selectedDrivingForce *
      1.5,
    input.equilibriumGasFraction +
      selectedDrivingForce *
      2,
  ]

  return candidates
    .filter(
      (
        value,
      ) =>
        value >
          input.equilibriumGasFraction &&
        value <
          input.inletGasSoluteFraction,
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
}

export function calculatePackedColumnHtuNtu(
  input: PackedColumnInput,
): PackedColumnResult {
  validateInput(input)

  const scenarios =
    createOutletTargets(input)
      .map(
        (
          outletGasSoluteFraction,
        ) =>
          calculatePackedColumnScenario({
            input,
            outletGasSoluteFraction,
          }),
      )

  const selectedScenario =
    scenarios.find(
      (
        scenario,
      ) =>
        Math.abs(
          scenario.outletGasSoluteFraction -
          input.outletGasSoluteFraction
        ) <
        1e-12,
    )

  if (
    !selectedScenario
  ) {
    throw new PackedColumnCalculationError(
      'numericalFailure',
    )
  }

  return {
    selectedScenario,
    scenarios,
    equilibriumLimit:
      input.equilibriumGasFraction,
    modelName:
      'Overall gas-phase HTU–NTU packed-column height model',
    limitationDescription:
      'This shortcut assumes a constant overall gas-phase HTU and a constant equilibrium gas composition over the packed section. Final design should account for changing gas and liquid flow rates, nonlinear equilibrium, temperature effects, pressure drop, wetting, packing characteristics, mass-transfer coefficients, maldistribution and flooding limits.',
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

export function createPackedColumnHtuNtuCsv(
  input: PackedColumnInput,
  result: PackedColumnResult,
): string {
  const rows: (
    string |
    number
  )[][] = [
    [
      'Packed Column HTU–NTU Height',
      '',
    ],
    [],
    [
      'Input',
      'Value',
    ],
    [
      'Inlet gas solute fraction',
      input.inletGasSoluteFraction,
    ],
    [
      'Outlet gas solute fraction',
      input.outletGasSoluteFraction,
    ],
    [
      'Equilibrium gas fraction',
      input.equilibriumGasFraction,
    ],
    [
      'Overall gas-phase HTU, m',
      input.overallGasHtu,
    ],
    [
      'Design margin fraction',
      input.designMarginFraction,
    ],
    [],
    [
      'Selected result',
      'Value',
    ],
    [
      'Removal, percent',
      result.selectedScenario.removalPercent,
    ],
    [
      'Inlet driving force',
      result.selectedScenario.inletDrivingForce,
    ],
    [
      'Outlet driving force',
      result.selectedScenario.outletDrivingForce,
    ],
    [
      'Logarithmic mean driving force',
      result
        .selectedScenario
        .logarithmicMeanDrivingForce,
    ],
    [
      'Overall gas-phase NTU',
      result.selectedScenario.overallGasNtu,
    ],
    [
      'Theoretical packing height, m',
      result
        .selectedScenario
        .theoreticalPackingHeight,
    ],
    [
      'Design packing height, m',
      result
        .selectedScenario
        .designPackingHeight,
    ],
    [
      'Equilibrium approach, percent',
      result
        .selectedScenario
        .equilibriumApproachPercent,
    ],
    [],
    [
      'Outlet gas fraction',
      'Removal, percent',
      'Outlet driving force',
      'Log mean driving force',
      'NOG',
      'Theoretical height, m',
      'Design height, m',
      'Equilibrium approach, percent',
    ],
    ...result.scenarios.map(
      (
        scenario,
      ) => [
        scenario.outletGasSoluteFraction,
        scenario.removalPercent,
        scenario.outletDrivingForce,
        scenario.logarithmicMeanDrivingForce,
        scenario.overallGasNtu,
        scenario.theoreticalPackingHeight,
        scenario.designPackingHeight,
        scenario.equilibriumApproachPercent,
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
