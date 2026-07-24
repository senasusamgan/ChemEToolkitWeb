import type {
  IdealGasMembraneStageCutInput,
  IdealGasMembraneStageCutResult,
} from './types.ts'

export type IdealGasMembraneStageCutErrorCode =
  | 'nonFiniteInput'
  | 'fractionOutOfRange'
  | 'invalidCompositionOrdering'
  | 'numericalFailure'

const messages: Record<
  IdealGasMembraneStageCutErrorCode,
  string
> = {
  nonFiniteInput:
    'All ideal gas-membrane inputs must be finite.',
  fractionOutOfRange:
    'Feed, permeate and retentate solute fractions must satisfy 0 < value < 1.',
  invalidCompositionOrdering:
    'For an enriched permeate, compositions must satisfy xR < zF < yP.',
  numericalFailure:
    'The stage-cut calculation did not produce finite physical results.',
}

export class IdealGasMembraneStageCutCalculationError extends Error {
  readonly code: IdealGasMembraneStageCutErrorCode

  constructor(code: IdealGasMembraneStageCutErrorCode) {
    super(messages[code])
    this.name =
      'IdealGasMembraneStageCutCalculationError'
    this.code = code
  }
}

export function calculateIdealGasMembraneStageCut(
  input: IdealGasMembraneStageCutInput,
): IdealGasMembraneStageCutResult {
  const values = [
    input.feedSoluteFraction,
    input.permeateSoluteFraction,
    input.retentateSoluteFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new IdealGasMembraneStageCutCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    values.some(
      (value) => value <= 0 || value >= 1,
    )
  ) {
    throw new IdealGasMembraneStageCutCalculationError(
      'fractionOutOfRange',
    )
  }

  if (
    !(
      input.retentateSoluteFraction <
        input.feedSoluteFraction &&
      input.feedSoluteFraction <
        input.permeateSoluteFraction
    )
  ) {
    throw new IdealGasMembraneStageCutCalculationError(
      'invalidCompositionOrdering',
    )
  }

  const stageCut =
    (
      input.feedSoluteFraction -
      input.retentateSoluteFraction
    ) /
    (
      input.permeateSoluteFraction -
      input.retentateSoluteFraction
    )

  const permeateFlowPerUnitFeed = stageCut
  const retentateFlowPerUnitFeed =
    1 - stageCut

  const soluteRecoveryToPermeate =
    (
      stageCut *
      input.permeateSoluteFraction
    ) /
    input.feedSoluteFraction

  const soluteRejectionToRetentate =
    (
      retentateFlowPerUnitFeed *
      input.retentateSoluteFraction
    ) /
    input.feedSoluteFraction

  const productSelectivity =
    (
      input.permeateSoluteFraction /
      (1 - input.permeateSoluteFraction)
    ) /
    (
      input.retentateSoluteFraction /
      (1 - input.retentateSoluteFraction)
    )

  const totalBalanceResidual =
    1 -
    permeateFlowPerUnitFeed -
    retentateFlowPerUnitFeed

  const soluteBalanceResidual =
    input.feedSoluteFraction -
    permeateFlowPerUnitFeed *
      input.permeateSoluteFraction -
    retentateFlowPerUnitFeed *
      input.retentateSoluteFraction

  const results = [
    stageCut,
    permeateFlowPerUnitFeed,
    retentateFlowPerUnitFeed,
    soluteRecoveryToPermeate,
    soluteRejectionToRetentate,
    productSelectivity,
    totalBalanceResidual,
    soluteBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    stageCut <= 0 ||
    stageCut >= 1 ||
    soluteRecoveryToPermeate <= 0 ||
    soluteRecoveryToPermeate >= 1 ||
    soluteRejectionToRetentate <= 0 ||
    soluteRejectionToRetentate >= 1 ||
    productSelectivity <= 1
  ) {
    throw new IdealGasMembraneStageCutCalculationError(
      'numericalFailure',
    )
  }

  return {
    stageCut,
    permeateFlowPerUnitFeed,
    retentateFlowPerUnitFeed,
    soluteRecoveryToPermeate,
    soluteRejectionToRetentate,
    productSelectivity,
    totalBalanceResidual,
    soluteBalanceResidual,
    modelName:
      'Single-stage overall and solute membrane balances',
    limitationDescription:
      'Uses specified bulk product compositions. It does not calculate compositions from permeance selectivity, pressure ratio or module flow pattern.',
  }
}
