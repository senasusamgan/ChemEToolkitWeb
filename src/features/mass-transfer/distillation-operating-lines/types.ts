export interface DistillationOperatingLinesInput {
  relativeVolatility: number
  distillateLightMoleFraction: number
  bottomsLightMoleFraction: number
  feedLightMoleFraction: number
  refluxRatio: number
  feedQuality: number
}

export interface DistillationOperatingLinesResult {
  rectifyingSlope: number
  rectifyingIntercept: number
  feedLineSlope: number | null
  feedLineDescription: string
  feedIntersectionLiquidMoleFraction: number
  feedIntersectionVaporMoleFraction: number
  strippingSlope: number
  strippingIntercept: number
  minimumRefluxRatio: number
  actualToMinimumRefluxRatio: number
  minimumRefluxPinchLiquidMoleFraction: number
  minimumRefluxPinchVaporMoleFraction: number
  modelName: string
}

export interface DistillationLineGeometry {
  mr: number
  br: number
  feedLineSlope: number | null
  feedLineDescription: string
  feedX: number
  feedY: number
  ms: number
  bs: number
  rmin: number
  pinchX: number
  pinchY: number
}
