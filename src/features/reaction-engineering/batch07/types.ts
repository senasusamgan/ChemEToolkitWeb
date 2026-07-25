export type ReactionEngineeringBatch07Mode =
  | 'rateConstantTemperatureShift'
  | 'rateLawBuilder'
  | 'reactionOrderDetermination'
  | 'reactiveDistillationBasics'
  | 'reactorOptimization'
  | 'recyclePFR'

export interface RateConstantTemperatureShiftInput {
  referenceRateConstant: number
  activationEnergy: number
  referenceTemperature: number
  targetTemperature: number
}

export interface RateConstantTemperatureShiftResult {
  shiftedRateConstant: number
  rateConstantRatio: number
  logarithmicRateConstantRatio: number
  temperatureDifference: number
  inverseTemperatureDifference: number
  activationExponent: number
  rateDirectionDescription: string
}

export interface RateLawBuilderInput {
  stoichiometricCoefficientA: number
  stoichiometricCoefficientB: number
  reactionOrderA: number
  reactionOrderB: number
}

export interface RateLawBuilderResult {
  overallReactionOrder: number
  rateConstantConcentrationExponent: number
  powerLawExpression: string
  disappearanceRateExpressionA: string
  disappearanceRateExpressionB: string
  stoichiometricRateRelationship: string
  rateConstantUnitsDescription: string
  consistencyDescription: string
}

export interface ReactionOrderDeterminationInput {
  concentrationExperimentOne: number
  rateExperimentOne: number
  concentrationExperimentTwo: number
  rateExperimentTwo: number
}

export interface ReactionOrderDeterminationResult {
  reactionOrder: number
  rateConstantExperimentOne: number
  rateConstantExperimentTwo: number
  representativeRateConstant: number
  concentrationRatio: number
  rateRatio: number
  rateConstantRelativeDifference: number
  orderClassification: string
  powerLawExpression: string
}

export interface ReactiveDistillationBasicsInput {
  initialConcentrationA: number
  initialConcentrationB: number
  equilibriumConstant: number
  stageProductRemovalFraction: number
  equilibriumStages: number
}

export interface ReactiveDistillationBasicsResult {
  overallConversionA: number
  overallConversionB: number
  remainingConcentrationA: number
  remainingConcentrationB: number
  retainedProductConcentration: number
  removedProductConcentration: number
  totalProductFormed: number
  productRecoveryFraction: number
  stageConversionsA: number[]
  conversionEnhancementOverSingleStage: number
}

export interface ReactorOptimizationInput {
  inletConcentrationA: number
  volumetricFlowRate: number
  firstOrderRateConstant: number
  annualOperatingHours: number
  productValuePerMole: number
  annualizedReactorCostPerVolume: number
  minimumConversion: number
  maximumConversion: number
}

export interface ReactorOptimizationResult {
  optimumConversion: number
  optimumReactorVolume: number
  annualProductMoles: number
  annualProductValue: number
  annualizedReactorCost: number
  optimumAnnualMargin: number
  lowerBoundAnnualMargin: number
  upperBoundAnnualMargin: number
  optimizationGridPoints: number
  optimumAtBoundary: boolean
}

export interface RecyclePFRInput {
  freshFeedConcentrationA: number
  freshVolumetricFlowRate: number
  firstOrderRateConstant: number
  reactorVolume: number
  recycleRatio: number
}

export interface RecyclePFRResult {
  totalReactorFlowRate: number
  reactorSpaceTime: number
  singlePassDecayFactor: number
  mixedInletConcentrationA: number
  reactorOutletConcentrationA: number
  overallConversionA: number
  singlePassConversion: number
  recycleFlowRate: number
  freshFeedMolarRateA: number
  outletMolarRateA: number
}
