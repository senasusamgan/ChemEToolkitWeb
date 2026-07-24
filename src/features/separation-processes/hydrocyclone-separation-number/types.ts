export interface HydrocycloneSeparationNumberInput {
  particleDensity: number
  fluidDensity: number
  particleDiameter: number
  inletVelocity: number
  fluidViscosity: number
  cycloneDiameter: number
}

export interface HydrocycloneSeparationNumberResult {
  densityDifference: number
  separationNumber: number
  particleReynoldsEstimate: number
  centrifugalResponseAssessment: string
  modelName: string
  limitationDescription: string
}
