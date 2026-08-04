export type PackedColumnInput = {
  inletGasSoluteFraction: number
  outletGasSoluteFraction: number
  equilibriumGasFraction: number
  overallGasHtu: number
  designMarginFraction: number
}

export type PackedColumnScenario = {
  outletGasSoluteFraction: number
  removalPercent: number
  inletDrivingForce: number
  outletDrivingForce: number
  logarithmicMeanDrivingForce: number
  overallGasNtu: number
  theoreticalPackingHeight: number
  designPackingHeight: number
  equilibriumApproachPercent: number
}

export type PackedColumnResult = {
  selectedScenario: PackedColumnScenario
  scenarios: PackedColumnScenario[]
  equilibriumLimit: number
  modelName: string
  limitationDescription: string
}
