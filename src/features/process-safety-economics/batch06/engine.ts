import type {
  ExpectedMonetaryValueDecisionInput,
  ExpectedMonetaryValueDecisionResult,
  FaultTreeProbabilityInput,
  FaultTreeProbabilityResult,
  LifecycleCostAnalysisInput,
  LifecycleCostAnalysisResult,
  ProofTestIntervalCalculatorInput,
  ProofTestIntervalCalculatorResult,
  RiskReductionCostEffectivenessInput,
  RiskReductionCostEffectivenessResult,
  SIFAveragePFDInput,
  SIFAveragePFDResult,
} from './types.ts'

export type ProcessSafetyEconomicsBatch06ErrorCode =
  | 'nonFiniteInput'
  | 'invalidFaultTreeInputs'
  | 'invalidSIFInputs'
  | 'invalidProofTestInputs'
  | 'infeasibleProofTestTarget'
  | 'invalidCostEffectivenessInputs'
  | 'invalidEMVInputs'
  | 'invalidLifecycleInputs'
  | 'numericalFailure'

const messages: Record<
  ProcessSafetyEconomicsBatch06ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidFaultTreeInputs:
    'Gate code must be one for OR or two for AND. Basic-event probabilities must lie from zero through one.',
  invalidSIFInputs:
    'Dangerous failure rate, proof-test interval and repair time must be positive. Diagnostic coverage must lie from zero through one, and common-cause PFD cannot be negative.',
  invalidProofTestInputs:
    'Dangerous failure rate, repair time and target PFD must be positive. Diagnostic coverage must lie from zero through one, and common-cause PFD cannot be negative.',
  infeasibleProofTestTarget:
    'The fixed detected-failure and common-cause contributions already meet or exceed the selected target PFD.',
  invalidCostEffectivenessInputs:
    'Expected losses, implementation cost and annual maintenance cost cannot be negative. Analysis period must be a positive integer and discount rate must be greater than minus one.',
  invalidEMVInputs:
    'Success probabilities must lie from zero through one.',
  invalidLifecycleInputs:
    'Lifecycle costs and salvage value cannot be negative. Project life must be a positive integer, replacement year must be a whole number within the project life, and discount rate must be greater than minus one.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessSafetyEconomicsBatch06CalculationError
  extends Error {
  readonly code:
    ProcessSafetyEconomicsBatch06ErrorCode

  constructor(
    code:
      ProcessSafetyEconomicsBatch06ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ProcessSafetyEconomicsBatch06CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'numericalFailure',
      )
  }
}

function probability(
  value: number,
): boolean {
  return value >= 0 && value <= 1
}

function annuityPresentWorthFactor(
  rate: number,
  years: number,
): number {
  if (Math.abs(rate) < 1e-14) {
    return years
  }

  return (
    1 -
    (1 + rate) ** (-years)
  ) /
  rate
}

function capitalRecoveryFactor(
  rate: number,
  years: number,
): number {
  if (Math.abs(rate) < 1e-14) {
    return 1 / years
  }

  return (
    rate *
    (1 + rate) ** years
  ) /
  (
    (1 + rate) ** years -
    1
  )
}

export function calculateFaultTreeProbability(
  input: FaultTreeProbabilityInput,
): FaultTreeProbabilityResult {
  validateFinite(Object.values(input))

  const probabilities = [
    input.basicEventOneProbability,
    input.basicEventTwoProbability,
    input.basicEventThreeProbability,
  ]

  if (
    ![1, 2].includes(
      input.gateTypeCode,
    ) ||
    probabilities.some(
      (value) =>
        !probability(value),
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'invalidFaultTreeInputs',
      )
  }

  const gateType =
    input.gateTypeCode === 1
      ? 'OR gate'
      : 'AND gate'

  const topEventProbability =
    input.gateTypeCode === 1
      ? 1 -
        probabilities.reduce(
          (
            product,
            value,
          ) =>
            product *
            (1 - value),
          1,
        )
      : probabilities.reduce(
          (
            product,
            value,
          ) =>
            product * value,
          1,
        )

  const topEventSuccessProbability =
    1 -
    topEventProbability

  const equivalentRiskReductionFactor =
    topEventProbability > 0
      ? 1 /
        topEventProbability
      : Number.MAX_VALUE

  const labels = [
    'Basic event 1',
    'Basic event 2',
    'Basic event 3',
  ]

  const dominantIndex =
    probabilities.reduce(
      (
        bestIndex,
        value,
        index,
      ) =>
        value >
        probabilities[bestIndex]
          ? index
          : bestIndex,
      0,
    )

  const probabilityBoundsDescription =
    input.gateTypeCode === 1
      ? 'OR-gate probability lies at or above the largest basic-event probability.'
      : 'AND-gate probability lies at or below the smallest basic-event probability.'

  validateResults([
    topEventProbability,
    topEventSuccessProbability,
    equivalentRiskReductionFactor,
  ])

  return {
    gateType,
    topEventProbability,
    topEventFailurePercent:
      topEventProbability *
      100,
    topEventSuccessProbability,
    equivalentRiskReductionFactor,
    dominantBasicEvent:
      labels[dominantIndex],
    probabilityBoundsDescription,
  }
}

export function calculateSIFAveragePFD(
  input: SIFAveragePFDInput,
): SIFAveragePFDResult {
  validateFinite(Object.values(input))

  if (
    input.dangerousFailureRate <= 0 ||
    !probability(
      input.diagnosticCoverageFraction,
    ) ||
    input.proofTestIntervalHours <= 0 ||
    input.meanRepairTimeHours <= 0 ||
    input.commonCausePFD < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'invalidSIFInputs',
      )
  }

  const dangerousDetectedFailureRate =
    input.dangerousFailureRate *
    input.diagnosticCoverageFraction

  const dangerousUndetectedFailureRate =
    input.dangerousFailureRate *
    (
      1 -
      input.diagnosticCoverageFraction
    )

  const proofTestContribution =
    dangerousUndetectedFailureRate *
    input.proofTestIntervalHours /
    2

  const repairContribution =
    dangerousDetectedFailureRate *
    input.meanRepairTimeHours

  const commonCauseContribution =
    input.commonCausePFD

  const averageProbabilityOfFailureOnDemand =
    proofTestContribution +
    repairContribution +
    commonCauseContribution

  const riskReductionFactor =
    averageProbabilityOfFailureOnDemand >
      0
      ? 1 /
        averageProbabilityOfFailureOnDemand
      : Number.MAX_VALUE

  const screeningSILBand =
    averageProbabilityOfFailureOnDemand <=
      1e-4
      ? 'SIL 3 or better screening range'
      : averageProbabilityOfFailureOnDemand <=
          1e-3
        ? 'SIL 2 screening range'
        : averageProbabilityOfFailureOnDemand <=
            1e-2
          ? 'SIL 1 screening range'
          : 'Below SIL 1 screening range'

  validateResults([
    dangerousDetectedFailureRate,
    dangerousUndetectedFailureRate,
    proofTestContribution,
    repairContribution,
    commonCauseContribution,
    averageProbabilityOfFailureOnDemand,
    riskReductionFactor,
  ])

  return {
    dangerousDetectedFailureRate,
    dangerousUndetectedFailureRate,
    proofTestContribution,
    repairContribution,
    commonCauseContribution,
    averageProbabilityOfFailureOnDemand,
    riskReductionFactor,
    screeningSILBand,
  }
}

export function calculateProofTestInterval(
  input: ProofTestIntervalCalculatorInput,
): ProofTestIntervalCalculatorResult {
  validateFinite(Object.values(input))

  if (
    input.dangerousFailureRate <= 0 ||
    !probability(
      input.diagnosticCoverageFraction,
    ) ||
    input.meanRepairTimeHours <= 0 ||
    input.commonCausePFD < 0 ||
    input.targetAveragePFD <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'invalidProofTestInputs',
      )
  }

  const dangerousDetectedFailureRate =
    input.dangerousFailureRate *
    input.diagnosticCoverageFraction

  const dangerousUndetectedFailureRate =
    input.dangerousFailureRate *
    (
      1 -
      input.diagnosticCoverageFraction
    )

  const fixedPFDContribution =
    dangerousDetectedFailureRate *
    input.meanRepairTimeHours +
    input.commonCausePFD

  const availablePFDForProofTest =
    input.targetAveragePFD -
    fixedPFDContribution

  if (
    availablePFDForProofTest <= 0 ||
    dangerousUndetectedFailureRate <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'infeasibleProofTestTarget',
      )
  }

  const maximumProofTestIntervalHours =
    2 *
    availablePFDForProofTest /
    dangerousUndetectedFailureRate

  const maximumProofTestIntervalDays =
    maximumProofTestIntervalHours /
    24

  const maximumProofTestIntervalYears =
    maximumProofTestIntervalDays /
    365.25

  validateResults([
    dangerousDetectedFailureRate,
    dangerousUndetectedFailureRate,
    fixedPFDContribution,
    availablePFDForProofTest,
    maximumProofTestIntervalHours,
    maximumProofTestIntervalDays,
    maximumProofTestIntervalYears,
  ])

  return {
    dangerousDetectedFailureRate,
    dangerousUndetectedFailureRate,
    fixedPFDContribution,
    availablePFDForProofTest,
    maximumProofTestIntervalHours,
    maximumProofTestIntervalDays,
    maximumProofTestIntervalYears,
    targetFeasible: true,
  }
}

export function calculateRiskReductionCostEffectiveness(
  input: RiskReductionCostEffectivenessInput,
): RiskReductionCostEffectivenessResult {
  validateFinite(Object.values(input))

  if (
    input.baselineAnnualExpectedLoss < 0 ||
    input.residualAnnualExpectedLoss < 0 ||
    input.implementationCost < 0 ||
    input.annualMaintenanceCost < 0 ||
    input.analysisPeriodYears <= 0 ||
    !Number.isInteger(
      input.analysisPeriodYears,
    ) ||
    input.discountRateFraction <= -1
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'invalidCostEffectivenessInputs',
      )
  }

  const grossAnnualRiskReduction =
    input.baselineAnnualExpectedLoss -
    input.residualAnnualExpectedLoss

  const netAnnualBenefit =
    grossAnnualRiskReduction -
    input.annualMaintenanceCost

  const simplePaybackPeriodYears =
    netAnnualBenefit > 0
      ? input.implementationCost /
        netAnnualBenefit
      : Number.MAX_VALUE

  const presentValueOfNetBenefits =
    netAnnualBenefit *
    annuityPresentWorthFactor(
      input.discountRateFraction,
      input.analysisPeriodYears,
    )

  const netPresentValue =
    presentValueOfNetBenefits -
    input.implementationCost

  const benefitCostRatio =
    input.implementationCost > 0
      ? presentValueOfNetBenefits /
        input.implementationCost
      : Number.MAX_VALUE

  const costPerUnitAnnualRiskReduction =
    grossAnnualRiskReduction > 0
      ? (
          input.implementationCost +
          input.annualMaintenanceCost
        ) /
        grossAnnualRiskReduction
      : Number.MAX_VALUE

  validateResults([
    grossAnnualRiskReduction,
    netAnnualBenefit,
    simplePaybackPeriodYears,
    presentValueOfNetBenefits,
    netPresentValue,
    benefitCostRatio,
    costPerUnitAnnualRiskReduction,
  ])

  return {
    grossAnnualRiskReduction,
    netAnnualBenefit,
    simplePaybackPeriodYears,
    presentValueOfNetBenefits,
    netPresentValue,
    benefitCostRatio,
    costPerUnitAnnualRiskReduction,
    economicallyFavorable:
      netPresentValue > 0,
  }
}

export function calculateExpectedMonetaryValueDecision(
  input: ExpectedMonetaryValueDecisionInput,
): ExpectedMonetaryValueDecisionResult {
  validateFinite(Object.values(input))

  if (
    !probability(
      input.optionASuccessProbability,
    ) ||
    !probability(
      input.optionBSuccessProbability,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'invalidEMVInputs',
      )
  }

  const optionAExpectedMonetaryValue =
    input.optionASuccessProbability *
    input.optionASuccessValue +
    (
      1 -
      input.optionASuccessProbability
    ) *
    input.optionAFailureValue

  const optionBExpectedMonetaryValue =
    input.optionBSuccessProbability *
    input.optionBSuccessValue +
    (
      1 -
      input.optionBSuccessProbability
    ) *
    input.optionBFailureValue

  const expectedValueDifference =
    optionAExpectedMonetaryValue -
    optionBExpectedMonetaryValue

  const preferredOption =
    Math.abs(expectedValueDifference) <
      1e-12
      ? 'Equivalent expected monetary value'
      : expectedValueDifference > 0
        ? 'Option A'
        : 'Option B'

  const comparisonScale =
    Math.max(
      Math.abs(
        optionAExpectedMonetaryValue,
      ),
      Math.abs(
        optionBExpectedMonetaryValue,
      ),
      1,
    )

  const relativeDifference =
    Math.abs(
      expectedValueDifference,
    ) /
    comparisonScale

  const decisionStrengthBand =
    relativeDifference < 0.05
      ? 'Close decision'
      : relativeDifference < 0.2
        ? 'Moderate expected-value advantage'
        : 'Strong expected-value advantage'

  validateResults([
    optionAExpectedMonetaryValue,
    optionBExpectedMonetaryValue,
    expectedValueDifference,
    relativeDifference,
  ])

  return {
    optionAExpectedMonetaryValue,
    optionBExpectedMonetaryValue,
    expectedValueDifference,
    preferredOption,
    optionADownsideProbability:
      1 -
      input.optionASuccessProbability,
    optionBDownsideProbability:
      1 -
      input.optionBSuccessProbability,
    decisionStrengthBand,
  }
}

export function calculateLifecycleCostAnalysis(
  input: LifecycleCostAnalysisInput,
): LifecycleCostAnalysisResult {
  validateFinite(Object.values(input))

  const costs = [
    input.initialCapitalCost,
    input.annualOperatingCost,
    input.annualMaintenanceCost,
    input.replacementCost,
    input.terminalSalvageValue,
  ]

  if (
    costs.some(
      (value) => value < 0,
    ) ||
    input.projectLifeYears <= 0 ||
    !Number.isInteger(
      input.projectLifeYears,
    ) ||
    input.replacementYear < 0 ||
    !Number.isInteger(
      input.replacementYear,
    ) ||
    input.replacementYear >
      input.projectLifeYears ||
    input.discountRateFraction <= -1
  ) {
    throw new
      ProcessSafetyEconomicsBatch06CalculationError(
        'invalidLifecycleInputs',
      )
  }

  const presentWorthFactor =
    annuityPresentWorthFactor(
      input.discountRateFraction,
      input.projectLifeYears,
    )

  const presentValueOfOperatingCost =
    input.annualOperatingCost *
    presentWorthFactor

  const presentValueOfMaintenanceCost =
    input.annualMaintenanceCost *
    presentWorthFactor

  const presentValueOfReplacementCost =
    input.replacementYear > 0
      ? input.replacementCost /
        (
          1 +
          input.discountRateFraction
        ) **
        input.replacementYear
      : 0

  const presentValueOfSalvageValue =
    input.terminalSalvageValue /
    (
      1 +
      input.discountRateFraction
    ) **
    input.projectLifeYears

  const totalLifecycleCost =
    input.initialCapitalCost +
    presentValueOfOperatingCost +
    presentValueOfMaintenanceCost +
    presentValueOfReplacementCost -
    presentValueOfSalvageValue

  const equivalentAnnualCost =
    totalLifecycleCost *
    capitalRecoveryFactor(
      input.discountRateFraction,
      input.projectLifeYears,
    )

  const operatingAndMaintenanceCost =
    presentValueOfOperatingCost +
    presentValueOfMaintenanceCost

  const capitalAndReplacementCost =
    input.initialCapitalCost +
    presentValueOfReplacementCost -
    presentValueOfSalvageValue

  const denominator =
    Math.max(
      totalLifecycleCost,
      1e-15,
    )

  const operatingAndMaintenanceSharePercent =
    operatingAndMaintenanceCost /
    denominator *
    100

  const capitalAndReplacementSharePercent =
    capitalAndReplacementCost /
    denominator *
    100

  validateResults([
    presentValueOfOperatingCost,
    presentValueOfMaintenanceCost,
    presentValueOfReplacementCost,
    presentValueOfSalvageValue,
    totalLifecycleCost,
    equivalentAnnualCost,
    operatingAndMaintenanceSharePercent,
    capitalAndReplacementSharePercent,
  ])

  return {
    presentValueOfOperatingCost,
    presentValueOfMaintenanceCost,
    presentValueOfReplacementCost,
    presentValueOfSalvageValue,
    totalLifecycleCost,
    equivalentAnnualCost,
    operatingAndMaintenanceSharePercent,
    capitalAndReplacementSharePercent,
  }
}
