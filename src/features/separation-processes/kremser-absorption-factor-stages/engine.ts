import type {
  KremserAbsorptionInput,
  KremserAbsorptionRegime,
  KremserAbsorptionResult,
} from './types.ts'

export const KREMSER_ABSORPTION_ENGINE_VERSION =
  'kremser-absorption-factor-stages-v1'

export type KremserAbsorptionErrorCode =
  | 'INVALID_INLET_COMPOSITION'
  | 'INVALID_OUTLET_COMPOSITION'
  | 'INVALID_COMPOSITION_WINDOW'
  | 'INVALID_ABSORPTION_FACTOR'
  | 'TARGET_NOT_ACHIEVABLE'

export class KremserAbsorptionError
  extends Error {
  readonly code:
    KremserAbsorptionErrorCode

  constructor(
    code: KremserAbsorptionErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'KremserAbsorptionError'

    this.code =
      code
  }
}

const UNITY_TOLERANCE =
  1e-10

function requireFraction(
  value: number,
  code: KremserAbsorptionErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    value >= 1
  ) {
    throw new KremserAbsorptionError(
      code,
      `${label} must be between 0 and 1.`,
    )
  }
}

function determineRegime(
  absorptionFactor: number,
): KremserAbsorptionRegime {
  if (
    absorptionFactor >
    1 + UNITY_TOLERANCE
  ) {
    return 'favorable'
  }

  if (
    absorptionFactor <
    1 - UNITY_TOLERANCE
  ) {
    return 'limited'
  }

  return 'unity'
}

function predictOutletFraction(
  inletFraction: number,
  absorptionFactor: number,
  stages: number,
): number {
  if (
    Math.abs(
      absorptionFactor - 1,
    ) <= UNITY_TOLERANCE
  ) {
    return (
      inletFraction /
      (stages + 1)
    )
  }

  return (
    inletFraction *
    (absorptionFactor - 1) /
    (
      absorptionFactor **
        (stages + 1) -
      1
    )
  )
}

export function calculateKremserAbsorption(
  input: KremserAbsorptionInput,
): KremserAbsorptionResult {
  requireFraction(
    input.inletGasSoluteMoleFraction,
    'INVALID_INLET_COMPOSITION',
    'Inlet gas solute mole fraction',
  )

  requireFraction(
    input.targetOutletGasSoluteMoleFraction,
    'INVALID_OUTLET_COMPOSITION',
    'Target outlet gas solute mole fraction',
  )

  if (
    input.targetOutletGasSoluteMoleFraction >=
    input.inletGasSoluteMoleFraction
  ) {
    throw new KremserAbsorptionError(
      'INVALID_COMPOSITION_WINDOW',
      'Target outlet composition must be lower than inlet composition.',
    )
  }

  if (
    !Number.isFinite(
      input.absorptionFactor,
    ) ||
    input.absorptionFactor <= 0
  ) {
    throw new KremserAbsorptionError(
      'INVALID_ABSORPTION_FACTOR',
      'Absorption factor must be a positive finite number.',
    )
  }

  const inlet =
    input.inletGasSoluteMoleFraction

  const target =
    input.targetOutletGasSoluteMoleFraction

  const factor =
    input.absorptionFactor

  if (
    factor <
    1 - UNITY_TOLERANCE
  ) {
    const asymptoticMinimumOutlet =
      inlet *
      (1 - factor)

    if (
      target <=
      asymptoticMinimumOutlet +
        1e-14
    ) {
      throw new KremserAbsorptionError(
        'TARGET_NOT_ACHIEVABLE',
        'The requested outlet composition is below the Kremser asymptotic limit for the selected absorption factor.',
      )
    }
  }

  const inletToTargetRatio =
    inlet / target

  let exactIdealStageRequirement:
    number

  if (
    Math.abs(
      factor - 1,
    ) <= UNITY_TOLERANCE
  ) {
    exactIdealStageRequirement =
      inletToTargetRatio - 1
  } else {
    exactIdealStageRequirement =
      (
        Math.log(
          1 +
          (factor - 1) *
          inletToTargetRatio,
        ) /
        Math.log(factor)
      ) - 1
  }

  if (
    !Number.isFinite(
      exactIdealStageRequirement,
    ) ||
    exactIdealStageRequirement < 0
  ) {
    throw new KremserAbsorptionError(
      'TARGET_NOT_ACHIEVABLE',
      'The selected absorption factor cannot produce a finite positive stage requirement for this target.',
    )
  }

  const requiredIdealStages =
    Math.max(
      1,
      Math.ceil(
        exactIdealStageRequirement -
        1e-12,
      ),
    )

  const predictedOutletMoleFraction =
    predictOutletFraction(
      inlet,
      factor,
      requiredIdealStages,
    )

  const targetRemovalPercent =
    (
      1 -
      target / inlet
    ) * 100

  const predictedRemovalPercent =
    (
      1 -
      predictedOutletMoleFraction /
      inlet
    ) * 100

  return {
    modelName:
      'Kremser Absorption Factor & Ideal Stages',
    limitationDescription:
      'This calculator applies the classical Kremser absorption relation for dilute systems with constant molar gas and liquid flow, linear equilibrium behavior, ideal equilibrium stages and solute-free entering solvent. Real absorbers require equilibrium data, hydraulic checks, efficiency corrections and appropriate flow-basis treatment.',
    absorptionFactor:
      factor,
    operatingRegime:
      determineRegime(factor),
    inletToTargetRatio,
    targetRemovalPercent,
    exactIdealStageRequirement,
    requiredIdealStages,
    predictedOutletMoleFraction,
    predictedRemovalPercent,
    stageRoundingMargin:
      requiredIdealStages -
      exactIdealStageRequirement,
  }
}

export function createKremserAbsorptionCsv(
  input: KremserAbsorptionInput,
  result: KremserAbsorptionResult,
): string {
  const rows = [
    [
      'Kremser Absorption Factor & Ideal Stages',
    ],
    [],
    [
      'Input',
      'Value',
    ],
    [
      'Inlet gas solute mole fraction',
      input.inletGasSoluteMoleFraction,
    ],
    [
      'Target outlet gas solute mole fraction',
      input.targetOutletGasSoluteMoleFraction,
    ],
    [
      'Absorption factor',
      input.absorptionFactor,
    ],
    [],
    [
      'Result',
      'Value',
    ],
    [
      'Operating regime',
      result.operatingRegime,
    ],
    [
      'Target removal percent',
      result.targetRemovalPercent,
    ],
    [
      'Exact ideal stage requirement',
      result.exactIdealStageRequirement,
    ],
    [
      'Required ideal stages',
      result.requiredIdealStages,
    ],
    [
      'Predicted outlet mole fraction',
      result.predictedOutletMoleFraction,
    ],
    [
      'Predicted removal percent',
      result.predictedRemovalPercent,
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
