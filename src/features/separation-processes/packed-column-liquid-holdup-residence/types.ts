export type PackedColumnHoldupStatus =
  | 'stable'
  | 'marginal'
  | 'highHoldup'
  | 'shortResidence'

export type PackedColumnLiquidHoldupInput = {
  liquidVolumetricFlowRate: number
  columnDiameter: number
  packingHeight: number
  bedVoidFraction: number
  liquidHoldupFraction: number
  liquidDensity: number
  minimumResidenceTime: number
}

export type PackedColumnLiquidHoldupScenario = {
  liquidFlowMultiplier: number
  liquidVolumetricFlowRate: number
  superficialLiquidVelocity: number
  interstitialLiquidVelocity: number
  liquidMassFlux: number
  residenceTime: number
  turnoverRatePerHour: number
  residenceMarginPercent: number
  status: PackedColumnHoldupStatus
}

export type PackedColumnLiquidHoldupResult = {
  columnArea: number
  packedBedVolume: number
  packedBedVoidVolume: number
  liquidHoldupVolume: number
  liquidInventoryMass: number
  voidSaturationFraction: number
  minimumHoldupVolume: number
  minimumHoldupFraction: number
  maximumLiquidFlowByResidence: number
  currentResidenceCapacityFraction: number
  selectedScenario: PackedColumnLiquidHoldupScenario
  scenarios: PackedColumnLiquidHoldupScenario[]
  modelName: string
  limitationDescription: string
}
