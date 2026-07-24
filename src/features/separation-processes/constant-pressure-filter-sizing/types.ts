export interface ConstantPressureFilterSizingInput {
  filtrateViscosity: number
  specificCakeResistance: number
  drySolidsPerFiltrateVolume: number
  filterArea: number
  pressureDrop: number
  filterMediumResistance: number
  targetFiltrateVolume: number
}

export interface ConstantPressureFilterSizingResult {
  cakeTime: number
  mediumTime: number
  totalFiltrationTime: number
  averageFiltrateRate: number
  finalInstantaneousRate: number
  cakeResistanceAtTarget: number
  totalResistanceAtTarget: number
  modelName: string
  limitationDescription: string
}
