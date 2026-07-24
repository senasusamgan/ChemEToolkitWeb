export interface ConstantPressureFiltrationInput {
  filtrateViscosity: number
  pressureDrop: number
  filterArea: number
  specificCakeResistance: number
  slurrySolidsPerFiltrateVolume: number
  filterMediumResistance: number
  targetFiltrateVolume: number
}

export interface ConstantPressureFiltrationResult {
  filtrationTime: number
  averageFiltrateFlowRate: number
  initialFiltrateFlowRate: number
  finalFiltrateFlowRate: number
  depositedCakeMass: number
  finalCakeResistance: number
  finalTotalResistance: number
  filtrationPlotSlope: number
  filtrationPlotIntercept: number
  cakeResistanceFraction: number
  mediumResistanceFraction: number
  modelName: string
  limitationDescription: string
}
