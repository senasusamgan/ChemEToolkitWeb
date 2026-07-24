export interface ExtractionDistributionSelectivityInput {
  raffinateSoluteAConcentration: number
  extractSoluteAConcentration: number
  raffinateSoluteBConcentration: number
  extractSoluteBConcentration: number
}

export interface ExtractionDistributionSelectivityResult {
  distributionCoefficientA: number
  distributionCoefficientB: number
  selectivityAOverB: number
  separationPreference: string
  modelName: string
  limitationDescription: string
}
