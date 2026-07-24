import type {
  AbsorptionStrippingFactorsInput,
  AbsorptionStrippingFactorsResult,
} from './types.ts'

export type AbsorptionStrippingFactorsErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'numericalFailure'

const messages: Record<
  AbsorptionStrippingFactorsErrorCode,
  string
> = {
  nonFiniteInput:
    'All absorption and stripping factor inputs must be finite.',
  nonPositiveProperty:
    'Liquid flow, gas flow and equilibrium slope must be greater than zero.',
  numericalFailure:
    'The factor calculation did not produce finite physical results.',
}

export class AbsorptionStrippingFactorsCalculationError extends Error {
  readonly code: AbsorptionStrippingFactorsErrorCode

  constructor(code: AbsorptionStrippingFactorsErrorCode) {
    super(messages[code])
    this.name =
      'AbsorptionStrippingFactorsCalculationError'
    this.code = code
  }
}

export function calculateAbsorptionStrippingFactors(
  input: AbsorptionStrippingFactorsInput,
): AbsorptionStrippingFactorsResult {
  const values = [
    input.liquidMolarFlowRate,
    input.gasMolarFlowRate,
    input.equilibriumSlope,
  ]

  if (!values.every(Number.isFinite)) {
    throw new AbsorptionStrippingFactorsCalculationError(
      'nonFiniteInput',
    )
  }

  if (values.some((value) => value <= 0)) {
    throw new AbsorptionStrippingFactorsCalculationError(
      'nonPositiveProperty',
    )
  }

  const liquidToGasRatio =
    input.liquidMolarFlowRate /
    input.gasMolarFlowRate

  const gasToLiquidRatio =
    input.gasMolarFlowRate /
    input.liquidMolarFlowRate

  const absorptionFactor =
    input.liquidMolarFlowRate /
    (
      input.equilibriumSlope *
      input.gasMolarFlowRate
    )

  const strippingFactor =
    (
      input.equilibriumSlope *
      input.gasMolarFlowRate
    ) /
    input.liquidMolarFlowRate

  const results = [
    liquidToGasRatio,
    gasToLiquidRatio,
    absorptionFactor,
    strippingFactor,
  ]

  if (
    !results.every(Number.isFinite) ||
    results.some((value) => value <= 0)
  ) {
    throw new AbsorptionStrippingFactorsCalculationError(
      'numericalFailure',
    )
  }

  const absorptionAssessment =
    absorptionFactor > 1
      ? 'A > 1: liquid flow is favorable for absorption.'
      : absorptionFactor < 1
        ? 'A < 1: absorption is flow-limited.'
        : 'A = 1: limiting Kremser case.'

  const strippingAssessment =
    strippingFactor > 1
      ? 'S > 1: gas flow is favorable for stripping.'
      : strippingFactor < 1
        ? 'S < 1: stripping is flow-limited.'
        : 'S = 1: limiting Kremser case.'

  return {
    absorptionFactor,
    strippingFactor,
    liquidToGasRatio,
    gasToLiquidRatio,
    absorptionAssessment,
    strippingAssessment,
    modelName:
      'Dilute linear-equilibrium absorption and stripping factors',
    limitationDescription:
      'Assumes constant solute-free phase flow rates and a linear equilibrium relation y* = mx.',
  }
}
