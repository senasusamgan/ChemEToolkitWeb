export interface IdealGasMembraneStageCutInput {
  feedSoluteFraction: number
  permeateSoluteFraction: number
  retentateSoluteFraction: number
}

export interface IdealGasMembraneStageCutResult {
  stageCut: number
  permeateFlowPerUnitFeed: number
  retentateFlowPerUnitFeed: number
  soluteRecoveryToPermeate: number
  soluteRejectionToRetentate: number
  productSelectivity: number
  totalBalanceResidual: number
  soluteBalanceResidual: number
  modelName: string
  limitationDescription: string
}
