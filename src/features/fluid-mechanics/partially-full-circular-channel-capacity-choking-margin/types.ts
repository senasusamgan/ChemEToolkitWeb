export interface PartiallyFullCircularChannelCapacityChokingMarginInput {
  pipeDiameter: number

  actualDischarge: number

  availableSpecificEnergy: number

  fluidDensity: number
}


export interface PartiallyFullCircularChannelCapacityChokingMarginResult {
  actualDischarge: number

  maximumDischarge: number

  dischargeMargin: number

  dischargeReserve: number

  dischargeOverload: number

  dischargeUtilization: number

  dischargeReservePercent: number

  capacityFactor: number

  availableSpecificEnergy: number

  minimumRequiredSpecificEnergy: number

  specificEnergyMargin: number

  specificEnergyReserve: number

  specificEnergyDeficit: number

  specificEnergyReservePercent: number

  energyAdequacyRatio: number

  chokingMarginIndex: number

  capacityState: string

  isChoked: boolean

  isAtChokingLimit: boolean

  actualCriticalDepth: number

  actualCriticalDepthRatio: number

  capacityCriticalDepth: number

  capacityCriticalDepthRatio: number

  actualMassFlowRate: number

  maximumMassFlowCapacity: number

  availableHydraulicPower: number

  minimumRequiredHydraulicPower: number

  hydraulicPowerMargin: number

  inverseDischargeResidual: number

  inverseEnergyResidual: number

  modelName: string

  limitationDescription: string
}
