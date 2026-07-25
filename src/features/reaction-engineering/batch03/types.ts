export type ReactionEngineeringBatch03Mode =
  | 'cstrPFRSequence'
  | 'deactivatingPackedBedReactor'
  | 'deadVolumeEstimator'
  | 'eCurveGenerator'
  | 'economicReactorSelection'
  | 'enzymeBatchReactor'

export interface CSTRPFRSequenceInput {
  inletConcentration: number
  firstOrderRateConstant: number
  totalSpaceTime: number
  cstrSpaceTimeFraction: number
}

export interface CSTRPFRSequenceResult {
  cstrSpaceTime: number
  pfrSpaceTime: number
  cstrOutletConcentration: number
  finalOutletConcentration: number
  overallConversion: number
  equivalentIdealPFRConversion: number
  equivalentIdealCSTRConversion: number
  sequenceAdvantageOverCSTR: number
  sequencePenaltyFromPFR: number
}

export interface DeactivatingPackedBedReactorInput {
  inletMolarFlowRate: number
  inletConcentration: number
  catalystWeight: number
  rateConstantPerCatalystMass: number
  effectivenessFactor: number
  initialActivity: number
  deactivationRateConstant: number
  timeOnStream: number
}

export interface DeactivatingPackedBedReactorResult {
  currentActivity: number
  retainedActivityPercent: number
  effectiveRateConstant: number
  damkohlerNumber: number
  conversion: number
  outletConcentration: number
  outletMolarFlowRate: number
  freshCatalystConversion: number
  conversionLoss: number
}

export interface DeadVolumeEstimatorInput {
  nominalReactorVolume: number
  volumetricFlowRate: number
  measuredMeanResidenceTime: number
}

export interface DeadVolumeEstimatorResult {
  activeReactorVolume: number
  estimatedDeadVolume: number
  deadVolumeFraction: number
  activeVolumeFraction: number
  nominalResidenceTime: number
  measuredToNominalTimeRatio: number
  hydraulicUtilizationPercent: number
  conditionBand: string
}

export interface ECurveGeneratorInput {
  meanResidenceTime: number
  tanksInSeries: number
  evaluationTime: number
}

export interface ECurveGeneratorResult {
  dimensionlessTime: number
  exitAgeDensity: number
  dimensionlessExitAgeDensity: number
  cumulativeExitFraction: number
  tailFraction: number
  dimensionlessVariance: number
  residenceTimeVariance: number
  residenceTimeStandardDeviation: number
}

export interface EconomicReactorSelectionInput {
  inletConcentration: number
  volumetricFlowRate: number
  firstOrderRateConstant: number
  targetConversion: number
  cstrInstalledCostPerVolume: number
  pfrInstalledCostPerVolume: number
  cstrAnnualOperatingCost: number
  pfrAnnualOperatingCost: number
  projectLifeYears: number
}

export interface EconomicReactorSelectionResult {
  requiredCSTRVolume: number
  requiredPFRVolume: number
  cstrCapitalCost: number
  pfrCapitalCost: number
  cstrLifecycleCost: number
  pfrLifecycleCost: number
  lifecycleCostDifference: number
  preferredReactor: string
  preferredCostSavingPercent: number
  pfrVolumeReductionPercent: number
}

export interface EnzymeBatchReactorInput {
  initialSubstrateConcentration: number
  maximumReactionRate: number
  michaelisConstant: number
  targetConversion: number
}

export interface EnzymeBatchReactorResult {
  requiredBatchTime: number
  finalSubstrateConcentration: number
  substrateConsumed: number
  initialReactionRate: number
  finalReactionRate: number
  averageReactionRate: number
  initialSaturationFraction: number
  finalSaturationFraction: number
}
