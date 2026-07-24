export interface MSMPRCrystallizerDesignInput {
  residenceTime: number
  linearCrystalGrowthRate: number
  nucleiPopulationDensity: number
  crystalDensity: number
  crystalVolumeShapeFactor: number
  slurryVolumetricFlowRate: number
  evaluationCrystalSize: number
}

export interface MSMPRCrystallizerDesignResult {
  characteristicCrystalSize: number
  numberMeanCrystalSize: number
  surfaceWeightedMeanSize: number
  volumeWeightedMeanSize: number
  totalCrystalNumberConcentration: number
  thirdPopulationMoment: number
  solidsVolumeFraction: number
  crystalMassConcentration: number
  crystalProductionRate: number
  evaluationCrystalSize: number
  populationDensityAtEvaluationSize: number
  fractionByNumberAboveEvaluationSize: number
  modelName: string
  limitationDescription: string
}
