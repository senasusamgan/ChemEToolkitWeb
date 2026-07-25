import type {
  BypassDeadVolumeReactorInput,
  BypassDeadVolumeReactorResult,
  CatalystDeactivationKineticsInput,
  CatalystDeactivationKineticsResult,
  CatalystRegenerationCycleInput,
  CatalystRegenerationCycleResult,
  CatalystTimeOnStreamInput,
  CatalystTimeOnStreamResult,
  CatalystWeightFromRateDataInput,
  CatalystWeightFromRateDataResult,
  ConversionFromRTDInput,
  ConversionFromRTDResult,
} from './types.ts'

export type ReactionEngineeringBatch02ErrorCode =
  | 'nonFiniteInput'
  | 'invalidBypassDeadVolumeInputs'
  | 'invalidDeactivationInputs'
  | 'invalidRegenerationInputs'
  | 'invalidTimeOnStreamInputs'
  | 'invalidCatalystWeightInputs'
  | 'invalidConversionFromRTDInputs'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch02ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidBypassDeadVolumeInputs:
    'Reactor volume, flow rate and rate constant must be positive. Bypass and dead-volume fractions must lie from zero up to, but not including, one.',
  invalidDeactivationInputs:
    'Initial activity must lie above zero and no greater than one. Deactivation constant must be positive, order must lie from zero through two, elapsed time cannot be negative, and target activity must lie above zero and below initial activity.',
  invalidRegenerationInputs:
    'Activity and recovery fractions must lie from zero through one. Irreversible loss must be below one, and service and regeneration times must be positive.',
  invalidTimeOnStreamInputs:
    'Initial and observed activities must be positive with observed activity below initial activity. Observed time must be positive, order must lie from zero through two, and target activity must be positive and below initial activity.',
  invalidCatalystWeightInputs:
    'Molar feed, concentration, rate constant and effectiveness factor must be positive. Reaction order must be positive, and target conversion must lie above zero and below one.',
  invalidConversionFromRTDInputs:
    'Mean residence time, residence-time variance and first-order rate constant must be positive.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch02CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch02ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch02ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch02CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'numericalFailure',
      )
  }
}

function fraction(
  value: number,
): boolean {
  return value >= 0 && value <= 1
}

function activityAtTime(
  initialActivity: number,
  rateConstant: number,
  order: number,
  time: number,
): number {
  if (
    Math.abs(
      order -
      1,
    ) <
    1e-12
  ) {
    return (
      initialActivity *
      Math.exp(
        -rateConstant *
        time,
      )
    )
  }

  const base =
    initialActivity **
    (
      1 -
      order
    ) +
    (
      order -
      1
    ) *
    rateConstant *
    time

  if (
    base <= 0
  ) {
    return 0
  }

  return (
    base **
    (
      1 /
      (
        1 -
        order
      )
    )
  )
}

function timeToActivity(
  initialActivity: number,
  targetActivity: number,
  rateConstant: number,
  order: number,
): number {
  if (
    Math.abs(
      order -
      1,
    ) <
    1e-12
  ) {
    return (
      Math.log(
        initialActivity /
        targetActivity,
      ) /
      rateConstant
    )
  }

  return (
    (
      targetActivity **
      (
        1 -
        order
      ) -
      initialActivity **
      (
        1 -
        order
      )
    ) /
    (
      (
        order -
        1
      ) *
      rateConstant
    )
  )
}

function simpsonIntegral(
  functionValue:
    (coordinate: number) => number,
  lowerBound: number,
  upperBound: number,
  intervals: number,
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

export function calculateBypassDeadVolumeReactor(
  input: BypassDeadVolumeReactorInput,
): BypassDeadVolumeReactorResult {
  validateFinite(Object.values(input))

  if (
    input.nominalReactorVolume <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.firstOrderRateConstant <= 0 ||
    input.bypassFraction < 0 ||
    input.bypassFraction >= 1 ||
    input.deadVolumeFraction < 0 ||
    input.deadVolumeFraction >= 1
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidBypassDeadVolumeInputs',
      )
  }

  const activeReactorVolume =
    input.nominalReactorVolume *
    (
      1 -
      input.deadVolumeFraction
    )

  const reactingFlowRate =
    input.volumetricFlowRate *
    (
      1 -
      input.bypassFraction
    )

  const bypassFlowRate =
    input.volumetricFlowRate -
    reactingFlowRate

  const nominalSpaceTime =
    input.nominalReactorVolume /
    input.volumetricFlowRate

  const activePathSpaceTime =
    activeReactorVolume /
    reactingFlowRate

  const activePathConversion =
    1 -
    Math.exp(
      -input.firstOrderRateConstant *
      activePathSpaceTime,
    )

  const overallConversion =
    (
      1 -
      input.bypassFraction
    ) *
    activePathConversion

  const outletConcentrationFraction =
    1 -
    overallConversion

  const hydraulicEffectiveness =
    activePathSpaceTime /
    nominalSpaceTime

  validateResults([
    activeReactorVolume,
    reactingFlowRate,
    bypassFlowRate,
    nominalSpaceTime,
    activePathSpaceTime,
    activePathConversion,
    overallConversion,
    outletConcentrationFraction,
    hydraulicEffectiveness,
  ])

  return {
    activeReactorVolume,
    reactingFlowRate,
    bypassFlowRate,
    nominalSpaceTime,
    activePathSpaceTime,
    activePathConversion,
    overallConversion,
    outletConcentrationFraction,
    hydraulicEffectiveness,
  }
}

export function calculateCatalystDeactivationKinetics(
  input: CatalystDeactivationKineticsInput,
): CatalystDeactivationKineticsResult {
  validateFinite(Object.values(input))

  if (
    input.initialActivity <= 0 ||
    input.initialActivity > 1 ||
    input.deactivationRateConstant <= 0 ||
    input.deactivationOrder < 0 ||
    input.deactivationOrder > 2 ||
    input.elapsedTime < 0 ||
    input.targetActivity <= 0 ||
    input.targetActivity >=
      input.initialActivity
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidDeactivationInputs',
      )
  }

  const currentActivity =
    activityAtTime(
      input.initialActivity,
      input.deactivationRateConstant,
      input.deactivationOrder,
      input.elapsedTime,
    )

  const retainedActivityPercent =
    currentActivity /
    input.initialActivity *
    100

  const lostActivityFraction =
    1 -
    currentActivity /
    input.initialActivity

  const timeToTargetActivity =
    timeToActivity(
      input.initialActivity,
      input.targetActivity,
      input.deactivationRateConstant,
      input.deactivationOrder,
    )

  const timeToHalfInitialActivity =
    timeToActivity(
      input.initialActivity,
      input.initialActivity /
      2,
      input.deactivationRateConstant,
      input.deactivationOrder,
    )

  const remainingTimeToTarget =
    Math.max(
      0,
      timeToTargetActivity -
      input.elapsedTime,
    )

  const targetAlreadyPassed =
    currentActivity <=
    input.targetActivity

  const finiteExtinctionTime =
    input.deactivationOrder < 1
      ? (
          input.initialActivity **
          (
            1 -
            input.deactivationOrder
          ) /
          (
            (
              1 -
              input.deactivationOrder
            ) *
            input.deactivationRateConstant
          )
        )
      : null

  validateResults([
    currentActivity,
    retainedActivityPercent,
    lostActivityFraction,
    timeToTargetActivity,
    timeToHalfInitialActivity,
    remainingTimeToTarget,
    finiteExtinctionTime ??
      0,
  ])

  return {
    currentActivity,
    retainedActivityPercent,
    lostActivityFraction,
    timeToTargetActivity,
    timeToHalfInitialActivity,
    remainingTimeToTarget,
    targetAlreadyPassed,
    finiteExtinctionTime,
  }
}

export function calculateCatalystRegenerationCycle(
  input: CatalystRegenerationCycleInput,
): CatalystRegenerationCycleResult {
  validateFinite(Object.values(input))

  if (
    !fraction(
      input.activityBeforeRegeneration,
    ) ||
    !fraction(
      input.regenerationRecoveryFraction,
    ) ||
    input.irreversibleLossFractionPerCycle < 0 ||
    input.irreversibleLossFractionPerCycle >= 1 ||
    input.serviceTimePerCycle <= 0 ||
    input.regenerationTimePerCycle <= 0
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidRegenerationInputs',
      )
  }

  const recoveredActivity =
    (
      1 -
      input.activityBeforeRegeneration
    ) *
    input.regenerationRecoveryFraction

  const regeneratedActivity =
    input.activityBeforeRegeneration +
    recoveredActivity

  const irreversibleActivityLoss =
    regeneratedActivity *
    input.irreversibleLossFractionPerCycle

  const nextCycleStartingActivity =
    regeneratedActivity -
    irreversibleActivityLoss

  const cycleDuration =
    input.serviceTimePerCycle +
    input.regenerationTimePerCycle

  const cycleUptimeFraction =
    input.serviceTimePerCycle /
    cycleDuration

  const averageServiceActivity =
    (
      nextCycleStartingActivity +
      input.activityBeforeRegeneration
    ) /
    2

  const averageCycleActivityIndex =
    averageServiceActivity *
    cycleUptimeFraction

  const cyclesToHalfStartingActivity =
    input.irreversibleLossFractionPerCycle >
      0
      ? (
          Math.log(
            0.5,
          ) /
          Math.log(
            1 -
            input
              .irreversibleLossFractionPerCycle,
          )
        )
      : Number.MAX_VALUE

  validateResults([
    regeneratedActivity,
    nextCycleStartingActivity,
    recoveredActivity,
    irreversibleActivityLoss,
    cycleUptimeFraction,
    averageCycleActivityIndex,
    cycleDuration,
    cyclesToHalfStartingActivity,
  ])

  return {
    regeneratedActivity,
    nextCycleStartingActivity,
    recoveredActivity,
    irreversibleActivityLoss,
    cycleUptimeFraction,
    averageCycleActivityIndex,
    cycleDuration,
    cyclesToHalfStartingActivity,
  }
}

export function calculateCatalystTimeOnStream(
  input: CatalystTimeOnStreamInput,
): CatalystTimeOnStreamResult {
  validateFinite(Object.values(input))

  if (
    input.initialActivity <= 0 ||
    input.initialActivity > 1 ||
    input.observedActivity <= 0 ||
    input.observedActivity >=
      input.initialActivity ||
    input.observedTime <= 0 ||
    input.deactivationOrder < 0 ||
    input.deactivationOrder > 2 ||
    input.targetActivity <= 0 ||
    input.targetActivity >=
      input.initialActivity
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidTimeOnStreamInputs',
      )
  }

  let inferredDeactivationRateConstant =
    0

  if (
    Math.abs(
      input.deactivationOrder -
      1,
    ) <
    1e-12
  ) {
    inferredDeactivationRateConstant =
      Math.log(
        input.initialActivity /
        input.observedActivity,
      ) /
      input.observedTime
  } else {
    inferredDeactivationRateConstant =
      (
        input.observedActivity **
        (
          1 -
          input.deactivationOrder
        ) -
        input.initialActivity **
        (
          1 -
          input.deactivationOrder
        )
      ) /
      (
        (
          input.deactivationOrder -
          1
        ) *
        input.observedTime
      )
  }

  if (
    inferredDeactivationRateConstant <=
    0
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidTimeOnStreamInputs',
      )
  }

  const totalTimeToTargetActivity =
    timeToActivity(
      input.initialActivity,
      input.targetActivity,
      inferredDeactivationRateConstant,
      input.deactivationOrder,
    )

  const remainingTimeToTargetActivity =
    Math.max(
      0,
      totalTimeToTargetActivity -
      input.observedTime,
    )

  const totalTimeToHalfActivity =
    timeToActivity(
      input.initialActivity,
      input.initialActivity /
      2,
      inferredDeactivationRateConstant,
      input.deactivationOrder,
    )

  const observedActivityLossPercent =
    (
      1 -
      input.observedActivity /
      input.initialActivity
    ) *
    100

  const observedTargetAlreadyPassed =
    input.observedActivity <=
    input.targetActivity

  const deactivationModelDescription =
    Math.abs(
      input.deactivationOrder -
      1,
    ) <
    1e-12
      ? 'First-order exponential activity decay'
      : `General activity-decay order ${input.deactivationOrder}`

  validateResults([
    inferredDeactivationRateConstant,
    totalTimeToTargetActivity,
    remainingTimeToTargetActivity,
    totalTimeToHalfActivity,
    observedActivityLossPercent,
  ])

  return {
    inferredDeactivationRateConstant,
    totalTimeToTargetActivity,
    remainingTimeToTargetActivity,
    totalTimeToHalfActivity,
    observedActivityLossPercent,
    observedTargetAlreadyPassed,
    deactivationModelDescription,
  }
}

export function calculateCatalystWeightFromRateData(
  input: CatalystWeightFromRateDataInput,
): CatalystWeightFromRateDataResult {
  validateFinite(Object.values(input))

  if (
    input.inletMolarFlowRate <= 0 ||
    input.inletConcentration <= 0 ||
    input.targetConversion <= 0 ||
    input.targetConversion >= 1 ||
    input.rateConstantPerCatalystMass <= 0 ||
    input.reactionOrder <= 0 ||
    input.effectivenessFactor <= 0 ||
    input.effectivenessFactor > 1
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidCatalystWeightInputs',
      )
  }

  const integrationIntervals =
    1200

  const observedRate =
    (
      conversion: number,
    ): number => {
      const concentration =
        input.inletConcentration *
        (
          1 -
          conversion
        )

      return (
        input.effectivenessFactor *
        input.rateConstantPerCatalystMass *
        concentration **
        input.reactionOrder
      )
    }

  const integral =
    simpsonIntegral(
      (
        conversion,
      ) =>
        1 /
        observedRate(
          conversion,
        ),
      0,
      input.targetConversion,
      integrationIntervals,
    )

  const requiredCatalystWeight =
    input.inletMolarFlowRate *
    integral

  const inletObservedRatePerCatalystMass =
    observedRate(
      0,
    )

  const outletObservedRatePerCatalystMass =
    observedRate(
      input.targetConversion,
    )

  const outletConcentration =
    input.inletConcentration *
    (
      1 -
      input.targetConversion
    )

  const catalystWeightPerMolarFeed =
    requiredCatalystWeight /
    input.inletMolarFlowRate

  const averageObservedRatePerCatalystMass =
    input.inletMolarFlowRate *
    input.targetConversion /
    requiredCatalystWeight

  validateResults([
    requiredCatalystWeight,
    inletObservedRatePerCatalystMass,
    outletObservedRatePerCatalystMass,
    outletConcentration,
    catalystWeightPerMolarFeed,
    averageObservedRatePerCatalystMass,
    integrationIntervals,
  ])

  return {
    requiredCatalystWeight,
    inletObservedRatePerCatalystMass,
    outletObservedRatePerCatalystMass,
    outletConcentration,
    catalystWeightPerMolarFeed,
    averageObservedRatePerCatalystMass,
    integrationIntervals,
  }
}

export function calculateConversionFromRTD(
  input: ConversionFromRTDInput,
): ConversionFromRTDResult {
  validateFinite(Object.values(input))

  if (
    input.meanResidenceTime <= 0 ||
    input.residenceTimeVariance <= 0 ||
    input.firstOrderRateConstant <= 0
  ) {
    throw new
      ReactionEngineeringBatch02CalculationError(
        'invalidConversionFromRTDInputs',
      )
  }

  const dimensionlessVariance =
    input.residenceTimeVariance /
    input.meanResidenceTime **
    2

  const equivalentTanksInSeries =
    1 /
    dimensionlessVariance

  const damkohlerNumber =
    input.firstOrderRateConstant *
    input.meanResidenceTime

  const rtdBasedConversion =
    1 -
    (
      1 +
      damkohlerNumber /
      equivalentTanksInSeries
    ) **
    (
      -equivalentTanksInSeries
    )

  const idealPFRConversion =
    1 -
    Math.exp(
      -damkohlerNumber,
    )

  const idealCSTRConversion =
    damkohlerNumber /
    (
      1 +
      damkohlerNumber
    )

  const conversionRelativeToPFR =
    rtdBasedConversion /
    idealPFRConversion

  const conversionRelativeToCSTR =
    rtdBasedConversion /
    idealCSTRConversion

  validateResults([
    equivalentTanksInSeries,
    dimensionlessVariance,
    damkohlerNumber,
    rtdBasedConversion,
    idealPFRConversion,
    idealCSTRConversion,
    conversionRelativeToPFR,
    conversionRelativeToCSTR,
  ])

  return {
    equivalentTanksInSeries,
    dimensionlessVariance,
    damkohlerNumber,
    rtdBasedConversion,
    idealPFRConversion,
    idealCSTRConversion,
    conversionRelativeToPFR,
    conversionRelativeToCSTR,
  }
}
