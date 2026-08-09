export interface FluidBedDryerMassCoreInput {
  wetFeedMassFlowRate: number
  inletMoistureWetBasis: number
  outletMoistureWetBasis: number
  dryAirMassFlowRate: number
  inletAirHumidityRatio: number
}

export interface FluidBedDryerMassCoreResult {
  drySolidMassFlowRate: number
  inletWaterMassFlowRate: number
  dryProductMassFlowRate: number
  outletProductWaterMassFlowRate: number
  evaporatedWaterMassFlowRate: number
  inletWetAirMassFlowRate: number
  outletAirHumidityRatio: number
  outletWetAirMassFlowRate: number
  totalMassIn: number
  totalMassOut: number
  massBalanceClosureError: number
  massBalanceClosurePercent: number
  waterRemovalPercent: number
}

export type FluidBedDryerBalanceCoreErrorCode =
  | 'INVALID_WET_FEED_FLOW'
  | 'INVALID_INLET_MOISTURE'
  | 'INVALID_OUTLET_MOISTURE'
  | 'INVALID_MOISTURE_WINDOW'
  | 'INVALID_DRY_AIR_FLOW'
  | 'INVALID_INLET_HUMIDITY_RATIO'

export class FluidBedDryerBalanceCoreError
  extends Error {
  readonly code:
    FluidBedDryerBalanceCoreErrorCode

  constructor(
    code: FluidBedDryerBalanceCoreErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'FluidBedDryerBalanceCoreError'

    this.code =
      code
  }
}

function requirePositive(
  value: number,
  code: FluidBedDryerBalanceCoreErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new FluidBedDryerBalanceCoreError(
      code,
      `${label} must be a positive finite number.`,
    )
  }
}

function requireWetBasisFraction(
  value: number,
  code: FluidBedDryerBalanceCoreErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value >= 1
  ) {
    throw new FluidBedDryerBalanceCoreError(
      code,
      `${label} must be between 0 and 1 on a wet basis.`,
    )
  }
}

export function calculateFluidBedDryerMassCore(
  input: FluidBedDryerMassCoreInput,
): FluidBedDryerMassCoreResult {
  requirePositive(
    input.wetFeedMassFlowRate,
    'INVALID_WET_FEED_FLOW',
    'Wet feed mass flow rate',
  )

  requireWetBasisFraction(
    input.inletMoistureWetBasis,
    'INVALID_INLET_MOISTURE',
    'Inlet moisture fraction',
  )

  requireWetBasisFraction(
    input.outletMoistureWetBasis,
    'INVALID_OUTLET_MOISTURE',
    'Outlet moisture fraction',
  )

  if (
    input.outletMoistureWetBasis >=
    input.inletMoistureWetBasis
  ) {
    throw new FluidBedDryerBalanceCoreError(
      'INVALID_MOISTURE_WINDOW',
      'Outlet moisture must be lower than inlet moisture for drying.',
    )
  }

  requirePositive(
    input.dryAirMassFlowRate,
    'INVALID_DRY_AIR_FLOW',
    'Dry-air mass flow rate',
  )

  if (
    !Number.isFinite(
      input.inletAirHumidityRatio,
    ) ||
    input.inletAirHumidityRatio < 0
  ) {
    throw new FluidBedDryerBalanceCoreError(
      'INVALID_INLET_HUMIDITY_RATIO',
      'Inlet humidity ratio must be non-negative.',
    )
  }

  const drySolidMassFlowRate =
    input.wetFeedMassFlowRate *
    (
      1 -
      input.inletMoistureWetBasis
    )

  const inletWaterMassFlowRate =
    input.wetFeedMassFlowRate *
    input.inletMoistureWetBasis

  const dryProductMassFlowRate =
    drySolidMassFlowRate /
    (
      1 -
      input.outletMoistureWetBasis
    )

  const outletProductWaterMassFlowRate =
    dryProductMassFlowRate *
    input.outletMoistureWetBasis

  const evaporatedWaterMassFlowRate =
    inletWaterMassFlowRate -
    outletProductWaterMassFlowRate

  const inletWetAirMassFlowRate =
    input.dryAirMassFlowRate *
    (
      1 +
      input.inletAirHumidityRatio
    )

  const outletAirHumidityRatio =
    input.inletAirHumidityRatio +
    evaporatedWaterMassFlowRate /
    input.dryAirMassFlowRate

  const outletWetAirMassFlowRate =
    input.dryAirMassFlowRate *
    (
      1 +
      outletAirHumidityRatio
    )

  const totalMassIn =
    input.wetFeedMassFlowRate +
    inletWetAirMassFlowRate

  const totalMassOut =
    dryProductMassFlowRate +
    outletWetAirMassFlowRate

  const massBalanceClosureError =
    totalMassIn -
    totalMassOut

  const massBalanceClosurePercent =
    Math.abs(
      massBalanceClosureError,
    ) /
    totalMassIn *
    100

  const waterRemovalPercent =
    inletWaterMassFlowRate > 0
      ? (
          evaporatedWaterMassFlowRate /
          inletWaterMassFlowRate *
          100
        )
      : 0

  return {
    drySolidMassFlowRate,
    inletWaterMassFlowRate,
    dryProductMassFlowRate,
    outletProductWaterMassFlowRate,
    evaporatedWaterMassFlowRate,
    inletWetAirMassFlowRate,
    outletAirHumidityRatio,
    outletWetAirMassFlowRate,
    totalMassIn,
    totalMassOut,
    massBalanceClosureError,
    massBalanceClosurePercent,
    waterRemovalPercent,
  }
}
