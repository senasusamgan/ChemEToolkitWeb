export type ProcessSafetyEconomicsBatch04Mode =
  | 'chemicalProcessRiskMatrix'
  | 'hazopGuideWordAssistant'
  | 'inherentlySaferDesignChecklist'
  | 'layerOfProtectionAnalysis'
  | 'safetyIntegrityLevelTarget'
  | 'poolFireRadiationScreening'

export interface ChemicalProcessRiskMatrixInput {
  likelihoodRating: number
  severityRating: number
  existingSafeguardCredit: number
}

export interface ChemicalProcessRiskMatrixResult {
  grossRiskScore: number
  adjustedRiskScore: number
  riskReductionPercent: number
  likelihoodBand: string
  severityBand: string
  riskBand: string
  recommendedAction: string
}

export interface HAZOPGuideWordAssistantInput {
  guideWordCode: number
  parameterCode: number
  safeguardStrengthRating: number
  consequenceSeverityRating: number
}

export interface HAZOPGuideWordAssistantResult {
  guideWord: string
  processParameter: string
  deviationPhrase: string
  likelyCausePrompt: string
  consequencePrompt: string
  safeguardPrompt: string
  recommendationPrompt: string
  screeningPriority: number
  priorityBand: string
}

export interface InherentlySaferDesignChecklistInput {
  minimizeRating: number
  substituteRating: number
  moderateRating: number
  simplifyRating: number
  implementationConfidence: number
}

export interface InherentlySaferDesignChecklistResult {
  averagePrincipleRating: number
  confidenceAdjustedScore: number
  minimizeContribution: number
  substituteContribution: number
  moderateContribution: number
  simplifyContribution: number
  strongestPrinciple: string
  weakestPrinciple: string
  maturityBand: string
}

export interface LayerOfProtectionAnalysisInput {
  initiatingEventFrequency: number
  enablingConditionProbability: number
  conditionalModifierProbability: number
  firstIPLProbabilityOfFailure: number
  secondIPLProbabilityOfFailure: number
  thirdIPLProbabilityOfFailure: number
  tolerableEventFrequency: number
}

export interface LayerOfProtectionAnalysisResult {
  unmitigatedScenarioFrequency: number
  combinedIPLProbabilityOfFailure: number
  mitigatedScenarioFrequency: number
  achievedRiskReductionFactor: number
  requiredRiskReductionFactor: number
  frequencyGapFactor: number
  targetMet: boolean
  assessmentBand: string
}

export interface SafetyIntegrityLevelTargetInput {
  unmitigatedEventFrequency: number
  tolerableEventFrequency: number
  nonSIFRiskReductionFactor: number
}

export interface SafetyIntegrityLevelTargetResult {
  totalRequiredRiskReductionFactor: number
  requiredSIFRiskReductionFactor: number
  targetAverageProbabilityOfFailure: number
  targetSIL: string
  designMarginFactor: number
  beyondConventionalSILRange: boolean
}

export interface PoolFireRadiationScreeningInput {
  burningMassRate: number
  heatOfCombustion: number
  radiantFraction: number
  atmosphericTransmissivity: number
  receptorDistance: number
}

export interface PoolFireRadiationScreeningResult {
  totalHeatReleaseRate: number
  radiatedHeatRate: number
  transmittedRadiatedHeatRate: number
  thermalRadiationFlux: number
  hazardBand: string
  screeningDescription: string
}
