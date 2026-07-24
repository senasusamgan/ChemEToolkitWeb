export interface CountercurrentSolidsWashingInput {
  insolubleSolidFlowRate: number
  retainedSolventPerInsolubleSolid: number
  freshWashSolventFlowRate: number
  feedUnderflowSoluteRatio: number
  freshWashSoluteRatio: number
  numberOfIdealStages: number
}

export interface CountercurrentSolidsWashingResult {
  numberOfIdealStages: number
  retainedSolventFlowRate: number
  overflowSolventFlowRate: number
  washingFactor: number
  productOverflowSoluteRatio: number
  finalUnderflowSoluteRatio: number
  initialSoluteWithUnderflow: number
  recoveredSoluteInOverflow: number
  residualSoluteWithWashedSolids: number
  soluteRemovalFraction: number
  soluteBalanceResidual: number
  stageSoluteRatios: number[]
  modelName: string
  limitationDescription: string
}
