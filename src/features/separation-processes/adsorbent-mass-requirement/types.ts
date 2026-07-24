export interface AdsorbentMassRequirementInput {
  feedMassFlowRate: number
  soluteMassFraction: number
  targetRemovalFraction: number
  workingAdsorptionCapacity: number
  utilizationFraction: number
}

export interface AdsorbentMassRequirementResult {
  feedSoluteRate: number
  soluteRemovedRate: number
  effectiveWorkingCapacity: number
  requiredAdsorbentRate: number
  adsorbentToFeedRatio: number
  untreatedSoluteRate: number
  modelName: string
  limitationDescription: string
}
