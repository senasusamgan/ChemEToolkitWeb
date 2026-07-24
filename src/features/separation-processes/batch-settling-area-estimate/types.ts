export interface BatchSettlingAreaEstimateInput {
  feedVolumetricFlowRate: number
  feedSolidsConcentration: number
  underflowSolidsConcentration: number
  zoneSettlingVelocity: number
  designFactor: number
}

export interface BatchSettlingAreaEstimateResult {
  hydraulicArea: number
  solidsFluxArea: number
  designArea: number
  designDiameter: number
  feedSolidsRate: number
  thickeningRatio: number
  solidsFluxCapacity: number
  modelName: string
  limitationDescription: string
}
