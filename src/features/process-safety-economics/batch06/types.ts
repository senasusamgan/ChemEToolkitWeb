export type ProcessSafetyEconomicsBatch06Mode =
  | 'faultTreeProbability'
  | 'sifAveragePFD'
  | 'proofTestIntervalCalculator'
  | 'riskReductionCostEffectiveness'
  | 'expectedMonetaryValueDecision'
  | 'lifecycleCostAnalysis'

export interface FaultTreeProbabilityInput {
  gateTypeCode: number
  basicEventOneProbability: number
  basicEventTwoProbability: number
  basicEventThreeProbability: number
}

export interface FaultTreeProbabilityResult {
  gateType: string
  topEventProbability: number
  topEventFailurePercent: number
  topEventSuccessProbability: number
  equivalentRiskReductionFactor: number
  dominantBasicEvent: string
  probabilityBoundsDescription: string
}

export interface SIFAveragePFDInput {
  dangerousFailureRate: number
  diagnosticCoverageFraction: number
  proofTestIntervalHours: number
  meanRepairTimeHours: number
  commonCausePFD: number
}

export interface SIFAveragePFDResult {
  dangerousDetectedFailureRate: number
  dangerousUndetectedFailureRate: number
  proofTestContribution: number
  repairContribution: number
  commonCauseContribution: number
  averageProbabilityOfFailureOnDemand: number
  riskReductionFactor: number
  screeningSILBand: string
}

export interface ProofTestIntervalCalculatorInput {
  dangerousFailureRate: number
  diagnosticCoverageFraction: number
  meanRepairTimeHours: number
  commonCausePFD: number
  targetAveragePFD: number
}

export interface ProofTestIntervalCalculatorResult {
  dangerousDetectedFailureRate: number
  dangerousUndetectedFailureRate: number
  fixedPFDContribution: number
  availablePFDForProofTest: number
  maximumProofTestIntervalHours: number
  maximumProofTestIntervalDays: number
  maximumProofTestIntervalYears: number
  targetFeasible: boolean
}

export interface RiskReductionCostEffectivenessInput {
  baselineAnnualExpectedLoss: number
  residualAnnualExpectedLoss: number
  implementationCost: number
  annualMaintenanceCost: number
  analysisPeriodYears: number
  discountRateFraction: number
}

export interface RiskReductionCostEffectivenessResult {
  grossAnnualRiskReduction: number
  netAnnualBenefit: number
  simplePaybackPeriodYears: number
  presentValueOfNetBenefits: number
  netPresentValue: number
  benefitCostRatio: number
  costPerUnitAnnualRiskReduction: number
  economicallyFavorable: boolean
}

export interface ExpectedMonetaryValueDecisionInput {
  optionASuccessProbability: number
  optionASuccessValue: number
  optionAFailureValue: number
  optionBSuccessProbability: number
  optionBSuccessValue: number
  optionBFailureValue: number
}

export interface ExpectedMonetaryValueDecisionResult {
  optionAExpectedMonetaryValue: number
  optionBExpectedMonetaryValue: number
  expectedValueDifference: number
  preferredOption: string
  optionADownsideProbability: number
  optionBDownsideProbability: number
  decisionStrengthBand: string
}

export interface LifecycleCostAnalysisInput {
  initialCapitalCost: number
  annualOperatingCost: number
  annualMaintenanceCost: number
  replacementCost: number
  replacementYear: number
  projectLifeYears: number
  discountRateFraction: number
  terminalSalvageValue: number
}

export interface LifecycleCostAnalysisResult {
  presentValueOfOperatingCost: number
  presentValueOfMaintenanceCost: number
  presentValueOfReplacementCost: number
  presentValueOfSalvageValue: number
  totalLifecycleCost: number
  equivalentAnnualCost: number
  operatingAndMaintenanceSharePercent: number
  capitalAndReplacementSharePercent: number
}
