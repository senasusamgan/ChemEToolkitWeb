export interface SingleStageLeachingRecoveryInput {
  insolubleSolidFlowRate: number
  solubleSoluteFlowRate: number
  pureSolventFlowRate: number
  retainedSolventPerInsolubleSolid: number
}

export interface SingleStageLeachingRecoveryResult {
  equilibriumSoluteRatio: number
  retainedSolventFlowRate: number
  overflowSolventFlowRate: number
  soluteRecoveredInOverflow: number
  soluteRetainedWithUnderflow: number
  soluteRecoveryFraction: number
  overflowSolutionMassFlowRate: number
  underflowTotalMassFlowRate: number
  soluteBalanceResidual: number
  modelName: string
  limitationDescription: string
}
