export type BinaryVLECalculationMode =
  | 'liquidToVapor'
  | 'vaporToLiquid'

export interface RelativeVolatilityBinaryVLEInput {
  mode: BinaryVLECalculationMode
  relativeVolatility: number
  specifiedMoleFraction: number
}

export interface RelativeVolatilityBinaryVLEResult {
  liquidMoleFraction: number
  vaporMoleFraction: number
  equilibriumGap: number
  vaporEnrichmentFactor: number
  interpretation: string
  modelName: string
}
