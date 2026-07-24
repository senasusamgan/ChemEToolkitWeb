import type {
  SingleStageLeachingBalanceInput,
  SingleStageLeachingBalanceResult,
} from './types.ts'

export type SingleStageLeachingBalanceErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'fractionOutOfRange'
  | 'noOverflowExtract'
  | 'numericalFailure'

const messages: Record<
  SingleStageLeachingBalanceErrorCode,
  string
> = {
  nonFiniteInput:
    'All single-stage leaching inputs must be finite.',
  nonPositiveProperty:
    'Dry inert solids, initial solution mass, fresh solvent mass and retained-solution ratio must be greater than zero.',
  fractionOutOfRange:
    'Initial solution solute fraction must satisfy 0 < w < 1.',
  noOverflowExtract:
    'Total mixed solution must exceed the solution retained with the solids.',
  numericalFailure:
    'The single-stage leaching balance did not produce finite physical results.',
}

export class SingleStageLeachingBalanceCalculationError extends Error {
  readonly code: SingleStageLeachingBalanceErrorCode

  constructor(code: SingleStageLeachingBalanceErrorCode) {
    super(messages[code])
    this.name =
      'SingleStageLeachingBalanceCalculationError'
    this.code = code
  }
}

export function calculateSingleStageLeachingBalance(
  input: SingleStageLeachingBalanceInput,
): SingleStageLeachingBalanceResult {
  const values = [
    input.dryInertSolidMass,
    input.initialSolutionMass,
    input.initialSolutionSoluteFraction,
    input.freshSolventMass,
    input.retainedSolutionPerDrySolid,
  ]

  if (!values.every(Number.isFinite)) {
    throw new SingleStageLeachingBalanceCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.dryInertSolidMass <= 0 ||
    input.initialSolutionMass <= 0 ||
    input.freshSolventMass <= 0 ||
    input.retainedSolutionPerDrySolid <= 0
  ) {
    throw new SingleStageLeachingBalanceCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.initialSolutionSoluteFraction <= 0 ||
    input.initialSolutionSoluteFraction >= 1
  ) {
    throw new SingleStageLeachingBalanceCalculationError(
      'fractionOutOfRange',
    )
  }

  const initialSoluteMass =
    input.initialSolutionMass *
    input.initialSolutionSoluteFraction

  const totalMixedSolutionMass =
    input.initialSolutionMass +
    input.freshSolventMass

  const mixedSolutionSoluteFraction =
    initialSoluteMass /
    totalMixedSolutionMass

  const retainedUnderflowSolutionMass =
    input.dryInertSolidMass *
    input.retainedSolutionPerDrySolid

  if (
    retainedUnderflowSolutionMass >=
    totalMixedSolutionMass
  ) {
    throw new SingleStageLeachingBalanceCalculationError(
      'noOverflowExtract',
    )
  }

  const overflowExtractSolutionMass =
    totalMixedSolutionMass -
    retainedUnderflowSolutionMass

  const soluteInUnderflow =
    retainedUnderflowSolutionMass *
    mixedSolutionSoluteFraction

  const soluteInExtract =
    overflowExtractSolutionMass *
    mixedSolutionSoluteFraction

  const solventInUnderflow =
    retainedUnderflowSolutionMass -
    soluteInUnderflow

  const solventInExtract =
    overflowExtractSolutionMass -
    soluteInExtract

  const soluteBalanceResidual =
    initialSoluteMass -
    soluteInUnderflow -
    soluteInExtract

  const results = [
    totalMixedSolutionMass,
    mixedSolutionSoluteFraction,
    retainedUnderflowSolutionMass,
    overflowExtractSolutionMass,
    soluteInUnderflow,
    soluteInExtract,
    solventInUnderflow,
    solventInExtract,
    soluteBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    totalMixedSolutionMass <= 0 ||
    mixedSolutionSoluteFraction <= 0 ||
    mixedSolutionSoluteFraction >= 1 ||
    retainedUnderflowSolutionMass <= 0 ||
    overflowExtractSolutionMass <= 0 ||
    soluteInUnderflow <= 0 ||
    soluteInExtract <= 0 ||
    solventInUnderflow <= 0 ||
    solventInExtract <= 0
  ) {
    throw new SingleStageLeachingBalanceCalculationError(
      'numericalFailure',
    )
  }

  return {
    totalMixedSolutionMass,
    mixedSolutionSoluteFraction,
    retainedUnderflowSolutionMass,
    overflowExtractSolutionMass,
    soluteInUnderflow,
    soluteInExtract,
    solventInUnderflow,
    solventInExtract,
    soluteBalanceResidual,
    modelName:
      'Single ideal leaching stage with uniform retained-solution composition',
    limitationDescription:
      'Assumes complete mixing, solute-free fresh solvent, no undissolved soluble solid and the same solution composition in underflow retention and overflow extract.',
  }
}
