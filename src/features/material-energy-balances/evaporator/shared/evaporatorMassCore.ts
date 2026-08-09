export interface EvaporatorMassCoreInput {
  feedMassFlowRate: number
  feedSolidsMassFraction: number
  productSolidsMassFraction: number
}

export interface EvaporatorMassCoreResult {
  drySolidsMassFlowRate: number
  productMassFlowRate: number
  evaporatedWaterMassFlowRate: number

  totalMassIn: number
  totalMassOut: number

  massBalanceClosureError: number
  massBalanceClosurePercent: number
}

export type EvaporatorMassCoreErrorCode =
  | 'INVALID_FEED_FLOW'
  | 'INVALID_FEED_SOLIDS'
  | 'INVALID_PRODUCT_SOLIDS'
  | 'INVALID_CONCENTRATION_WINDOW'

export class EvaporatorMassCoreError
  extends Error {
  readonly code:
    EvaporatorMassCoreErrorCode

  constructor(
    code:
      EvaporatorMassCoreErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'EvaporatorMassCoreError'

    this.code =
      code
  }
}

function requirePositive(
  value: number,
  code:
    EvaporatorMassCoreErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new EvaporatorMassCoreError(
      code,
      `${label} must be a positive finite number.`,
    )
  }
}

function requireFraction(
  value: number,
  code:
    EvaporatorMassCoreErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    value >= 1
  ) {
    throw new EvaporatorMassCoreError(
      code,
      `${label} must satisfy 0 < x < 1.`,
    )
  }
}

export function calculateEvaporatorMassCore(
  input:
    EvaporatorMassCoreInput,
): EvaporatorMassCoreResult {
  requirePositive(
    input.feedMassFlowRate,
    'INVALID_FEED_FLOW',
    'Feed mass flow rate',
  )

  requireFraction(
    input.feedSolidsMassFraction,
    'INVALID_FEED_SOLIDS',
    'Feed solids mass fraction',
  )

  requireFraction(
    input.productSolidsMassFraction,
    'INVALID_PRODUCT_SOLIDS',
    'Product solids mass fraction',
  )

  if (
    input.productSolidsMassFraction <=
    input.feedSolidsMassFraction
  ) {
    throw new EvaporatorMassCoreError(
      'INVALID_CONCENTRATION_WINDOW',
      'Product solids fraction must be greater than feed solids fraction for evaporation.',
    )
  }

  const drySolidsMassFlowRate =
    input.feedMassFlowRate *
    input.feedSolidsMassFraction

  const productMassFlowRate =
    drySolidsMassFlowRate /
    input.productSolidsMassFraction

  const evaporatedWaterMassFlowRate =
    input.feedMassFlowRate -
    productMassFlowRate

  const totalMassIn =
    input.feedMassFlowRate

  const totalMassOut =
    productMassFlowRate +
    evaporatedWaterMassFlowRate

  const massBalanceClosureError =
    totalMassIn -
    totalMassOut

  const massBalanceClosurePercent =
    Math.abs(
      massBalanceClosureError,
    ) /
    totalMassIn *
    100

  return {
    drySolidsMassFlowRate,
    productMassFlowRate,
    evaporatedWaterMassFlowRate,

    totalMassIn,
    totalMassOut,

    massBalanceClosureError,
    massBalanceClosurePercent,
  }
}
