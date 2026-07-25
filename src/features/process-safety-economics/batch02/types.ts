export type ProcessSafetyEconomicsBatch02Mode =
  | 'langFactorCapitalEstimate'
  | 'totalCapitalInvestmentEstimate'
  | 'annualOperatingCostEstimate'
  | 'straightLineDepreciation'
  | 'netPresentValueAnalysis'
  | 'internalRateOfReturnAnalysis'

export interface LangFactorCapitalEstimateInput {
  purchasedEquipmentCost: number
  langFactor: number
  workingCapitalFractionOfFixedCapital: number
  startupCostFractionOfFixedCapital: number
  landCost: number
}

export interface LangFactorCapitalEstimateResult {
  fixedCapitalInvestment: number
  workingCapital: number
  startupCost: number
  landCost: number
  totalCapitalInvestment: number
  totalToEquipmentCostRatio: number
}

export interface TotalCapitalInvestmentEstimateInput {
  purchasedEquipmentCost: number
  equipmentInstallationCost: number
  pipingCost: number
  instrumentationCost: number
  electricalCost: number
  buildingsAndYardCost: number
  utilitiesAndServiceFacilitiesCost: number
  engineeringAndConstructionCost: number
  contingencyFractionOfSubtotal: number
  workingCapitalFractionOfFixedCapital: number
}

export interface TotalCapitalInvestmentEstimateResult {
  directAndIndirectSubtotal: number
  contingencyCost: number
  fixedCapitalInvestment: number
  workingCapital: number
  totalCapitalInvestment: number
  purchasedEquipmentFractionOfTotal: number
}

export interface AnnualOperatingCostEstimateInput {
  rawMaterialCost: number
  utilityCost: number
  operatingLaborCost: number
  maintenanceCost: number
  wasteTreatmentCost: number
  laboratoryAndQualityCost: number
  plantOverheadFractionOfLaborAndMaintenance: number
  insuranceAndTaxFractionOfFixedCapital: number
  fixedCapitalInvestment: number
  annualProduction: number
}

export interface AnnualOperatingCostEstimateResult {
  directCashOperatingCost: number
  plantOverheadCost: number
  insuranceAndTaxCost: number
  totalAnnualOperatingCost: number
  unitProductionCost: number
  variableCostFraction: number
  laborAndMaintenanceFraction: number
  largestCostCategory: string
}

export interface StraightLineDepreciationInput {
  initialAssetCost: number
  salvageValue: number
  usefulLifeYears: number
  elapsedYears: number
}

export interface StraightLineDepreciationResult {
  depreciableBasis: number
  annualDepreciation: number
  accumulatedDepreciation: number
  bookValue: number
  remainingDepreciableAmount: number
  depreciatedLifeFraction: number
  fullyDepreciated: boolean
}

export interface NetPresentValueAnalysisInput {
  initialInvestment: number
  annualNetCashFlow: number
  terminalValue: number
  projectLifeYears: number
  discountRateFraction: number
}

export interface NetPresentValueAnalysisResult {
  presentValueOfAnnualCashFlows: number
  presentValueOfTerminalValue: number
  netPresentValue: number
  profitabilityIndex: number
  discountedPaybackApproximationYears: number
  valueCreating: boolean
}

export interface InternalRateOfReturnAnalysisInput {
  initialInvestment: number
  annualNetCashFlow: number
  terminalValue: number
  projectLifeYears: number
  minimumSearchRate: number
  maximumSearchRate: number
}

export interface InternalRateOfReturnAnalysisResult {
  internalRateOfReturn: number
  netPresentValueAtIRR: number
  lowerBracketRate: number
  upperBracketRate: number
  iterationCount: number
  annualCashFlowToInvestmentRatio: number
}
