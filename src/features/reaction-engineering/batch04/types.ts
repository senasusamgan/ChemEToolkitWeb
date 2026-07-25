export type ReactionEngineeringBatch04Mode =
  | 'equilibriumConversion'
  | 'fCurveGenerator'
  | 'heatExchangeBatchReactor'
  | 'heatExchangeCSTR'
  | 'heatExchangePFR'
  | 'immobilizedEnzymeReactor'

export interface EquilibriumConversionInput {
  initialConcentrationA: number
  initialConcentrationB: number
  equilibriumConstant: number
}
export interface EquilibriumConversionResult {
  equilibriumExtent: number
  equilibriumConcentrationA: number
  equilibriumConcentrationB: number
  equilibriumConcentrationProduct: number
  conversionA: number
  conversionB: number
  limitingReactant: string
  equilibriumResidual: number
}

export interface FCurveGeneratorInput {
  times: number[]
  eValues: number[]
  evaluationTime: number
}
export interface FCurveGeneratorResult {
  rawEArea: number
  normalizedEValues: number[]
  cumulativeFValues: number[]
  fAtEvaluationTime: number
  meanResidenceTime: number
  medianResidenceTime: number
  timeAtTenPercent: number
  timeAtNinetyPercent: number
  centralEightyPercentSpan: number
}

export interface HeatExchangeBatchReactorInput {
  initialConcentrationA: number
  preExponentialFactor: number
  activationEnergy: number
  initialTemperature: number
  adiabaticTemperatureRise: number
  coolantTemperature: number
  heatRemovalCoefficient: number
  targetConversion: number
  maximumTime: number
}
export interface HeatExchangeBatchReactorResult {
  requiredBatchTime: number
  finalTemperature: number
  maximumTemperature: number
  finalConcentrationA: number
  finalRateConstant: number
  finalReactionRate: number
  totalHeatRemovedIndex: number
  integrationSteps: number
}

export interface HeatExchangeCSTRInput {
  inletConcentrationA: number
  volumetricFlowRate: number
  preExponentialFactor: number
  activationEnergy: number
  inletTemperature: number
  adiabaticTemperatureRise: number
  coolantTemperature: number
  heatRemovalNumber: number
  targetConversion: number
}
export interface HeatExchangeCSTRResult {
  outletTemperature: number
  outletConcentrationA: number
  outletRateConstant: number
  outletReactionRate: number
  requiredReactorVolume: number
  spaceTime: number
  heatRemovedTemperatureEquivalent: number
  heatRemovalFractionOfAdiabaticRise: number
}

export interface HeatExchangePFRInput {
  inletConcentrationA: number
  volumetricFlowRate: number
  preExponentialFactor: number
  activationEnergy: number
  inletTemperature: number
  adiabaticTemperatureRise: number
  coolantTemperature: number
  heatRemovalNumberPerConversion: number
  targetConversion: number
}
export interface HeatExchangePFRResult {
  outletTemperature: number
  maximumTemperature: number
  outletConcentrationA: number
  outletRateConstant: number
  requiredReactorVolume: number
  spaceTime: number
  averageRateConstant: number
  integrationIntervals: number
}

export interface ImmobilizedEnzymeReactorInput {
  sphericalPelletRadius: number
  effectiveDiffusivity: number
  maximumVolumetricRate: number
  michaelisConstant: number
  bulkSubstrateConcentration: number
  totalPelletVolume: number
}
export interface ImmobilizedEnzymeReactorResult {
  firstOrderRateConstant: number
  thieleModulus: number
  effectivenessFactor: number
  intrinsicVolumetricRate: number
  observedVolumetricRate: number
  totalObservedMolarRate: number
  internalDiffusionLossFraction: number
  diffusionRegimeDescription: string
}
