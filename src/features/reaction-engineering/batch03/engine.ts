import type {
  CSTRPFRSequenceInput,
  CSTRPFRSequenceResult,
  DeadVolumeEstimatorInput,
  DeadVolumeEstimatorResult,
  DeactivatingPackedBedReactorInput,
  DeactivatingPackedBedReactorResult,
  ECurveGeneratorInput,
  ECurveGeneratorResult,
  EconomicReactorSelectionInput,
  EconomicReactorSelectionResult,
  EnzymeBatchReactorInput,
  EnzymeBatchReactorResult,
} from './types.ts'

export type ReactionEngineeringBatch03ErrorCode =
  | 'nonFiniteInput'
  | 'invalidSequenceInputs'
  | 'invalidDeactivatingPBRInputs'
  | 'invalidDeadVolumeInputs'
  | 'inconsistentDeadVolumeInputs'
  | 'invalidECurveInputs'
  | 'invalidEconomicInputs'
  | 'invalidEnzymeBatchInputs'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch03ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidSequenceInputs:
    'Inlet concentration, rate constant and total space time must be positive. CSTR space-time fraction must lie from zero through one.',
  invalidDeactivatingPBRInputs:
    'Molar flow, concentration, catalyst weight, rate constant and deactivation constant must be positive. Effectiveness and initial activity must lie above zero and no greater than one, and time-on-stream cannot be negative.',
  invalidDeadVolumeInputs:
    'Nominal volume, volumetric flow rate and measured mean residence time must be positive.',
  inconsistentDeadVolumeInputs:
    'Measured active volume exceeds nominal reactor volume; this simple dead-volume model is not applicable.',
  invalidECurveInputs:
    'Mean residence time must be positive, tanks in series must be a positive integer, and evaluation time cannot be negative.',
  invalidEconomicInputs:
    'Concentration, flow, rate constant and installed cost rates must be positive. Target conversion must lie above zero and below one. Annual operating costs cannot be negative and project life must be a positive integer.',
  invalidEnzymeBatchInputs:
    'Initial substrate concentration, maximum rate and Michaelis constant must be positive. Target conversion must lie above zero and below one.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch03CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch03ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch03ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch03CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'numericalFailure',
      )
  }
}

function validConversion(
  value: number,
): boolean {
  return value > 0 && value < 1
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

export function calculateCSTRPFRSequence(
  input: CSTRPFRSequenceInput,
): CSTRPFRSequenceResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentration <= 0 ||
    input.firstOrderRateConstant <= 0 ||
    input.totalSpaceTime <= 0 ||
    input.cstrSpaceTimeFraction < 0 ||
    input.cstrSpaceTimeFraction > 1
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'invalidSequenceInputs',
      )
  }

  const cstrSpaceTime =
    input.totalSpaceTime *
    input.cstrSpaceTimeFraction

  const pfrSpaceTime =
    input.totalSpaceTime -
    cstrSpaceTime

  const cstrOutletConcentration =
    input.inletConcentration /
    (
      1 +
      input.firstOrderRateConstant *
      cstrSpaceTime
    )

  const finalOutletConcentration =
    cstrOutletConcentration *
    Math.exp(
      -input.firstOrderRateConstant *
      pfrSpaceTime,
    )

  const overallConversion =
    1 -
    finalOutletConcentration /
    input.inletConcentration

  const equivalentIdealPFRConversion =
    1 -
    Math.exp(
      -input.firstOrderRateConstant *
      input.totalSpaceTime,
    )

  const equivalentIdealCSTRConversion =
    input.firstOrderRateConstant *
    input.totalSpaceTime /
    (
      1 +
      input.firstOrderRateConstant *
      input.totalSpaceTime
    )

  const sequenceAdvantageOverCSTR =
    overallConversion -
    equivalentIdealCSTRConversion

  const sequencePenaltyFromPFR =
    equivalentIdealPFRConversion -
    overallConversion

  validateResults([
    cstrSpaceTime,
    pfrSpaceTime,
    cstrOutletConcentration,
    finalOutletConcentration,
    overallConversion,
    equivalentIdealPFRConversion,
    equivalentIdealCSTRConversion,
    sequenceAdvantageOverCSTR,
    sequencePenaltyFromPFR,
  ])

  return {
    cstrSpaceTime,
    pfrSpaceTime,
    cstrOutletConcentration,
    finalOutletConcentration,
    overallConversion,
    equivalentIdealPFRConversion,
    equivalentIdealCSTRConversion,
    sequenceAdvantageOverCSTR,
    sequencePenaltyFromPFR,
  }
}

export function calculateDeactivatingPackedBedReactor(
  input: DeactivatingPackedBedReactorInput,
): DeactivatingPackedBedReactorResult {
  validateFinite(Object.values(input))

  if (
    input.inletMolarFlowRate <= 0 ||
    input.inletConcentration <= 0 ||
    input.catalystWeight <= 0 ||
    input.rateConstantPerCatalystMass <= 0 ||
    input.effectivenessFactor <= 0 ||
    input.effectivenessFactor > 1 ||
    input.initialActivity <= 0 ||
    input.initialActivity > 1 ||
    input.deactivationRateConstant <= 0 ||
    input.timeOnStream < 0
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'invalidDeactivatingPBRInputs',
      )
  }

  const currentActivity =
    input.initialActivity *
    Math.exp(
      -input.deactivationRateConstant *
      input.timeOnStream,
    )

  const retainedActivityPercent =
    currentActivity /
    input.initialActivity *
    100

  const effectiveRateConstant =
    input.rateConstantPerCatalystMass *
    input.effectivenessFactor *
    currentActivity

  const damkohlerNumber =
    effectiveRateConstant *
    input.inletConcentration *
    input.catalystWeight /
    input.inletMolarFlowRate

  const conversion =
    1 -
    Math.exp(
      -damkohlerNumber,
    )

  const outletConcentration =
    input.inletConcentration *
    (
      1 -
      conversion
    )

  const outletMolarFlowRate =
    input.inletMolarFlowRate *
    (
      1 -
      conversion
    )

  const freshDamkohlerNumber =
    input.rateConstantPerCatalystMass *
    input.effectivenessFactor *
    input.initialActivity *
    input.inletConcentration *
    input.catalystWeight /
    input.inletMolarFlowRate

  const freshCatalystConversion =
    1 -
    Math.exp(
      -freshDamkohlerNumber,
    )

  const conversionLoss =
    freshCatalystConversion -
    conversion

  validateResults([
    currentActivity,
    retainedActivityPercent,
    effectiveRateConstant,
    damkohlerNumber,
    conversion,
    outletConcentration,
    outletMolarFlowRate,
    freshCatalystConversion,
    conversionLoss,
  ])

  return {
    currentActivity,
    retainedActivityPercent,
    effectiveRateConstant,
    damkohlerNumber,
    conversion,
    outletConcentration,
    outletMolarFlowRate,
    freshCatalystConversion,
    conversionLoss,
  }
}

export function calculateDeadVolumeEstimator(
  input: DeadVolumeEstimatorInput,
): DeadVolumeEstimatorResult {
  validateFinite(Object.values(input))

  if (
    input.nominalReactorVolume <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.measuredMeanResidenceTime <= 0
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'invalidDeadVolumeInputs',
      )
  }

  const activeReactorVolume =
    input.volumetricFlowRate *
    input.measuredMeanResidenceTime

  if (
    activeReactorVolume >
    input.nominalReactorVolume *
    (
      1 +
      1e-12
    )
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'inconsistentDeadVolumeInputs',
      )
  }

  const estimatedDeadVolume =
    Math.max(
      0,
      input.nominalReactorVolume -
      activeReactorVolume,
    )

  const deadVolumeFraction =
    estimatedDeadVolume /
    input.nominalReactorVolume

  const activeVolumeFraction =
    1 -
    deadVolumeFraction

  const nominalResidenceTime =
    input.nominalReactorVolume /
    input.volumetricFlowRate

  const measuredToNominalTimeRatio =
    input.measuredMeanResidenceTime /
    nominalResidenceTime

  const hydraulicUtilizationPercent =
    activeVolumeFraction *
    100

  const conditionBand =
    deadVolumeFraction < 0.02
      ? 'Negligible estimated dead volume'
      : deadVolumeFraction < 0.1
        ? 'Low estimated dead volume'
        : deadVolumeFraction < 0.25
          ? 'Moderate estimated dead volume'
          : 'High estimated dead volume'

  validateResults([
    activeReactorVolume,
    estimatedDeadVolume,
    deadVolumeFraction,
    activeVolumeFraction,
    nominalResidenceTime,
    measuredToNominalTimeRatio,
    hydraulicUtilizationPercent,
  ])

  return {
    activeReactorVolume,
    estimatedDeadVolume,
    deadVolumeFraction,
    activeVolumeFraction,
    nominalResidenceTime,
    measuredToNominalTimeRatio,
    hydraulicUtilizationPercent,
    conditionBand,
  }
}

export function calculateECurveGenerator(
  input: ECurveGeneratorInput,
): ECurveGeneratorResult {
  validateFinite(Object.values(input))

  if (
    input.meanResidenceTime <= 0 ||
    input.tanksInSeries <= 0 ||
    !Number.isInteger(
      input.tanksInSeries,
    ) ||
    input.evaluationTime < 0
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'invalidECurveInputs',
      )
  }

  const dimensionlessTime =
    input.evaluationTime /
    input.meanResidenceTime

  const tanks =
    input.tanksInSeries

  const dimensionlessExitAgeDensity =
    dimensionlessTime === 0
      ? (
          tanks === 1
            ? 1
            : 0
        )
      : (
          tanks ** tanks /
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

  const exitAgeDensity =
    dimensionlessExitAgeDensity /
    input.meanResidenceTime

  const scaledTime =
    tanks *
    dimensionlessTime

  let cumulativeSeries = 0

  for (
    let index = 0;
    index < tanks;
    index += 1
  ) {
    cumulativeSeries +=
      scaledTime ** index /
      factorial(index)
  }

  const tailFraction =
    Math.exp(
      -scaledTime,
    ) *
    cumulativeSeries

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
    tanks

  const residenceTimeVariance =
    input.meanResidenceTime ** 2 /
    tanks

  const residenceTimeStandardDeviation =
    Math.sqrt(
      residenceTimeVariance,
    )

  validateResults([
    dimensionlessTime,
    exitAgeDensity,
    dimensionlessExitAgeDensity,
    cumulativeExitFraction,
    tailFraction,
    dimensionlessVariance,
    residenceTimeVariance,
    residenceTimeStandardDeviation,
  ])

  return {
    dimensionlessTime,
    exitAgeDensity,
    dimensionlessExitAgeDensity,
    cumulativeExitFraction,
    tailFraction,
    dimensionlessVariance,
    residenceTimeVariance,
    residenceTimeStandardDeviation,
  }
}

export function calculateEconomicReactorSelection(
  input: EconomicReactorSelectionInput,
): EconomicReactorSelectionResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentration <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.firstOrderRateConstant <= 0 ||
    !validConversion(
      input.targetConversion,
    ) ||
    input.cstrInstalledCostPerVolume <= 0 ||
    input.pfrInstalledCostPerVolume <= 0 ||
    input.cstrAnnualOperatingCost < 0 ||
    input.pfrAnnualOperatingCost < 0 ||
    input.projectLifeYears <= 0 ||
    !Number.isInteger(
      input.projectLifeYears,
    )
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'invalidEconomicInputs',
      )
  }

  const requiredCSTRVolume =
    input.volumetricFlowRate *
    input.targetConversion /
    (
      input.firstOrderRateConstant *
      (
        1 -
        input.targetConversion
      )
    )

  const requiredPFRVolume =
    input.volumetricFlowRate *
    -Math.log(
      1 -
      input.targetConversion,
    ) /
    input.firstOrderRateConstant

  const cstrCapitalCost =
    requiredCSTRVolume *
    input.cstrInstalledCostPerVolume

  const pfrCapitalCost =
    requiredPFRVolume *
    input.pfrInstalledCostPerVolume

  const cstrLifecycleCost =
    cstrCapitalCost +
    input.cstrAnnualOperatingCost *
    input.projectLifeYears

  const pfrLifecycleCost =
    pfrCapitalCost +
    input.pfrAnnualOperatingCost *
    input.projectLifeYears

  const lifecycleCostDifference =
    Math.abs(
      cstrLifecycleCost -
      pfrLifecycleCost,
    )

  const preferredReactor =
    Math.abs(
      cstrLifecycleCost -
      pfrLifecycleCost,
    ) <
    1e-9
      ? 'Equivalent lifecycle cost'
      : cstrLifecycleCost <
          pfrLifecycleCost
        ? 'CSTR'
        : 'PFR'

  const higherCost =
    Math.max(
      cstrLifecycleCost,
      pfrLifecycleCost,
    )

  const preferredCostSavingPercent =
    higherCost > 0
      ? lifecycleCostDifference /
        higherCost *
        100
      : 0

  const pfrVolumeReductionPercent =
    (
      1 -
      requiredPFRVolume /
      requiredCSTRVolume
    ) *
    100

  validateResults([
    requiredCSTRVolume,
    requiredPFRVolume,
    cstrCapitalCost,
    pfrCapitalCost,
    cstrLifecycleCost,
    pfrLifecycleCost,
    lifecycleCostDifference,
    preferredCostSavingPercent,
    pfrVolumeReductionPercent,
  ])

  return {
    requiredCSTRVolume,
    requiredPFRVolume,
    cstrCapitalCost,
    pfrCapitalCost,
    cstrLifecycleCost,
    pfrLifecycleCost,
    lifecycleCostDifference,
    preferredReactor,
    preferredCostSavingPercent,
    pfrVolumeReductionPercent,
  }
}

export function calculateEnzymeBatchReactor(
  input: EnzymeBatchReactorInput,
): EnzymeBatchReactorResult {
  validateFinite(Object.values(input))

  if (
    input.initialSubstrateConcentration <= 0 ||
    input.maximumReactionRate <= 0 ||
    input.michaelisConstant <= 0 ||
    !validConversion(
      input.targetConversion,
    )
  ) {
    throw new
      ReactionEngineeringBatch03CalculationError(
        'invalidEnzymeBatchInputs',
      )
  }

  const finalSubstrateConcentration =
    input.initialSubstrateConcentration *
    (
      1 -
      input.targetConversion
    )

  const substrateConsumed =
    input.initialSubstrateConcentration -
    finalSubstrateConcentration

  const requiredBatchTime =
    (
      substrateConsumed +
      input.michaelisConstant *
      Math.log(
        input.initialSubstrateConcentration /
        finalSubstrateConcentration,
      )
    ) /
    input.maximumReactionRate

  const initialReactionRate =
    input.maximumReactionRate *
    input.initialSubstrateConcentration /
    (
      input.michaelisConstant +
      input.initialSubstrateConcentration
    )

  const finalReactionRate =
    input.maximumReactionRate *
    finalSubstrateConcentration /
    (
      input.michaelisConstant +
      finalSubstrateConcentration
    )

  const averageReactionRate =
    substrateConsumed /
    requiredBatchTime

  const initialSaturationFraction =
    input.initialSubstrateConcentration /
    (
      input.michaelisConstant +
      input.initialSubstrateConcentration
    )

  const finalSaturationFraction =
    finalSubstrateConcentration /
    (
      input.michaelisConstant +
      finalSubstrateConcentration
    )

  validateResults([
    requiredBatchTime,
    finalSubstrateConcentration,
    substrateConsumed,
    initialReactionRate,
    finalReactionRate,
    averageReactionRate,
    initialSaturationFraction,
    finalSaturationFraction,
  ])

  return {
    requiredBatchTime,
    finalSubstrateConcentration,
    substrateConsumed,
    initialReactionRate,
    finalReactionRate,
    averageReactionRate,
    initialSaturationFraction,
    finalSaturationFraction,
  }
}
