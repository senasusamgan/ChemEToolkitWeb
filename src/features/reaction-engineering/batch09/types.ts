export type ReactionEngineeringBatch09Mode =
  | 'seriesParallelReactions'
  | 'stepResponseRTDAnalysis'
  | 'tanksInSeriesRTD'
  | 'arrheniusThreePointFit'

export interface SeriesParallelReactionsInput {
  initialConcentrationA: number
  desiredRateConstant: number
  consecutiveRateConstant: number
  parallelUndesiredRateConstant: number
  reactionTime: number
}

export interface SeriesParallelReactionsResult {
  concentrationA: number
  concentrationDesiredIntermediateB: number
  concentrationConsecutiveProductC: number
  concentrationParallelProductD: number
  conversionA: number
  desiredIntermediateYield: number
  consecutiveProductYield: number
  parallelProductYield: number
  desiredIntermediateSelectivity: number
  optimumTimeForIntermediate: number
  maximumIntermediateConcentration: number
  massBalanceResidual: number
}

export interface StepResponseRTDAnalysisInput {
  times: number[]
  normalizedOutletResponses: number[]
}

export interface StepResponseRTDAnalysisResult {
  normalizedResponses: number[]
  intervalEValues: number[]
  intervalMidpointTimes: number[]
  immediateBypassFraction: number
  finalResponse: number
  responseCompleteness: number
  meanResidenceTime: number
  variance: number
  standardDeviation: number
  dimensionlessVariance: number
  timeAtTenPercent: number
  medianResidenceTime: number
  timeAtNinetyPercent: number
}

export interface TanksInSeriesRTDInput {
  meanResidenceTime: number
  tanksInSeries: number
  evaluationTime: number
}

export interface TanksInSeriesRTDResult {
  dimensionlessTime: number
  exitAgeDensity: number
  cumulativeExitFraction: number
  tailFraction: number
  dimensionlessVariance: number
  residenceTimeVariance: number
  residenceTimeStandardDeviation: number
  modalResidenceTime: number
  peakExitAgeDensity: number
  mixingInterpretation: string
}

export interface ArrheniusThreePointFitInput {
  temperatureOne: number
  rateConstantOne: number
  temperatureTwo: number
  rateConstantTwo: number
  temperatureThree: number
  rateConstantThree: number
  targetTemperature: number
}

export interface ArrheniusThreePointFitResult {
  activationEnergy: number
  preExponentialFactor: number
  interceptLnA: number
  arrheniusSlope: number
  predictedRateConstantAtTarget: number
  coefficientOfDetermination: number
  rootMeanSquareLogError: number
  fittedRateConstants: number[]
  relativeResiduals: number[]
  fitQualityDescription: string
}
