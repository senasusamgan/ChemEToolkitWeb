export type PackedColumnHydraulicStatus =
  | 'lowLoad'
  | 'stable'
  | 'highLoad'
  | 'flooded'

export type PackedColumnPressureDropInput = {
  gasVolumetricFlowRate: number
  columnDiameter: number
  packingHeight: number
  bedVoidFraction: number
  packingEquivalentDiameter: number
  gasDensity: number
  gasViscosity: number
  liquidDensity: number
  packingCapacityFactor: number
  designFloodFraction: number
}

export type PackedColumnPressureDropScenario = {
  gasFlowMultiplier: number
  gasVolumetricFlowRate: number
  superficialGasVelocity: number
  packingReynoldsNumber: number
  viscousPressureGradient: number
  inertialPressureGradient: number
  dryPressureDropPerLength: number
  totalDryPressureDrop: number
  floodingVelocity: number
  floodFraction: number
  designCapacityMarginPercent: number
  status: PackedColumnHydraulicStatus
}

export type PackedColumnPressureDropResult = {
  columnArea: number
  floodingVelocity: number
  designSuperficialGasVelocity: number
  maximumGasFlowAtDesign: number
  currentDesignCapacityFraction: number
  selectedScenario: PackedColumnPressureDropScenario
  scenarios: PackedColumnPressureDropScenario[]
  modelName: string
  limitationDescription: string
}
