export type PackedColumnGasLoadStatus =
  | 'underloaded'
  | 'stable'
  | 'marginal'
  | 'overloaded'

export interface PackedColumnGasLoadInput {
  gasVolumetricFlowRate: number
  columnDiameter: number
  gasDensity: number
  minimumOperatingFFactor: number
  maximumDesignFFactor: number
}

export interface PackedColumnGasLoadScenario {
  multiplier: number
  gasVolumetricFlowRate: number
  superficialGasVelocity: number
  gasMassFlowRate: number
  gasMassFlux: number
  fFactor: number
  kineticPressure: number
  minimumFFactorRatio: number
  maximumFFactorRatio: number
  marginToMaximumPercent: number
  status: PackedColumnGasLoadStatus
}

export interface PackedColumnGasLoadResult {
  modelName: string
  limitationDescription: string
  columnArea: number
  minimumSuperficialGasVelocity: number
  maximumSuperficialGasVelocity: number
  minimumGasFlowByFFactor: number
  maximumGasFlowByFFactor: number
  selectedScenario: PackedColumnGasLoadScenario
  scenarios: PackedColumnGasLoadScenario[]
}
