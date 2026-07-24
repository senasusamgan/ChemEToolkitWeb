export interface UltrafiltrationResistanceSeriesInput {
  transmembranePressure: number
  filtrateViscosity: number
  membraneResistance: number
  foulingResistance: number
  cakeResistance: number
  membraneArea: number
}

export interface UltrafiltrationResistanceSeriesResult {
  totalResistance: number
  permeateFlux: number
  permeateFluxLitresPerSquareMetreHour: number
  permeateFlowRate: number
  membraneResistanceFraction: number
  foulingResistanceFraction: number
  cakeResistanceFraction: number
  modelName: string
  limitationDescription: string
}
