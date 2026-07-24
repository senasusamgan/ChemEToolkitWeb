export interface SingleStageLeachingBalanceInput {
  dryInertSolidMass: number
  initialSolutionMass: number
  initialSolutionSoluteFraction: number
  freshSolventMass: number
  retainedSolutionPerDrySolid: number
}

export interface SingleStageLeachingBalanceResult {
  totalMixedSolutionMass: number
  mixedSolutionSoluteFraction: number
  retainedUnderflowSolutionMass: number
  overflowExtractSolutionMass: number
  soluteInUnderflow: number
  soluteInExtract: number
  solventInUnderflow: number
  solventInExtract: number
  soluteBalanceResidual: number
  modelName: string
  limitationDescription: string
}
