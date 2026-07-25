export type ReactionEngineeringBatch02Mode =
  | 'bypassDeadVolumeReactor'
  | 'catalystDeactivationKinetics'
  | 'catalystRegenerationCycle'
  | 'catalystTimeOnStream'
  | 'catalystWeightFromRateData'
  | 'conversionFromRTD'

export interface BypassDeadVolumeReactorInput {
  nominalReactorVolume: number
  volumetricFlowRate: number
  firstOrderRateConstant: number
  bypassFraction: number
  deadVolumeFraction: number
}

export interface BypassDeadVolumeReactorResult {
  activeReactorVolume: number
  reactingFlowRate: number
  bypassFlowRate: number
  nominalSpaceTime: number
  activePathSpaceTime: number
  activePathConversion: number
  overallConversion: number
  outletConcentrationFraction: number
  hydraulicEffectiveness: number
}

export interface CatalystDeactivationKineticsInput {
  initialActivity: number
  deactivationRateConstant: number
  deactivationOrder: number
  elapsedTime: number
  targetActivity: number
}

export interface CatalystDeactivationKineticsResult {
  currentActivity: number
  retainedActivityPercent: number
  lostActivityFraction: number
  timeToTargetActivity: number
  timeToHalfInitialActivity: number
  remainingTimeToTarget: number
  targetAlreadyPassed: boolean
  finiteExtinctionTime: number | null
}

export interface CatalystRegenerationCycleInput {
  activityBeforeRegeneration: number
  regenerationRecoveryFraction: number
  irreversibleLossFractionPerCycle: number
  serviceTimePerCycle: number
  regenerationTimePerCycle: number
}

export interface CatalystRegenerationCycleResult {
  regeneratedActivity: number
  nextCycleStartingActivity: number
  recoveredActivity: number
  irreversibleActivityLoss: number
  cycleUptimeFraction: number
  averageCycleActivityIndex: number
  cycleDuration: number
  cyclesToHalfStartingActivity: number
}

export interface CatalystTimeOnStreamInput {
  initialActivity: number
  observedActivity: number
  observedTime: number
  deactivationOrder: number
  targetActivity: number
}

export interface CatalystTimeOnStreamResult {
  inferredDeactivationRateConstant: number
  totalTimeToTargetActivity: number
  remainingTimeToTargetActivity: number
  totalTimeToHalfActivity: number
  observedActivityLossPercent: number
  observedTargetAlreadyPassed: boolean
  deactivationModelDescription: string
}

export interface CatalystWeightFromRateDataInput {
  inletMolarFlowRate: number
  inletConcentration: number
  targetConversion: number
  rateConstantPerCatalystMass: number
  reactionOrder: number
  effectivenessFactor: number
}

export interface CatalystWeightFromRateDataResult {
  requiredCatalystWeight: number
  inletObservedRatePerCatalystMass: number
  outletObservedRatePerCatalystMass: number
  outletConcentration: number
  catalystWeightPerMolarFeed: number
  averageObservedRatePerCatalystMass: number
  integrationIntervals: number
}

export interface ConversionFromRTDInput {
  meanResidenceTime: number
  residenceTimeVariance: number
  firstOrderRateConstant: number
}

export interface ConversionFromRTDResult {
  equivalentTanksInSeries: number
  dimensionlessVariance: number
  damkohlerNumber: number
  rtdBasedConversion: number
  idealPFRConversion: number
  idealCSTRConversion: number
  conversionRelativeToPFR: number
  conversionRelativeToCSTR: number
}
