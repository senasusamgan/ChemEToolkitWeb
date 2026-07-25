import type {
  RTDModelComparisonInput,
  RTDModelComparisonResult,
  RTDMomentsInput,
  RTDMomentsResult,
  ReversibleReactionsInput,
  ReversibleReactionsResult,
  SegregationModelConversionInput,
  SegregationModelConversionResult,
  SemibatchReactorInput,
  SemibatchReactorResult,
  SeriesReactionsInput,
  SeriesReactionsResult,
} from './types.ts'

export type ReactionEngineeringBatch08ErrorCode =
  | 'nonFiniteInput'
  | 'invalidReversibleInputs'
  | 'invalidRTDModelInputs'
  | 'invalidRTDMomentInputs'
  | 'invalidSegregationInputs'
  | 'invalidSemibatchInputs'
  | 'invalidSeriesInputs'
  | 'numericalFailure'

const messages: Record<ReactionEngineeringBatch08ErrorCode, string> = {
  nonFiniteInput: 'All calculator inputs must be finite.',
  invalidReversibleInputs:
    'Initial concentrations cannot be negative, their sum must be positive, both rate constants must be positive, and reaction time cannot be negative.',
  invalidRTDModelInputs:
    'Mean residence time, residence-time variance and first-order rate constant must be positive.',
  invalidRTDMomentInputs:
    'Provide at least three equal-length time and tracer arrays. Times must be nonnegative and strictly increasing, tracer values must be nonnegative, and the integrated tracer area must be positive.',
  invalidSegregationInputs:
    'Provide at least three equal-length time and E-value arrays. Times must be nonnegative and strictly increasing, E values must be nonnegative, their integrated area must be positive, and rate constant must be positive.',
  invalidSemibatchInputs:
    'Initial volume, initial A concentration, feed rate, feed B concentration, second-order rate constant and feed duration must be positive.',
  invalidSeriesInputs:
    'Initial concentration, both first-order rate constants and reaction time must be positive.',
  numericalFailure: 'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch08CalculationError extends Error {
  readonly code: ReactionEngineeringBatch08ErrorCode

  constructor(code: ReactionEngineeringBatch08ErrorCode) {
    super(messages[code])
    this.name = 'ReactionEngineeringBatch08CalculationError'
    this.code = code
  }
}

function ensureFinite(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch08CalculationError('nonFiniteInput')
  }
}

function ensureResults(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch08CalculationError('numericalFailure')
  }
}

function validateCurve(
  times: number[],
  values: number[],
  code: 'invalidRTDMomentInputs' | 'invalidSegregationInputs',
): void {
  if (
    times.length < 3 ||
    times.length !== values.length ||
    times.some((time, index) =>
      time < 0 || (index > 0 && time <= times[index - 1])) ||
    values.some((value) => value < 0)
  ) {
    throw new ReactionEngineeringBatch08CalculationError(code)
  }
}

function trapezoid(times: number[], values: number[]): number {
  let area = 0
  for (let index = 1; index < times.length; index += 1) {
    area +=
      (times[index] - times[index - 1]) *
      (values[index] + values[index - 1]) /
      2
  }
  return area
}

function cumulativeTrapezoid(times: number[], values: number[]): number[] {
  const cumulative = new Array<number>(times.length).fill(0)
  for (let index = 1; index < times.length; index += 1) {
    cumulative[index] =
      cumulative[index - 1] +
      (times[index] - times[index - 1]) *
      (values[index] + values[index - 1]) /
      2
  }
  return cumulative
}

function percentileTime(
  times: number[],
  cumulative: number[],
  target: number,
): number {
  for (let index = 1; index < cumulative.length; index += 1) {
    if (cumulative[index] >= target) {
      const span = cumulative[index] - cumulative[index - 1]
      const fraction = span > 0
        ? (target - cumulative[index - 1]) / span
        : 0
      return times[index - 1] + fraction * (times[index] - times[index - 1])
    }
  }
  return times[times.length - 1]
}

export function calculateReversibleReactions(
  input: ReversibleReactionsInput,
): ReversibleReactionsResult {
  ensureFinite(Object.values(input))
  const total = input.initialConcentrationA + input.initialConcentrationB

  if (
    input.initialConcentrationA < 0 ||
    input.initialConcentrationB < 0 ||
    total <= 0 ||
    input.forwardRateConstant <= 0 ||
    input.reverseRateConstant <= 0 ||
    input.reactionTime < 0
  ) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidReversibleInputs',
    )
  }

  const totalRate = input.forwardRateConstant + input.reverseRateConstant
  const equilibriumConcentrationA =
    total * input.reverseRateConstant / totalRate
  const equilibriumConcentrationB = total - equilibriumConcentrationA
  const decay = Math.exp(-totalRate * input.reactionTime)
  const finalConcentrationA =
    equilibriumConcentrationA +
    (input.initialConcentrationA - equilibriumConcentrationA) * decay
  const finalConcentrationB = total - finalConcentrationA
  const conversionA = input.initialConcentrationA > 0
    ? (input.initialConcentrationA - finalConcentrationA) /
      input.initialConcentrationA
    : 0
  const equilibriumConversionA = input.initialConcentrationA > 0
    ? (input.initialConcentrationA - equilibriumConcentrationA) /
      input.initialConcentrationA
    : 0
  const initialDistance = Math.abs(
    input.initialConcentrationA - equilibriumConcentrationA,
  )
  const fractionOfEquilibriumApproach = initialDistance > 1e-15
    ? 1 - Math.abs(finalConcentrationA - equilibriumConcentrationA) /
      initialDistance
    : 1
  const relaxationTime = 1 / totalRate
  const equilibriumConstant =
    input.forwardRateConstant / input.reverseRateConstant

  ensureResults([
    finalConcentrationA,
    finalConcentrationB,
    equilibriumConcentrationA,
    equilibriumConcentrationB,
    conversionA,
    equilibriumConversionA,
    fractionOfEquilibriumApproach,
    relaxationTime,
    equilibriumConstant,
  ])

  return {
    finalConcentrationA,
    finalConcentrationB,
    equilibriumConcentrationA,
    equilibriumConcentrationB,
    conversionA,
    equilibriumConversionA,
    fractionOfEquilibriumApproach,
    relaxationTime,
    equilibriumConstant,
  }
}

export function calculateRTDModelComparison(
  input: RTDModelComparisonInput,
): RTDModelComparisonResult {
  ensureFinite(Object.values(input))
  if (
    input.meanResidenceTime <= 0 ||
    input.residenceTimeVariance <= 0 ||
    input.firstOrderRateConstant <= 0
  ) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidRTDModelInputs',
    )
  }

  const dimensionlessVariance =
    input.residenceTimeVariance / input.meanResidenceTime ** 2
  const equivalentTanksInSeries = 1 / dimensionlessVariance
  const equivalentPecletNumber = 2 / dimensionlessVariance
  const damkohlerNumber =
    input.firstOrderRateConstant * input.meanResidenceTime
  const idealPFRConversion = 1 - Math.exp(-damkohlerNumber)
  const idealCSTRConversion = damkohlerNumber / (1 + damkohlerNumber)
  const tanksInSeriesConversion =
    1 - (1 + damkohlerNumber / equivalentTanksInSeries) **
    (-equivalentTanksInSeries)

  const root = Math.sqrt(
    1 + 4 * damkohlerNumber / equivalentPecletNumber,
  )
  const numerator =
    4 * root * Math.exp(equivalentPecletNumber / 2)
  const denominator =
    (1 + root) ** 2 *
    Math.exp(root * equivalentPecletNumber / 2) -
    (1 - root) ** 2 *
    Math.exp(-root * equivalentPecletNumber / 2)
  const axialDispersionConversion = 1 - numerator / denominator
  const tanksDeviationFromPFR =
    idealPFRConversion - tanksInSeriesConversion
  const dispersionDeviationFromPFR =
    idealPFRConversion - axialDispersionConversion
  const modelInterpretation = dimensionlessVariance < 0.05
    ? 'Narrow RTD: behavior is close to plug flow.'
    : dimensionlessVariance < 0.25
      ? 'Moderate RTD spread: nonideal mixing is significant.'
      : 'Broad RTD: behavior moves toward mixed-flow performance.'

  ensureResults([
    dimensionlessVariance,
    equivalentTanksInSeries,
    equivalentPecletNumber,
    damkohlerNumber,
    idealPFRConversion,
    idealCSTRConversion,
    tanksInSeriesConversion,
    axialDispersionConversion,
    tanksDeviationFromPFR,
    dispersionDeviationFromPFR,
  ])

  return {
    dimensionlessVariance,
    equivalentTanksInSeries,
    equivalentPecletNumber,
    damkohlerNumber,
    idealPFRConversion,
    idealCSTRConversion,
    tanksInSeriesConversion,
    axialDispersionConversion,
    tanksDeviationFromPFR,
    dispersionDeviationFromPFR,
    modelInterpretation,
  }
}

export function calculateRTDMoments(
  input: RTDMomentsInput,
): RTDMomentsResult {
  ensureFinite([...input.times, ...input.tracerConcentrations])
  validateCurve(
    input.times,
    input.tracerConcentrations,
    'invalidRTDMomentInputs',
  )
  const tracerArea = trapezoid(input.times, input.tracerConcentrations)
  if (tracerArea <= 0) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidRTDMomentInputs',
    )
  }

  const normalizedEValues = input.tracerConcentrations.map(
    (value) => value / tracerArea,
  )
  const cumulativeRaw = cumulativeTrapezoid(input.times, normalizedEValues)
  const scale = cumulativeRaw[cumulativeRaw.length - 1]
  const cumulativeFValues = cumulativeRaw.map((value) => value / scale)
  const meanResidenceTime = trapezoid(
    input.times,
    input.times.map((time, index) => time * normalizedEValues[index]),
  )
  const variance = trapezoid(
    input.times,
    input.times.map(
      (time, index) =>
        (time - meanResidenceTime) ** 2 * normalizedEValues[index],
    ),
  )
  const standardDeviation = Math.sqrt(variance)
  const dimensionlessVariance = variance / meanResidenceTime ** 2
  const thirdCentralMoment = trapezoid(
    input.times,
    input.times.map(
      (time, index) =>
        (time - meanResidenceTime) ** 3 * normalizedEValues[index],
    ),
  )
  const skewness = standardDeviation > 0
    ? thirdCentralMoment / standardDeviation ** 3
    : 0
  const timeAtTenPercent = percentileTime(
    input.times,
    cumulativeFValues,
    0.1,
  )
  const medianResidenceTime = percentileTime(
    input.times,
    cumulativeFValues,
    0.5,
  )
  const timeAtNinetyPercent = percentileTime(
    input.times,
    cumulativeFValues,
    0.9,
  )

  ensureResults([
    tracerArea,
    ...normalizedEValues,
    ...cumulativeFValues,
    meanResidenceTime,
    variance,
    standardDeviation,
    dimensionlessVariance,
    skewness,
    timeAtTenPercent,
    medianResidenceTime,
    timeAtNinetyPercent,
  ])

  return {
    tracerArea,
    normalizedEValues,
    cumulativeFValues,
    meanResidenceTime,
    variance,
    standardDeviation,
    dimensionlessVariance,
    skewness,
    timeAtTenPercent,
    medianResidenceTime,
    timeAtNinetyPercent,
  }
}

export function calculateSegregationModelConversion(
  input: SegregationModelConversionInput,
): SegregationModelConversionResult {
  ensureFinite([...input.times, ...input.eValues, input.firstOrderRateConstant])
  validateCurve(input.times, input.eValues, 'invalidSegregationInputs')
  if (input.firstOrderRateConstant <= 0) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidSegregationInputs',
    )
  }

  const area = trapezoid(input.times, input.eValues)
  if (area <= 0) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidSegregationInputs',
    )
  }

  const normalizedEValues = input.eValues.map((value) => value / area)
  const segregationOutletFractionA = trapezoid(
    input.times,
    input.times.map(
      (time, index) =>
        Math.exp(-input.firstOrderRateConstant * time) *
        normalizedEValues[index],
    ),
  )
  const segregationConversion = 1 - segregationOutletFractionA
  const meanResidenceTime = trapezoid(
    input.times,
    input.times.map((time, index) => time * normalizedEValues[index]),
  )
  const damkohlerNumber =
    input.firstOrderRateConstant * meanResidenceTime
  const idealPFRConversionAtMeanTime = 1 - Math.exp(-damkohlerNumber)
  const idealCSTRConversionAtMeanTime =
    damkohlerNumber / (1 + damkohlerNumber)
  const conversionRelativeToPFR =
    segregationConversion / idealPFRConversionAtMeanTime
  const conversionRelativeToCSTR =
    segregationConversion / idealCSTRConversionAtMeanTime
  const integrationSegments = input.times.length - 1

  ensureResults([
    ...normalizedEValues,
    segregationOutletFractionA,
    segregationConversion,
    meanResidenceTime,
    idealPFRConversionAtMeanTime,
    idealCSTRConversionAtMeanTime,
    conversionRelativeToPFR,
    conversionRelativeToCSTR,
    integrationSegments,
  ])

  return {
    normalizedEValues,
    segregationOutletFractionA,
    segregationConversion,
    meanResidenceTime,
    idealPFRConversionAtMeanTime,
    idealCSTRConversionAtMeanTime,
    conversionRelativeToPFR,
    conversionRelativeToCSTR,
    integrationSegments,
  }
}

interface SemibatchState {
  molesA: number
  molesB: number
  molesProduct: number
  volume: number
}

export function calculateSemibatchReactor(
  input: SemibatchReactorInput,
): SemibatchReactorResult {
  ensureFinite(Object.values(input))
  if (
    input.initialLiquidVolume <= 0 ||
    input.initialConcentrationA <= 0 ||
    input.feedVolumetricFlowRate <= 0 ||
    input.feedConcentrationB <= 0 ||
    input.secondOrderRateConstant <= 0 ||
    input.feedDuration <= 0
  ) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidSemibatchInputs',
    )
  }

  const integrationSteps = 5000
  const step = input.feedDuration / integrationSteps
  const derivative = (state: SemibatchState): SemibatchState => {
    const concentrationA = Math.max(state.molesA / state.volume, 0)
    const concentrationB = Math.max(state.molesB / state.volume, 0)
    const reactionRateMoles =
      input.secondOrderRateConstant *
      concentrationA *
      concentrationB *
      state.volume
    return {
      molesA: -reactionRateMoles,
      molesB:
        input.feedVolumetricFlowRate * input.feedConcentrationB -
        reactionRateMoles,
      molesProduct: reactionRateMoles,
      volume: input.feedVolumetricFlowRate,
    }
  }
  const shifted = (
    state: SemibatchState,
    slope: SemibatchState,
    multiplier: number,
  ): SemibatchState => ({
    molesA: state.molesA + multiplier * slope.molesA,
    molesB: state.molesB + multiplier * slope.molesB,
    molesProduct: state.molesProduct + multiplier * slope.molesProduct,
    volume: state.volume + multiplier * slope.volume,
  })

  let state: SemibatchState = {
    molesA: input.initialLiquidVolume * input.initialConcentrationA,
    molesB: 0,
    molesProduct: 0,
    volume: input.initialLiquidVolume,
  }
  const initialMolesA = state.molesA

  for (let index = 0; index < integrationSteps; index += 1) {
    const k1 = derivative(state)
    const k2 = derivative(shifted(state, k1, step / 2))
    const k3 = derivative(shifted(state, k2, step / 2))
    const k4 = derivative(shifted(state, k3, step))
    state = {
      molesA:
        state.molesA + step *
        (k1.molesA + 2 * k2.molesA + 2 * k3.molesA + k4.molesA) / 6,
      molesB:
        state.molesB + step *
        (k1.molesB + 2 * k2.molesB + 2 * k3.molesB + k4.molesB) / 6,
      molesProduct:
        state.molesProduct + step *
        (k1.molesProduct + 2 * k2.molesProduct +
          2 * k3.molesProduct + k4.molesProduct) / 6,
      volume:
        state.volume + step *
        (k1.volume + 2 * k2.volume + 2 * k3.volume + k4.volume) / 6,
    }
    state.molesA = Math.max(state.molesA, 0)
    state.molesB = Math.max(state.molesB, 0)
    state.molesProduct = Math.max(state.molesProduct, 0)
  }

  const finalLiquidVolume = state.volume
  const finalMolesA = state.molesA
  const finalMolesB = state.molesB
  const finalMolesProduct = state.molesProduct
  const finalConcentrationA = finalMolesA / finalLiquidVolume
  const finalConcentrationB = finalMolesB / finalLiquidVolume
  const finalProductConcentration = finalMolesProduct / finalLiquidVolume
  const conversionA = (initialMolesA - finalMolesA) / initialMolesA
  const fedMolesB =
    input.feedVolumetricFlowRate * input.feedConcentrationB * input.feedDuration
  const productYieldFromA = finalMolesProduct / initialMolesA

  ensureResults([
    finalLiquidVolume,
    finalMolesA,
    finalMolesB,
    finalMolesProduct,
    finalConcentrationA,
    finalConcentrationB,
    finalProductConcentration,
    conversionA,
    fedMolesB,
    productYieldFromA,
    integrationSteps,
  ])

  return {
    finalLiquidVolume,
    finalMolesA,
    finalMolesB,
    finalMolesProduct,
    finalConcentrationA,
    finalConcentrationB,
    finalProductConcentration,
    conversionA,
    fedMolesB,
    productYieldFromA,
    integrationSteps,
  }
}

function intermediateConcentration(
  initialConcentration: number,
  firstRateConstant: number,
  secondRateConstant: number,
  time: number,
): number {
  if (Math.abs(firstRateConstant - secondRateConstant) < 1e-12) {
    return initialConcentration * firstRateConstant * time *
      Math.exp(-firstRateConstant * time)
  }
  return initialConcentration * firstRateConstant /
    (secondRateConstant - firstRateConstant) *
    (Math.exp(-firstRateConstant * time) -
      Math.exp(-secondRateConstant * time))
}

export function calculateSeriesReactions(
  input: SeriesReactionsInput,
): SeriesReactionsResult {
  ensureFinite(Object.values(input))
  if (
    input.initialConcentrationA <= 0 ||
    input.firstReactionRateConstant <= 0 ||
    input.secondReactionRateConstant <= 0 ||
    input.reactionTime <= 0
  ) {
    throw new ReactionEngineeringBatch08CalculationError(
      'invalidSeriesInputs',
    )
  }

  const concentrationA = input.initialConcentrationA *
    Math.exp(-input.firstReactionRateConstant * input.reactionTime)
  const concentrationIntermediateB = intermediateConcentration(
    input.initialConcentrationA,
    input.firstReactionRateConstant,
    input.secondReactionRateConstant,
    input.reactionTime,
  )
  const concentrationFinalC = Math.max(
    0,
    input.initialConcentrationA - concentrationA - concentrationIntermediateB,
  )
  const conversionA = 1 - concentrationA / input.initialConcentrationA
  const intermediateYield =
    concentrationIntermediateB / input.initialConcentrationA
  const finalProductYield = concentrationFinalC / input.initialConcentrationA
  const optimumTimeForIntermediate = Math.abs(
    input.firstReactionRateConstant - input.secondReactionRateConstant,
  ) < 1e-12
    ? 1 / input.firstReactionRateConstant
    : Math.log(
        input.secondReactionRateConstant / input.firstReactionRateConstant,
      ) /
      (input.secondReactionRateConstant - input.firstReactionRateConstant)
  const maximumIntermediateConcentration = intermediateConcentration(
    input.initialConcentrationA,
    input.firstReactionRateConstant,
    input.secondReactionRateConstant,
    optimumTimeForIntermediate,
  )
  const intermediateSelectivityOverFinal = concentrationFinalC > 0
    ? concentrationIntermediateB / concentrationFinalC
    : Number.MAX_VALUE
  const massBalanceResidual = Math.abs(
    input.initialConcentrationA -
    (concentrationA + concentrationIntermediateB + concentrationFinalC),
  )

  ensureResults([
    concentrationA,
    concentrationIntermediateB,
    concentrationFinalC,
    conversionA,
    intermediateYield,
    finalProductYield,
    optimumTimeForIntermediate,
    maximumIntermediateConcentration,
    intermediateSelectivityOverFinal,
    massBalanceResidual,
  ])

  return {
    concentrationA,
    concentrationIntermediateB,
    concentrationFinalC,
    conversionA,
    intermediateYield,
    finalProductYield,
    optimumTimeForIntermediate,
    maximumIntermediateConcentration,
    intermediateSelectivityOverFinal,
    massBalanceResidual,
  }
}
