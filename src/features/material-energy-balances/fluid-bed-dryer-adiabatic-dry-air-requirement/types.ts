import type {
  FluidBedDryerEnergyBalanceInput,
  FluidBedDryerEnergyBalanceResult,
} from '../fluid-bed-dryer-energy-balance/types.ts'

export type FluidBedDryerAdiabaticDryAirRequirementInput =
  Omit<
    FluidBedDryerEnergyBalanceInput,
    'dryAirMassFlowRate'
  >

export interface FluidBedDryerAdiabaticDryAirRequirementResult
  extends FluidBedDryerEnergyBalanceResult {
  requiredDryAirMassFlowRate: number
  dutySlopePerDryAirFlow: number
  adiabaticResidualDuty: number
  adiabaticResidualDutyKilowatts: number
}
