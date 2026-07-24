import type {
  StrippingMinimumGasRateInput,
  StrippingMinimumGasRateResult,
} from './types.ts'

export type StrippingMinimumGasRateErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidLiquidOrdering'
  | 'insufficientDrivingForce'
  | 'numericalFailure'

const messages: Record<
  StrippingMinimumGasRateErrorCode,
  string
> = {
  nonFiniteInput:
    'All minimum-gas-rate inputs must be finite.',
  nonPositiveProperty:
    'Liquid flow, inlet liquid ratio and equilibrium slope must be positive; remaining ratios cannot be negative.',
  invalidLiquidOrdering:
    'Outlet liquid solute ratio must be lower than inlet liquid solute ratio.',
  insufficientDrivingForce:
    'The equilibrium outlet gas ratio must exceed the entering gas solute ratio.',
  numericalFailure:
    'The minimum stripping-gas calculation did not produce finite physical results.',
}

export class StrippingMinimumGasRateCalculationError extends Error {
  readonly code: StrippingMinimumGasRateErrorCode

  constructor(code: StrippingMinimumGasRateErrorCode) {
    super(messages[code])
    this.name =
      'StrippingMinimumGasRateCalculationError'
    this.code = code
  }
}

export function calculateStrippingMinimumGasRate(
  input: StrippingMinimumGasRateInput,
): StrippingMinimumGasRateResult {
  const values = [
    input.liquidMolarFlowRate,
    input.inletLiquidSoluteRatio,
    input.outletLiquidSoluteRatio,
    input.equilibriumSlope,
    input.inletGasSoluteRatio,
  ]

  if (!values.every(Number.isFinite)) {
    throw new StrippingMinimumGasRateCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.liquidMolarFlowRate <= 0 ||
    input.inletLiquidSoluteRatio <= 0 ||
    input.outletLiquidSoluteRatio < 0 ||
    input.equilibriumSlope <= 0 ||
    input.inletGasSoluteRatio < 0
  ) {
    throw new StrippingMinimumGasRateCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.outletLiquidSoluteRatio >=
    input.inletLiquidSoluteRatio
  ) {
    throw new StrippingMinimumGasRateCalculationError(
      'invalidLiquidOrdering',
    )
  }

  const equilibriumOutletGasRatio =
    input.equilibriumSlope *
    input.inletLiquidSoluteRatio

  const denominatorDrivingDifference =
    equilibriumOutletGasRatio -
    input.inletGasSoluteRatio

  if (denominatorDrivingDifference <= 0) {
    throw new StrippingMinimumGasRateCalculationError(
      'insufficientDrivingForce',
    )
  }

  const soluteRemovedRate =
    input.liquidMolarFlowRate *
    (
      input.inletLiquidSoluteRatio -
      input.outletLiquidSoluteRatio
    )

  const minimumGasMolarFlowRate =
    soluteRemovedRate /
    denominatorDrivingDifference

  const minimumGasToLiquidRatio =
    minimumGasMolarFlowRate /
    input.liquidMolarFlowRate

  const results = [
    equilibriumOutletGasRatio,
    denominatorDrivingDifference,
    soluteRemovedRate,
    minimumGasMolarFlowRate,
    minimumGasToLiquidRatio,
  ]

  if (
    !results.every(Number.isFinite) ||
    equilibriumOutletGasRatio <= 0 ||
    denominatorDrivingDifference <= 0 ||
    soluteRemovedRate <= 0 ||
    minimumGasMolarFlowRate <= 0 ||
    minimumGasToLiquidRatio <= 0
  ) {
    throw new StrippingMinimumGasRateCalculationError(
      'numericalFailure',
    )
  }

  return {
    equilibriumOutletGasRatio,
    minimumGasMolarFlowRate,
    minimumGasToLiquidRatio,
    soluteRemovedRate,
    denominatorDrivingDifference,
    modelName:
      'Minimum-gas stripping balance with top pinch at equilibrium',
    limitationDescription:
      'Assumes dilute ratios, constant solute-free liquid flow, linear equilibrium and a top-end pinch where exiting gas equilibrates with entering rich liquid.',
  }
}
