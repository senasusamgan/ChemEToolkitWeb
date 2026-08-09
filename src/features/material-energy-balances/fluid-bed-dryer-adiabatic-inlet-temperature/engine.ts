import {
  FluidBedDryerBalanceCoreError,
  FluidBedDryerEnergyBalanceError,
  calculateFluidBedDryerEnergyBalance,
} from '../fluid-bed-dryer-energy-balance/engine.ts'

import type {
  FluidBedDryerAdiabaticInletTemperatureInput,
  FluidBedDryerAdiabaticInletTemperatureResult,
} from './types.ts'

export {
  FluidBedDryerBalanceCoreError,
  FluidBedDryerEnergyBalanceError,
}

export const FLUID_BED_DRYER_ADIABATIC_INLET_TEMPERATURE_ENGINE_VERSION =
  'fluid-bed-dryer-adiabatic-inlet-temperature-v1'

export type FluidBedDryerAdiabaticInletTemperatureErrorCode =
  | 'DEGENERATE_ENERGY_SLOPE'
  | 'INVALID_REQUIRED_TEMPERATURE'
  | 'ADIABATIC_CLOSURE_FAILURE'

export class FluidBedDryerAdiabaticInletTemperatureError
  extends Error {
  readonly code:
    FluidBedDryerAdiabaticInletTemperatureErrorCode

  constructor(
    code:
      FluidBedDryerAdiabaticInletTemperatureErrorCode,
    message: string,
  ) {
    super(message)
    this.name =
      'FluidBedDryerAdiabaticInletTemperatureError'
    this.code = code
  }
}

function evaluateDuty(
  input:
    FluidBedDryerAdiabaticInletTemperatureInput,
  inletAirTemperature: number,
) {
  return calculateFluidBedDryerEnergyBalance({
    ...input,
    inletAirTemperature,
  })
}

export function calculateFluidBedDryerAdiabaticInletTemperature(
  input:
    FluidBedDryerAdiabaticInletTemperatureInput,
): FluidBedDryerAdiabaticInletTemperatureResult {
  // The Calculator 394 model is linear in inlet-air temperature
  // for constant heat capacities. Two evaluations determine that
  // line exactly, so no iterative root finder or duplicated
  // enthalpy equation is required here.
  const anchorTemperature =
    input.referenceTemperature

  const anchor =
    evaluateDuty(
      input,
      anchorTemperature,
    )

  const oneDegree =
    evaluateDuty(
      input,
      anchorTemperature + 1,
    )

  const dutySlopePerDegree =
    oneDegree.netExternalHeatDuty -
    anchor.netExternalHeatDuty

  if (
    !Number.isFinite(
      dutySlopePerDegree,
    ) ||
    Math.abs(
      dutySlopePerDegree,
    ) <= 1e-12
  ) {
    throw new FluidBedDryerAdiabaticInletTemperatureError(
      'DEGENERATE_ENERGY_SLOPE',
      'The Calculator 394 energy model has insufficient inlet-air temperature sensitivity for an adiabatic solution.',
    )
  }

  const requiredInletAirTemperature =
    anchorTemperature -
    anchor.netExternalHeatDuty /
      dutySlopePerDegree

  if (
    !Number.isFinite(
      requiredInletAirTemperature,
    )
  ) {
    throw new FluidBedDryerAdiabaticInletTemperatureError(
      'INVALID_REQUIRED_TEMPERATURE',
      'The required adiabatic inlet-air temperature is not finite.',
    )
  }

  const verification =
    evaluateDuty(
      input,
      requiredInletAirTemperature,
    )

  const adiabaticResidualDuty =
    verification.netExternalHeatDuty

  const adiabaticResidualDutyKilowatts =
    adiabaticResidualDuty /
    3600

  const tolerance =
    Math.max(
      Math.abs(
        verification.totalOutletEnthalpyRate,
      ),
      1,
    ) *
    1e-8

  if (
    Math.abs(
      adiabaticResidualDuty,
    ) >
    tolerance
  ) {
    throw new FluidBedDryerAdiabaticInletTemperatureError(
      'ADIABATIC_CLOSURE_FAILURE',
      'The solved inlet-air temperature did not close the Calculator 394 energy balance at Qext = 0.',
    )
  }

  return {
    ...verification,
    requiredInletAirTemperature,
    dutySlopePerDegree,
    adiabaticResidualDuty,
    adiabaticResidualDutyKilowatts,
  }
}

export function createFluidBedDryerAdiabaticInletTemperatureCsv(
  input:
    FluidBedDryerAdiabaticInletTemperatureInput,
  result:
    FluidBedDryerAdiabaticInletTemperatureResult,
): string {
  const rows = [
    ['Fluid Bed Dryer Adiabatic Inlet-Air Temperature'],
    [],
    ['Input', 'Value', 'Unit'],
    ['Wet feed mass flow rate', input.wetFeedMassFlowRate, 'kg/h'],
    ['Inlet moisture', input.inletMoistureWetBasis, 'wet-basis fraction'],
    ['Outlet moisture', input.outletMoistureWetBasis, 'wet-basis fraction'],
    ['Dry-air mass flow rate', input.dryAirMassFlowRate, 'kg dry air/h'],
    ['Inlet humidity ratio', input.inletAirHumidityRatio, 'kg water/kg dry air'],
    ['Feed temperature', input.feedTemperature, '°C'],
    ['Product temperature', input.productTemperature, '°C'],
    ['Outlet-air temperature', input.outletAirTemperature, '°C'],
    [],
    ['Result', 'Value', 'Unit'],
    ['Required inlet-air temperature', result.requiredInletAirTemperature, '°C'],
    ['Evaporated water', result.evaporatedWaterMassFlowRate, 'kg/h'],
    ['Outlet humidity ratio', result.outletAirHumidityRatio, 'kg water/kg dry air'],
    ['Adiabatic residual duty', result.adiabaticResidualDuty, 'kJ/h'],
    ['Mass-balance closure error', result.massBalanceClosurePercent, '%'],
    ['Energy-balance closure error', result.energyBalanceClosurePercent, '%'],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
