import type { DistillationOperatingLinesInput } from '../distillation-operating-lines/types.ts'

export type McCabeThieleMethodInput = DistillationOperatingLinesInput

export interface McCabeThieleMethodResult {
  continuousTheoreticalStageCount: number
  requiredWholeStageCount: number
  feedStageNumber: number
  minimumRefluxRatio: number
  actualToMinimumRefluxRatio: number
  rectifyingSlope: number
  strippingSlope: number
  feedIntersectionLiquidMoleFraction: number
  feedIntersectionVaporMoleFraction: number
  finalStageFraction: number
  stageLiquidCompositions: number[]
  countingConvention: string
  modelName: string
}
