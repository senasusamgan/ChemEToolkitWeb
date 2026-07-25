import type {
  AdiabaticBatchReactorInput,
  AdiabaticBatchReactorResult,
  AdiabaticCSTRInput,
  AdiabaticCSTRResult,
  AdiabaticPFRInput,
  AdiabaticPFRResult,
  AutocatalyticBatchReactorInput,
  AutocatalyticBatchReactorResult,
  AxialDispersionRTDInput,
  AxialDispersionRTDResult,
  BypassFractionEstimatorInput,
  BypassFractionEstimatorResult,
} from './types.ts'

export type ReactionEngineeringBatch01ErrorCode =
  | 'nonFiniteInput'
  | 'invalidAdiabaticBatchInputs'
  | 'invalidAdiabaticCSTRInputs'
  | 'invalidAdiabaticPFRInputs'
  | 'invalidAutocatalyticInputs'
  | 'invalidAxialDispersionInputs'
  | 'invalidBypassInputs'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch01ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidAdiabaticBatchInputs:
    'Concentration, pre-exponential factor, activation energy, reaction order and absolute temperature must be positive. Target conversion must lie above zero and below one.',
  invalidAdiabaticCSTRInputs:
    'Concentration, flow rate, pre-exponential factor, activation energy and absolute temperature must be positive. Target conversion must lie above zero and below one.',
  invalidAdiabaticPFRInputs:
    'Concentration, flow rate, pre-exponential factor, activation energy and absolute temperature must be positive. Target conversion must lie above zero and below one.',
  invalidAutocatalyticInputs:
    'Initial reactant concentration, initial autocatalyst concentration and rate constant must be positive. Target conversion must lie above zero and below one.',
  invalidAxialDispersionInputs:
    'Mean residence time and Peclet number must be positive. Evaluation time cannot be negative.',
  invalidBypassInputs:
    'Recovered, injected, volume and flow values must be positive. Early bypass area cannot be negative or exceed total recovered tracer area.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch01CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch01ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch01ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch01CalculationError'
    this.code = code
  }
}

const gasConstant =
  8.314462618

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'numericalFailure',
      )
  }
}

function validConversion(
  value: number,
): boolean {
  return value > 0 && value < 1
}

function arrheniusRateConstant(
  preExponentialFactor: number,
  activationEnergy: number,
  temperature: number,
): number {
  return (
    preExponentialFactor *
    Math.exp(
      -activationEnergy /
      (
        gasConstant *
        temperature
      ),
    )
  )
}

function simpsonIntegral(
  functionValue:
    (coordinate: number) => number,
  lowerBound: number,
  upperBound: number,
  intervals = 1200,
): number {
  const evenIntervals =
    intervals % 2 === 0
      ? intervals
      : intervals + 1

  const step =
    (
      upperBound -
      lowerBound
    ) /
    evenIntervals

  let sum =
    functionValue(lowerBound) +
    functionValue(upperBound)

  for (
    let index = 1;
    index < evenIntervals;
    index += 1
  ) {
    const coordinate =
      lowerBound +
      index *
      step

    sum +=
      (
        index % 2 === 0
          ? 2
          : 4
      ) *
      functionValue(coordinate)
  }

  return (
    step *
    sum /
    3
  )
}

export function calculateAdiabaticBatchReactor(
  input: AdiabaticBatchReactorInput,
): AdiabaticBatchReactorResult {
  validateFinite(Object.values(input))

  if (
    input.initialConcentration <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.reactionOrder <= 0 ||
    input.inletTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    !validConversion(
      input.targetConversion,
    )
  ) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'invalidAdiabaticBatchInputs',
      )
  }

  const integrand =
    (
      conversion: number,
    ): number => {
      const temperature =
        input.inletTemperature +
        input
          .adiabaticTemperatureRise *
        conversion

      const rateConstant =
        arrheniusRateConstant(
          input.preExponentialFactor,
          input.activationEnergy,
          temperature,
        )

      const concentrationFactor =
        input.initialConcentration **
        (
          input.reactionOrder -
          1
        )

      return (
        1 /
        (
          rateConstant *
          concentrationFactor *
          (
            1 -
            conversion
          ) **
          input.reactionOrder
        )
      )
    }

  const requiredBatchTime =
    simpsonIntegral(
      integrand,
      0,
      input.targetConversion,
    )

  const outletTemperature =
    input.inletTemperature +
    input.adiabaticTemperatureRise *
    input.targetConversion

  const outletConcentration =
    input.initialConcentration *
    (
      1 -
      input.targetConversion
    )

  const initialRateConstant =
    arrheniusRateConstant(
      input.preExponentialFactor,
      input.activationEnergy,
      input.inletTemperature,
    )

  const outletRateConstant =
    arrheniusRateConstant(
      input.preExponentialFactor,
      input.activationEnergy,
      outletTemperature,
    )

  const initialReactionRate =
    initialRateConstant *
    input.initialConcentration **
    input.reactionOrder

  const outletReactionRate =
    outletRateConstant *
    outletConcentration **
    input.reactionOrder

  const temperatureRise =
    outletTemperature -
    input.inletTemperature

  validateResults([
    requiredBatchTime,
    outletTemperature,
    outletConcentration,
    initialRateConstant,
    outletRateConstant,
    initialReactionRate,
    outletReactionRate,
    temperatureRise,
  ])

  return {
    requiredBatchTime,
    outletTemperature,
    outletConcentration,
    initialRateConstant,
    outletRateConstant,
    initialReactionRate,
    outletReactionRate,
    temperatureRise,
  }
}

export function calculateAdiabaticCSTR(
  input: AdiabaticCSTRInput,
): AdiabaticCSTRResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentration <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.inletTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    !validConversion(
      input.targetConversion,
    )
  ) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'invalidAdiabaticCSTRInputs',
      )
  }

  const outletTemperature =
    input.inletTemperature +
    input.adiabaticTemperatureRise *
    input.targetConversion

  const outletRateConstant =
    arrheniusRateConstant(
      input.preExponentialFactor,
      input.activationEnergy,
      outletTemperature,
    )

  const outletConcentration =
    input.inletConcentration *
    (
      1 -
      input.targetConversion
    )

  const outletReactionRate =
    outletRateConstant *
    outletConcentration

  const inletMolarFlowRate =
    input.inletConcentration *
    input.volumetricFlowRate

  const requiredReactorVolume =
    inletMolarFlowRate *
    input.targetConversion /
    outletReactionRate

  const spaceTime =
    requiredReactorVolume /
    input.volumetricFlowRate

  const heatReleaseTemperatureRise =
    outletTemperature -
    input.inletTemperature

  validateResults([
    requiredReactorVolume,
    spaceTime,
    outletTemperature,
    outletConcentration,
    outletRateConstant,
    outletReactionRate,
    inletMolarFlowRate,
    heatReleaseTemperatureRise,
  ])

  return {
    requiredReactorVolume,
    spaceTime,
    outletTemperature,
    outletConcentration,
    outletRateConstant,
    outletReactionRate,
    inletMolarFlowRate,
    heatReleaseTemperatureRise,
  }
}

export function calculateAdiabaticPFR(
  input: AdiabaticPFRInput,
): AdiabaticPFRResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentration <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.inletTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    !validConversion(
      input.targetConversion,
    )
  ) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'invalidAdiabaticPFRInputs',
      )
  }

  const integrationIntervals =
    1200

  const volumeIntegrand =
    (
      conversion: number,
    ): number => {
      const temperature =
        input.inletTemperature +
        input
          .adiabaticTemperatureRise *
        conversion

      const rateConstant =
        arrheniusRateConstant(
          input.preExponentialFactor,
          input.activationEnergy,
          temperature,
        )

      return (
        input.volumetricFlowRate /
        (
          rateConstant *
          (
            1 -
            conversion
          )
        )
      )
    }

  const requiredReactorVolume =
    simpsonIntegral(
      volumeIntegrand,
      0,
      input.targetConversion,
      integrationIntervals,
    )

  const spaceTime =
    requiredReactorVolume /
    input.volumetricFlowRate

  const outletTemperature =
    input.inletTemperature +
    input.adiabaticTemperatureRise *
    input.targetConversion

  const outletConcentration =
    input.inletConcentration *
    (
      1 -
      input.targetConversion
    )

  const outletRateConstant =
    arrheniusRateConstant(
      input.preExponentialFactor,
      input.activationEnergy,
      outletTemperature,
    )

  const inletMolarFlowRate =
    input.inletConcentration *
    input.volumetricFlowRate

  const averageRateConstant =
    input.targetConversion > 0
      ? (
          input.volumetricFlowRate *
          -Math.log(
            1 -
            input.targetConversion
          )
        ) /
        requiredReactorVolume
      : 0

  validateResults([
    requiredReactorVolume,
    spaceTime,
    outletTemperature,
    outletConcentration,
    outletRateConstant,
    inletMolarFlowRate,
    averageRateConstant,
    integrationIntervals,
  ])

  return {
    requiredReactorVolume,
    spaceTime,
    outletTemperature,
    outletConcentration,
    outletRateConstant,
    inletMolarFlowRate,
    averageRateConstant,
    integrationIntervals,
  }
}

export function calculateAutocatalyticBatchReactor(
  input: AutocatalyticBatchReactorInput,
): AutocatalyticBatchReactorResult {
  validateFinite(Object.values(input))

  if (
    input.initialReactantConcentration <= 0 ||
    input.initialAutocatalystConcentration <= 0 ||
    input.rateConstant <= 0 ||
    !validConversion(
      input.targetConversion,
    )
  ) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'invalidAutocatalyticInputs',
      )
  }

  const totalReactiveConcentration =
    input.initialReactantConcentration +
    input.initialAutocatalystConcentration

  const outletReactantConcentration =
    input.initialReactantConcentration *
    (
      1 -
      input.targetConversion
    )

  const outletAutocatalystConcentration =
    input.initialAutocatalystConcentration +
    input.initialReactantConcentration *
    input.targetConversion

  const requiredBatchTime =
    Math.log(
      outletAutocatalystConcentration /
      (
        input
          .initialAutocatalystConcentration *
        (
          1 -
          input.targetConversion
        )
      ),
    ) /
    (
      input.rateConstant *
      totalReactiveConcentration
    )

  const initialReactionRate =
    input.rateConstant *
    input.initialReactantConcentration *
    input.initialAutocatalystConcentration

  const outletReactionRate =
    input.rateConstant *
    outletReactantConcentration *
    outletAutocatalystConcentration

  const unconstrainedPeakConversion =
    (
      input.initialReactantConcentration -
      input.initialAutocatalystConcentration
    ) /
    (
      2 *
      input.initialReactantConcentration
    )

  const peakRateConversion =
    Math.max(
      0,
      Math.min(
        1,
        unconstrainedPeakConversion,
      ),
    )

  const peakReactantConcentration =
    input.initialReactantConcentration *
    (
      1 -
      peakRateConversion
    )

  const peakAutocatalystConcentration =
    input.initialAutocatalystConcentration +
    input.initialReactantConcentration *
    peakRateConversion

  const peakReactionRate =
    input.rateConstant *
    peakReactantConcentration *
    peakAutocatalystConcentration

  validateResults([
    requiredBatchTime,
    outletReactantConcentration,
    outletAutocatalystConcentration,
    initialReactionRate,
    outletReactionRate,
    peakRateConversion,
    peakReactionRate,
    totalReactiveConcentration,
  ])

  return {
    requiredBatchTime,
    outletReactantConcentration,
    outletAutocatalystConcentration,
    initialReactionRate,
    outletReactionRate,
    peakRateConversion,
    peakReactionRate,
    totalReactiveConcentration,
  }
}

function dimensionlessAxialDensity(
  dimensionlessTime: number,
  pecletNumber: number,
): number {
  if (
    dimensionlessTime <= 0
  ) {
    return 0
  }

  return (
    Math.sqrt(
      pecletNumber /
      (
        4 *
        Math.PI *
        dimensionlessTime
      ),
    ) *
    Math.exp(
      -pecletNumber *
      (
        1 -
        dimensionlessTime
      ) **
      2 /
      (
        4 *
        dimensionlessTime
      ),
    )
  )
}

export function calculateAxialDispersionRTD(
  input: AxialDispersionRTDInput,
): AxialDispersionRTDResult {
  validateFinite(Object.values(input))

  if (
    input.meanResidenceTime <= 0 ||
    input.pecletNumber <= 0 ||
    input.evaluationTime < 0
  ) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'invalidAxialDispersionInputs',
      )
  }

  const dimensionlessTime =
    input.evaluationTime /
    input.meanResidenceTime

  const dispersionNumber =
    1 /
    input.pecletNumber

  const dimensionlessVariance =
    2 /
    input.pecletNumber

  const residenceTimeStandardDeviation =
    input.meanResidenceTime *
    Math.sqrt(
      dimensionlessVariance,
    )

  const dimensionlessExitAgeDensity =
    dimensionlessAxialDensity(
      dimensionlessTime,
      input.pecletNumber,
    )

  const exitAgeDensity =
    dimensionlessExitAgeDensity /
    input.meanResidenceTime

  let cumulativeExitFraction = 0

  if (
    dimensionlessTime > 0
  ) {
    const lower =
      1e-8

    cumulativeExitFraction =
      Math.max(
        0,
        Math.min(
          1,
          simpsonIntegral(
            (
              coordinate,
            ) =>
              dimensionlessAxialDensity(
                coordinate,
                input.pecletNumber,
              ),
            lower,
            dimensionlessTime,
            1600,
          ),
        ),
      )
  }

  const tailFraction =
    1 -
    cumulativeExitFraction

  validateResults([
    dimensionlessTime,
    dispersionNumber,
    dimensionlessVariance,
    residenceTimeStandardDeviation,
    exitAgeDensity,
    dimensionlessExitAgeDensity,
    cumulativeExitFraction,
    tailFraction,
  ])

  return {
    dimensionlessTime,
    dispersionNumber,
    dimensionlessVariance,
    residenceTimeStandardDeviation,
    exitAgeDensity,
    dimensionlessExitAgeDensity,
    cumulativeExitFraction,
    tailFraction,
  }
}

export function calculateBypassFractionEstimator(
  input: BypassFractionEstimatorInput,
): BypassFractionEstimatorResult {
  validateFinite(Object.values(input))

  if (
    input.earlyBypassTracerArea < 0 ||
    input.totalRecoveredTracerArea <= 0 ||
    input.injectedTracerArea <= 0 ||
    input.earlyBypassTracerArea >
      input.totalRecoveredTracerArea ||
    input.reactorVolume <= 0 ||
    input.totalVolumetricFlowRate <= 0
  ) {
    throw new
      ReactionEngineeringBatch01CalculationError(
        'invalidBypassInputs',
      )
  }

  const bypassFraction =
    input.earlyBypassTracerArea /
    input.totalRecoveredTracerArea

  const activeFlowFraction =
    1 -
    bypassFraction

  const tracerRecoveryFraction =
    input.totalRecoveredTracerArea /
    input.injectedTracerArea

  const bypassFlowRate =
    input.totalVolumetricFlowRate *
    bypassFraction

  const activeFlowRate =
    input.totalVolumetricFlowRate *
    activeFlowFraction

  const nominalSpaceTime =
    input.reactorVolume /
    input.totalVolumetricFlowRate

  const activePathSpaceTime =
    activeFlowRate > 0
      ? input.reactorVolume /
        activeFlowRate
      : Number.MAX_VALUE

  const bypassSeverityBand =
    bypassFraction < 0.01
      ? 'Negligible screening bypass'
      : bypassFraction < 0.05
        ? 'Low bypass fraction'
        : bypassFraction < 0.15
          ? 'Moderate bypass fraction'
          : 'High bypass fraction'

  validateResults([
    bypassFraction,
    activeFlowFraction,
    tracerRecoveryFraction,
    bypassFlowRate,
    activeFlowRate,
    nominalSpaceTime,
    activePathSpaceTime,
  ])

  return {
    bypassFraction,
    activeFlowFraction,
    tracerRecoveryFraction,
    bypassFlowRate,
    activeFlowRate,
    nominalSpaceTime,
    activePathSpaceTime,
    bypassSeverityBand,
  }
}
