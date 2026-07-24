export interface IonExchangeBedSizingInput {
  liquidVolumetricFlowRate: number
  influentIonConcentration: number
  ionChargeMagnitude: number
  targetRemovalFraction: number
  serviceTime: number
  resinCapacity: number
  capacityUtilizationFraction: number
}

export interface IonExchangeBedSizingResult {
  ionChargeMagnitude: number
  treatedLiquidVolume: number
  totalEquivalentLoad: number
  removedEquivalentLoad: number
  residualEquivalentLoad: number
  usableResinCapacity: number
  requiredResinVolumeLiters: number
  requiredResinVolumeCubicMeters: number
  outletIonConcentration: number
  emptyBedContactTimeMinutes: number
  processedBedVolumes: number
  modelName: string
  limitationDescription: string
}
