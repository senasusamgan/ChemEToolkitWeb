import {
  FluidBedDryerBalanceCoreError,
  calculateFluidBedDryerMassCore,
} from '../fluid-bed-dryer/shared/fluidBedDryerBalanceCore.ts'

import type {
  FluidBedDryerMassBalanceInput,
  FluidBedDryerMassBalanceResult,
} from './types.ts'

export {
  FluidBedDryerBalanceCoreError
    as FluidBedDryerMassBalanceError,
}

export const FLUID_BED_DRYER_MASS_BALANCE_ENGINE_VERSION =
  'fluid-bed-dryer-mass-balance-v1'

export function calculateFluidBedDryerMassBalance(
  input: FluidBedDryerMassBalanceInput,
): FluidBedDryerMassBalanceResult {
  const core =
    calculateFluidBedDryerMassCore(
      input,
    )

  return {
    modelName:
      'Fluid Bed Dryer Mass Balance',

    limitationDescription:
      'Steady-state solids and water balance for a fluid-bed dryer. Moisture contents are wet-basis fractions and humidity ratio is expressed per kilogram of dry air. The model neglects solids entrainment, air leakage, condensation and chemical reaction.',

    ...core,
  }
}

export function createFluidBedDryerMassBalanceCsv(
  input: FluidBedDryerMassBalanceInput,
  result: FluidBedDryerMassBalanceResult,
): string {
  const rows = [
    [
      'Fluid Bed Dryer Mass Balance',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Wet feed mass flow rate',
      input.wetFeedMassFlowRate,
      'kg/h',
    ],
    [
      'Inlet moisture',
      input.inletMoistureWetBasis,
      'wet-basis fraction',
    ],
    [
      'Outlet moisture',
      input.outletMoistureWetBasis,
      'wet-basis fraction',
    ],
    [
      'Dry-air mass flow rate',
      input.dryAirMassFlowRate,
      'kg dry air/h',
    ],
    [
      'Inlet humidity ratio',
      input.inletAirHumidityRatio,
      'kg water/kg dry air',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Dry solids',
      result.drySolidMassFlowRate,
      'kg/h',
    ],
    [
      'Dry product',
      result.dryProductMassFlowRate,
      'kg/h',
    ],
    [
      'Evaporated water',
      result.evaporatedWaterMassFlowRate,
      'kg/h',
    ],
    [
      'Outlet humidity ratio',
      result.outletAirHumidityRatio,
      'kg water/kg dry air',
    ],
    [
      'Outlet wet air',
      result.outletWetAirMassFlowRate,
      'kg/h',
    ],
    [
      'Water removal',
      result.waterRemovalPercent,
      '%',
    ],
    [
      'Mass-balance closure error',
      result.massBalanceClosurePercent,
      '%',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
