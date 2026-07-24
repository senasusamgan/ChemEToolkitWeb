import type {
  GillilandStageEstimateInput,
  GillilandStageEstimateResult,
} from './types.ts'

export type GillilandStageEstimateErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'refluxNotAboveMinimum'
  | 'efficiencyOutOfRange'
  | 'numericalFailure'

const messages: Record<
  GillilandStageEstimateErrorCode,
  string
> = {
  nonFiniteInput:
    'All Gilliland stage-estimate inputs must be finite.',
  nonPositiveProperty:
    'Minimum stages and both reflux ratios must be greater than zero.',
  refluxNotAboveMinimum:
    'Operating reflux ratio must exceed the minimum reflux ratio.',
  efficiencyOutOfRange:
    'Overall stage efficiency must satisfy 0 < efficiency ≤ 1.',
  numericalFailure:
    'The Gilliland stage estimate did not produce finite physical results.',
}

export class GillilandStageEstimateCalculationError extends Error {
  readonly code: GillilandStageEstimateErrorCode

  constructor(code: GillilandStageEstimateErrorCode) {
    super(messages[code])
    this.name =
      'GillilandStageEstimateCalculationError'
    this.code = code
  }
}

export function calculateGillilandStageEstimate(
  input: GillilandStageEstimateInput,
): GillilandStageEstimateResult {
  const values = [
    input.minimumStages,
    input.minimumRefluxRatio,
    input.operatingRefluxRatio,
    input.overallStageEfficiency,
  ]

  if (!values.every(Number.isFinite)) {
    throw new GillilandStageEstimateCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.minimumStages <= 0 ||
    input.minimumRefluxRatio <= 0 ||
    input.operatingRefluxRatio <= 0
  ) {
    throw new GillilandStageEstimateCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.operatingRefluxRatio <=
    input.minimumRefluxRatio
  ) {
    throw new GillilandStageEstimateCalculationError(
      'refluxNotAboveMinimum',
    )
  }

  if (
    input.overallStageEfficiency <= 0 ||
    input.overallStageEfficiency > 1
  ) {
    throw new GillilandStageEstimateCalculationError(
      'efficiencyOutOfRange',
    )
  }

  const reducedReflux =
    (
      input.operatingRefluxRatio -
      input.minimumRefluxRatio
    ) /
    (
      input.operatingRefluxRatio + 1
    )

  const exponent =
    (
      (1 + 54.4 * reducedReflux) /
      (11 + 117.2 * reducedReflux)
    ) *
    (
      (reducedReflux - 1) /
      Math.sqrt(reducedReflux)
    )

  const gillilandReducedStages =
    1 - Math.exp(exponent)

  const theoreticalStageCount =
    (
      input.minimumStages +
      gillilandReducedStages
    ) /
    (
      1 - gillilandReducedStages
    )

  const requiredIntegerTheoreticalStages =
    Math.ceil(theoreticalStageCount)

  const actualStageCount =
    theoreticalStageCount /
    input.overallStageEfficiency

  const requiredIntegerActualStages =
    Math.ceil(actualStageCount)

  const results = [
    reducedReflux,
    gillilandReducedStages,
    theoreticalStageCount,
    requiredIntegerTheoreticalStages,
    actualStageCount,
    requiredIntegerActualStages,
  ]

  if (
    !results.every(Number.isFinite) ||
    reducedReflux <= 0 ||
    reducedReflux >= 1 ||
    gillilandReducedStages <= 0 ||
    gillilandReducedStages >= 1 ||
    theoreticalStageCount <=
      input.minimumStages ||
    requiredIntegerTheoreticalStages < 1 ||
    actualStageCount < theoreticalStageCount ||
    requiredIntegerActualStages < 1
  ) {
    throw new GillilandStageEstimateCalculationError(
      'numericalFailure',
    )
  }

  return {
    reducedReflux,
    gillilandReducedStages,
    theoreticalStageCount,
    requiredIntegerTheoreticalStages,
    actualStageCount,
    requiredIntegerActualStages,
    modelName:
      'Eduljee analytical approximation to the Gilliland correlation',
    limitationDescription:
      'Provides a shortcut stage estimate after independent minimum-stage and minimum-reflux calculations. Feed condition and tray hydraulics are not resolved.',
  }
}
