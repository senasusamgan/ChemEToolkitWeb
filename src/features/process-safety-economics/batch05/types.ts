export type ProcessSafetyEconomicsBatch05Mode =
  | 'bleveFireballScreening'
  | 'tntEquivalentExplosionScreening'
  | 'gasLeakRateScreening'
  | 'gaussianPlumeDispersion'
  | 'toxicExposureDoseScreening'
  | 'eventTreeAnalysis'

export interface BLEVEFireballScreeningInput {
  flammableMass: number
  heatOfCombustion: number
  radiantFraction: number
  atmosphericTransmissivity: number
  receptorDistance: number
}

export interface BLEVEFireballScreeningResult {
  fireballDiameter: number
  fireballDuration: number
  totalChemicalEnergy: number
  radiatedEnergy: number
  averageRadiatedPower: number
  transmittedRadiatedPower: number
  thermalRadiationFlux: number
  hazardBand: string
  screeningDescription: string
}

export interface TNTEquivalentExplosionScreeningInput {
  flammableMass: number
  heatOfCombustion: number
  explosionEfficiency: number
  receptorDistance: number
}

export interface TNTEquivalentExplosionScreeningResult {
  totalCombustionEnergy: number
  effectiveExplosionEnergy: number
  tntEquivalentMass: number
  scaledDistance: number
  estimatedPeakOverpressure: number
  overpressureKilopascals: number
  hazardBand: string
  screeningDescription: string
}

export interface GasLeakRateScreeningInput {
  upstreamAbsolutePressure: number
  downstreamAbsolutePressure: number
  gasTemperature: number
  molecularWeight: number
  heatCapacityRatio: number
  dischargeCoefficient: number
  orificeDiameter: number
}

export interface GasLeakRateScreeningResult {
  orificeArea: number
  specificGasConstant: number
  upstreamGasDensity: number
  pressureRatio: number
  criticalPressureRatio: number
  flowIsChoked: boolean
  massFlux: number
  massReleaseRate: number
  upstreamVolumetricReleaseRate: number
  flowRegimeDescription: string
}

export interface GaussianPlumeDispersionInput {
  sourceEmissionRate: number
  windSpeed: number
  crosswindDistance: number
  receptorHeight: number
  effectiveReleaseHeight: number
  horizontalDispersionCoefficient: number
  verticalDispersionCoefficient: number
}

export interface GaussianPlumeDispersionResult {
  prefactorConcentration: number
  crosswindAttenuationFactor: number
  directVerticalFactor: number
  reflectedVerticalFactor: number
  receptorConcentration: number
  centerlineGroundConcentration: number
  groundReflectionContributionFraction: number
  plumeRegimeDescription: string
}

export interface ToxicExposureDoseScreeningInput {
  exposureConcentration: number
  exposureDuration: number
  concentrationExponent: number
  referenceDose: number
}

export interface ToxicExposureDoseScreeningResult {
  concentrationTerm: number
  toxicDose: number
  doseRatio: number
  dosePercentOfReference: number
  equivalentReferenceDuration: number
  hazardBand: string
  screeningDescription: string
}

export interface EventTreeAnalysisInput {
  initiatingEventFrequency: number
  barrier1SuccessProbability: number
  barrier2SuccessProbability: number
  barrier3SuccessProbability: number
}

export interface EventTreeAnalysisResult {
  initiatingEventFrequency: number
  barrier1FailureOutcomeFrequency: number
  barrier2FailureOutcomeFrequency: number
  barrier3FailureOutcomeFrequency: number
  allBarriersSuccessfulFrequency: number
  totalOutcomeFrequency: number
  probabilityConservationError: number
  dominantOutcome: string
  fullSuccessProbability: number
}
