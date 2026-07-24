export interface UltrafiltrationConcentrationPolarizationInput {
  feedVolumetricFlowRate: number
  membraneArea: number
  liquidSideMassTransferCoefficient: number
  bulkSoluteConcentration: number
  gelConcentration: number
  observedSievingCoefficient: number
}

export interface UltrafiltrationConcentrationPolarizationResult {
  limitingFluxMetersPerHour: number
  limitingFluxLMH: number
  polarizationModulus: number
  permeateFlowRate: number
  retentateFlowRate: number
  volumetricRecoveryFraction: number
  permeateSoluteConcentration: number
  retentateSoluteConcentration: number
  observedRejection: number
  concentrationFactor: number
  retainedSoluteRate: number
  soluteBalanceResidual: number
  modelName: string
  limitationDescription: string
}
