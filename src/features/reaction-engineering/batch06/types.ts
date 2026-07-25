export type ReactionEngineeringBatch06Mode =
  | 'nonIsothermalCSTRSteadyStates'
  | 'packedBedPressureDrop'
  | 'packedBedReactorDesign'
  | 'parallelReactions'
  | 'pbrPressureDropEffects'
  | 'rateConstantCalculation'

export interface NonIsothermalCSTRSteadyStatesInput {
  spaceTime: number
  preExponentialFactor: number
  activationEnergy: number
  inletTemperature: number
  adiabaticTemperatureRise: number
  coolantTemperature: number
  heatRemovalNumber: number
  minimumSearchTemperature: number
  maximumSearchTemperature: number
}

export interface NonIsothermalCSTRSteadyStatesResult {
  steadyStateCount: number
  steadyStateTemperatures: number[]
  steadyStateConversions: number[]
  stabilityDescriptions: string[]
  lowestTemperatureState: number | null
  highestTemperatureState: number | null
  temperatureSpan: number
  maximumConversion: number
  minimumConversion: number
  searchIntervals: number
}

export interface PackedBedPressureDropInput {
  bedLength: number
  particleDiameter: number
  bedVoidFraction: number
  fluidDensity: number
  fluidViscosity: number
  superficialVelocity: number
}

export interface PackedBedPressureDropResult {
  viscousPressureGradient: number
  inertialPressureGradient: number
  totalPressureGradient: number
  totalPressureDrop: number
  viscousContributionFraction: number
  inertialContributionFraction: number
  particleReynoldsNumber: number
  ergunRegimeDescription: string
}

export interface PackedBedReactorDesignInput {
  inletConcentrationA: number
  inletVolumetricFlowRate: number
  massSpecificFirstOrderRateConstant: number
  targetConversion: number
}

export interface PackedBedReactorDesignResult {
  requiredCatalystWeight: number
  inletMolarFlowRateA: number
  outletConcentrationA: number
  outletMolarFlowRateA: number
  catalystWeightPerVolumetricFlow: number
  catalystWeightPerMolarFeed: number
  logarithmicConversionFactor: number
  apparentCatalystSpaceVelocity: number
}

export interface ParallelReactionsInput {
  reactantConcentration: number
  desiredRateConstant: number
  desiredReactionOrder: number
  undesiredRateConstant: number
  undesiredReactionOrder: number
}

export interface ParallelReactionsResult {
  desiredReactionRate: number
  undesiredReactionRate: number
  totalDisappearanceRate: number
  instantaneousSelectivity: number
  desiredProductFraction: number
  undesiredProductFraction: number
  overallReactionOrderAtState: number
  concentrationSensitivityDescription: string
}

export interface PBRPressureDropEffectsInput {
  inletMolarFlowRateA: number
  inletConcentrationA: number
  catalystWeight: number
  massSpecificFirstOrderRateConstant: number
  pressureDropCoefficient: number
  inletPressure: number
}

export interface PBRPressureDropEffectsResult {
  outletPressure: number
  outletPressureRatio: number
  conversionWithPressureDrop: number
  conversionWithoutPressureDrop: number
  conversionPenalty: number
  pressureDropFraction: number
  effectiveCatalystExposureIntegral: number
  outletConcentrationA: number
  pressureDropSeverityDescription: string
}

export interface RateConstantCalculationInput {
  observedReactionRate: number
  concentrationA: number
  reactionOrderA: number
  concentrationB: number
  reactionOrderB: number
}

export interface RateConstantCalculationResult {
  rateConstant: number
  overallReactionOrder: number
  concentrationFactorA: number
  concentrationFactorB: number
  combinedConcentrationFactor: number
  reconstructedReactionRate: number
  relativeReconstructionError: number
  dimensionalBasisDescription: string
}
