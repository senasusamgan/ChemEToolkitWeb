import type {
  SingleStageGasAbsorptionInput,
  SingleStageGasAbsorptionResult,
} from './types.ts'

export type SingleStageGasAbsorptionErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeSoluteRatio'
  | 'noAbsorptionDrivingForce'
  | 'numericalFailure'

const messages: Record<
  SingleStageGasAbsorptionErrorCode,
  string
> = {
  nonFiniteInput:
    'All single-stage absorption inputs must be finite.',
  nonPositiveProperty:
    'Gas flow, liquid flow and equilibrium slope must be greater than zero.',
  negativeSoluteRatio:
    'Gas and liquid solute ratios cannot be negative.',
  noAbsorptionDrivingForce:
    'The entering gas must be richer than the gas in equilibrium with the entering liquid.',
  numericalFailure:
    'The single-stage absorption calculation did not produce finite physical results.',
}

export class SingleStageGasAbsorptionCalculationError extends Error {
  readonly code: SingleStageGasAbsorptionErrorCode

  constructor(code: SingleStageGasAbsorptionErrorCode) {
    super(messages[code])
    this.name =
      'SingleStageGasAbsorptionCalculationError'
    this.code = code
  }
}

export function calculateSingleStageGasAbsorption(
  input: SingleStageGasAbsorptionInput,
): SingleStageGasAbsorptionResult {
  const values = [
    input.gasCarrierMolarFlowRate,
    input.liquidCarrierMolarFlowRate,
    input.inletGasSoluteRatio,
    input.inletLiquidSoluteRatio,
    input.equilibriumSlope,
  ]

  if (!values.every(Number.isFinite)) {
    throw new SingleStageGasAbsorptionCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.gasCarrierMolarFlowRate <= 0 ||
    input.liquidCarrierMolarFlowRate <= 0 ||
    input.equilibriumSlope <= 0
  ) {
    throw new SingleStageGasAbsorptionCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.inletGasSoluteRatio < 0 ||
    input.inletLiquidSoluteRatio < 0
  ) {
    throw new SingleStageGasAbsorptionCalculationError(
      'negativeSoluteRatio',
    )
  }

  if (
    input.inletGasSoluteRatio <=
    input.equilibriumSlope *
    input.inletLiquidSoluteRatio
  ) {
    throw new SingleStageGasAbsorptionCalculationError(
      'noAbsorptionDrivingForce',
    )
  }

  const outletLiquidSoluteRatio =
    (
      input.gasCarrierMolarFlowRate *
      input.inletGasSoluteRatio +
      input.liquidCarrierMolarFlowRate *
      input.inletLiquidSoluteRatio
    ) /
    (
      input.liquidCarrierMolarFlowRate +
      input.equilibriumSlope *
      input.gasCarrierMolarFlowRate
    )

  const outletGasSoluteRatio =
    input.equilibriumSlope *
    outletLiquidSoluteRatio

  const soluteAbsorbedRate =
    input.gasCarrierMolarFlowRate *
    (
      input.inletGasSoluteRatio -
      outletGasSoluteRatio
    )

  const gasSoluteRemovalFraction =
    (
      input.inletGasSoluteRatio -
      outletGasSoluteRatio
    ) /
    input.inletGasSoluteRatio

  const absorptionFactor =
    input.liquidCarrierMolarFlowRate /
    (
      input.equilibriumSlope *
      input.gasCarrierMolarFlowRate
    )

  const soluteBalanceResidual =
    input.gasCarrierMolarFlowRate *
    input.inletGasSoluteRatio +
    input.liquidCarrierMolarFlowRate *
    input.inletLiquidSoluteRatio -
    input.gasCarrierMolarFlowRate *
    outletGasSoluteRatio -
    input.liquidCarrierMolarFlowRate *
    outletLiquidSoluteRatio

  const results = [
    outletLiquidSoluteRatio,
    outletGasSoluteRatio,
    soluteAbsorbedRate,
    gasSoluteRemovalFraction,
    absorptionFactor,
    soluteBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    outletLiquidSoluteRatio < 0 ||
    outletGasSoluteRatio < 0 ||
    soluteAbsorbedRate <= 0 ||
    gasSoluteRemovalFraction <= 0 ||
    gasSoluteRemovalFraction >= 1 ||
    absorptionFactor <= 0
  ) {
    throw new SingleStageGasAbsorptionCalculationError(
      'numericalFailure',
    )
  }

  return {
    outletLiquidSoluteRatio,
    outletGasSoluteRatio,
    soluteAbsorbedRate,
    gasSoluteRemovalFraction,
    absorptionFactor,
    soluteBalanceResidual,
    modelName:
      'Ideal single equilibrium stage with linear gas–liquid equilibrium',
    limitationDescription:
      'Uses dilute solute ratios and constant solute-free carrier flows. Heat effects, chemical reaction and finite mass-transfer efficiency are excluded.',
  }
}
