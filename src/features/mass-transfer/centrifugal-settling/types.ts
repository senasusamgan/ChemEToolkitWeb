export interface CentrifugalSettlingInput {
  particleDiameter: number
  particleDensity: number
  fluidDensity: number
  fluidViscosity: number
  rotationalSpeedRPM: number
  initialRadius: number
  finalRadius: number
}

export interface CentrifugalSettlingResult {
  angularVelocity: number
  radialResponseCoefficient: number
  innerRadialVelocity: number
  outerRadialVelocity: number
  migrationDistance: number
  migrationTime: number
  outerCentrifugalAcceleration: number
  outerRelativeCentrifugalForce: number
  outerParticleReynoldsNumber: number
  densityDifference: number
  modelName: string
  limitationDescription: string
}
