export type ProcessSafetyEconomicsBatch01Mode =
  | 'equipmentCostScaling'
  | 'costIndexEscalation'
  | 'emergencyVentilationDilution'
  | 'annualizedLossExpectancy'
  | 'liquidLeakRateScreening'
  | 'paybackAndROIAnalysis'

export interface EquipmentCostScalingInput {
  referenceEquipmentCost: number
  referenceCapacity: number
  targetCapacity: number
  scalingExponent: number
}

export interface EquipmentCostScalingResult {
  capacityRatio: number
  scaledEquipmentCost: number
  referenceUnitCost: number
  targetUnitCost: number
  unitCostChangePercent: number
  economiesOfScaleObserved: boolean
}

export interface CostIndexEscalationInput {
  historicalCost: number
  baseCostIndex: number
  targetCostIndex: number
  elapsedYears: number
}

export interface CostIndexEscalationResult {
  indexRatio: number
  escalatedCost: number
  absoluteCostChange: number
  costChangePercent: number
  annualizedEscalationRatePercent: number
}

export interface EmergencyVentilationDilutionInput {
  enclosureVolume: number
  ventilationFlowRate: number
  initialConcentration: number
  targetConcentration: number
  elapsedTime: number
}

export interface EmergencyVentilationDilutionResult {
  airChangeRatePerHour: number
  exchangeTimeConstant: number
  airChangesElapsed: number
  concentrationAtElapsedTime: number
  removalFraction: number
  timeToTarget: number
  targetAchieved: boolean
}

export interface AnnualizedLossExpectancyInput {
  eventFrequencyPerYear: number
  assetDamageCost: number
  businessInterruptionCost: number
  environmentalRemediationCost: number
  injuryAndLiabilityCost: number
  insuranceRecoveryFraction: number
}

export interface AnnualizedLossExpectancyResult {
  grossConsequenceCost: number
  insuranceRecoveryAmount: number
  retainedConsequenceCost: number
  annualizedLossExpectancy: number
  expectedEventsPerDecade: number
  retainedLossFraction: number
}

export interface LiquidLeakRateScreeningInput {
  upstreamPressure: number
  downstreamPressure: number
  liquidDensity: number
  orificeDiameter: number
  dischargeCoefficient: number
  releaseDuration: number
}

export interface LiquidLeakRateScreeningResult {
  pressureDrop: number
  orificeArea: number
  volumetricLeakRate: number
  massLeakRate: number
  releasedVolume: number
  releasedMass: number
  equivalentLitersPerMinute: number
}

export interface PaybackAndROIAnalysisInput {
  initialInvestment: number
  annualRevenue: number
  annualOperatingCost: number
  annualDepreciation: number
  incomeTaxRate: number
  projectLifeYears: number
}

export interface PaybackAndROIAnalysisResult {
  annualEBITDA: number
  taxableIncome: number
  annualTax: number
  annualNetIncome: number
  annualCashFlow: number
  simplePaybackPeriodYears: number
  annualReturnOnInvestmentPercent: number
  cumulativeCashFlowAtProjectEnd: number
  investmentRecoveredWithinProjectLife: boolean
}
