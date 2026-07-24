import type {
  BatchSettlingAreaEstimateInput,
  BatchSettlingAreaEstimateResult,
} from './types.ts'

export type BatchSettlingAreaEstimateErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'underflowNotConcentrated'
  | 'designFactorBelowOne'
  | 'numericalFailure'

const messages: Record<
  BatchSettlingAreaEstimateErrorCode,
  string
> = {
  nonFiniteInput:
    'All settling-area inputs must be finite.',
  nonPositiveProperty:
    'Flow rate, both solids concentrations and settling velocity must be greater than zero.',
  underflowNotConcentrated:
    'Underflow solids concentration must exceed the feed solids concentration.',
  designFactorBelowOne:
    'Design factor must be at least one.',
  numericalFailure:
    'The settling-area calculation did not produce a finite physical result.',
}

export class BatchSettlingAreaEstimateCalculationError extends Error {
  readonly code: BatchSettlingAreaEstimateErrorCode

  constructor(code: BatchSettlingAreaEstimateErrorCode) {
    super(messages[code])
    this.name =
      'BatchSettlingAreaEstimateCalculationError'
    this.code = code
  }
}

export function calculateBatchSettlingAreaEstimate(
  input: BatchSettlingAreaEstimateInput,
): BatchSettlingAreaEstimateResult {
  const values = [
    input.feedVolumetricFlowRate,
    input.feedSolidsConcentration,
    input.underflowSolidsConcentration,
    input.zoneSettlingVelocity,
    input.designFactor,
  ]

  if (!values.every(Number.isFinite)) {
    throw new BatchSettlingAreaEstimateCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.feedVolumetricFlowRate <= 0 ||
    input.feedSolidsConcentration <= 0 ||
    input.underflowSolidsConcentration <= 0 ||
    input.zoneSettlingVelocity <= 0
  ) {
    throw new BatchSettlingAreaEstimateCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.underflowSolidsConcentration <=
    input.feedSolidsConcentration
  ) {
    throw new BatchSettlingAreaEstimateCalculationError(
      'underflowNotConcentrated',
    )
  }

  if (input.designFactor < 1) {
    throw new BatchSettlingAreaEstimateCalculationError(
      'designFactorBelowOne',
    )
  }

  const hydraulicArea =
    input.feedVolumetricFlowRate /
    input.zoneSettlingVelocity

  const solidsFluxArea =
    (
      input.feedVolumetricFlowRate *
      input.feedSolidsConcentration
    ) /
    (
      input.zoneSettlingVelocity *
      (
        input.underflowSolidsConcentration -
        input.feedSolidsConcentration
      )
    )

  const controllingArea =
    Math.max(hydraulicArea, solidsFluxArea)

  const designArea =
    input.designFactor * controllingArea

  const designDiameter =
    Math.sqrt((4 * designArea) / Math.PI)

  const feedSolidsRate =
    input.feedVolumetricFlowRate *
    input.feedSolidsConcentration

  const thickeningRatio =
    input.underflowSolidsConcentration /
    input.feedSolidsConcentration

  const solidsFluxCapacity =
    feedSolidsRate / designArea

  const results = [
    hydraulicArea,
    solidsFluxArea,
    designArea,
    designDiameter,
    feedSolidsRate,
    thickeningRatio,
    solidsFluxCapacity,
  ]

  if (
    !results.every(Number.isFinite) ||
    hydraulicArea <= 0 ||
    solidsFluxArea <= 0 ||
    designArea <= 0 ||
    designDiameter <= 0 ||
    feedSolidsRate <= 0 ||
    thickeningRatio <= 1 ||
    solidsFluxCapacity <= 0
  ) {
    throw new BatchSettlingAreaEstimateCalculationError(
      'numericalFailure',
    )
  }

  return {
    hydraulicArea,
    solidsFluxArea,
    designArea,
    designDiameter,
    feedSolidsRate,
    thickeningRatio,
    solidsFluxCapacity,
    modelName:
      'Preliminary zone-settling and solids-flux area estimate',
    limitationDescription:
      'Uses a representative zone-settling velocity and ideal thickening balance. Compression settling, flocculation changes and feed-well effects require pilot confirmation.',
  }
}
