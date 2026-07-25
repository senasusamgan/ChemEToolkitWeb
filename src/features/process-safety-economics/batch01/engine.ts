import type {
  AnnualizedLossExpectancyInput,
  AnnualizedLossExpectancyResult,
  CostIndexEscalationInput,
  CostIndexEscalationResult,
  EmergencyVentilationDilutionInput,
  EmergencyVentilationDilutionResult,
  EquipmentCostScalingInput,
  EquipmentCostScalingResult,
  LiquidLeakRateScreeningInput,
  LiquidLeakRateScreeningResult,
  PaybackAndROIAnalysisInput,
  PaybackAndROIAnalysisResult,
} from './types.ts'

export type ProcessSafetyEconomicsBatch01ErrorCode =
  | 'nonFiniteInput'
  | 'invalidEquipmentScalingInputs'
  | 'invalidCostIndexInputs'
  | 'invalidVentilationInputs'
  | 'invalidAnnualizedLossInputs'
  | 'invalidLiquidLeakInputs'
  | 'invalidPaybackInputs'
  | 'numericalFailure'

const messages: Record<
  ProcessSafetyEconomicsBatch01ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidEquipmentScalingInputs:
    'Reference cost, both capacities and scaling exponent must be greater than zero.',
  invalidCostIndexInputs:
    'Historical cost, both cost indices and elapsed years must be greater than zero.',
  invalidVentilationInputs:
    'Enclosure volume, ventilation flow and initial concentration must be positive. Target concentration must be positive and below the initial concentration, and elapsed time cannot be negative.',
  invalidAnnualizedLossInputs:
    'Event frequency and consequence costs cannot be negative, at least one consequence cost must be positive, and insurance recovery fraction must be from zero through one.',
  invalidLiquidLeakInputs:
    'Upstream pressure must exceed downstream pressure. Density, diameter, discharge coefficient and release duration must be positive.',
  invalidPaybackInputs:
    'Initial investment, project life and annual revenue must be positive. Costs and depreciation cannot be negative, and tax rate must be from zero through one.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessSafetyEconomicsBatch01CalculationError
  extends Error {
  readonly code:
    ProcessSafetyEconomicsBatch01ErrorCode

  constructor(
    code:
      ProcessSafetyEconomicsBatch01ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ProcessSafetyEconomicsBatch01CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'numericalFailure',
      )
  }
}

export function calculateEquipmentCostScaling(
  input: EquipmentCostScalingInput,
): EquipmentCostScalingResult {
  validateFinite(Object.values(input))

  if (
    input.referenceEquipmentCost <= 0 ||
    input.referenceCapacity <= 0 ||
    input.targetCapacity <= 0 ||
    input.scalingExponent <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidEquipmentScalingInputs',
      )
  }

  const capacityRatio =
    input.targetCapacity /
    input.referenceCapacity

  const scaledEquipmentCost =
    input.referenceEquipmentCost *
    capacityRatio **
      input.scalingExponent

  const referenceUnitCost =
    input.referenceEquipmentCost /
    input.referenceCapacity

  const targetUnitCost =
    scaledEquipmentCost /
    input.targetCapacity

  const unitCostChangePercent =
    (
      targetUnitCost /
      referenceUnitCost -
      1
    ) *
    100

  const economiesOfScaleObserved =
    capacityRatio > 1 &&
    targetUnitCost <
      referenceUnitCost

  validateResults([
    capacityRatio,
    scaledEquipmentCost,
    referenceUnitCost,
    targetUnitCost,
    unitCostChangePercent,
  ])

  return {
    capacityRatio,
    scaledEquipmentCost,
    referenceUnitCost,
    targetUnitCost,
    unitCostChangePercent,
    economiesOfScaleObserved,
  }
}

export function calculateCostIndexEscalation(
  input: CostIndexEscalationInput,
): CostIndexEscalationResult {
  validateFinite(Object.values(input))

  if (
    input.historicalCost <= 0 ||
    input.baseCostIndex <= 0 ||
    input.targetCostIndex <= 0 ||
    input.elapsedYears <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidCostIndexInputs',
      )
  }

  const indexRatio =
    input.targetCostIndex /
    input.baseCostIndex

  const escalatedCost =
    input.historicalCost *
    indexRatio

  const absoluteCostChange =
    escalatedCost -
    input.historicalCost

  const costChangePercent =
    (
      indexRatio -
      1
    ) *
    100

  const annualizedEscalationRatePercent =
    (
      indexRatio **
        (
          1 /
          input.elapsedYears
        ) -
      1
    ) *
    100

  validateResults([
    indexRatio,
    escalatedCost,
    absoluteCostChange,
    costChangePercent,
    annualizedEscalationRatePercent,
  ])

  return {
    indexRatio,
    escalatedCost,
    absoluteCostChange,
    costChangePercent,
    annualizedEscalationRatePercent,
  }
}

export function calculateEmergencyVentilationDilution(
  input: EmergencyVentilationDilutionInput,
): EmergencyVentilationDilutionResult {
  validateFinite(Object.values(input))

  if (
    input.enclosureVolume <= 0 ||
    input.ventilationFlowRate <= 0 ||
    input.initialConcentration <= 0 ||
    input.targetConcentration <= 0 ||
    input.targetConcentration >=
      input.initialConcentration ||
    input.elapsedTime < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidVentilationInputs',
      )
  }

  const exchangeTimeConstant =
    input.enclosureVolume /
    input.ventilationFlowRate

  const airChangesElapsed =
    input.elapsedTime /
    exchangeTimeConstant

  const concentrationAtElapsedTime =
    input.initialConcentration *
    Math.exp(
      -airChangesElapsed,
    )

  const removalFraction =
    1 -
    concentrationAtElapsedTime /
    input.initialConcentration

  const timeToTarget =
    exchangeTimeConstant *
    Math.log(
      input.initialConcentration /
      input.targetConcentration,
    )

  const airChangeRatePerHour =
    input.ventilationFlowRate /
    input.enclosureVolume *
    3600

  const targetAchieved =
    concentrationAtElapsedTime <=
    input.targetConcentration

  validateResults([
    airChangeRatePerHour,
    exchangeTimeConstant,
    airChangesElapsed,
    concentrationAtElapsedTime,
    removalFraction,
    timeToTarget,
  ])

  return {
    airChangeRatePerHour,
    exchangeTimeConstant,
    airChangesElapsed,
    concentrationAtElapsedTime,
    removalFraction,
    timeToTarget,
    targetAchieved,
  }
}

export function calculateAnnualizedLossExpectancy(
  input: AnnualizedLossExpectancyInput,
): AnnualizedLossExpectancyResult {
  validateFinite(Object.values(input))

  const consequenceCosts = [
    input.assetDamageCost,
    input.businessInterruptionCost,
    input.environmentalRemediationCost,
    input.injuryAndLiabilityCost,
  ]

  if (
    input.eventFrequencyPerYear < 0 ||
    consequenceCosts.some(
      (value) => value < 0,
    ) ||
    consequenceCosts.every(
      (value) => value === 0,
    ) ||
    input.insuranceRecoveryFraction < 0 ||
    input.insuranceRecoveryFraction > 1
  ) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidAnnualizedLossInputs',
      )
  }

  const grossConsequenceCost =
    consequenceCosts.reduce(
      (
        total,
        value,
      ) =>
        total + value,
      0,
    )

  const insuranceRecoveryAmount =
    grossConsequenceCost *
    input.insuranceRecoveryFraction

  const retainedConsequenceCost =
    grossConsequenceCost -
    insuranceRecoveryAmount

  const annualizedLossExpectancy =
    input.eventFrequencyPerYear *
    retainedConsequenceCost

  const expectedEventsPerDecade =
    input.eventFrequencyPerYear *
    10

  const retainedLossFraction =
    retainedConsequenceCost /
    grossConsequenceCost

  validateResults([
    grossConsequenceCost,
    insuranceRecoveryAmount,
    retainedConsequenceCost,
    annualizedLossExpectancy,
    expectedEventsPerDecade,
    retainedLossFraction,
  ])

  return {
    grossConsequenceCost,
    insuranceRecoveryAmount,
    retainedConsequenceCost,
    annualizedLossExpectancy,
    expectedEventsPerDecade,
    retainedLossFraction,
  }
}

export function calculateLiquidLeakRateScreening(
  input: LiquidLeakRateScreeningInput,
): LiquidLeakRateScreeningResult {
  validateFinite(Object.values(input))

  const pressureDrop =
    input.upstreamPressure -
    input.downstreamPressure

  if (
    pressureDrop <= 0 ||
    input.liquidDensity <= 0 ||
    input.orificeDiameter <= 0 ||
    input.dischargeCoefficient <= 0 ||
    input.releaseDuration <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidLiquidLeakInputs',
      )
  }

  const orificeArea =
    Math.PI *
    input.orificeDiameter ** 2 /
    4

  const volumetricLeakRate =
    input.dischargeCoefficient *
    orificeArea *
    Math.sqrt(
      2 *
      pressureDrop /
      input.liquidDensity,
    )

  const massLeakRate =
    input.liquidDensity *
    volumetricLeakRate

  const releasedVolume =
    volumetricLeakRate *
    input.releaseDuration

  const releasedMass =
    massLeakRate *
    input.releaseDuration

  const equivalentLitersPerMinute =
    volumetricLeakRate *
    60_000

  validateResults([
    pressureDrop,
    orificeArea,
    volumetricLeakRate,
    massLeakRate,
    releasedVolume,
    releasedMass,
    equivalentLitersPerMinute,
  ])

  return {
    pressureDrop,
    orificeArea,
    volumetricLeakRate,
    massLeakRate,
    releasedVolume,
    releasedMass,
    equivalentLitersPerMinute,
  }
}

export function calculatePaybackAndROIAnalysis(
  input: PaybackAndROIAnalysisInput,
): PaybackAndROIAnalysisResult {
  validateFinite(Object.values(input))

  if (
    input.initialInvestment <= 0 ||
    input.annualRevenue <= 0 ||
    input.annualOperatingCost < 0 ||
    input.annualDepreciation < 0 ||
    input.incomeTaxRate < 0 ||
    input.incomeTaxRate > 1 ||
    input.projectLifeYears <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidPaybackInputs',
      )
  }

  const annualEBITDA =
    input.annualRevenue -
    input.annualOperatingCost

  const taxableIncome =
    Math.max(
      0,
      annualEBITDA -
      input.annualDepreciation,
    )

  const annualTax =
    taxableIncome *
    input.incomeTaxRate

  const annualNetIncome =
    annualEBITDA -
    input.annualDepreciation -
    annualTax

  const annualCashFlow =
    annualNetIncome +
    input.annualDepreciation

  if (annualCashFlow <= 0) {
    throw new
      ProcessSafetyEconomicsBatch01CalculationError(
        'invalidPaybackInputs',
      )
  }

  const simplePaybackPeriodYears =
    input.initialInvestment /
    annualCashFlow

  const annualReturnOnInvestmentPercent =
    annualNetIncome /
    input.initialInvestment *
    100

  const cumulativeCashFlowAtProjectEnd =
    annualCashFlow *
    input.projectLifeYears -
    input.initialInvestment

  const investmentRecoveredWithinProjectLife =
    simplePaybackPeriodYears <=
    input.projectLifeYears

  validateResults([
    annualEBITDA,
    taxableIncome,
    annualTax,
    annualNetIncome,
    annualCashFlow,
    simplePaybackPeriodYears,
    annualReturnOnInvestmentPercent,
    cumulativeCashFlowAtProjectEnd,
  ])

  return {
    annualEBITDA,
    taxableIncome,
    annualTax,
    annualNetIncome,
    annualCashFlow,
    simplePaybackPeriodYears,
    annualReturnOnInvestmentPercent,
    cumulativeCashFlowAtProjectEnd,
    investmentRecoveredWithinProjectLife,
  }
}
