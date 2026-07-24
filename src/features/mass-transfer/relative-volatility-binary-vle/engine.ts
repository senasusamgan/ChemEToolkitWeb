import type {
  RelativeVolatilityBinaryVLEInput,
  RelativeVolatilityBinaryVLEResult,
} from './types.ts'

export type RelativeVolatilityBinaryVLEErrorCode =
  | 'nonFiniteInput'
  | 'relativeVolatilityNotGreaterThanOne'
  | 'moleFractionOutOfRange'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  RelativeVolatilityBinaryVLEErrorCode,
  string
> = {
  nonFiniteInput:
    'All binary-VLE inputs must be finite.',
  relativeVolatilityNotGreaterThanOne:
    'Relative volatility must be greater than one because the selected component is defined as the more volatile component.',
  moleFractionOutOfRange:
    'The specified mole fraction must lie between zero and one.',
  numericalFailure:
    'The equilibrium calculation did not produce a finite physical composition.',
}

export class RelativeVolatilityBinaryVLECalculationError extends Error {
  readonly code: RelativeVolatilityBinaryVLEErrorCode

  constructor(
    code: RelativeVolatilityBinaryVLEErrorCode,
  ) {
    super(ERROR_MESSAGES[code])
    this.name =
      'RelativeVolatilityBinaryVLECalculationError'
    this.code = code
  }
}

const TOLERANCE = 1e-12

export function calculateRelativeVolatilityBinaryVLE(
  input: RelativeVolatilityBinaryVLEInput,
): RelativeVolatilityBinaryVLEResult {
  if (
    !Number.isFinite(input.relativeVolatility) ||
    !Number.isFinite(input.specifiedMoleFraction)
  ) {
    throw new RelativeVolatilityBinaryVLECalculationError(
      'nonFiniteInput',
    )
  }

  if (input.relativeVolatility <= 1) {
    throw new RelativeVolatilityBinaryVLECalculationError(
      'relativeVolatilityNotGreaterThanOne',
    )
  }

  if (
    input.specifiedMoleFraction < 0 ||
    input.specifiedMoleFraction > 1
  ) {
    throw new RelativeVolatilityBinaryVLECalculationError(
      'moleFractionOutOfRange',
    )
  }

  let liquidMoleFraction: number
  let vaporMoleFraction: number

  if (input.mode === 'liquidToVapor') {
    liquidMoleFraction =
      input.specifiedMoleFraction

    vaporMoleFraction =
      (
        input.relativeVolatility *
        liquidMoleFraction
      ) /
      (
        1 +
        (
          input.relativeVolatility - 1
        ) *
        liquidMoleFraction
      )
  } else {
    vaporMoleFraction =
      input.specifiedMoleFraction

    liquidMoleFraction =
      vaporMoleFraction /
      (
        input.relativeVolatility -
        (
          input.relativeVolatility - 1
        ) *
        vaporMoleFraction
      )
  }

  if (
    !Number.isFinite(liquidMoleFraction) ||
    !Number.isFinite(vaporMoleFraction) ||
    liquidMoleFraction < 0 ||
    liquidMoleFraction > 1 ||
    vaporMoleFraction < 0 ||
    vaporMoleFraction > 1
  ) {
    throw new RelativeVolatilityBinaryVLECalculationError(
      'numericalFailure',
    )
  }

  const vaporEnrichmentFactor =
    liquidMoleFraction > TOLERANCE
      ? vaporMoleFraction /
        liquidMoleFraction
      : input.relativeVolatility

  const interpretation =
    Math.abs(
      vaporMoleFraction -
      liquidMoleFraction,
    ) <= TOLERANCE
      ? 'The equilibrium compositions meet at a pure-component boundary.'
      : 'The vapor phase is enriched in the more volatile component.'

  return {
    liquidMoleFraction,
    vaporMoleFraction,
    equilibriumGap:
      vaporMoleFraction -
      liquidMoleFraction,
    vaporEnrichmentFactor,
    interpretation,
    modelName:
      'Constant-relative-volatility binary VLE',
  }
}
