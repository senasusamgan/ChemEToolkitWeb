import type {
  AnnualOperatingCostEstimateInput,
  AnnualOperatingCostEstimateResult,
  InternalRateOfReturnAnalysisInput,
  InternalRateOfReturnAnalysisResult,
  LangFactorCapitalEstimateInput,
  LangFactorCapitalEstimateResult,
  NetPresentValueAnalysisInput,
  NetPresentValueAnalysisResult,
  StraightLineDepreciationInput,
  StraightLineDepreciationResult,
  TotalCapitalInvestmentEstimateInput,
  TotalCapitalInvestmentEstimateResult,
} from './types.ts'

export type ProcessSafetyEconomicsBatch02ErrorCode =
  | 'nonFiniteInput'
  | 'invalidLangFactorInputs'
  | 'invalidCapitalInvestmentInputs'
  | 'invalidOperatingCostInputs'
  | 'invalidDepreciationInputs'
  | 'invalidNPVInputs'
  | 'invalidIRRInputs'
  | 'rootNotBracketed'
  | 'numericalFailure'

const messages: Record<
  ProcessSafetyEconomicsBatch02ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidLangFactorInputs:
    'Purchased-equipment cost and Lang factor must be positive. Fractions must be from zero through one, and land cost cannot be negative.',
  invalidCapitalInvestmentInputs:
    'Capital-cost components cannot be negative, purchased-equipment cost must be positive, and both fractions must be from zero through one.',
  invalidOperatingCostInputs:
    'Annual costs and fixed capital cannot be negative, annual production must be positive, and both fractions must be from zero through one.',
  invalidDepreciationInputs:
    'Initial asset cost and useful life must be positive. Salvage value and elapsed years cannot be negative, and salvage value cannot exceed initial cost.',
  invalidNPVInputs:
    'Initial investment and project life must be positive. Terminal value cannot be negative, and discount rate must be greater than −100%.',
  invalidIRRInputs:
    'Initial investment and project life must be positive. Terminal value cannot be negative, and search rates must satisfy −1 < minimum < maximum.',
  rootNotBracketed:
    'The selected search interval does not bracket an IRR root.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessSafetyEconomicsBatch02CalculationError
  extends Error {
  readonly code:
    ProcessSafetyEconomicsBatch02ErrorCode

  constructor(
    code:
      ProcessSafetyEconomicsBatch02ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ProcessSafetyEconomicsBatch02CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'numericalFailure',
      )
  }
}

function isFraction(
  value: number,
): boolean {
  return value >= 0 && value <= 1
}

export function calculateLangFactorCapitalEstimate(
  input: LangFactorCapitalEstimateInput,
): LangFactorCapitalEstimateResult {
  validateFinite(Object.values(input))

  if (
    input.purchasedEquipmentCost <= 0 ||
    input.langFactor <= 0 ||
    !isFraction(
      input
        .workingCapitalFractionOfFixedCapital,
    ) ||
    !isFraction(
      input
        .startupCostFractionOfFixedCapital,
    ) ||
    input.landCost < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'invalidLangFactorInputs',
      )
  }

  const fixedCapitalInvestment =
    input.purchasedEquipmentCost *
    input.langFactor

  const workingCapital =
    fixedCapitalInvestment *
    input
      .workingCapitalFractionOfFixedCapital

  const startupCost =
    fixedCapitalInvestment *
    input
      .startupCostFractionOfFixedCapital

  const totalCapitalInvestment =
    fixedCapitalInvestment +
    workingCapital +
    startupCost +
    input.landCost

  const totalToEquipmentCostRatio =
    totalCapitalInvestment /
    input.purchasedEquipmentCost

  validateResults([
    fixedCapitalInvestment,
    workingCapital,
    startupCost,
    totalCapitalInvestment,
    totalToEquipmentCostRatio,
  ])

  return {
    fixedCapitalInvestment,
    workingCapital,
    startupCost,
    landCost:
      input.landCost,
    totalCapitalInvestment,
    totalToEquipmentCostRatio,
  }
}

export function calculateTotalCapitalInvestmentEstimate(
  input: TotalCapitalInvestmentEstimateInput,
): TotalCapitalInvestmentEstimateResult {
  validateFinite(Object.values(input))

  const components = [
    input.purchasedEquipmentCost,
    input.equipmentInstallationCost,
    input.pipingCost,
    input.instrumentationCost,
    input.electricalCost,
    input.buildingsAndYardCost,
    input
      .utilitiesAndServiceFacilitiesCost,
    input
      .engineeringAndConstructionCost,
  ]

  if (
    input.purchasedEquipmentCost <= 0 ||
    components.some(
      (value) => value < 0,
    ) ||
    !isFraction(
      input
        .contingencyFractionOfSubtotal,
    ) ||
    !isFraction(
      input
        .workingCapitalFractionOfFixedCapital,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'invalidCapitalInvestmentInputs',
      )
  }

  const directAndIndirectSubtotal =
    components.reduce(
      (
        total,
        value,
      ) =>
        total + value,
      0,
    )

  const contingencyCost =
    directAndIndirectSubtotal *
    input
      .contingencyFractionOfSubtotal

  const fixedCapitalInvestment =
    directAndIndirectSubtotal +
    contingencyCost

  const workingCapital =
    fixedCapitalInvestment *
    input
      .workingCapitalFractionOfFixedCapital

  const totalCapitalInvestment =
    fixedCapitalInvestment +
    workingCapital

  const purchasedEquipmentFractionOfTotal =
    input.purchasedEquipmentCost /
    totalCapitalInvestment

  validateResults([
    directAndIndirectSubtotal,
    contingencyCost,
    fixedCapitalInvestment,
    workingCapital,
    totalCapitalInvestment,
    purchasedEquipmentFractionOfTotal,
  ])

  return {
    directAndIndirectSubtotal,
    contingencyCost,
    fixedCapitalInvestment,
    workingCapital,
    totalCapitalInvestment,
    purchasedEquipmentFractionOfTotal,
  }
}

export function calculateAnnualOperatingCostEstimate(
  input: AnnualOperatingCostEstimateInput,
): AnnualOperatingCostEstimateResult {
  validateFinite(Object.values(input))

  const directCosts = [
    input.rawMaterialCost,
    input.utilityCost,
    input.operatingLaborCost,
    input.maintenanceCost,
    input.wasteTreatmentCost,
    input.laboratoryAndQualityCost,
  ]

  if (
    directCosts.some(
      (value) => value < 0,
    ) ||
    input.fixedCapitalInvestment < 0 ||
    input.annualProduction <= 0 ||
    !isFraction(
      input
        .plantOverheadFractionOfLaborAndMaintenance,
    ) ||
    !isFraction(
      input
        .insuranceAndTaxFractionOfFixedCapital,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'invalidOperatingCostInputs',
      )
  }

  const directCashOperatingCost =
    directCosts.reduce(
      (
        total,
        value,
      ) =>
        total + value,
      0,
    )

  const plantOverheadCost =
    (
      input.operatingLaborCost +
      input.maintenanceCost
    ) *
    input
      .plantOverheadFractionOfLaborAndMaintenance

  const insuranceAndTaxCost =
    input.fixedCapitalInvestment *
    input
      .insuranceAndTaxFractionOfFixedCapital

  const totalAnnualOperatingCost =
    directCashOperatingCost +
    plantOverheadCost +
    insuranceAndTaxCost

  const unitProductionCost =
    totalAnnualOperatingCost /
    input.annualProduction

  const variableCost =
    input.rawMaterialCost +
    input.utilityCost +
    input.wasteTreatmentCost

  const variableCostFraction =
    totalAnnualOperatingCost > 0
      ? variableCost /
        totalAnnualOperatingCost
      : 0

  const laborAndMaintenanceFraction =
    totalAnnualOperatingCost > 0
      ? (
          input.operatingLaborCost +
          input.maintenanceCost
        ) /
        totalAnnualOperatingCost
      : 0

  const labeledCosts = [
    ['Raw materials', input.rawMaterialCost],
    ['Utilities', input.utilityCost],
    ['Operating labor', input.operatingLaborCost],
    ['Maintenance', input.maintenanceCost],
    ['Waste treatment', input.wasteTreatmentCost],
    ['Laboratory and quality', input.laboratoryAndQualityCost],
    ['Plant overhead', plantOverheadCost],
    ['Insurance and tax', insuranceAndTaxCost],
  ] as const

  const largestCostCategory =
    labeledCosts.reduce(
      (
        current,
        candidate,
      ) =>
        candidate[1] >
        current[1]
          ? candidate
          : current,
    )[0]

  validateResults([
    directCashOperatingCost,
    plantOverheadCost,
    insuranceAndTaxCost,
    totalAnnualOperatingCost,
    unitProductionCost,
    variableCostFraction,
    laborAndMaintenanceFraction,
  ])

  return {
    directCashOperatingCost,
    plantOverheadCost,
    insuranceAndTaxCost,
    totalAnnualOperatingCost,
    unitProductionCost,
    variableCostFraction,
    laborAndMaintenanceFraction,
    largestCostCategory,
  }
}

export function calculateStraightLineDepreciation(
  input: StraightLineDepreciationInput,
): StraightLineDepreciationResult {
  validateFinite(Object.values(input))

  if (
    input.initialAssetCost <= 0 ||
    input.salvageValue < 0 ||
    input.salvageValue >
      input.initialAssetCost ||
    input.usefulLifeYears <= 0 ||
    input.elapsedYears < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'invalidDepreciationInputs',
      )
  }

  const depreciableBasis =
    input.initialAssetCost -
    input.salvageValue

  const annualDepreciation =
    depreciableBasis /
    input.usefulLifeYears

  const effectiveElapsedYears =
    Math.min(
      input.elapsedYears,
      input.usefulLifeYears,
    )

  const accumulatedDepreciation =
    annualDepreciation *
    effectiveElapsedYears

  const bookValue =
    Math.max(
      input.salvageValue,
      input.initialAssetCost -
        accumulatedDepreciation,
    )

  const remainingDepreciableAmount =
    Math.max(
      0,
      bookValue -
        input.salvageValue,
    )

  const depreciatedLifeFraction =
    effectiveElapsedYears /
    input.usefulLifeYears

  const fullyDepreciated =
    input.elapsedYears >=
    input.usefulLifeYears

  validateResults([
    depreciableBasis,
    annualDepreciation,
    accumulatedDepreciation,
    bookValue,
    remainingDepreciableAmount,
    depreciatedLifeFraction,
  ])

  return {
    depreciableBasis,
    annualDepreciation,
    accumulatedDepreciation,
    bookValue,
    remainingDepreciableAmount,
    depreciatedLifeFraction,
    fullyDepreciated,
  }
}

function presentValueOfAnnuity(
  annualCashFlow: number,
  rate: number,
  years: number,
): number {
  if (Math.abs(rate) < 1e-14) {
    return annualCashFlow * years
  }

  return (
    annualCashFlow *
    (
      1 -
      (1 + rate) ** (-years)
    ) /
    rate
  )
}

function projectNPV(
  initialInvestment: number,
  annualCashFlow: number,
  terminalValue: number,
  years: number,
  rate: number,
): number {
  return (
    -initialInvestment +
    presentValueOfAnnuity(
      annualCashFlow,
      rate,
      years,
    ) +
    terminalValue /
    (1 + rate) ** years
  )
}

export function calculateNetPresentValueAnalysis(
  input: NetPresentValueAnalysisInput,
): NetPresentValueAnalysisResult {
  validateFinite(Object.values(input))

  if (
    input.initialInvestment <= 0 ||
    input.projectLifeYears <= 0 ||
    !Number.isInteger(
      input.projectLifeYears,
    ) ||
    input.terminalValue < 0 ||
    input.discountRateFraction <= -1
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'invalidNPVInputs',
      )
  }

  const presentValueOfAnnualCashFlows =
    presentValueOfAnnuity(
      input.annualNetCashFlow,
      input.discountRateFraction,
      input.projectLifeYears,
    )

  const presentValueOfTerminalValue =
    input.terminalValue /
    (
      1 +
      input.discountRateFraction
    ) **
    input.projectLifeYears

  const netPresentValue =
    -input.initialInvestment +
    presentValueOfAnnualCashFlows +
    presentValueOfTerminalValue

  const profitabilityIndex =
    (
      presentValueOfAnnualCashFlows +
      presentValueOfTerminalValue
    ) /
    input.initialInvestment

  const discountedAnnualEquivalent =
    input.projectLifeYears > 0
      ? (
          presentValueOfAnnualCashFlows +
          presentValueOfTerminalValue
        ) /
        input.projectLifeYears
      : 0

  const discountedPaybackApproximationYears =
    discountedAnnualEquivalent > 0
      ? input.initialInvestment /
        discountedAnnualEquivalent
      : Number.POSITIVE_INFINITY

  const finitePayback =
    Number.isFinite(
      discountedPaybackApproximationYears,
    )
      ? discountedPaybackApproximationYears
      : 0

  validateResults([
    presentValueOfAnnualCashFlows,
    presentValueOfTerminalValue,
    netPresentValue,
    profitabilityIndex,
    finitePayback,
  ])

  return {
    presentValueOfAnnualCashFlows,
    presentValueOfTerminalValue,
    netPresentValue,
    profitabilityIndex,
    discountedPaybackApproximationYears,
    valueCreating:
      netPresentValue > 0,
  }
}

export function calculateInternalRateOfReturnAnalysis(
  input: InternalRateOfReturnAnalysisInput,
): InternalRateOfReturnAnalysisResult {
  validateFinite(Object.values(input))

  if (
    input.initialInvestment <= 0 ||
    input.projectLifeYears <= 0 ||
    !Number.isInteger(
      input.projectLifeYears,
    ) ||
    input.terminalValue < 0 ||
    input.minimumSearchRate <= -1 ||
    input.maximumSearchRate <=
      input.minimumSearchRate
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'invalidIRRInputs',
      )
  }

  let lower =
    input.minimumSearchRate
  let upper =
    input.maximumSearchRate

  let lowerNPV =
    projectNPV(
      input.initialInvestment,
      input.annualNetCashFlow,
      input.terminalValue,
      input.projectLifeYears,
      lower,
    )

  let upperNPV =
    projectNPV(
      input.initialInvestment,
      input.annualNetCashFlow,
      input.terminalValue,
      input.projectLifeYears,
      upper,
    )

  if (
    lowerNPV === 0
  ) {
    return {
      internalRateOfReturn:
        lower,
      netPresentValueAtIRR:
        0,
      lowerBracketRate:
        lower,
      upperBracketRate:
        lower,
      iterationCount:
        0,
      annualCashFlowToInvestmentRatio:
        input.annualNetCashFlow /
        input.initialInvestment,
    }
  }

  if (
    upperNPV === 0
  ) {
    return {
      internalRateOfReturn:
        upper,
      netPresentValueAtIRR:
        0,
      lowerBracketRate:
        upper,
      upperBracketRate:
        upper,
      iterationCount:
        0,
      annualCashFlowToInvestmentRatio:
        input.annualNetCashFlow /
        input.initialInvestment,
    }
  }

  if (
    lowerNPV *
    upperNPV >
    0
  ) {
    throw new
      ProcessSafetyEconomicsBatch02CalculationError(
        'rootNotBracketed',
      )
  }

  let midpoint =
    (lower + upper) /
    2
  let midpointNPV =
    projectNPV(
      input.initialInvestment,
      input.annualNetCashFlow,
      input.terminalValue,
      input.projectLifeYears,
      midpoint,
    )

  let iterationCount = 0

  for (
    iterationCount = 1;
    iterationCount <= 200;
    iterationCount += 1
  ) {
    midpoint =
      (lower + upper) /
      2

    midpointNPV =
      projectNPV(
        input.initialInvestment,
        input.annualNetCashFlow,
        input.terminalValue,
        input.projectLifeYears,
        midpoint,
      )

    if (
      Math.abs(midpointNPV) < 1e-8 ||
      Math.abs(upper - lower) <
        1e-15
    ) {
      break
    }

    if (
      lowerNPV *
      midpointNPV <=
      0
    ) {
      upper =
        midpoint
      upperNPV =
        midpointNPV
    } else {
      lower =
        midpoint
      lowerNPV =
        midpointNPV
    }
  }

  validateResults([
    midpoint,
    midpointNPV,
    lower,
    upper,
    input.annualNetCashFlow /
      input.initialInvestment,
  ])

  return {
    internalRateOfReturn:
      midpoint,
    netPresentValueAtIRR:
      midpointNPV,
    lowerBracketRate:
      lower,
    upperBracketRate:
      upper,
    iterationCount,
    annualCashFlowToInvestmentRatio:
      input.annualNetCashFlow /
      input.initialInvestment,
  }
}
