export type ProcessControlBatch03Id =
  | 'inverseLaplaceTransformHelper'
  | 'laplaceTransformHelper'
  | 'liquidControlValveSizing'
  | 'liquidLevelDynamics'
  | 'modelPredictiveControl'
  | 'nonInteractingTankSystem'

export interface Batch03ResultItem {
  label: string
  value: number | string
  unit: string
}

export interface Batch03CalculationResult {
  headlineLabel: string
  headlineValue: number | string
  items: Batch03ResultItem[]
  modelName: string
  limitationDescription: string
}
