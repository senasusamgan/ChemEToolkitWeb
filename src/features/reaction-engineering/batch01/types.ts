export type ReactionEngineeringBatch01Mode =
  | 'adiabaticBatchReactor'
  | 'adiabaticCSTR'
  | 'adiabaticPFR'
  | 'autocatalyticBatchReactor'
  | 'axialDispersionRTD'
  | 'bypassFractionEstimator'

export interface AdiabaticBatchReactorInput {
  initialConcentration: number
  preExponentialFactor: number
  activationEnergy: number
  reactionOrder: number
  inletTemperature: number
  adiabaticTemperatureRise: number
  targetConversion: number
}

export interface AdiabaticBatchReactorResult {
  requiredBatchTime: number
  outletTemperature: number
  outletConcentration: number
  initialRateConstant: number
  outletRateConstant: number
  initialReactionRate: number
  outletReactionRate: number
  temperatureRise: number
}

export interface AdiabaticCSTRInput {
  inletConcentration: number
  volumetricFlowRate: number
  preExponentialFactor: number
  activationEnergy: number
  inletTemperature: number
  adiabaticTemperatureRise: number
  targetConversion: number
}

export interface AdiabaticCSTRResult {
  requiredReactorVolume: number
  spaceTime: number
  outletTemperature: number
  outletConcentration: number
  outletRateConstant: number
  outletReactionRate: number
  inletMolarFlowRate: number
  heatReleaseTemperatureRise: number
}

export interface AdiabaticPFRInput {
  inletConcentration: number
  volumetricFlowRate: number
  preExponentialFactor: number
  activationEnergy: number
  inletTemperature: number
  adiabaticTemperatureRise: number
  targetConversion: number
}

export interface AdiabaticPFRResult {
  requiredReactorVolume: number
  spaceTime: number
  outletTemperature: number
  outletConcentration: number
  outletRateConstant: number
  inletMolarFlowRate: number
  averageRateConstant: number
  integrationIntervals: number
}

export interface AutocatalyticBatchReactorInput {
  initialReactantConcentration: number
  initialAutocatalystConcentration: number
  rateConstant: number
  targetConversion: number
}

export interface AutocatalyticBatchReactorResult {
  requiredBatchTime: number
  outletReactantConcentration: number
  outletAutocatalystConcentration: number
  initialReactionRate: number
  outletReactionRate: number
  peakRateConversion: number
  peakReactionRate: number
  totalReactiveConcentration: number
}

export interface AxialDispersionRTDInput {
  meanResidenceTime: number
  pecletNumber: number
  evaluationTime: number
}

export interface AxialDispersionRTDResult {
  dimensionlessTime: number
  dispersionNumber: number
  dimensionlessVariance: number
  residenceTimeStandardDeviation: number
  exitAgeDensity: number
  dimensionlessExitAgeDensity: number
  cumulativeExitFraction: number
  tailFraction: number
}

export interface BypassFractionEstimatorInput {
  earlyBypassTracerArea: number
  totalRecoveredTracerArea: number
  injectedTracerArea: number
  reactorVolume: number
  totalVolumetricFlowRate: number
}

export interface BypassFractionEstimatorResult {
  bypassFraction: number
  activeFlowFraction: number
  tracerRecoveryFraction: number
  bypassFlowRate: number
  activeFlowRate: number
  nominalSpaceTime: number
  activePathSpaceTime: number
  bypassSeverityBand: string
}
