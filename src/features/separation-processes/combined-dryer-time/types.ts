export interface CombinedDryerTimeInput {
  drySolidMass: number
  dryingArea: number
  constantDryingRate: number
  initialMoistureContent: number
  criticalMoistureContent: number
  finalMoistureContent: number
  equilibriumMoistureContent: number
}

export interface CombinedDryerTimeResult {
  constantRateTime: number
  fallingRateTime: number
  totalDryingTime: number
  constantRateMoistureRemoved: number
  fallingRateMoistureRemoved: number
  totalMoistureRemoved: number
  fallingRateTimeFraction: number
  modelName: string
  limitationDescription: string
}
