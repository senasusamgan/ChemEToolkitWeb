export interface CoolingCrystallizerYieldInput {
  feedSolutionMass: number
  hotSolubility: number
  coldSolubility: number
  crystalPurity: number
}

export interface CoolingCrystallizerYieldResult {
  solventMass: number
  initialDissolvedSoluteMass: number
  finalDissolvedSoluteMass: number
  pureCrystalMass: number
  productCrystalMass: number
  soluteRecoveryFraction: number
  motherLiquorMass: number
  modelName: string
  limitationDescription: string
}
