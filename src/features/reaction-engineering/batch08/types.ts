export type ReactionEngineeringBatch08Mode =
  | 'reversibleReactions'
  | 'rtdModelComparison'
  | 'rtdMoments'
  | 'segregationModelConversion'
  | 'semibatchReactor'
  | 'seriesReactions'

export interface ReversibleReactionsInput {
  initialConcentrationA: number
  initialConcentrationB: number
  forwardRateConstant: number
  reverseRateConstant: number
  reactionTime: number
}
export interface ReversibleReactionsResult {
  finalConcentrationA: number
  finalConcentrationB: number
  equilibriumConcentrationA: number
  equilibriumConcentrationB: number
  conversionA: number
  equilibriumConversionA: number
  fractionOfEquilibriumApproach: number
  relaxationTime: number
  equilibriumConstant: number
}

export interface RTDModelComparisonInput {
  meanResidenceTime: number
  residenceTimeVariance: number
  firstOrderRateConstant: number
}
export interface RTDModelComparisonResult {
  dimensionlessVariance: number
  equivalentTanksInSeries: number
  equivalentPecletNumber: number
  damkohlerNumber: number
  idealPFRConversion: number
  idealCSTRConversion: number
  tanksInSeriesConversion: number
  axialDispersionConversion: number
  tanksDeviationFromPFR: number
  dispersionDeviationFromPFR: number
  modelInterpretation: string
}

export interface RTDMomentsInput {
  times: number[]
  tracerConcentrations: number[]
}
export interface RTDMomentsResult {
  tracerArea: number
  normalizedEValues: number[]
  cumulativeFValues: number[]
  meanResidenceTime: number
  variance: number
  standardDeviation: number
  dimensionlessVariance: number
  skewness: number
  timeAtTenPercent: number
  medianResidenceTime: number
  timeAtNinetyPercent: number
}

export interface SegregationModelConversionInput {
  times: number[]
  eValues: number[]
  firstOrderRateConstant: number
}
export interface SegregationModelConversionResult {
  normalizedEValues: number[]
  segregationOutletFractionA: number
  segregationConversion: number
  meanResidenceTime: number
  idealPFRConversionAtMeanTime: number
  idealCSTRConversionAtMeanTime: number
  conversionRelativeToPFR: number
  conversionRelativeToCSTR: number
  integrationSegments: number
}

export interface SemibatchReactorInput {
  initialLiquidVolume: number
  initialConcentrationA: number
  feedVolumetricFlowRate: number
  feedConcentrationB: number
  secondOrderRateConstant: number
  feedDuration: number
}
export interface SemibatchReactorResult {
  finalLiquidVolume: number
  finalMolesA: number
  finalMolesB: number
  finalMolesProduct: number
  finalConcentrationA: number
  finalConcentrationB: number
  finalProductConcentration: number
  conversionA: number
  fedMolesB: number
  productYieldFromA: number
  integrationSteps: number
}

export interface SeriesReactionsInput {
  initialConcentrationA: number
  firstReactionRateConstant: number
  secondReactionRateConstant: number
  reactionTime: number
}
export interface SeriesReactionsResult {
  concentrationA: number
  concentrationIntermediateB: number
  concentrationFinalC: number
  conversionA: number
  intermediateYield: number
  finalProductYield: number
  optimumTimeForIntermediate: number
  maximumIntermediateConcentration: number
  intermediateSelectivityOverFinal: number
  massBalanceResidual: number
}
