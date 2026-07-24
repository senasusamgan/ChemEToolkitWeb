export interface GasMembraneAreaRequirementInput {
  feedMolarFlowRate: number
  stageCut: number
  permeateSoluteFraction: number
  solutePermeance: number
  partialPressureDrivingForce: number
}

export interface GasMembraneAreaRequirementResult {
  permeateMolarFlowRate: number
  retentateMolarFlowRate: number
  solutePermeateRate: number
  soluteFlux: number
  requiredMembraneArea: number
  areaPerFeedCapacity: number
  modelName: string
  limitationDescription: string
}
