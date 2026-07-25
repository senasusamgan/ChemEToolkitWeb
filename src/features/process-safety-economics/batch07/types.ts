export type Mode =
  | 'individualRiskScreening'
  | 'societalRiskFNScreening'
  | 'alarpGrossDisproportionScreening'
  | 'safetyProjectPortfolioRanking'

export interface IndividualRiskInput {
  scenarioFrequencyPerYear: number
  fatalityProbabilityGivenExposure: number
  occupancyFraction: number
  presenceProbability: number
}
export interface IndividualRiskResult {
  combinedExposureProbability: number
  annualIndividualRisk: number
  annualIndividualRiskPerMillion: number
  returnPeriodYears: number
  screeningBand: string
  assessmentDescription: string
}

export interface SocietalRiskInput {
  scenarioFrequencyPerYear: number
  estimatedFatalities: number
  criterionCoefficient: number
  criterionExponent: number
}
export interface SocietalRiskResult {
  cumulativeFrequency: number
  fatalityCount: number
  criterionFrequency: number
  frequencyToCriterionRatio: number
  logarithmicMargin: number
  criterionSatisfied: boolean
  screeningBand: string
  assessmentDescription: string
}

export interface ALARPInput {
  measureCost: number
  annualRiskReductionBenefit: number
  remainingLifeYears: number
  discountRateFraction: number
  grossDisproportionFactor: number
}
export interface ALARPResult {
  presentValueOfRiskReductionBenefit: number
  grossDisproportionAdjustedBenefit: number
  costToBenefitRatio: number
  costToAdjustedBenefitRatio: number
  maximumReasonablyPracticableCost: number
  netAdjustedBenefit: number
  reasonablyPracticable: boolean
  decisionBand: string
}

export interface PortfolioInput {
  project1RiskReduction: number
  project1Cost: number
  project1UrgencyRating: number
  project2RiskReduction: number
  project2Cost: number
  project2UrgencyRating: number
  project3RiskReduction: number
  project3Cost: number
  project3UrgencyRating: number
}
export interface PortfolioResult {
  project1Score: number
  project2Score: number
  project3Score: number
  project1BenefitCostRatio: number
  project2BenefitCostRatio: number
  project3BenefitCostRatio: number
  rankedProjectNames: string[]
  rankedProjectScores: number[]
  highestPriorityProject: string
  scoreSeparationPercent: number
}
