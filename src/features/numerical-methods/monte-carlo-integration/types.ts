export interface MonteCarloIntegrationInput {
  lowerBound: number
  upperBound: number
  coefficient3: number
  coefficient2: number
  coefficient1: number
  coefficient0: number
  sampleCount: number
  randomSeed: number
}

export interface MonteCarloIntegrationResult {
  integralEstimate: number
  exactIntegral: number
  absoluteError: number
  standardError: number
  confidenceLower95: number
  confidenceUpper95: number
  sampleMean: number
  sampleStandardDeviation: number
  modelName: string
  limitationDescription: string
}
