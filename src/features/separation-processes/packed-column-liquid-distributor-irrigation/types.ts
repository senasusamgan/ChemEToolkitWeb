export type PackedColumnDistributorStatus =
  | 'inadequate'
  | 'marginal'
  | 'stable'

export interface PackedColumnLiquidDistributorInput {
  liquidVolumetricFlowRate: number
  columnDiameter: number
  liquidDensity: number
  distributorPointCount: number
  minimumIrrigationDensity: number
  minimumPointDensity: number
}

export interface PackedColumnLiquidDistributorScenario {
  liquidFlowMultiplier: number
  liquidVolumetricFlowRate: number
  superficialLiquidVelocity: number
  irrigationDensity: number
  liquidMassFlux: number
  flowPerDistributorPoint: number
  irrigationRatio: number
  pointDensityRatio: number
  irrigationMarginPercent: number
  pointDensityMarginPercent: number
  status: PackedColumnDistributorStatus
}

export interface PackedColumnLiquidDistributorResult {
  modelName: string
  limitationDescription: string
  columnArea: number
  distributorPointDensity: number
  areaPerDistributorPoint: number
  equivalentSquarePitch: number
  minimumLiquidFlowByIrrigation: number
  minimumDistributorPointCount: number
  selectedScenario: PackedColumnLiquidDistributorScenario
  scenarios: PackedColumnLiquidDistributorScenario[]
}
