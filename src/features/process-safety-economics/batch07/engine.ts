import type {
  ALARPInput, ALARPResult, IndividualRiskInput, IndividualRiskResult,
  PortfolioInput, PortfolioResult, SocietalRiskInput, SocietalRiskResult,
} from './types.ts'

export type ErrorCode =
  | 'nonFiniteInput'
  | 'invalidIndividualRiskInputs'
  | 'invalidSocietalRiskInputs'
  | 'invalidALARPInputs'
  | 'invalidPortfolioInputs'
  | 'numericalFailure'

const messages: Record<ErrorCode, string> = {
  nonFiniteInput: 'All calculator inputs must be finite.',
  invalidIndividualRiskInputs:
    'Scenario frequency cannot be negative. Fatality, occupancy and presence probabilities must lie from zero through one.',
  invalidSocietalRiskInputs:
    'Scenario frequency, fatality count, criterion coefficient and criterion exponent must be positive.',
  invalidALARPInputs:
    'Measure cost, annual benefit, remaining life and gross-disproportion factor must be positive. Discount rate must be greater than minus one.',
  invalidPortfolioInputs:
    'Risk reduction cannot be negative. Costs must be positive and urgency ratings must lie from one through five.',
  numericalFailure: 'The calculation produced a non-finite result.',
}

export class Batch07Error extends Error {
  readonly code: ErrorCode
  constructor(code: ErrorCode) {
    super(messages[code])
    this.name = 'Batch07Error'
    this.code = code
  }
}

function finite(values: number[]) {
  if (!values.every(Number.isFinite)) throw new Batch07Error('nonFiniteInput')
}
function valid(values: number[]) {
  if (!values.every(Number.isFinite)) throw new Batch07Error('numericalFailure')
}
function probability(value: number) {
  return value >= 0 && value <= 1
}
function pwFactor(rate: number, years: number) {
  return Math.abs(rate) < 1e-14
    ? years
    : (1 - (1 + rate) ** (-years)) / rate
}

export function calculateIndividualRisk(input: IndividualRiskInput): IndividualRiskResult {
  finite(Object.values(input))
  if (
    input.scenarioFrequencyPerYear < 0 ||
    !probability(input.fatalityProbabilityGivenExposure) ||
    !probability(input.occupancyFraction) ||
    !probability(input.presenceProbability)
  ) throw new Batch07Error('invalidIndividualRiskInputs')

  const combinedExposureProbability =
    input.fatalityProbabilityGivenExposure *
    input.occupancyFraction *
    input.presenceProbability
  const annualIndividualRisk =
    input.scenarioFrequencyPerYear * combinedExposureProbability
  const annualIndividualRiskPerMillion = annualIndividualRisk * 1_000_000
  const returnPeriodYears = annualIndividualRisk > 0
    ? 1 / annualIndividualRisk
    : Number.MAX_VALUE

  let screeningBand: string
  let assessmentDescription: string
  if (annualIndividualRisk === 0) {
    screeningBand = 'Zero entered screening risk'
    assessmentDescription = 'The entered scenario or exposure terms produce zero annual individual risk.'
  } else if (annualIndividualRisk < 1e-6) {
    screeningBand = 'Below 10⁻⁶ per year'
    assessmentDescription = 'Below one in one million per year.'
  } else if (annualIndividualRisk < 1e-5) {
    screeningBand = '10⁻⁶ to below 10⁻⁵ per year'
    assessmentDescription = 'Between one in one million and one in one hundred thousand per year.'
  } else if (annualIndividualRisk < 1e-4) {
    screeningBand = '10⁻⁵ to below 10⁻⁴ per year'
    assessmentDescription = 'Between one in one hundred thousand and one in ten thousand per year.'
  } else {
    screeningBand = 'At or above 10⁻⁴ per year'
    assessmentDescription = 'At or above one in ten thousand per year.'
  }

  valid([combinedExposureProbability, annualIndividualRisk, annualIndividualRiskPerMillion, returnPeriodYears])
  return {
    combinedExposureProbability, annualIndividualRisk, annualIndividualRiskPerMillion,
    returnPeriodYears, screeningBand, assessmentDescription,
  }
}

export function calculateSocietalRisk(input: SocietalRiskInput): SocietalRiskResult {
  finite(Object.values(input))
  if (
    input.scenarioFrequencyPerYear <= 0 ||
    input.estimatedFatalities <= 0 ||
    input.criterionCoefficient <= 0 ||
    input.criterionExponent <= 0
  ) throw new Batch07Error('invalidSocietalRiskInputs')

  const cumulativeFrequency = input.scenarioFrequencyPerYear
  const criterionFrequency =
    input.criterionCoefficient / input.estimatedFatalities ** input.criterionExponent
  const frequencyToCriterionRatio = cumulativeFrequency / criterionFrequency
  const logarithmicMargin = Math.log10(criterionFrequency / cumulativeFrequency)
  const criterionSatisfied = cumulativeFrequency <= criterionFrequency
  const screeningBand =
    frequencyToCriterionRatio <= 0.1 ? 'Well below entered criterion' :
    frequencyToCriterionRatio <= 1 ? 'Below entered criterion' :
    frequencyToCriterionRatio <= 10 ? 'Criterion exceeded' :
    'Criterion substantially exceeded'
  const assessmentDescription = criterionSatisfied
    ? 'The cumulative frequency is at or below the selected F–N criterion.'
    : 'The cumulative frequency exceeds the selected F–N criterion.'

  valid([cumulativeFrequency, criterionFrequency, frequencyToCriterionRatio, logarithmicMargin])
  return {
    cumulativeFrequency, fatalityCount: input.estimatedFatalities, criterionFrequency,
    frequencyToCriterionRatio, logarithmicMargin, criterionSatisfied,
    screeningBand, assessmentDescription,
  }
}

export function calculateALARP(input: ALARPInput): ALARPResult {
  finite(Object.values(input))
  if (
    input.measureCost <= 0 ||
    input.annualRiskReductionBenefit <= 0 ||
    input.remainingLifeYears <= 0 ||
    !Number.isInteger(input.remainingLifeYears) ||
    input.discountRateFraction <= -1 ||
    input.grossDisproportionFactor <= 0
  ) throw new Batch07Error('invalidALARPInputs')

  const presentValueOfRiskReductionBenefit =
    input.annualRiskReductionBenefit *
    pwFactor(input.discountRateFraction, input.remainingLifeYears)
  const grossDisproportionAdjustedBenefit =
    presentValueOfRiskReductionBenefit * input.grossDisproportionFactor
  const costToBenefitRatio = input.measureCost / presentValueOfRiskReductionBenefit
  const costToAdjustedBenefitRatio = input.measureCost / grossDisproportionAdjustedBenefit
  const maximumReasonablyPracticableCost = grossDisproportionAdjustedBenefit
  const netAdjustedBenefit = grossDisproportionAdjustedBenefit - input.measureCost
  const reasonablyPracticable = input.measureCost <= grossDisproportionAdjustedBenefit
  const decisionBand =
    costToAdjustedBenefitRatio <= 0.5 ? 'Strongly favorable screening case' :
    costToAdjustedBenefitRatio <= 1 ? 'Reasonably practicable screening case' :
    costToAdjustedBenefitRatio <= 2 ? 'Borderline gross-disproportion case' :
    'Cost exceeds adjusted benefit'

  valid([
    presentValueOfRiskReductionBenefit, grossDisproportionAdjustedBenefit,
    costToBenefitRatio, costToAdjustedBenefitRatio,
    maximumReasonablyPracticableCost, netAdjustedBenefit,
  ])
  return {
    presentValueOfRiskReductionBenefit, grossDisproportionAdjustedBenefit,
    costToBenefitRatio, costToAdjustedBenefitRatio,
    maximumReasonablyPracticableCost, netAdjustedBenefit,
    reasonablyPracticable, decisionBand,
  }
}

export function calculatePortfolio(input: PortfolioInput): PortfolioResult {
  finite(Object.values(input))
  const rr = [input.project1RiskReduction, input.project2RiskReduction, input.project3RiskReduction]
  const cost = [input.project1Cost, input.project2Cost, input.project3Cost]
  const urgency = [input.project1UrgencyRating, input.project2UrgencyRating, input.project3UrgencyRating]
  if (
    rr.some((value) => value < 0) ||
    cost.some((value) => value <= 0) ||
    urgency.some((value) => value < 1 || value > 5)
  ) throw new Batch07Error('invalidPortfolioInputs')

  const ratios = rr.map((value, index) => value / cost[index])
  const scores = ratios.map((value, index) => value * urgency[index])
  const ranking = [
    { name: 'Project 1', score: scores[0] },
    { name: 'Project 2', score: scores[1] },
    { name: 'Project 3', score: scores[2] },
  ].sort((a, b) => b.score - a.score)
  const scoreSeparationPercent = ranking[0].score > 0
    ? (ranking[0].score - ranking[1].score) / ranking[0].score * 100
    : 0

  valid([...ratios, ...scores, scoreSeparationPercent])
  return {
    project1Score: scores[0], project2Score: scores[1], project3Score: scores[2],
    project1BenefitCostRatio: ratios[0], project2BenefitCostRatio: ratios[1],
    project3BenefitCostRatio: ratios[2],
    rankedProjectNames: ranking.map((item) => item.name),
    rankedProjectScores: ranking.map((item) => item.score),
    highestPriorityProject: ranking[0].name,
    scoreSeparationPercent,
  }
}
