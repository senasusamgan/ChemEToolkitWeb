export type CrystallizationPhaseState =
  | 'undersaturated'
  | 'saturated'
  | 'crystalsFormed'

export interface CrystallizationYieldMotherLiquorInput {
  feedSolutionMass: number
  feedSoluteMassFraction: number
  evaporatedSolventMass: number
  finalSolubilityRatio: number
  crystalSoluteMassFraction: number
}

export interface CrystallizationYieldMotherLiquorResult {
  phaseState: CrystallizationPhaseState
  initialSoluteMass: number
  initialSolventMass: number
  remainingSolventAfterEvaporation: number
  supersaturationRatio: number
  crystalMass: number
  crystalSoluteMass: number
  crystalSolventMass: number
  motherLiquorSolventMass: number
  motherLiquorSoluteMass: number
  motherLiquorTotalMass: number
  motherLiquorSoluteRatio: number
  soluteRecoveryFraction: number
  crystalYieldOnFeed: number
  totalMassBalanceResidual: number
  stateDescription: string
  modelName: string
}
