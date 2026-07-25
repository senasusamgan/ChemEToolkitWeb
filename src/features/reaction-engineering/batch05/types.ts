export type ReactionEngineeringBatch05Mode =
  | 'levenspielPlotSizing'
  | 'membraneReactor'
  | 'michaelisMentenReactor'
  | 'monodBioreactorDesign'
  | 'multipleReactionsCSTR'
  | 'multipleReactionsPFR'

export interface LevenspielPlotSizingInput {
  inletMolarFlowRate: number
  conversions: number[]
  inverseRates: number[]
}

export interface LevenspielPlotSizingResult {
  pfrVolume: number
  cstrVolumeToFinalConversion: number
  finalConversion: number
  integratedArea: number
  endpointInverseRate: number
  minimumInverseRate: number
  maximumInverseRate: number
  pfrToCSTRVolumeRatio: number
  integrationSegments: number
}

export interface MembraneReactorInput {
  inletMolarFlowRateA: number
  volumetricFlowRate: number
  forwardRateConstant: number
  equilibriumConstant: number
  membraneRemovalRateConstant: number
  reactorVolume: number
}

export interface MembraneReactorResult {
  outletMolarFlowRateA: number
  outletMolarFlowRateB: number
  permeatedMolarFlowRateB: number
  conversionA: number
  productRecovery: number
  outletSelectivityToRetainedProduct: number
  outletConcentrationA: number
  outletConcentrationB: number
  netProductionRateAtOutlet: number
  integrationSteps: number
}

export interface MichaelisMentenReactorInput {
  substrateVolumetricFlowRate: number
  inletSubstrateConcentration: number
  maximumVolumetricRate: number
  michaelisConstant: number
  targetConversion: number
}

export interface MichaelisMentenReactorResult {
  outletSubstrateConcentration: number
  outletReactionRate: number
  requiredReactorVolume: number
  spaceTime: number
  substrateConsumptionRate: number
  inletSaturationFraction: number
  outletSaturationFraction: number
  volumetricProductivity: number
}

export interface MonodBioreactorDesignInput {
  volumetricFlowRate: number
  feedSubstrateConcentration: number
  targetEffluentSubstrateConcentration: number
  maximumSpecificGrowthRate: number
  monodHalfSaturationConstant: number
  biomassYieldCoefficient: number
  biomassDecayRate: number
}

export interface MonodBioreactorDesignResult {
  grossSpecificGrowthRate: number
  netSpecificGrowthRate: number
  dilutionRate: number
  requiredReactorVolume: number
  hydraulicResidenceTime: number
  steadyStateBiomassConcentration: number
  biomassProductionRate: number
  substrateRemovalRate: number
  washoutDilutionRate: number
  washoutSafetyMargin: number
}

export interface MultipleReactionsCSTRInput {
  inletConcentrationA: number
  volumetricFlowRate: number
  desiredReactionRateConstant: number
  undesiredReactionRateConstant: number
  targetConversion: number
}

export interface MultipleReactionsCSTRResult {
  totalRateConstant: number
  requiredSpaceTime: number
  requiredReactorVolume: number
  outletConcentrationA: number
  outletConcentrationDesiredProduct: number
  outletConcentrationUndesiredProduct: number
  desiredProductYield: number
  desiredProductSelectivity: number
  desiredProductFraction: number
}

export interface MultipleReactionsPFRInput {
  inletConcentrationA: number
  volumetricFlowRate: number
  firstReactionRateConstant: number
  secondReactionRateConstant: number
  spaceTime: number
}

export interface MultipleReactionsPFRResult {
  outletConcentrationA: number
  outletConcentrationIntermediate: number
  outletConcentrationFinalProduct: number
  conversionA: number
  intermediateYield: number
  intermediateSelectivity: number
  optimumSpaceTimeForIntermediate: number
  maximumIntermediateConcentration: number
  reactorVolume: number
}
