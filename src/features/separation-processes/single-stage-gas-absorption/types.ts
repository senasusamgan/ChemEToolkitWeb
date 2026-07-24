export interface SingleStageGasAbsorptionInput {
  gasCarrierMolarFlowRate: number
  liquidCarrierMolarFlowRate: number
  inletGasSoluteRatio: number
  inletLiquidSoluteRatio: number
  equilibriumSlope: number
}

export interface SingleStageGasAbsorptionResult {
  outletLiquidSoluteRatio: number
  outletGasSoluteRatio: number
  soluteAbsorbedRate: number
  gasSoluteRemovalFraction: number
  absorptionFactor: number
  soluteBalanceResidual: number
  modelName: string
  limitationDescription: string
}
