export interface EvaporativeCrystallizerBalanceInput {
  feedMassFlowRate: number
  feedSoluteMassFraction: number
  motherLiquorSoluteMassFraction: number
  solventEvaporationRate: number
  crystalPurity: number
}

export interface EvaporativeCrystallizerBalanceResult {
  pureCrystalSoluteRate: number
  productCrystalRate: number
  motherLiquorRate: number
  motherLiquorSoluteRate: number
  solventRecoveryFraction: number
  soluteRecoveryFraction: number
  totalBalanceResidual: number
  soluteBalanceResidual: number
  modelName: string
  limitationDescription: string
}
