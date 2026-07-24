import type {
  BinaryFlashInput,
  BinaryFlashPhaseState,
  BinaryFlashResult,
} from './types.ts'

export type BinaryFlashErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveFeedFlow'
  | 'feedCompositionOutOfRange'
  | 'nonPositiveKValue'
  | 'invalidKValueOrdering'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<BinaryFlashErrorCode, string> = {
  nonFiniteInput: 'All inputs must be finite.',
  nonPositiveFeedFlow: 'Feed flow rate must be greater than zero.',
  feedCompositionOutOfRange:
    'Feed light-component mole fraction must lie between zero and one.',
  nonPositiveKValue: 'Both equilibrium K-values must be greater than zero.',
  invalidKValueOrdering:
    'The light-component K-value must be greater than the heavy-component K-value.',
  numericalFailure:
    'The flash calculation did not converge to a physical result.',
}

export class BinaryFlashCalculationError extends Error {
  readonly code: BinaryFlashErrorCode

  constructor(code: BinaryFlashErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'BinaryFlashCalculationError'
    this.code = code
  }
}

const TOLERANCE = 1e-12

function residual(beta: number, input: BinaryFlashInput): number {
  const z = input.feedLightMoleFraction

  return (
    (z * (input.lightComponentKValue - 1)) /
      (1 + beta * (input.lightComponentKValue - 1)) +
    ((1 - z) * (input.heavyComponentKValue - 1)) /
      (1 + beta * (input.heavyComponentKValue - 1))
  )
}

function solveBeta(input: BinaryFlashInput): number {
  let lower = 0
  let upper = 1

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const midpoint = 0.5 * (lower + upper)
    const value = residual(midpoint, input)

    if (Math.abs(value) <= TOLERANCE) {
      return midpoint
    }

    if (value > 0) {
      lower = midpoint
    } else {
      upper = midpoint
    }
  }

  const midpoint = 0.5 * (lower + upper)

  if (Math.abs(residual(midpoint, input)) > 1e-9) {
    throw new BinaryFlashCalculationError('numericalFailure')
  }

  return midpoint
}

function incipientVaporLight(input: BinaryFlashInput): number {
  const light =
    input.lightComponentKValue * input.feedLightMoleFraction
  const heavy =
    input.heavyComponentKValue *
    (1 - input.feedLightMoleFraction)

  return light / (light + heavy)
}

function incipientLiquidLight(input: BinaryFlashInput): number {
  const light =
    input.feedLightMoleFraction / input.lightComponentKValue
  const heavy =
    (1 - input.feedLightMoleFraction) /
    input.heavyComponentKValue

  return light / (light + heavy)
}

function validate(input: BinaryFlashInput): void {
  const values = [
    input.feedFlowRate,
    input.feedLightMoleFraction,
    input.lightComponentKValue,
    input.heavyComponentKValue,
  ]

  if (!values.every(Number.isFinite)) {
    throw new BinaryFlashCalculationError('nonFiniteInput')
  }

  if (input.feedFlowRate <= 0) {
    throw new BinaryFlashCalculationError('nonPositiveFeedFlow')
  }

  if (
    input.feedLightMoleFraction < 0 ||
    input.feedLightMoleFraction > 1
  ) {
    throw new BinaryFlashCalculationError(
      'feedCompositionOutOfRange',
    )
  }

  if (
    input.lightComponentKValue <= 0 ||
    input.heavyComponentKValue <= 0
  ) {
    throw new BinaryFlashCalculationError('nonPositiveKValue')
  }

  if (
    input.lightComponentKValue <= input.heavyComponentKValue
  ) {
    throw new BinaryFlashCalculationError(
      'invalidKValueOrdering',
    )
  }
}

export function calculateBinaryFlash(
  input: BinaryFlashInput,
): BinaryFlashResult {
  validate(input)

  const f0 = residual(0, input)
  const f1 = residual(1, input)

  let phaseState: BinaryFlashPhaseState
  let vaporFraction: number
  let liquidLightMoleFraction: number
  let vaporLightMoleFraction: number
  let rachfordRiceResidual: number

  if (Math.abs(f0) <= TOLERANCE) {
    phaseState = 'bubblePoint'
    vaporFraction = 0
    liquidLightMoleFraction = input.feedLightMoleFraction
    vaporLightMoleFraction = incipientVaporLight(input)
    rachfordRiceResidual = f0
  } else if (f0 < 0) {
    phaseState = 'allLiquid'
    vaporFraction = 0
    liquidLightMoleFraction = input.feedLightMoleFraction
    vaporLightMoleFraction = incipientVaporLight(input)
    rachfordRiceResidual = f0
  } else if (Math.abs(f1) <= TOLERANCE) {
    phaseState = 'dewPoint'
    vaporFraction = 1
    vaporLightMoleFraction = input.feedLightMoleFraction
    liquidLightMoleFraction = incipientLiquidLight(input)
    rachfordRiceResidual = f1
  } else if (f1 > 0) {
    phaseState = 'allVapor'
    vaporFraction = 1
    vaporLightMoleFraction = input.feedLightMoleFraction
    liquidLightMoleFraction = incipientLiquidLight(input)
    rachfordRiceResidual = f1
  } else {
    phaseState = 'twoPhase'
    vaporFraction = solveBeta(input)

    const rawLiquidLight =
      input.feedLightMoleFraction /
      (1 +
        vaporFraction *
          (input.lightComponentKValue - 1))

    const rawLiquidHeavy =
      (1 - input.feedLightMoleFraction) /
      (1 +
        vaporFraction *
          (input.heavyComponentKValue - 1))

    const liquidTotal = rawLiquidLight + rawLiquidHeavy

    const rawVaporLight =
      input.lightComponentKValue * rawLiquidLight
    const rawVaporHeavy =
      input.heavyComponentKValue * rawLiquidHeavy

    const vaporTotal = rawVaporLight + rawVaporHeavy

    if (liquidTotal <= 0 || vaporTotal <= 0) {
      throw new BinaryFlashCalculationError('numericalFailure')
    }

    liquidLightMoleFraction = rawLiquidLight / liquidTotal
    vaporLightMoleFraction = rawVaporLight / vaporTotal
    rachfordRiceResidual = residual(vaporFraction, input)
  }

  const liquidFraction = 1 - vaporFraction

  const resultValues = [
    vaporFraction,
    liquidFraction,
    liquidLightMoleFraction,
    vaporLightMoleFraction,
    rachfordRiceResidual,
  ]

  if (
    !resultValues.every(Number.isFinite) ||
    vaporFraction < 0 ||
    vaporFraction > 1 ||
    liquidLightMoleFraction < 0 ||
    liquidLightMoleFraction > 1 ||
    vaporLightMoleFraction < 0 ||
    vaporLightMoleFraction > 1
  ) {
    throw new BinaryFlashCalculationError('numericalFailure')
  }

  return {
    phaseState,
    vaporFraction,
    liquidFraction,
    vaporFlowRate: input.feedFlowRate * vaporFraction,
    liquidFlowRate: input.feedFlowRate * liquidFraction,
    vaporLightMoleFraction,
    liquidLightMoleFraction,
    rachfordRiceResidual,
    modelName:
      'Isothermal binary flash using constant K-values and Rachford–Rice',
  }
}

export function phaseStateTitle(
  phaseState: BinaryFlashPhaseState,
): string {
  switch (phaseState) {
    case 'allLiquid':
      return 'Single liquid phase'
    case 'bubblePoint':
      return 'Bubble-point boundary'
    case 'twoPhase':
      return 'Two-phase flash'
    case 'dewPoint':
      return 'Dew-point boundary'
    case 'allVapor':
      return 'Single vapor phase'
  }
}
