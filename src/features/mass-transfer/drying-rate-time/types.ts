export interface DryingRateTimeInput {
  drySolidMass: number
  dryingArea: number
  constantDryingFlux: number
  initialMoistureContent: number
  criticalMoistureContent: number
  equilibriumMoistureContent: number
  finalMoistureContent: number
}

export interface DryingRateTimeResult {
  constantRateTime: number
  fallingRateTime: number
  totalDryingTime: number
  removedMoistureMass: number
  averageDryingFlux: number
  finalDryingFlux: number
  constantRateMoistureRemoved: number
  fallingRateMoistureRemoved: number
  periodDescription: string
  modelName: string
}
