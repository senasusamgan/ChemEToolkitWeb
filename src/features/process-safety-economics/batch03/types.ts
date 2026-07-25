export type ProcessSafetyEconomicsBatch03Mode =
  | 'breakEvenProductionAnalysis'
  | 'equivalentAnnualWorth'
  | 'economicSensitivityAnalysis'
  | 'flammabilityMixtureLimits'
  | 'gasReliefValveSizing'
  | 'liquidReliefValveSizing'

export interface BreakEvenProductionAnalysisInput {
  fixedAnnualCost: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  expectedAnnualProduction: number
}

export interface BreakEvenProductionAnalysisResult {
  contributionMarginPerUnit: number
  contributionMarginRatio: number
  breakEvenProductionUnits: number
  breakEvenRevenue: number
  expectedAnnualProfit: number
  marginOfSafetyUnits: number
  marginOfSafetyPercent: number
  profitableAtExpectedProduction: boolean
}

export interface EquivalentAnnualWorthInput {
  initialInvestment: number
  annualNetCashFlow: number
  terminalValue: number
  projectLifeYears: number
  discountRateFraction: number
}

export interface EquivalentAnnualWorthResult {
  presentWorth: number
  capitalRecoveryFactor: number
  annualizedInitialInvestment: number
  annualizedTerminalValue: number
  equivalentAnnualWorth: number
  valueCreating: boolean
}

export interface EconomicSensitivityAnalysisInput {
  baseAnnualRevenue: number
  baseAnnualOperatingCost: number
  baseInitialInvestment: number
  revenueChangeFraction: number
  operatingCostChangeFraction: number
  capitalChangeFraction: number
  projectLifeYears: number
  discountRateFraction: number
}

export interface EconomicSensitivityAnalysisResult {
  adjustedAnnualRevenue: number
  adjustedAnnualOperatingCost: number
  adjustedInitialInvestment: number
  baseNetPresentValue: number
  adjustedNetPresentValue: number
  netPresentValueChange: number
  netPresentValueChangePercent: number
  adjustedAnnualNetCashFlow: number
  adjustedCaseValueCreating: boolean
}

export interface FlammabilityMixtureLimitsInput {
  componentOneFuelFraction: number
  componentTwoFuelFraction: number
  componentOneLFLPercent: number
  componentOneUFLPercent: number
  componentTwoLFLPercent: number
  componentTwoUFLPercent: number
  actualFuelConcentrationPercent: number
}

export interface FlammabilityMixtureLimitsResult {
  normalizedComponentOneFraction: number
  normalizedComponentTwoFraction: number
  mixtureLFLPercent: number
  mixtureUFLPercent: number
  flammableMixture: boolean
  concentrationStatus: string
  distanceToNearestLimitPercent: number
}

export interface GasReliefValveSizingInput {
  requiredMassFlowRate: number
  relievingAbsolutePressure: number
  backAbsolutePressure: number
  relievingTemperature: number
  molecularWeight: number
  compressibilityFactor: number
  heatCapacityRatio: number
  dischargeCoefficient: number
}

export interface GasReliefValveSizingResult {
  criticalPressureRatio: number
  actualPressureRatio: number
  chokedFlow: boolean
  idealMassFlux: number
  effectiveMassFlux: number
  requiredArea: number
  equivalentDiameter: number
  pressureDrop: number
}

export interface LiquidReliefValveSizingInput {
  requiredVolumetricFlowRate: number
  liquidDensity: number
  upstreamAbsolutePressure: number
  downstreamAbsolutePressure: number
  dischargeCoefficient: number
}

export interface LiquidReliefValveSizingResult {
  pressureDrop: number
  idealVelocity: number
  effectiveVelocity: number
  requiredArea: number
  equivalentDiameter: number
  requiredMassFlowRate: number
}
