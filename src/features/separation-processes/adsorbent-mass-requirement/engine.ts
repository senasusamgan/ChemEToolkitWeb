import type {
  AdsorbentMassRequirementInput,
  AdsorbentMassRequirementResult,
} from './types.ts'

export type AdsorbentMassRequirementErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'fractionOutOfRange'
  | 'numericalFailure'

const messages: Record<
  AdsorbentMassRequirementErrorCode,
  string
> = {
  nonFiniteInput:
    'All adsorbent requirement inputs must be finite.',
  nonPositiveProperty:
    'Feed flow and working adsorption capacity must be greater than zero.',
  fractionOutOfRange:
    'Solute fraction, removal fraction and utilization fraction must satisfy 0 < value ≤ 1.',
  numericalFailure:
    'The adsorbent requirement calculation did not produce finite physical results.',
}

export class AdsorbentMassRequirementCalculationError extends Error {
  readonly code: AdsorbentMassRequirementErrorCode

  constructor(code: AdsorbentMassRequirementErrorCode) {
    super(messages[code])
    this.name =
      'AdsorbentMassRequirementCalculationError'
    this.code = code
  }
}

export function calculateAdsorbentMassRequirement(
  input: AdsorbentMassRequirementInput,
): AdsorbentMassRequirementResult {
  const values = [
    input.feedMassFlowRate,
    input.soluteMassFraction,
    input.targetRemovalFraction,
    input.workingAdsorptionCapacity,
    input.utilizationFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new AdsorbentMassRequirementCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.feedMassFlowRate <= 0 ||
    input.workingAdsorptionCapacity <= 0
  ) {
    throw new AdsorbentMassRequirementCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.soluteMassFraction <= 0 ||
    input.soluteMassFraction > 1 ||
    input.targetRemovalFraction <= 0 ||
    input.targetRemovalFraction > 1 ||
    input.utilizationFraction <= 0 ||
    input.utilizationFraction > 1
  ) {
    throw new AdsorbentMassRequirementCalculationError(
      'fractionOutOfRange',
    )
  }

  const feedSoluteRate =
    input.feedMassFlowRate *
    input.soluteMassFraction

  const soluteRemovedRate =
    feedSoluteRate *
    input.targetRemovalFraction

  const effectiveWorkingCapacity =
    input.workingAdsorptionCapacity *
    input.utilizationFraction

  const requiredAdsorbentRate =
    soluteRemovedRate /
    effectiveWorkingCapacity

  const adsorbentToFeedRatio =
    requiredAdsorbentRate /
    input.feedMassFlowRate

  const untreatedSoluteRate =
    feedSoluteRate -
    soluteRemovedRate

  const results = [
    feedSoluteRate,
    soluteRemovedRate,
    effectiveWorkingCapacity,
    requiredAdsorbentRate,
    adsorbentToFeedRatio,
    untreatedSoluteRate,
  ]

  if (
    !results.every(Number.isFinite) ||
    feedSoluteRate <= 0 ||
    soluteRemovedRate <= 0 ||
    effectiveWorkingCapacity <= 0 ||
    requiredAdsorbentRate <= 0 ||
    adsorbentToFeedRatio <= 0 ||
    untreatedSoluteRate < 0
  ) {
    throw new AdsorbentMassRequirementCalculationError(
      'numericalFailure',
    )
  }

  return {
    feedSoluteRate,
    soluteRemovedRate,
    effectiveWorkingCapacity,
    requiredAdsorbentRate,
    adsorbentToFeedRatio,
    untreatedSoluteRate,
    modelName:
      'Working-capacity adsorbent consumption estimate',
    limitationDescription:
      'Uses a specified usable capacity. Competitive adsorption, regeneration losses, mass-transfer-zone inventory and ageing require separate allowances.',
  }
}
