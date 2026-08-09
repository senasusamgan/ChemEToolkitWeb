import {
  FluidBedDryerBalanceCoreError,
  FluidBedDryerEnergyBalanceError,
  calculateFluidBedDryerEnergyBalance,
} from '../fluid-bed-dryer-energy-balance/engine.ts'

import type {
  FluidBedDryerAdiabaticDryAirRequirementInput,
  FluidBedDryerAdiabaticDryAirRequirementResult,
} from './types.ts'

export {
  FluidBedDryerBalanceCoreError,
  FluidBedDryerEnergyBalanceError,
}

export const FLUID_BED_DRYER_ADIABATIC_DRY_AIR_REQUIREMENT_ENGINE_VERSION =
  'fluid-bed-dryer-adiabatic-dry-air-requirement-v1'

export type FluidBedDryerAdiabaticDryAirRequirementErrorCode =
  | 'DEGENERATE_DRY_AIR_SLOPE'
  | 'INVALID_REQUIRED_DRY_AIR_FLOW'
  | 'ADIABATIC_CLOSURE_FAILURE'

export class FluidBedDryerAdiabaticDryAirRequirementError
  extends Error {
  readonly code:
    FluidBedDryerAdiabaticDryAirRequirementErrorCode

  constructor(
    code:
      FluidBedDryerAdiabaticDryAirRequirementErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'FluidBedDryerAdiabaticDryAirRequirementError'

    this.code =
      code
  }
}

function evaluateDuty(
  input:
    FluidBedDryerAdiabaticDryAirRequirementInput,
  dryAirMassFlowRate: number,
) {
  return calculateFluidBedDryerEnergyBalance({
    ...input,
    dryAirMassFlowRate,
  })
}

export function calculateFluidBedDryerAdiabaticDryAirRequirement(
  input:
    FluidBedDryerAdiabaticDryAirRequirementInput,
): FluidBedDryerAdiabaticDryAirRequirementResult {
  /*
   Calculator 394 is linear in dry-air flow when temperatures,
   moisture specifications and constant heat capacities are fixed.

   Evaluating at 1 and 2 kg dry air/h therefore determines the
   exact Qext(m_da) line without duplicating the energy equations
   or introducing an iterative solver.
  */

  const anchorFlow =
    1

  const secondFlow =
    2

  const anchor =
    evaluateDuty(
      input,
      anchorFlow,
    )

  const second =
    evaluateDuty(
      input,
      secondFlow,
    )

  const dutySlopePerDryAirFlow =
    (
      second.netExternalHeatDuty -
      anchor.netExternalHeatDuty
    ) /
    (
      secondFlow -
      anchorFlow
    )

  if (
    !Number.isFinite(
      dutySlopePerDryAirFlow,
    ) ||
    Math.abs(
      dutySlopePerDryAirFlow,
    ) <= 1e-9
  ) {
    throw new FluidBedDryerAdiabaticDryAirRequirementError(
      'DEGENERATE_DRY_AIR_SLOPE',
      'The Calculator 394 energy model has insufficient dry-air-flow sensitivity for an adiabatic solution.',
    )
  }

  const requiredDryAirMassFlowRate =
    anchorFlow -
    anchor.netExternalHeatDuty /
      dutySlopePerDryAirFlow

  if (
    !Number.isFinite(
      requiredDryAirMassFlowRate,
    ) ||
    requiredDryAirMassFlowRate <= 0
  ) {
    throw new FluidBedDryerAdiabaticDryAirRequirementError(
      'INVALID_REQUIRED_DRY_AIR_FLOW',
      'The required adiabatic dry-air flow is not a positive finite value for the specified operating conditions.',
    )
  }

  const verification =
    evaluateDuty(
      input,
      requiredDryAirMassFlowRate,
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
    throw new FluidBedDryerAdiabaticDryAirRequirementError(
      'ADIABATIC_CLOSURE_FAILURE',
      'The solved dry-air flow did not close the Calculator 394 energy balance at Qext = 0.',
    )
  }

  return {
    ...verification,

    requiredDryAirMassFlowRate,
    dutySlopePerDryAirFlow,

    adiabaticResidualDuty,
    adiabaticResidualDutyKilowatts,
  }
}

export function createFluidBedDryerAdiabaticDryAirRequirementCsv(
  input:
    FluidBedDryerAdiabaticDryAirRequirementInput,
  result:
    FluidBedDryerAdiabaticDryAirRequirementResult,
): string {
  const rows = [
    [
      'Fluid Bed Dryer Adiabatic Dry-Air Requirement',
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
      'Inlet humidity ratio',
      input.inletAirHumidityRatio,
      'kg water/kg dry air',
    ],
    [
      'Feed temperature',
      input.feedTemperature,
      '°C',
    ],
    [
      'Product temperature',
      input.productTemperature,
      '°C',
    ],
    [
      'Inlet-air temperature',
      input.inletAirTemperature,
      '°C',
    ],
    [
      'Outlet-air temperature',
      input.outletAirTemperature,
      '°C',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Required dry-air mass flow rate',
      result.requiredDryAirMassFlowRate,
      'kg dry air/h',
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
      'Adiabatic residual duty',
      result.adiabaticResidualDuty,
      'kJ/h',
    ],
    [
      'Mass-balance closure error',
      result.massBalanceClosurePercent,
      '%',
    ],
    [
      'Energy-balance closure error',
      result.energyBalanceClosurePercent,
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
