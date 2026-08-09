import type {
  FluidBedDryerMassCoreInput,
  FluidBedDryerMassCoreResult,
} from '../fluid-bed-dryer/shared/fluidBedDryerBalanceCore.ts'

export type FluidBedDryerEnergyBalanceStatus =
  | 'heating-required'
  | 'near-adiabatic'
  | 'energy-surplus'

export interface FluidBedDryerEnergyBalanceInput
  extends FluidBedDryerMassCoreInput {
  feedTemperature: number
  productTemperature: number
  inletAirTemperature: number
  outletAirTemperature: number
  referenceTemperature: number
  drySolidHeatCapacity: number
  liquidWaterHeatCapacity: number
  dryAirHeatCapacity: number
  waterVaporHeatCapacity: number
  waterLatentHeatReference: number
}

export interface FluidBedDryerEnergyBalanceResult
  extends FluidBedDryerMassCoreResult {
  modelName: string
  limitationDescription: string
  status: FluidBedDryerEnergyBalanceStatus
  feedMaterialEnthalpyRate: number
  productMaterialEnthalpyRate: number
  inletAirEnthalpyRate: number
  outletAirEnthalpyRate: number
  materialEnthalpyChangeRate: number
  airEnthalpyChangeRate: number
  totalInletEnthalpyRate: number
  totalOutletEnthalpyRate: number
  netExternalHeatDuty: number
  netExternalHeatDutyKilowatts: number
  specificExternalHeatDutyPerWaterRemoved: number
  energyBalanceClosureError: number
  energyBalanceClosurePercent: number
}
