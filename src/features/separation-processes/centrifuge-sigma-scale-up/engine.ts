import type {
  CentrifugeSigmaScaleUpInput,
  CentrifugeSigmaScaleUpResult,
} from './types.ts'

export type CentrifugeSigmaScaleUpErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'efficiencyOutOfRange'
  | 'numericalFailure'

const messages: Record<
  CentrifugeSigmaScaleUpErrorCode,
  string
> = {
  nonFiniteInput:
    'All centrifuge scale-up inputs must be finite.',
  nonPositiveProperty:
    'Laboratory throughput and both sigma values must be greater than zero.',
  efficiencyOutOfRange:
    'Efficiency factors must satisfy 0 < η ≤ 1.',
  numericalFailure:
    'The sigma scale-up calculation did not produce a finite physical result.',
}

export class CentrifugeSigmaScaleUpCalculationError extends Error {
  readonly code: CentrifugeSigmaScaleUpErrorCode

  constructor(code: CentrifugeSigmaScaleUpErrorCode) {
    super(messages[code])
    this.name =
      'CentrifugeSigmaScaleUpCalculationError'
    this.code = code
  }
}

export function calculateCentrifugeSigmaScaleUp(
  input: CentrifugeSigmaScaleUpInput,
): CentrifugeSigmaScaleUpResult {
  const values = [
    input.laboratoryThroughput,
    input.laboratorySigma,
    input.industrialSigma,
    input.laboratoryEfficiency,
    input.industrialEfficiency,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CentrifugeSigmaScaleUpCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.laboratoryThroughput <= 0 ||
    input.laboratorySigma <= 0 ||
    input.industrialSigma <= 0
  ) {
    throw new CentrifugeSigmaScaleUpCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.laboratoryEfficiency <= 0 ||
    input.laboratoryEfficiency > 1 ||
    input.industrialEfficiency <= 0 ||
    input.industrialEfficiency > 1
  ) {
    throw new CentrifugeSigmaScaleUpCalculationError(
      'efficiencyOutOfRange',
    )
  }

  const sigmaRatio =
    input.industrialSigma /
    input.laboratorySigma

  const efficiencyRatio =
    input.industrialEfficiency /
    input.laboratoryEfficiency

  const predictedIndustrialThroughput =
    input.laboratoryThroughput *
    sigmaRatio *
    efficiencyRatio

  const equivalentClarificationVelocity =
    input.laboratoryThroughput /
    (
      input.laboratorySigma *
      input.laboratoryEfficiency
    )

  const requiredSigmaForTargetThroughput =
    input.laboratoryThroughput /
    (
      equivalentClarificationVelocity *
      input.industrialEfficiency
    )

  const results = [
    sigmaRatio,
    efficiencyRatio,
    predictedIndustrialThroughput,
    equivalentClarificationVelocity,
    requiredSigmaForTargetThroughput,
  ]

  if (
    !results.every(Number.isFinite) ||
    sigmaRatio <= 0 ||
    efficiencyRatio <= 0 ||
    predictedIndustrialThroughput <= 0 ||
    equivalentClarificationVelocity <= 0 ||
    requiredSigmaForTargetThroughput <= 0
  ) {
    throw new CentrifugeSigmaScaleUpCalculationError(
      'numericalFailure',
    )
  }

  return {
    sigmaRatio,
    efficiencyRatio,
    predictedIndustrialThroughput,
    equivalentClarificationVelocity,
    requiredSigmaForTargetThroughput,
    modelName:
      'Sigma-theory centrifuge throughput scale-up',
    limitationDescription:
      'Assumes equal feed properties, particle settling behavior and separation target between laboratory and industrial units.',
  }
}
