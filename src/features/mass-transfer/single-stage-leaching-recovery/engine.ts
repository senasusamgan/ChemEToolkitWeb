import type {
  SingleStageLeachingRecoveryInput,
  SingleStageLeachingRecoveryResult,
} from './types.ts'

export type SingleStageLeachingRecoveryErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeSoluteFlow'
  | 'noOverflowSolution'
  | 'numericalFailure'

const messages: Record<
  SingleStageLeachingRecoveryErrorCode,
  string
> = {
  nonFiniteInput: 'All leaching inputs must be finite.',
  nonPositiveProperty:
    'Insoluble-solid flow, pure-solvent flow and retained-solvent ratio must be greater than zero.',
  negativeSoluteFlow:
    'Soluble-solute flow cannot be negative.',
  noOverflowSolution:
    'Pure-solvent flow must exceed the solvent retained with the insoluble underflow.',
  numericalFailure:
    'The single-stage leaching calculation did not produce a physical result.',
}

export class SingleStageLeachingRecoveryCalculationError extends Error {
  readonly code: SingleStageLeachingRecoveryErrorCode

  constructor(code: SingleStageLeachingRecoveryErrorCode) {
    super(messages[code])
    this.name = 'SingleStageLeachingRecoveryCalculationError'
    this.code = code
  }
}

export function calculateSingleStageLeachingRecovery(
  input: SingleStageLeachingRecoveryInput,
): SingleStageLeachingRecoveryResult {
  const values = [
    input.insolubleSolidFlowRate,
    input.solubleSoluteFlowRate,
    input.pureSolventFlowRate,
    input.retainedSolventPerInsolubleSolid,
  ]

  if (!values.every(Number.isFinite)) {
    throw new SingleStageLeachingRecoveryCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.insolubleSolidFlowRate <= 0 ||
    input.pureSolventFlowRate <= 0 ||
    input.retainedSolventPerInsolubleSolid <= 0
  ) {
    throw new SingleStageLeachingRecoveryCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.solubleSoluteFlowRate < 0) {
    throw new SingleStageLeachingRecoveryCalculationError(
      'negativeSoluteFlow',
    )
  }

  const retainedSolventFlowRate =
    input.insolubleSolidFlowRate *
    input.retainedSolventPerInsolubleSolid

  if (input.pureSolventFlowRate <= retainedSolventFlowRate) {
    throw new SingleStageLeachingRecoveryCalculationError(
      'noOverflowSolution',
    )
  }

  const overflowSolventFlowRate =
    input.pureSolventFlowRate - retainedSolventFlowRate

  const equilibriumSoluteRatio =
    input.solubleSoluteFlowRate / input.pureSolventFlowRate

  const soluteRecoveredInOverflow =
    overflowSolventFlowRate * equilibriumSoluteRatio

  const soluteRetainedWithUnderflow =
    retainedSolventFlowRate * equilibriumSoluteRatio

  const soluteRecoveryFraction =
    input.solubleSoluteFlowRate > 0
      ? soluteRecoveredInOverflow / input.solubleSoluteFlowRate
      : 0

  const overflowSolutionMassFlowRate =
    overflowSolventFlowRate + soluteRecoveredInOverflow

  const underflowTotalMassFlowRate =
    input.insolubleSolidFlowRate +
    retainedSolventFlowRate +
    soluteRetainedWithUnderflow

  const soluteBalanceResidual =
    input.solubleSoluteFlowRate -
    soluteRecoveredInOverflow -
    soluteRetainedWithUnderflow

  const results = [
    retainedSolventFlowRate,
    overflowSolventFlowRate,
    equilibriumSoluteRatio,
    soluteRecoveredInOverflow,
    soluteRetainedWithUnderflow,
    soluteRecoveryFraction,
    overflowSolutionMassFlowRate,
    underflowTotalMassFlowRate,
    soluteBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    retainedSolventFlowRate <= 0 ||
    overflowSolventFlowRate <= 0 ||
    equilibriumSoluteRatio < 0 ||
    soluteRecoveredInOverflow < 0 ||
    soluteRetainedWithUnderflow < 0 ||
    soluteRecoveryFraction < 0 ||
    soluteRecoveryFraction > 1
  ) {
    throw new SingleStageLeachingRecoveryCalculationError(
      'numericalFailure',
    )
  }

  return {
    equilibriumSoluteRatio,
    retainedSolventFlowRate,
    overflowSolventFlowRate,
    soluteRecoveredInOverflow,
    soluteRetainedWithUnderflow,
    soluteRecoveryFraction,
    overflowSolutionMassFlowRate,
    underflowTotalMassFlowRate,
    soluteBalanceResidual,
    modelName:
      'Ideal single-stage leaching on a solute-free-solvent ratio basis',
    limitationDescription:
      'All soluble material is assumed to dissolve completely. Overflow and retained underflow solution leave at the same equilibrium solute ratio.',
  }
}
