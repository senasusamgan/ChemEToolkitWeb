import {
  FluidBedDryerBalanceCoreError,
  calculateFluidBedDryerMassCore,
} from '../fluid-bed-dryer/shared/fluidBedDryerBalanceCore.ts'

import type {
  FluidBedDryerEnergyBalanceInput,
  FluidBedDryerEnergyBalanceResult,
  FluidBedDryerEnergyBalanceStatus,
} from './types.ts'

export {
  FluidBedDryerBalanceCoreError,
}

export const FLUID_BED_DRYER_ENERGY_BALANCE_ENGINE_VERSION =
  'fluid-bed-dryer-energy-balance-v1'

export type FluidBedDryerEnergyBalanceErrorCode =
  | 'INVALID_TEMPERATURE'
  | 'INVALID_HEAT_CAPACITY'
  | 'INVALID_LATENT_HEAT'
  | 'NUMERICAL_FAILURE'

export class FluidBedDryerEnergyBalanceError
  extends Error {
  readonly code:
    FluidBedDryerEnergyBalanceErrorCode

  constructor(
    code: FluidBedDryerEnergyBalanceErrorCode,
    message: string,
  ) {
    super(message)
    this.name =
      'FluidBedDryerEnergyBalanceError'
    this.code = code
  }
}

function requireFiniteTemperature(
  value: number,
  label: string,
): void {
  if (!Number.isFinite(value)) {
    throw new FluidBedDryerEnergyBalanceError(
      'INVALID_TEMPERATURE',
      `${label} must be a finite temperature.`,
    )
  }
}

function requirePositiveProperty(
  value: number,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new FluidBedDryerEnergyBalanceError(
      'INVALID_HEAT_CAPACITY',
      `${label} must be a positive finite value.`,
    )
  }
}

function determineStatus(
  duty: number,
  scale: number,
): FluidBedDryerEnergyBalanceStatus {
  const tolerance =
    Math.max(
      scale,
      1,
    ) * 1e-9

  if (
    Math.abs(duty) <=
    tolerance
  ) {
    return 'near-adiabatic'
  }

  return duty > 0
    ? 'heating-required'
    : 'energy-surplus'
}

export function calculateFluidBedDryerEnergyBalance(
  input: FluidBedDryerEnergyBalanceInput,
): FluidBedDryerEnergyBalanceResult {
  const mass =
    calculateFluidBedDryerMassCore(
      input,
    )

  for (
    const [
      value,
      label,
    ] of [
      [input.feedTemperature, 'Feed temperature'],
      [input.productTemperature, 'Product temperature'],
      [input.inletAirTemperature, 'Inlet-air temperature'],
      [input.outletAirTemperature, 'Outlet-air temperature'],
      [input.referenceTemperature, 'Reference temperature'],
    ] as const
  ) {
    requireFiniteTemperature(
      value,
      label,
    )
  }

  for (
    const [
      value,
      label,
    ] of [
      [input.drySolidHeatCapacity, 'Dry-solid heat capacity'],
      [input.liquidWaterHeatCapacity, 'Liquid-water heat capacity'],
      [input.dryAirHeatCapacity, 'Dry-air heat capacity'],
      [input.waterVaporHeatCapacity, 'Water-vapor heat capacity'],
    ] as const
  ) {
    requirePositiveProperty(
      value,
      label,
    )
  }

  if (
    !Number.isFinite(
      input.waterLatentHeatReference,
    ) ||
    input.waterLatentHeatReference <= 0
  ) {
    throw new FluidBedDryerEnergyBalanceError(
      'INVALID_LATENT_HEAT',
      'Water latent-heat reference must be a positive finite value.',
    )
  }

  const feedDeltaT =
    input.feedTemperature -
    input.referenceTemperature

  const productDeltaT =
    input.productTemperature -
    input.referenceTemperature

  const inletAirDeltaT =
    input.inletAirTemperature -
    input.referenceTemperature

  const outletAirDeltaT =
    input.outletAirTemperature -
    input.referenceTemperature

  const feedMaterialEnthalpyRate =
    mass.drySolidMassFlowRate *
      input.drySolidHeatCapacity *
      feedDeltaT +
    mass.inletWaterMassFlowRate *
      input.liquidWaterHeatCapacity *
      feedDeltaT

  const productMaterialEnthalpyRate =
    mass.drySolidMassFlowRate *
      input.drySolidHeatCapacity *
      productDeltaT +
    mass.outletProductWaterMassFlowRate *
      input.liquidWaterHeatCapacity *
      productDeltaT

  const inletAirEnthalpyRate =
    input.dryAirMassFlowRate *
      input.dryAirHeatCapacity *
      inletAirDeltaT +
    input.dryAirMassFlowRate *
      input.inletAirHumidityRatio *
      (
        input.waterLatentHeatReference +
        input.waterVaporHeatCapacity *
          inletAirDeltaT
      )

  const outletAirEnthalpyRate =
    input.dryAirMassFlowRate *
      input.dryAirHeatCapacity *
      outletAirDeltaT +
    input.dryAirMassFlowRate *
      mass.outletAirHumidityRatio *
      (
        input.waterLatentHeatReference +
        input.waterVaporHeatCapacity *
          outletAirDeltaT
      )

  const materialEnthalpyChangeRate =
    productMaterialEnthalpyRate -
    feedMaterialEnthalpyRate

  const airEnthalpyChangeRate =
    outletAirEnthalpyRate -
    inletAirEnthalpyRate

  const totalInletEnthalpyRate =
    feedMaterialEnthalpyRate +
    inletAirEnthalpyRate

  const totalOutletEnthalpyRate =
    productMaterialEnthalpyRate +
    outletAirEnthalpyRate

  const netExternalHeatDuty =
    totalOutletEnthalpyRate -
    totalInletEnthalpyRate

  const netExternalHeatDutyKilowatts =
    netExternalHeatDuty /
    3600

  const specificExternalHeatDutyPerWaterRemoved =
    netExternalHeatDuty /
    mass.evaporatedWaterMassFlowRate

  const energyBalanceClosureError =
    totalInletEnthalpyRate +
    netExternalHeatDuty -
    totalOutletEnthalpyRate

  const energyBalanceClosurePercent =
    Math.abs(
      energyBalanceClosureError,
    ) /
    Math.max(
      Math.abs(
        totalOutletEnthalpyRate,
      ),
      1,
    ) *
    100

  const values = [
    feedMaterialEnthalpyRate,
    productMaterialEnthalpyRate,
    inletAirEnthalpyRate,
    outletAirEnthalpyRate,
    materialEnthalpyChangeRate,
    airEnthalpyChangeRate,
    totalInletEnthalpyRate,
    totalOutletEnthalpyRate,
    netExternalHeatDuty,
    netExternalHeatDutyKilowatts,
    specificExternalHeatDutyPerWaterRemoved,
    energyBalanceClosureError,
    energyBalanceClosurePercent,
  ]

  if (
    !values.every(
      Number.isFinite,
    )
  ) {
    throw new FluidBedDryerEnergyBalanceError(
      'NUMERICAL_FAILURE',
      'The fluid-bed dryer energy balance did not produce finite results.',
    )
  }

  return {
    modelName:
      'Fluid Bed Dryer Integrated Energy Balance',

    limitationDescription:
      'Steady-state enthalpy balance coupled to the shared fluid-bed dryer mass core. Dry air and water vapor are represented by constant heat capacities and a supplied vapor latent-heat reference. Kinetic, potential, reaction, sorption and pressure-work effects are neglected.',

    status:
      determineStatus(
        netExternalHeatDuty,
        Math.max(
          Math.abs(
            totalInletEnthalpyRate,
          ),
          Math.abs(
            totalOutletEnthalpyRate,
          ),
        ),
      ),

    ...mass,

    feedMaterialEnthalpyRate,
    productMaterialEnthalpyRate,
    inletAirEnthalpyRate,
    outletAirEnthalpyRate,
    materialEnthalpyChangeRate,
    airEnthalpyChangeRate,
    totalInletEnthalpyRate,
    totalOutletEnthalpyRate,
    netExternalHeatDuty,
    netExternalHeatDutyKilowatts,
    specificExternalHeatDutyPerWaterRemoved,
    energyBalanceClosureError,
    energyBalanceClosurePercent,
  }
}

export function createFluidBedDryerEnergyBalanceCsv(
  input: FluidBedDryerEnergyBalanceInput,
  result: FluidBedDryerEnergyBalanceResult,
): string {
  const rows = [
    ['Fluid Bed Dryer Integrated Energy Balance'],
    [],
    ['Input', 'Value', 'Unit'],
    ['Wet feed mass flow rate', input.wetFeedMassFlowRate, 'kg/h'],
    ['Inlet moisture', input.inletMoistureWetBasis, 'wet-basis fraction'],
    ['Outlet moisture', input.outletMoistureWetBasis, 'wet-basis fraction'],
    ['Dry-air mass flow rate', input.dryAirMassFlowRate, 'kg dry air/h'],
    ['Inlet humidity ratio', input.inletAirHumidityRatio, 'kg water/kg dry air'],
    ['Feed temperature', input.feedTemperature, '°C'],
    ['Product temperature', input.productTemperature, '°C'],
    ['Inlet-air temperature', input.inletAirTemperature, '°C'],
    ['Outlet-air temperature', input.outletAirTemperature, '°C'],
    [],
    ['Mass-balance result', 'Value', 'Unit'],
    ['Evaporated water', result.evaporatedWaterMassFlowRate, 'kg/h'],
    ['Outlet humidity ratio', result.outletAirHumidityRatio, 'kg water/kg dry air'],
    [],
    ['Energy-balance result', 'Value', 'Unit'],
    ['Feed material enthalpy rate', result.feedMaterialEnthalpyRate, 'kJ/h'],
    ['Product material enthalpy rate', result.productMaterialEnthalpyRate, 'kJ/h'],
    ['Inlet air enthalpy rate', result.inletAirEnthalpyRate, 'kJ/h'],
    ['Outlet air enthalpy rate', result.outletAirEnthalpyRate, 'kJ/h'],
    ['Net external heat duty', result.netExternalHeatDuty, 'kJ/h'],
    ['Net external heat duty', result.netExternalHeatDutyKilowatts, 'kW'],
    ['Specific duty per water removed', result.specificExternalHeatDutyPerWaterRemoved, 'kJ/kg water'],
    ['Energy-balance closure error', result.energyBalanceClosurePercent, '%'],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
