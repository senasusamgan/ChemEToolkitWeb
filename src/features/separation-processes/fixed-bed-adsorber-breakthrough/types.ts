export interface FixedBedAdsorberBreakthroughInput {
  adsorbentMass: number
  workingAdsorptionCapacity: number
  capacityUtilizationFraction: number
  feedVolumetricFlowRate: number
  inletSoluteConcentration: number
  breakthroughConcentrationFraction: number
}

export interface FixedBedAdsorberBreakthroughResult {
  usableSoluteCapacity: number
  inletSoluteLoadingRate: number
  removedSoluteLoadingRate: number
  breakthroughTime: number
  treatedVolumeAtBreakthrough: number
  bedVolumesTreated: number
  averageRemovalFraction: number
  modelName: string
  limitationDescription: string
}
