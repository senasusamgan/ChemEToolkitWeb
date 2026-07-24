import type {
  ExtractionDistributionSelectivityInput,
  ExtractionDistributionSelectivityResult,
} from './types.ts'

export type ExtractionDistributionSelectivityErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveConcentration'
  | 'numericalFailure'

const messages: Record<
  ExtractionDistributionSelectivityErrorCode,
  string
> = {
  nonFiniteInput:
    'All distribution and selectivity inputs must be finite.',
  nonPositiveConcentration:
    'All equilibrium concentrations must be greater than zero.',
  numericalFailure:
    'The distribution-selectivity calculation did not produce finite physical results.',
}

export class ExtractionDistributionSelectivityCalculationError extends Error {
  readonly code:
    ExtractionDistributionSelectivityErrorCode

  constructor(
    code: ExtractionDistributionSelectivityErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ExtractionDistributionSelectivityCalculationError'
    this.code = code
  }
}

export function calculateExtractionDistributionSelectivity(
  input: ExtractionDistributionSelectivityInput,
): ExtractionDistributionSelectivityResult {
  const values = [
    input.raffinateSoluteAConcentration,
    input.extractSoluteAConcentration,
    input.raffinateSoluteBConcentration,
    input.extractSoluteBConcentration,
  ]

  if (!values.every(Number.isFinite)) {
    throw new ExtractionDistributionSelectivityCalculationError(
      'nonFiniteInput',
    )
  }

  if (values.some((value) => value <= 0)) {
    throw new ExtractionDistributionSelectivityCalculationError(
      'nonPositiveConcentration',
    )
  }

  const distributionCoefficientA =
    input.extractSoluteAConcentration /
    input.raffinateSoluteAConcentration

  const distributionCoefficientB =
    input.extractSoluteBConcentration /
    input.raffinateSoluteBConcentration

  const selectivityAOverB =
    distributionCoefficientA /
    distributionCoefficientB

  const results = [
    distributionCoefficientA,
    distributionCoefficientB,
    selectivityAOverB,
  ]

  if (
    !results.every(Number.isFinite) ||
    distributionCoefficientA <= 0 ||
    distributionCoefficientB <= 0 ||
    selectivityAOverB <= 0
  ) {
    throw new ExtractionDistributionSelectivityCalculationError(
      'numericalFailure',
    )
  }

  let separationPreference: string

  if (selectivityAOverB > 1) {
    separationPreference =
      'The solvent preferentially extracts solute A over solute B.'
  } else if (selectivityAOverB < 1) {
    separationPreference =
      'The solvent preferentially extracts solute B over solute A.'
  } else {
    separationPreference =
      'The solvent shows no equilibrium selectivity between A and B.'
  }

  return {
    distributionCoefficientA,
    distributionCoefficientB,
    selectivityAOverB,
    separationPreference,
    modelName:
      'Equilibrium distribution coefficients and solvent selectivity',
    limitationDescription:
      'Concentrations must use consistent bases in both phases and represent the same equilibrium temperature.',
  }
}
