export interface FiniteVolumeDialysisInput {
  donorVolume: number
  receiverVolume: number
  membraneArea: number
  overallMassTransferCoefficient: number
  contactTime: number
  donorInitialConcentration: number
  receiverInitialConcentration: number
}

export interface FiniteVolumeDialysisResult {
  equilibriumConcentration: number
  concentrationDifferenceDecayFactor: number
  fractionOfEquilibriumApproach: number
  donorFinalConcentration: number
  receiverFinalConcentration: number
  signedTransferredAmountToReceiver: number
  transferMagnitude: number
  initialSignedFlux: number
  finalSignedFlux: number
  systemRateConstant: number
  concentrationDifferenceHalfTime: number
  totalAmountBalanceResidual: number
  directionDescription: string
  modelName: string
}
