import type {
  InternalModelControlAnalysisInput,
  InternalModelControlAnalysisResult,
} from './types.ts'

export type InternalModelControlAnalysisErrorCode =
  | 'nonFiniteInput'
  | 'zeroProcessGain'
  | 'nonPositiveTimeConstant'
  | 'negativeDeadTime'
  | 'nonPositiveFilterTimeConstant'
  | 'negativeAngularFrequency'
  | 'singularRobustnessDenominator'
  | 'numericalFailure'

const messages: Record<
  InternalModelControlAnalysisErrorCode,
  string
> = {
  nonFiniteInput:
    'All internal-model-control inputs must be finite.',
  zeroProcessGain:
    'Actual and model process gains cannot be zero.',
  nonPositiveTimeConstant:
    'Actual and model time constants must be greater than zero.',
  negativeDeadTime:
    'Actual and model dead times cannot be negative.',
  nonPositiveFilterTimeConstant:
    'Filter time constant must be greater than zero.',
  negativeAngularFrequency:
    'Angular frequency cannot be negative.',
  singularRobustnessDenominator:
    'The IMC robustness denominator is zero or too close to zero.',
  numericalFailure:
    'The internal-model-control analysis produced a non-finite result.',
}

export class InternalModelControlAnalysisCalculationError extends Error {
  readonly code: InternalModelControlAnalysisErrorCode

  constructor(code: InternalModelControlAnalysisErrorCode) {
    super(messages[code])
    this.name =
      'InternalModelControlAnalysisCalculationError'
    this.code = code
  }
}

interface Complex {
  real: number
  imaginary: number
}

function add(left: Complex, right: Complex): Complex {
  return {
    real: left.real + right.real,
    imaginary: left.imaginary + right.imaginary,
  }
}

function subtract(
  left: Complex,
  right: Complex,
): Complex {
  return {
    real: left.real - right.real,
    imaginary: left.imaginary - right.imaginary,
  }
}

function multiply(
  left: Complex,
  right: Complex,
): Complex {
  return {
    real:
      left.real * right.real -
      left.imaginary * right.imaginary,
    imaginary:
      left.real * right.imaginary +
      left.imaginary * right.real,
  }
}

function divide(
  numerator: Complex,
  denominator: Complex,
): Complex {
  const scale =
    denominator.real ** 2 +
    denominator.imaginary ** 2

  if (scale < 1e-24) {
    throw new InternalModelControlAnalysisCalculationError(
      'singularRobustnessDenominator',
    )
  }

  return {
    real:
      (
        numerator.real * denominator.real +
        numerator.imaginary * denominator.imaginary
      ) /
      scale,
    imaginary:
      (
        numerator.imaginary * denominator.real -
        numerator.real * denominator.imaginary
      ) /
      scale,
  }
}

function magnitude(value: Complex): number {
  return Math.hypot(
    value.real,
    value.imaginary,
  )
}

function phaseDegrees(value: Complex): number {
  return (
    Math.atan2(
      value.imaginary,
      value.real,
    ) *
    180 /
    Math.PI
  )
}

function firstOrderWithDelay(
  gain: number,
  timeConstant: number,
  deadTime: number,
  angularFrequency: number,
): Complex {
  const normalizedFrequency =
    angularFrequency * timeConstant

  const base: Complex = {
    real:
      gain /
      (1 + normalizedFrequency ** 2),
    imaginary:
      -gain *
      normalizedFrequency /
      (1 + normalizedFrequency ** 2),
  }

  const angle =
    -angularFrequency * deadTime

  const delay: Complex = {
    real: Math.cos(angle),
    imaginary: Math.sin(angle),
  }

  return multiply(base, delay)
}

export function calculateInternalModelControlAnalysis(
  input: InternalModelControlAnalysisInput,
): InternalModelControlAnalysisResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new InternalModelControlAnalysisCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    Math.abs(input.actualProcessGain) < 1e-15 ||
    Math.abs(input.modelProcessGain) < 1e-15
  ) {
    throw new InternalModelControlAnalysisCalculationError(
      'zeroProcessGain',
    )
  }

  if (
    input.actualTimeConstant <= 0 ||
    input.modelTimeConstant <= 0
  ) {
    throw new InternalModelControlAnalysisCalculationError(
      'nonPositiveTimeConstant',
    )
  }

  if (
    input.actualDeadTime < 0 ||
    input.modelDeadTime < 0
  ) {
    throw new InternalModelControlAnalysisCalculationError(
      'negativeDeadTime',
    )
  }

  if (input.filterTimeConstant <= 0) {
    throw new InternalModelControlAnalysisCalculationError(
      'nonPositiveFilterTimeConstant',
    )
  }

  if (input.angularFrequency < 0) {
    throw new InternalModelControlAnalysisCalculationError(
      'negativeAngularFrequency',
    )
  }

  const actualProcess =
    firstOrderWithDelay(
      input.actualProcessGain,
      input.actualTimeConstant,
      input.actualDeadTime,
      input.angularFrequency,
    )

  const modelProcess =
    firstOrderWithDelay(
      input.modelProcessGain,
      input.modelTimeConstant,
      input.modelDeadTime,
      input.angularFrequency,
    )

  const inverseModelNumerator: Complex = {
    real: 1,
    imaginary:
      input.angularFrequency *
      input.modelTimeConstant,
  }

  const filterDenominator: Complex = {
    real: 1,
    imaginary:
      input.angularFrequency *
      input.filterTimeConstant,
  }

  const controller =
    divide(
      {
        real:
          inverseModelNumerator.real /
          input.modelProcessGain,
        imaginary:
          inverseModelNumerator.imaginary /
          input.modelProcessGain,
      },
      filterDenominator,
    )

  const actualTimesController =
    multiply(
      actualProcess,
      controller,
    )

  const modelMismatch =
    subtract(
      actualProcess,
      modelProcess,
    )

  const robustnessDenominator =
    add(
      { real: 1, imaginary: 0 },
      multiply(
        controller,
        modelMismatch,
      ),
    )

  const closedLoop =
    divide(
      actualTimesController,
      robustnessDenominator,
    )

  const nominalClosedLoop =
    multiply(
      modelProcess,
      controller,
    )

  const controllerMagnitude =
    magnitude(controller)

  const controllerPhaseDegrees =
    phaseDegrees(controller)

  const closedLoopMagnitude =
    magnitude(closedLoop)

  const closedLoopPhaseDegrees =
    phaseDegrees(closedLoop)

  const modelMismatchMagnitude =
    magnitude(modelMismatch)

  const robustnessDenominatorMagnitude =
    magnitude(robustnessDenominator)

  const nominalClosedLoopMagnitude =
    magnitude(nominalClosedLoop)

  const lowFrequencyControllerGain =
    1 / input.modelProcessGain

  const results = [
    controllerMagnitude,
    controllerPhaseDegrees,
    closedLoopMagnitude,
    closedLoopPhaseDegrees,
    modelMismatchMagnitude,
    robustnessDenominatorMagnitude,
    nominalClosedLoopMagnitude,
    lowFrequencyControllerGain,
  ]

  if (!results.every(Number.isFinite)) {
    throw new InternalModelControlAnalysisCalculationError(
      'numericalFailure',
    )
  }

  return {
    controllerMagnitude,
    controllerPhaseDegrees,
    closedLoopMagnitude,
    closedLoopPhaseDegrees,
    modelMismatchMagnitude,
    robustnessDenominatorMagnitude,
    nominalClosedLoopMagnitude,
    lowFrequencyControllerGain,
    modelName:
      'Frequency-domain IMC analysis for first-order-plus-dead-time actual and model processes',
    limitationDescription:
      'The controller inverts only the stable first-order model factor and uses a first-order robustness filter. Delay inversion, constraints and multivariable interaction are excluded.',
  }
}
