import type {
  FluidBedDryerEnergyBalanceInput,
  FluidBedDryerEnergyBalanceResult,
} from '../fluid-bed-dryer-energy-balance/types.ts'

export type FluidBedDryerAdiabaticInletTemperatureInput =
  Omit<
    FluidBedDryerEnergyBalanceInput,
    'inletAirTemperature'
  >

export interface FluidBedDryerAdiabaticInletTemperatureResult
  extends FluidBedDryerEnergyBalanceResult {
  requiredInletAirTemperature: number
  dutySlopePerDegree: number
  adiabaticResidualDuty: number
  adiabaticResidualDutyKilowatts: number
}
