import type {
  BlockDiagramAlgebraInput,
  BlockDiagramAlgebraResult,
} from './types.ts'

export type BlockDiagramAlgebraErrorCode =
  | 'nonFiniteInput'
  | 'singularFeedbackDenominator'
  | 'numericalFailure'

const messages: Record<BlockDiagramAlgebraErrorCode, string> = {
  nonFiniteInput:
    'All block-diagram inputs must be finite.',
  singularFeedbackDenominator:
    'The negative-feedback denominator 1 + GH is zero or too close to zero.',
  numericalFailure:
    'The block-diagram calculation produced a non-finite result.',
}

export class BlockDiagramAlgebraCalculationError extends Error {
  readonly code: BlockDiagramAlgebraErrorCode

  constructor(code: BlockDiagramAlgebraErrorCode) {
    super(messages[code])
    this.name = 'BlockDiagramAlgebraCalculationError'
    this.code = code
  }
}

export function calculateBlockDiagramAlgebra(
  input: BlockDiagramAlgebraInput,
): BlockDiagramAlgebraResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new BlockDiagramAlgebraCalculationError('nonFiniteInput')
  }

  const seriesForwardGain =
    input.firstForwardGain * input.secondForwardGain
  const loopGain = seriesForwardGain * input.feedbackGain
  const denominator = 1 + loopGain

  if (Math.abs(denominator) < 1e-12) {
    throw new BlockDiagramAlgebraCalculationError(
      'singularFeedbackDenominator',
    )
  }

  const closedLoopGain = seriesForwardGain / denominator
  const outputSignal = closedLoopGain * input.inputSignal
  const errorSignal = input.inputSignal / denominator
  const sensitivity = 1 / denominator

  const results = [
    seriesForwardGain,
    loopGain,
    closedLoopGain,
    outputSignal,
    errorSignal,
    sensitivity,
  ]

  if (!results.every(Number.isFinite)) {
    throw new BlockDiagramAlgebraCalculationError('numericalFailure')
  }

  return {
    seriesForwardGain,
    loopGain,
    closedLoopGain,
    outputSignal,
    errorSignal,
    sensitivity,
    modelName:
      'Two series forward blocks with a single negative-feedback path',
    limitationDescription:
      'The calculation uses scalar steady-state gains. Dynamic transfer functions, summing-junction placement and positive feedback require a more detailed model.',
  }
}
