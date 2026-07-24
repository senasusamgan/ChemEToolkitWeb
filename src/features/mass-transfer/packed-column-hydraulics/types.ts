export interface PackedColumnHydraulicsInput {
  gasVolumetricFlowRate: number
  liquidVolumetricFlowRate: number
  floodingGasVelocity: number
  designFractionOfFlooding: number
  packedHeight: number
  gasDensity: number
  gasViscosity: number
  bedVoidFraction: number
  equivalentPackingDiameter: number
}

export interface PackedColumnHydraulicsResult {
  designGasVelocity: number
  columnCrossSectionalArea: number
  columnDiameter: number
  superficialLiquidVelocity: number
  fractionOfFlooding: number
  gasCapacityFactor: number
  modifiedParticleReynoldsNumber: number
  dryPressureDropPerLength: number
  totalDryPressureDrop: number
  designAssessment: string
  modelName: string
  limitationDescription: string
}
