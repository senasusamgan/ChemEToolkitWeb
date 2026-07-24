export interface ReverseOsmosisWaterFluxInput {
  waterPermeability: number
  appliedPressureDifference: number
  feedOsmoticPressure: number
  permeateOsmoticPressure: number
  membraneArea: number
}

export interface ReverseOsmosisWaterFluxResult {
  osmoticPressureDifference: number
  netDrivingPressure: number
  waterFlux: number
  permeateFlowRate: number
  permeateFlowCubicMetresPerHour: number
  specificProductivity: number
  modelName: string
  limitationDescription: string
}
