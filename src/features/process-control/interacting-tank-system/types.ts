export interface InteractingTankSystemInput {
  firstTankArea: number
  secondTankArea: number
  interTankResistance: number
  outletResistance: number
  inletFlowStep: number
  evaluationTime: number
  integrationSteps: number
}

export interface InteractingTankSystemResult {
  firstTankLevel: number
  secondTankLevel: number
  interTankFlow: number
  outletFlow: number
  totalStoredVolume: number
  cumulativeInletVolume: number
  cumulativeOutletVolume: number
  volumeBalanceResidual: number
  firstSteadyStateLevel: number
  secondSteadyStateLevel: number
  modelName: string
  limitationDescription: string
}
