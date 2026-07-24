export interface SingleStageLiquidLiquidExtractionInput {
  raffinateCarrierFlowRate: number
  solventCarrierFlowRate: number
  feedSoluteRatio: number
  enteringSolventSoluteRatio: number
  distributionCoefficient: number
}

export interface SingleStageLiquidLiquidExtractionResult {
  raffinateOutletSoluteRatio: number
  extractOutletSoluteRatio: number
  extractionFactor: number
  signedTransferRateToExtract: number
  transferRateMagnitude: number
  raffinateRemovalFraction: number
  soluteBalanceResidual: number
  directionDescription: string
  modelName: string
}
