import type {
  SingleStageLiquidLiquidExtractionInput,
  SingleStageLiquidLiquidExtractionResult,
} from './types.ts'

export type SingleStageLiquidLiquidExtractionErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeSoluteRatio'
  | 'numericalFailure'

const messages: Record<
  SingleStageLiquidLiquidExtractionErrorCode,
  string
> = {
  nonFiniteInput: 'All extraction inputs must be finite.',
  nonPositiveProperty:
    'Raffinate carrier flow, solvent carrier flow and distribution coefficient must be greater than zero.',
  negativeSoluteRatio:
    'Feed and entering-solvent solute ratios cannot be negative.',
  numericalFailure:
    'The single-stage extraction calculation did not produce a physical result.',
}

export class SingleStageLiquidLiquidExtractionCalculationError extends Error {
  readonly code: SingleStageLiquidLiquidExtractionErrorCode

  constructor(code: SingleStageLiquidLiquidExtractionErrorCode) {
    super(messages[code])
    this.name =
      'SingleStageLiquidLiquidExtractionCalculationError'
    this.code = code
  }
}

const zeroTolerance = 1e-12

export function calculateSingleStageLiquidLiquidExtraction(
  input: SingleStageLiquidLiquidExtractionInput,
): SingleStageLiquidLiquidExtractionResult {
  const values = [
    input.raffinateCarrierFlowRate,
    input.solventCarrierFlowRate,
    input.feedSoluteRatio,
    input.enteringSolventSoluteRatio,
    input.distributionCoefficient,
  ]

  if (!values.every(Number.isFinite)) {
    throw new SingleStageLiquidLiquidExtractionCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.raffinateCarrierFlowRate <= 0 ||
    input.solventCarrierFlowRate <= 0 ||
    input.distributionCoefficient <= 0
  ) {
    throw new SingleStageLiquidLiquidExtractionCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.feedSoluteRatio < 0 ||
    input.enteringSolventSoluteRatio < 0
  ) {
    throw new SingleStageLiquidLiquidExtractionCalculationError(
      'negativeSoluteRatio',
    )
  }

  const denominator =
    input.raffinateCarrierFlowRate +
    input.solventCarrierFlowRate *
      input.distributionCoefficient

  const raffinateOutletSoluteRatio =
    (
      input.raffinateCarrierFlowRate *
        input.feedSoluteRatio +
      input.solventCarrierFlowRate *
        input.enteringSolventSoluteRatio
    ) / denominator

  const extractOutletSoluteRatio =
    input.distributionCoefficient *
    raffinateOutletSoluteRatio

  const signedTransferRateToExtract =
    input.raffinateCarrierFlowRate *
    (
      input.feedSoluteRatio -
      raffinateOutletSoluteRatio
    )

  const feedSoluteRate =
    input.raffinateCarrierFlowRate *
    input.feedSoluteRatio

  const raffinateRemovalFraction =
    feedSoluteRate > zeroTolerance
      ? signedTransferRateToExtract / feedSoluteRate
      : 0

  const inletSoluteRate =
    feedSoluteRate +
    input.solventCarrierFlowRate *
      input.enteringSolventSoluteRatio

  const outletSoluteRate =
    input.raffinateCarrierFlowRate *
      raffinateOutletSoluteRatio +
    input.solventCarrierFlowRate *
      extractOutletSoluteRatio

  const soluteBalanceResidual =
    inletSoluteRate - outletSoluteRate

  const extractionFactor =
    (
      input.distributionCoefficient *
      input.solventCarrierFlowRate
    ) / input.raffinateCarrierFlowRate

  const results = [
    raffinateOutletSoluteRatio,
    extractOutletSoluteRatio,
    signedTransferRateToExtract,
    raffinateRemovalFraction,
    soluteBalanceResidual,
    extractionFactor,
  ]

  if (
    !results.every(Number.isFinite) ||
    raffinateOutletSoluteRatio < 0 ||
    extractOutletSoluteRatio < 0 ||
    extractionFactor <= 0
  ) {
    throw new SingleStageLiquidLiquidExtractionCalculationError(
      'numericalFailure',
    )
  }

  let directionDescription: string

  if (
    Math.abs(signedTransferRateToExtract) <=
    zeroTolerance
  ) {
    directionDescription =
      'The entering phases are at equilibrium; no net solute transfer is predicted.'
  } else if (signedTransferRateToExtract > 0) {
    directionDescription =
      'Solute transfers from the raffinate carrier into the extract solvent.'
  } else {
    directionDescription =
      'Solute transfers from the solvent phase into the raffinate carrier.'
  }

  return {
    raffinateOutletSoluteRatio,
    extractOutletSoluteRatio,
    extractionFactor,
    signedTransferRateToExtract,
    transferRateMagnitude:
      Math.abs(signedTransferRateToExtract),
    raffinateRemovalFraction,
    soluteBalanceResidual,
    directionDescription,
    modelName:
      'Single equilibrium stage with immiscible carrier phases and Y = DX',
  }
}
