export interface StrippingMinimumGasRateInput {
  liquidMolarFlowRate: number
  inletLiquidSoluteRatio: number
  outletLiquidSoluteRatio: number
  equilibriumSlope: number
  inletGasSoluteRatio: number
}

export interface StrippingMinimumGasRateResult {
  equilibriumOutletGasRatio: number
  minimumGasMolarFlowRate: number
  minimumGasToLiquidRatio: number
  soluteRemovedRate: number
  denominatorDrivingDifference: number
  modelName: string
  limitationDescription: string
}
