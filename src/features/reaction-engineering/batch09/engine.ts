import type {
  ArrheniusThreePointFitInput,
  ArrheniusThreePointFitResult,
  SeriesParallelReactionsInput,
  SeriesParallelReactionsResult,
  StepResponseRTDAnalysisInput,
  StepResponseRTDAnalysisResult,
  TanksInSeriesRTDInput,
  TanksInSeriesRTDResult,
} from './types.ts'

export type ReactionEngineeringBatch09ErrorCode =
  | 'nonFiniteInput'
  | 'invalidSeriesParallelInputs'
  | 'invalidStepResponseInputs'
  | 'incompleteStepResponse'
  | 'invalidTanksInputs'
  | 'invalidArrheniusInputs'
  | 'duplicateArrheniusTemperatures'
  | 'nonPhysicalArrheniusSlope'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch09ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidSeriesParallelInputs:
    'Initial concentration, all three rate constants and reaction time must be positive.',
  invalidStepResponseInputs:
    'Provide at least four equal-length time and response arrays. Times must be nonnegative and strictly increasing. Responses must remain from zero through one and cannot decrease.',
  incompleteStepResponse:
    'The observation window must capture at least 95% of the final normalized step response.',
  invalidTanksInputs:
    'Mean residence time must be positive, tank count must be a positive integer, and evaluation time cannot be negative.',
  invalidArrheniusInputs:
    'All temperatures and rate constants must be positive.',
  duplicateArrheniusTemperatures:
    'The three Arrhenius temperatures must be distinct.',
  nonPhysicalArrheniusSlope:
    'The fitted Arrhenius slope does not correspond to a positive activation energy.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch09CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch09ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch09ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch09CalculationError'
    this.code = code
  }
}

const gasConstant = 8.314462618

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch09CalculationError(
      'nonFiniteInput',
    )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch09CalculationError(
      'numericalFailure',
    )
  }
}

function intermediateConcentration(
  initialConcentration: number,
  totalAConsumptionRateConstant: number,
  consecutiveRateConstant: number,
  desiredRateConstant: number,
  time: number,
): number {
  if (
    Math.abs(
      consecutiveRateConstant -
      totalAConsumptionRateConstant,
    ) <
    1e-12
  ) {
    return (
      initialConcentration *
      desiredRateConstant *
      time *
      Math.exp(
        -totalAConsumptionRateConstant *
        time,
      )
    )
  }

  return (
    initialConcentration *
    desiredRateConstant /
    (
      consecutiveRateConstant -
      totalAConsumptionRateConstant
    ) *
    (
      Math.exp(
        -totalAConsumptionRateConstant *
        time,
      ) -
      Math.exp(
        -consecutiveRateConstant *
        time,
      )
    )
  )
}

export function calculateSeriesParallelReactions(
  input: SeriesParallelReactionsInput,
): SeriesParallelReactionsResult {
  validateFinite(Object.values(input))

  if (
    input.initialConcentrationA <= 0 ||
    input.desiredRateConstant <= 0 ||
    input.consecutiveRateConstant <= 0 ||
    input.parallelUndesiredRateConstant <= 0 ||
    input.reactionTime <= 0
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'invalidSeriesParallelInputs',
    )
  }

  const totalAConsumptionRateConstant =
    input.desiredRateConstant +
    input.parallelUndesiredRateConstant

  const concentrationA =
    input.initialConcentrationA *
    Math.exp(
      -totalAConsumptionRateConstant *
      input.reactionTime,
    )

  const concentrationDesiredIntermediateB =
    intermediateConcentration(
      input.initialConcentrationA,
      totalAConsumptionRateConstant,
      input.consecutiveRateConstant,
      input.desiredRateConstant,
      input.reactionTime,
    )

  const reactedConcentrationA =
    input.initialConcentrationA -
    concentrationA

  const concentrationParallelProductD =
    reactedConcentrationA *
    input.parallelUndesiredRateConstant /
    totalAConsumptionRateConstant

  const concentrationConsecutiveProductC =
    Math.max(
      0,
      reactedConcentrationA *
      input.desiredRateConstant /
      totalAConsumptionRateConstant -
      concentrationDesiredIntermediateB,
    )

  const conversionA =
    reactedConcentrationA /
    input.initialConcentrationA

  const desiredIntermediateYield =
    concentrationDesiredIntermediateB /
    input.initialConcentrationA

  const consecutiveProductYield =
    concentrationConsecutiveProductC /
    input.initialConcentrationA

  const parallelProductYield =
    concentrationParallelProductD /
    input.initialConcentrationA

  const undesiredProducts =
    concentrationConsecutiveProductC +
    concentrationParallelProductD

  const desiredIntermediateSelectivity =
    undesiredProducts > 0
      ? concentrationDesiredIntermediateB /
        undesiredProducts
      : Number.MAX_VALUE

  const optimumTimeForIntermediate =
    Math.abs(
      input.consecutiveRateConstant -
      totalAConsumptionRateConstant,
    ) <
    1e-12
      ? 1 /
        totalAConsumptionRateConstant
      : Math.log(
          input.consecutiveRateConstant /
          totalAConsumptionRateConstant,
        ) /
        (
          input.consecutiveRateConstant -
          totalAConsumptionRateConstant
        )

  const maximumIntermediateConcentration =
    intermediateConcentration(
      input.initialConcentrationA,
      totalAConsumptionRateConstant,
      input.consecutiveRateConstant,
      input.desiredRateConstant,
      optimumTimeForIntermediate,
    )

  const massBalanceResidual =
    Math.abs(
      input.initialConcentrationA -
      (
        concentrationA +
        concentrationDesiredIntermediateB +
        concentrationConsecutiveProductC +
        concentrationParallelProductD
      ),
    )

  validateResults([
    concentrationA,
    concentrationDesiredIntermediateB,
    concentrationConsecutiveProductC,
    concentrationParallelProductD,
    conversionA,
    desiredIntermediateYield,
    consecutiveProductYield,
    parallelProductYield,
    desiredIntermediateSelectivity,
    optimumTimeForIntermediate,
    maximumIntermediateConcentration,
    massBalanceResidual,
  ])

  return {
    concentrationA,
    concentrationDesiredIntermediateB,
    concentrationConsecutiveProductC,
    concentrationParallelProductD,
    conversionA,
    desiredIntermediateYield,
    consecutiveProductYield,
    parallelProductYield,
    desiredIntermediateSelectivity,
    optimumTimeForIntermediate,
    maximumIntermediateConcentration,
    massBalanceResidual,
  }
}

function interpolateThreshold(
  times: number[],
  cumulative: number[],
  target: number,
): number {
  if (target <= cumulative[0]) {
    return times[0]
  }

  for (
    let index = 1;
    index < cumulative.length;
    index += 1
  ) {
    if (
      cumulative[index] >= target
    ) {
      const span =
        cumulative[index] -
        cumulative[index - 1]

      const fraction =
        span > 0
          ? (
              target -
              cumulative[index - 1]
            ) /
            span
          : 0

      return (
        times[index - 1] +
        fraction *
        (
          times[index] -
          times[index - 1]
        )
      )
    }
  }

  return times[
    times.length -
    1
  ]
}

export function calculateStepResponseRTDAnalysis(
  input: StepResponseRTDAnalysisInput,
): StepResponseRTDAnalysisResult {
  validateFinite([
    ...input.times,
    ...input.normalizedOutletResponses,
  ])

  if (
    input.times.length < 4 ||
    input.times.length !==
      input.normalizedOutletResponses.length ||
    input.times.some(
      (
        time,
        index,
      ) =>
        time < 0 ||
        (
          index > 0 &&
          time <=
            input.times[index - 1]
        ),
    ) ||
    input.normalizedOutletResponses.some(
      (
        response,
        index,
      ) =>
        response < 0 ||
        response > 1 ||
        (
          index > 0 &&
          response <
            input.normalizedOutletResponses[index - 1]
        ),
    )
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'invalidStepResponseInputs',
    )
  }

  const finalResponse =
    input.normalizedOutletResponses[
      input.normalizedOutletResponses.length -
      1
    ]

  if (
    finalResponse < 0.95
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'incompleteStepResponse',
    )
  }

  const normalizedResponses =
    input.normalizedOutletResponses.map(
      (response) =>
        response /
        finalResponse,
    )

  const intervalEValues: number[] = []
  const intervalMidpointTimes: number[] = []

  let meanResidenceTime = 0
  let firstRawMoment = 0
  let secondRawMoment = 0

  for (
    let index = 1;
    index < input.times.length;
    index += 1
  ) {
    const deltaTime =
      input.times[index] -
      input.times[index - 1]

    const eValue =
      (
        normalizedResponses[index] -
        normalizedResponses[index - 1]
      ) /
      deltaTime

    const midpoint =
      (
        input.times[index] +
        input.times[index - 1]
      ) /
      2

    intervalEValues.push(eValue)
    intervalMidpointTimes.push(midpoint)

    const intervalProbability =
      eValue *
      deltaTime

    firstRawMoment +=
      midpoint *
      intervalProbability

    secondRawMoment +=
      midpoint **
      2 *
      intervalProbability

    meanResidenceTime +=
      deltaTime *
      (
        (
          1 -
          normalizedResponses[index - 1]
        ) +
        (
          1 -
          normalizedResponses[index]
        )
      ) /
      2
  }

  const immediateBypassFraction =
    normalizedResponses[0]

  const distributedProbability =
    1 -
    immediateBypassFraction

  if (
    distributedProbability > 1e-12
  ) {
    firstRawMoment /=
      distributedProbability

    secondRawMoment /=
      distributedProbability
  }

  const variance =
    Math.max(
      0,
      secondRawMoment -
      firstRawMoment **
      2,
    )

  const standardDeviation =
    Math.sqrt(variance)

  const dimensionlessVariance =
    meanResidenceTime > 0
      ? variance /
        meanResidenceTime **
        2
      : 0

  const timeAtTenPercent =
    interpolateThreshold(
      input.times,
      normalizedResponses,
      0.1,
    )

  const medianResidenceTime =
    interpolateThreshold(
      input.times,
      normalizedResponses,
      0.5,
    )

  const timeAtNinetyPercent =
    interpolateThreshold(
      input.times,
      normalizedResponses,
      0.9,
    )

  validateResults([
    ...normalizedResponses,
    ...intervalEValues,
    ...intervalMidpointTimes,
    immediateBypassFraction,
    finalResponse,
    finalResponse,
    meanResidenceTime,
    variance,
    standardDeviation,
    dimensionlessVariance,
    timeAtTenPercent,
    medianResidenceTime,
    timeAtNinetyPercent,
  ])

  return {
    normalizedResponses,
    intervalEValues,
    intervalMidpointTimes,
    immediateBypassFraction,
    finalResponse,
    responseCompleteness:
      finalResponse,
    meanResidenceTime,
    variance,
    standardDeviation,
    dimensionlessVariance,
    timeAtTenPercent,
    medianResidenceTime,
    timeAtNinetyPercent,
  }
}

function factorial(
  value: number,
): number {
  let result = 1

  for (
    let index = 2;
    index <= value;
    index += 1
  ) {
    result *= index
  }

  return result
}

function dimensionlessDensity(
  tanks: number,
  dimensionlessTime: number,
): number {
  if (
    dimensionlessTime === 0
  ) {
    return tanks === 1
      ? 1
      : 0
  }

  return (
    tanks **
    tanks /
    factorial(
      tanks -
      1,
    ) *
    dimensionlessTime **
    (
      tanks -
      1
    ) *
    Math.exp(
      -tanks *
      dimensionlessTime,
    )
  )
}

export function calculateTanksInSeriesRTD(
  input: TanksInSeriesRTDInput,
): TanksInSeriesRTDResult {
  validateFinite(Object.values(input))

  if (
    input.meanResidenceTime <= 0 ||
    input.tanksInSeries <= 0 ||
    !Number.isInteger(
      input.tanksInSeries,
    ) ||
    input.evaluationTime < 0
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'invalidTanksInputs',
    )
  }

  const dimensionlessTime =
    input.evaluationTime /
    input.meanResidenceTime

  const dimensionlessExitAgeDensity =
    dimensionlessDensity(
      input.tanksInSeries,
      dimensionlessTime,
    )

  const exitAgeDensity =
    dimensionlessExitAgeDensity /
    input.meanResidenceTime

  const scaledTime =
    input.tanksInSeries *
    dimensionlessTime

  let tailSeries = 0

  for (
    let index = 0;
    index < input.tanksInSeries;
    index += 1
  ) {
    tailSeries +=
      scaledTime **
      index /
      factorial(index)
  }

  const tailFraction =
    Math.exp(
      -scaledTime,
    ) *
    tailSeries

  const cumulativeExitFraction =
    Math.max(
      0,
      Math.min(
        1,
        1 -
        tailFraction,
      ),
    )

  const dimensionlessVariance =
    1 /
    input.tanksInSeries

  const residenceTimeVariance =
    input.meanResidenceTime **
    2 /
    input.tanksInSeries

  const residenceTimeStandardDeviation =
    Math.sqrt(
      residenceTimeVariance,
    )

  const modalResidenceTime =
    input.tanksInSeries > 1
      ? input.meanResidenceTime *
        (
          input.tanksInSeries -
          1
        ) /
        input.tanksInSeries
      : 0

  const peakDimensionlessTime =
    input.tanksInSeries > 1
      ? (
          input.tanksInSeries -
          1
        ) /
        input.tanksInSeries
      : 0

  const peakExitAgeDensity =
    dimensionlessDensity(
      input.tanksInSeries,
      peakDimensionlessTime,
    ) /
    input.meanResidenceTime

  const mixingInterpretation =
    input.tanksInSeries === 1
      ? 'Equivalent to an ideal CSTR RTD'
      : input.tanksInSeries < 5
        ? 'Broad tanks-in-series RTD'
        : input.tanksInSeries < 20
          ? 'Moderately narrow tanks-in-series RTD'
          : 'Narrow RTD approaching plug flow'

  validateResults([
    dimensionlessTime,
    exitAgeDensity,
    cumulativeExitFraction,
    tailFraction,
    dimensionlessVariance,
    residenceTimeVariance,
    residenceTimeStandardDeviation,
    modalResidenceTime,
    peakExitAgeDensity,
  ])

  return {
    dimensionlessTime,
    exitAgeDensity,
    cumulativeExitFraction,
    tailFraction,
    dimensionlessVariance,
    residenceTimeVariance,
    residenceTimeStandardDeviation,
    modalResidenceTime,
    peakExitAgeDensity,
    mixingInterpretation,
  }
}

export function calculateArrheniusThreePointFit(
  input: ArrheniusThreePointFitInput,
): ArrheniusThreePointFitResult {
  validateFinite(Object.values(input))

  const temperatures = [
    input.temperatureOne,
    input.temperatureTwo,
    input.temperatureThree,
  ]

  const rateConstants = [
    input.rateConstantOne,
    input.rateConstantTwo,
    input.rateConstantThree,
  ]

  if (
    temperatures.some(
      (temperature) =>
        temperature <= 0,
    ) ||
    rateConstants.some(
      (rateConstant) =>
        rateConstant <= 0,
    ) ||
    input.targetTemperature <= 0
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'invalidArrheniusInputs',
    )
  }

  const uniqueTemperatures =
    new Set(
      temperatures.map(
        (temperature) =>
          temperature.toPrecision(15),
      ),
    )

  if (
    uniqueTemperatures.size !== 3
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'duplicateArrheniusTemperatures',
    )
  }

  const xValues =
    temperatures.map(
      (temperature) =>
        1 /
        temperature,
    )

  const yValues =
    rateConstants.map(
      (rateConstant) =>
        Math.log(rateConstant),
    )

  const meanX =
    xValues.reduce(
      (
        sum,
        value,
      ) =>
        sum +
        value,
      0,
    ) /
    xValues.length

  const meanY =
    yValues.reduce(
      (
        sum,
        value,
      ) =>
        sum +
        value,
      0,
    ) /
    yValues.length

  let covariance = 0
  let varianceX = 0

  for (
    let index = 0;
    index < xValues.length;
    index += 1
  ) {
    covariance +=
      (
        xValues[index] -
        meanX
      ) *
      (
        yValues[index] -
        meanY
      )

    varianceX +=
      (
        xValues[index] -
        meanX
      ) **
      2
  }

  const arrheniusSlope =
    covariance /
    varianceX

  if (
    arrheniusSlope >= 0
  ) {
    throw new ReactionEngineeringBatch09CalculationError(
      'nonPhysicalArrheniusSlope',
    )
  }

  const interceptLnA =
    meanY -
    arrheniusSlope *
    meanX

  const activationEnergy =
    -arrheniusSlope *
    gasConstant

  const preExponentialFactor =
    Math.exp(
      interceptLnA,
    )

  const predictedRateConstantAtTarget =
    preExponentialFactor *
    Math.exp(
      -activationEnergy /
      (
        gasConstant *
        input.targetTemperature
      ),
    )

  const fittedLogValues =
    xValues.map(
      (xValue) =>
        interceptLnA +
        arrheniusSlope *
        xValue,
    )

  const fittedRateConstants =
    fittedLogValues.map(Math.exp)

  const residuals =
    yValues.map(
      (
        value,
        index,
      ) =>
        value -
        fittedLogValues[index],
    )

  const sumSquaredResiduals =
    residuals.reduce(
      (
        sum,
        residual,
      ) =>
        sum +
        residual **
        2,
      0,
    )

  const totalSumSquares =
    yValues.reduce(
      (
        sum,
        value,
      ) =>
        sum +
        (
          value -
          meanY
        ) **
        2,
      0,
    )

  const coefficientOfDetermination =
    totalSumSquares > 0
      ? 1 -
        sumSquaredResiduals /
        totalSumSquares
      : 1

  const rootMeanSquareLogError =
    Math.sqrt(
      sumSquaredResiduals /
      yValues.length,
    )

  const relativeResiduals =
    rateConstants.map(
      (
        observed,
        index,
      ) =>
        (
          fittedRateConstants[index] -
          observed
        ) /
        observed,
    )

  const fitQualityDescription =
    coefficientOfDetermination >= 0.999
      ? 'Excellent three-point Arrhenius linearity'
      : coefficientOfDetermination >= 0.98
        ? 'Good Arrhenius linearity'
        : 'Noticeable deviation from a single Arrhenius line'

  validateResults([
    activationEnergy,
    preExponentialFactor,
    interceptLnA,
    arrheniusSlope,
    predictedRateConstantAtTarget,
    coefficientOfDetermination,
    rootMeanSquareLogError,
    ...fittedRateConstants,
    ...relativeResiduals,
  ])

  return {
    activationEnergy,
    preExponentialFactor,
    interceptLnA,
    arrheniusSlope,
    predictedRateConstantAtTarget,
    coefficientOfDetermination,
    rootMeanSquareLogError,
    fittedRateConstants,
    relativeResiduals,
    fitQualityDescription,
  }
}
