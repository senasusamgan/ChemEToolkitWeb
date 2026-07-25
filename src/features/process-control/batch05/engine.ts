import type {
  AdaptiveControlInput,
  AdaptiveControlResult,
  MIMODecouplingInput,
  MIMODecouplingResult,
  RatioControlInput,
  RatioControlResult,
  SecondOrderFrequencyResponseInput,
  SecondOrderFrequencyResponseResult,
  SmithPredictorInput,
  SmithPredictorResult,
  SplitRangeControlInput,
  SplitRangeControlResult,
} from './types.ts'

export type ProcessControlBatch05ErrorCode =
  | 'nonFiniteInput'
  | 'singularMatrix'
  | 'invalidAdaptationSettings'
  | 'invalidRatioSettings'
  | 'invalidSecondOrderSettings'
  | 'invalidSmithPredictorSettings'
  | 'invalidSplitRangeSettings'
  | 'numericalFailure'

const messages: Record<ProcessControlBatch05ErrorCode, string> = {
  nonFiniteInput: 'All calculator inputs must be finite.',
  singularMatrix:
    'The 2×2 process-gain matrix is singular or too close to singular.',
  invalidAdaptationSettings:
    'Adaptation gain, sample time and normalization constant must be greater than zero.',
  invalidRatioSettings:
    'Wild flow and desired ratio must be positive, and output limits must be ordered.',
  invalidSecondOrderSettings:
    'Natural frequency and damping ratio must be greater than zero, and angular frequency cannot be negative.',
  invalidSmithPredictorSettings:
    'Process gains and time constants must be positive; dead times and evaluation time cannot be negative.',
  invalidSplitRangeSettings:
    'Demand and split settings must be within 0–100%, and valve maximums must exceed minimums.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessControlBatch05CalculationError extends Error {
  readonly code: ProcessControlBatch05ErrorCode

  constructor(code: ProcessControlBatch05ErrorCode) {
    super(messages[code])
    this.name = 'ProcessControlBatch05CalculationError'
    this.code = code
  }
}

function validateFinite(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ProcessControlBatch05CalculationError(
      'nonFiniteInput',
    )
  }
}

function validateResults(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ProcessControlBatch05CalculationError(
      'numericalFailure',
    )
  }
}

export function calculateMIMODecoupling(
  input: MIMODecouplingInput,
): MIMODecouplingResult {
  validateFinite(Object.values(input))

  const determinant =
    input.k11 * input.k22 -
    input.k12 * input.k21

  if (Math.abs(determinant) < 1e-12) {
    throw new ProcessControlBatch05CalculationError(
      'singularMatrix',
    )
  }

  const manipulatedInput1 =
    (
      input.k22 * input.outputTarget1 -
      input.k12 * input.outputTarget2
    ) /
    determinant

  const manipulatedInput2 =
    (
      -input.k21 * input.outputTarget1 +
      input.k11 * input.outputTarget2
    ) /
    determinant

  const relativeGain11 =
    input.k11 * input.k22 / determinant
  const relativeGain12 =
    -input.k12 * input.k21 / determinant
  const relativeGain21 = relativeGain12
  const relativeGain22 = relativeGain11

  const matrixInfinityNorm = Math.max(
    Math.abs(input.k11) + Math.abs(input.k12),
    Math.abs(input.k21) + Math.abs(input.k22),
  )

  const inverseInfinityNorm = Math.max(
    (Math.abs(input.k22) + Math.abs(input.k12)) /
      Math.abs(determinant),
    (Math.abs(input.k21) + Math.abs(input.k11)) /
      Math.abs(determinant),
  )

  const conditionEstimate =
    matrixInfinityNorm * inverseInfinityNorm

  const interactionIndex =
    Math.abs(relativeGain12) +
    Math.abs(relativeGain21)

  validateResults([
    determinant,
    manipulatedInput1,
    manipulatedInput2,
    relativeGain11,
    relativeGain12,
    relativeGain21,
    relativeGain22,
    conditionEstimate,
    interactionIndex,
  ])

  return {
    determinant,
    manipulatedInput1,
    manipulatedInput2,
    relativeGain11,
    relativeGain12,
    relativeGain21,
    relativeGain22,
    conditionEstimate,
    interactionIndex,
  }
}

export function calculateAdaptiveControl(
  input: AdaptiveControlInput,
): AdaptiveControlResult {
  validateFinite(Object.values(input))

  if (
    input.adaptationGain <= 0 ||
    input.sampleTime <= 0 ||
    input.normalizationConstant <= 0
  ) {
    throw new ProcessControlBatch05CalculationError(
      'invalidAdaptationSettings',
    )
  }

  const predictedOutputBeforeUpdate =
    input.currentGainEstimate * input.manipulatedInput +
    input.currentBiasEstimate

  const predictionError =
    input.measuredOutput -
    predictedOutputBeforeUpdate

  const denominator =
    input.normalizationConstant +
    input.manipulatedInput ** 2 +
    1

  const normalizedAdaptationStep =
    input.adaptationGain *
    input.sampleTime /
    denominator

  const updatedGainEstimate =
    input.currentGainEstimate +
    normalizedAdaptationStep *
    predictionError *
    input.manipulatedInput

  const updatedBiasEstimate =
    input.currentBiasEstimate +
    normalizedAdaptationStep *
    predictionError

  const predictedOutputAfterUpdate =
    updatedGainEstimate * input.manipulatedInput +
    updatedBiasEstimate

  validateResults([
    predictedOutputBeforeUpdate,
    predictionError,
    updatedGainEstimate,
    updatedBiasEstimate,
    predictedOutputAfterUpdate,
    normalizedAdaptationStep,
  ])

  return {
    predictedOutputBeforeUpdate,
    predictionError,
    updatedGainEstimate,
    updatedBiasEstimate,
    predictedOutputAfterUpdate,
    normalizedAdaptationStep,
  }
}

export function calculateRatioControl(
  input: RatioControlInput,
): RatioControlResult {
  validateFinite(Object.values(input))

  if (
    input.wildFlow <= 0 ||
    input.desiredRatio <= 0 ||
    input.maximumOutput <= input.minimumOutput
  ) {
    throw new ProcessControlBatch05CalculationError(
      'invalidRatioSettings',
    )
  }

  const controlledFlowSetpoint =
    input.desiredRatio * input.wildFlow

  const flowError =
    controlledFlowSetpoint -
    input.measuredControlledFlow

  const rawControllerOutput =
    input.controllerBias +
    input.controllerGain * flowError

  const controllerOutput = Math.min(
    input.maximumOutput,
    Math.max(input.minimumOutput, rawControllerOutput),
  )

  const outputWasLimited =
    controllerOutput !== rawControllerOutput

  const actualMeasuredRatio =
    input.measuredControlledFlow /
    input.wildFlow

  validateResults([
    controlledFlowSetpoint,
    flowError,
    rawControllerOutput,
    controllerOutput,
    actualMeasuredRatio,
  ])

  return {
    controlledFlowSetpoint,
    flowError,
    rawControllerOutput,
    controllerOutput,
    outputWasLimited,
    actualMeasuredRatio,
  }
}

export function calculateSecondOrderFrequencyResponse(
  input: SecondOrderFrequencyResponseInput,
): SecondOrderFrequencyResponseResult {
  validateFinite(Object.values(input))

  if (
    input.naturalFrequency <= 0 ||
    input.dampingRatio <= 0 ||
    input.angularFrequency < 0
  ) {
    throw new ProcessControlBatch05CalculationError(
      'invalidSecondOrderSettings',
    )
  }

  const normalizedFrequency =
    input.angularFrequency /
    input.naturalFrequency

  const realDenominator =
    1 - normalizedFrequency ** 2
  const imaginaryDenominator =
    2 * input.dampingRatio * normalizedFrequency

  const denominatorMagnitudeSquared =
    realDenominator ** 2 +
    imaginaryDenominator ** 2

  const realPart =
    input.processGain *
    realDenominator /
    denominatorMagnitudeSquared

  const rawImaginaryPart =
    -input.processGain *
    imaginaryDenominator /
    denominatorMagnitudeSquared

  const imaginaryPart =
    Math.abs(rawImaginaryPart) < 1e-15
      ? 0
      : rawImaginaryPart

  const magnitudeRatio =
    Math.abs(input.processGain) /
    Math.sqrt(denominatorMagnitudeSquared)

  const magnitudeDecibels =
    20 * Math.log10(magnitudeRatio)

  const rawPhaseDegrees =
    -Math.atan2(
      imaginaryDenominator,
      realDenominator,
    ) *
    180 /
    Math.PI

  const phaseDegrees =
    Math.abs(rawPhaseDegrees) < 1e-15
      ? 0
      : rawPhaseDegrees

  const resonantFrequency =
    input.dampingRatio < 1 / Math.sqrt(2)
      ? input.naturalFrequency *
        Math.sqrt(1 - 2 * input.dampingRatio ** 2)
      : null

  const resonantPeak =
    input.dampingRatio < 1 / Math.sqrt(2)
      ? Math.abs(input.processGain) /
        (
          2 *
          input.dampingRatio *
          Math.sqrt(1 - input.dampingRatio ** 2)
        )
      : null

  validateResults([
    magnitudeRatio,
    magnitudeDecibels,
    phaseDegrees,
    realPart,
    imaginaryPart,
    normalizedFrequency,
    ...(resonantFrequency === null
      ? []
      : [resonantFrequency]),
    ...(resonantPeak === null ? [] : [resonantPeak]),
  ])

  return {
    magnitudeRatio,
    magnitudeDecibels,
    phaseDegrees,
    realPart,
    imaginaryPart,
    normalizedFrequency,
    resonantFrequency,
    resonantPeak,
  }
}

export function calculateSmithPredictor(
  input: SmithPredictorInput,
): SmithPredictorResult {
  validateFinite(Object.values(input))

  if (
    input.actualProcessGain <= 0 ||
    input.actualTimeConstant <= 0 ||
    input.modelProcessGain <= 0 ||
    input.modelTimeConstant <= 0 ||
    input.actualDeadTime < 0 ||
    input.modelDeadTime < 0 ||
    input.evaluationTime < 0
  ) {
    throw new ProcessControlBatch05CalculationError(
      'invalidSmithPredictorSettings',
    )
  }

  const modelLoopGain =
    input.controllerGain *
    input.modelProcessGain

  const denominator =
    1 + modelLoopGain

  if (denominator <= 0) {
    throw new ProcessControlBatch05CalculationError(
      'invalidSmithPredictorSettings',
    )
  }

  const nominalClosedLoopGain =
    modelLoopGain / denominator

  const nominalClosedLoopTimeConstant =
    input.modelTimeConstant / denominator

  const delayFreePrediction =
    nominalClosedLoopGain *
    input.setpointStep *
    (
      1 -
      Math.exp(
        -input.evaluationTime /
        nominalClosedLoopTimeConstant,
      )
    )

  const modelActiveTime =
    Math.max(
      0,
      input.evaluationTime - input.modelDeadTime,
    )

  const delayedModelPrediction =
    nominalClosedLoopGain *
    input.setpointStep *
    (
      modelActiveTime === 0
        ? 0
        : 1 -
          Math.exp(
            -modelActiveTime /
            nominalClosedLoopTimeConstant,
          )
    )

  const effectiveResponseTime =
    Math.max(
      0,
      input.evaluationTime - input.actualDeadTime,
    )

  const approximateActualClosedLoopGain =
    input.controllerGain *
    input.actualProcessGain /
    (
      1 +
      input.controllerGain *
      input.modelProcessGain
    )

  const approximateActualTimeConstant =
    input.actualTimeConstant / denominator

  const approximateActualOutput =
    approximateActualClosedLoopGain *
    input.setpointStep *
    (
      effectiveResponseTime === 0
        ? 0
        : 1 -
          Math.exp(
            -effectiveResponseTime /
            approximateActualTimeConstant,
          )
    )

  const modelMismatch =
    approximateActualOutput -
    delayedModelPrediction

  validateResults([
    modelLoopGain,
    nominalClosedLoopGain,
    nominalClosedLoopTimeConstant,
    delayFreePrediction,
    delayedModelPrediction,
    approximateActualOutput,
    modelMismatch,
    effectiveResponseTime,
  ])

  return {
    modelLoopGain,
    nominalClosedLoopGain,
    nominalClosedLoopTimeConstant,
    delayFreePrediction,
    delayedModelPrediction,
    approximateActualOutput,
    modelMismatch,
    effectiveResponseTime,
  }
}

export function calculateSplitRangeControl(
  input: SplitRangeControlInput,
): SplitRangeControlResult {
  validateFinite(Object.values(input))

  const percentages = [
    input.controllerDemandPercent,
    input.splitPointPercent,
    input.overlapBandPercent,
    input.firstValveMinimumPercent,
    input.firstValveMaximumPercent,
    input.secondValveMinimumPercent,
    input.secondValveMaximumPercent,
  ]

  if (
    percentages.some(
      (value) => value < 0 || value > 100,
    ) ||
    input.firstValveMaximumPercent <=
      input.firstValveMinimumPercent ||
    input.secondValveMaximumPercent <=
      input.secondValveMinimumPercent
  ) {
    throw new ProcessControlBatch05CalculationError(
      'invalidSplitRangeSettings',
    )
  }

  const halfOverlap =
    input.overlapBandPercent / 2

  const firstEnd =
    Math.min(
      100,
      input.splitPointPercent + halfOverlap,
    )

  const secondStart =
    Math.max(
      0,
      input.splitPointPercent - halfOverlap,
    )

  const firstValveSpanFraction =
    firstEnd <= 0
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            input.controllerDemandPercent / firstEnd,
          ),
        )

  const secondValveSpanFraction =
    secondStart >= 100
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            (
              input.controllerDemandPercent -
              secondStart
            ) /
            (
              100 -
              secondStart
            ),
          ),
        )

  const firstValveOpeningPercent =
    input.firstValveMinimumPercent +
    firstValveSpanFraction *
    (
      input.firstValveMaximumPercent -
      input.firstValveMinimumPercent
    )

  const secondValveOpeningPercent =
    input.secondValveMinimumPercent +
    secondValveSpanFraction *
    (
      input.secondValveMaximumPercent -
      input.secondValveMinimumPercent
    )

  const simultaneousOperation =
    firstValveSpanFraction > 0 &&
    firstValveSpanFraction < 1 &&
    secondValveSpanFraction > 0 &&
    secondValveSpanFraction < 1

  const activeRegion =
    input.controllerDemandPercent < secondStart
      ? 'First-valve region'
      : input.controllerDemandPercent > firstEnd
        ? 'Second-valve region'
        : input.overlapBandPercent > 0
          ? 'Overlap region'
          : 'Split point'

  validateResults([
    firstValveOpeningPercent,
    secondValveOpeningPercent,
    firstValveSpanFraction,
    secondValveSpanFraction,
  ])

  return {
    firstValveOpeningPercent,
    secondValveOpeningPercent,
    activeRegion,
    simultaneousOperation,
    firstValveSpanFraction,
    secondValveSpanFraction,
  }
}
