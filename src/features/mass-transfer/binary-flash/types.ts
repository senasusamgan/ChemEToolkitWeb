export type BinaryFlashPhaseState =
  | 'allLiquid'
  | 'bubblePoint'
  | 'twoPhase'
  | 'dewPoint'
  | 'allVapor'

export interface BinaryFlashInput {
  feedFlowRate: number
  feedLightMoleFraction: number
  lightComponentKValue: number
  heavyComponentKValue: number
}

export interface BinaryFlashResult {
  phaseState: BinaryFlashPhaseState
  vaporFraction: number
  liquidFraction: number
  vaporFlowRate: number
  liquidFlowRate: number
  vaporLightMoleFraction: number
  liquidLightMoleFraction: number
  rachfordRiceResidual: number
  modelName: string
}
