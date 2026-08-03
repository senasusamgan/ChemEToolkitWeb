export type TrayHydraulicStatus =
  | 'stable'
  | 'marginal'
  | 'weepingRisk'
  | 'highFlooding'
  | 'flooded'

export type TrayHydraulicsInput = {
  vaporVolumetricFlowRate: number
  liquidVolumetricFlowRate: number
  columnDiameter: number
  activeAreaFraction: number
  holeAreaFraction: number
  dischargeCoefficient: number
  vaporDensity: number
  liquidDensity: number
  weirLength: number
  weirHeight: number
  capacityFactor: number
}

export type TrayHydraulicsScenario = {
  vaporFlowMultiplier: number
  vaporVolumetricFlowRate: number
  superficialVaporVelocity: number
  holeVelocity: number
  dryTrayPressureDrop: number
  liquidHeadPressureDrop: number
  totalTrayPressureDrop: number
  minimumHoleVelocity: number
  weepingVelocityRatio: number
  floodingVelocity: number
  floodFraction: number
  capacityMarginPercent: number
  status: TrayHydraulicStatus
}

export type TrayHydraulicsResult = {
  grossColumnArea: number
  activeTrayArea: number
  holeArea: number
  weirOverflowHeight: number
  clearLiquidHead: number
  selectedScenario: TrayHydraulicsScenario
  scenarios: TrayHydraulicsScenario[]
  modelName: string
  limitationDescription: string
}
