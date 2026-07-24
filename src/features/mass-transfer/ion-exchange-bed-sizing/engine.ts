import type {
  IonExchangeBedSizingInput,
  IonExchangeBedSizingResult,
} from './types.ts'

export type IonExchangeBedSizingErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'invalidIonCharge'
  | 'removalFractionOutOfRange'
  | 'utilizationFractionOutOfRange'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  IonExchangeBedSizingErrorCode,
  string
> = {
  nonFiniteInput:
    'All ion-exchange inputs must be finite.',
  nonPositiveProperty:
    'Liquid flow, influent concentration, service time and resin capacity must be greater than zero.',
  invalidIonCharge:
    'Ion charge magnitude must be a whole number from 1 through 6.',
  removalFractionOutOfRange:
    'Target removal fraction must satisfy 0 < removal ≤ 1.',
  utilizationFractionOutOfRange:
    'Capacity utilization fraction must satisfy 0 < utilization ≤ 1.',
  numericalFailure:
    'The ion-exchange sizing calculation did not produce finite physical results.',
}

export class IonExchangeBedSizingCalculationError extends Error {
  readonly code: IonExchangeBedSizingErrorCode

  constructor(code: IonExchangeBedSizingErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'IonExchangeBedSizingCalculationError'
    this.code = code
  }
}

const INTEGER_TOLERANCE = 1e-9

export function calculateIonExchangeBedSizing(
  input: IonExchangeBedSizingInput,
): IonExchangeBedSizingResult {
  const values = [
    input.liquidVolumetricFlowRate,
    input.influentIonConcentration,
    input.ionChargeMagnitude,
    input.targetRemovalFraction,
    input.serviceTime,
    input.resinCapacity,
    input.capacityUtilizationFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new IonExchangeBedSizingCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.liquidVolumetricFlowRate <= 0 ||
    input.influentIonConcentration <= 0 ||
    input.serviceTime <= 0 ||
    input.resinCapacity <= 0
  ) {
    throw new IonExchangeBedSizingCalculationError(
      'nonPositiveProperty',
    )
  }

  const roundedCharge = Math.round(input.ionChargeMagnitude)

  if (
    Math.abs(input.ionChargeMagnitude - roundedCharge) >
      INTEGER_TOLERANCE ||
    roundedCharge < 1 ||
    roundedCharge > 6
  ) {
    throw new IonExchangeBedSizingCalculationError(
      'invalidIonCharge',
    )
  }

  if (
    input.targetRemovalFraction <= 0 ||
    input.targetRemovalFraction > 1
  ) {
    throw new IonExchangeBedSizingCalculationError(
      'removalFractionOutOfRange',
    )
  }

  if (
    input.capacityUtilizationFraction <= 0 ||
    input.capacityUtilizationFraction > 1
  ) {
    throw new IonExchangeBedSizingCalculationError(
      'utilizationFractionOutOfRange',
    )
  }

  const treatedLiquidVolume =
    input.liquidVolumetricFlowRate *
    input.serviceTime

  const totalEquivalentLoad =
    treatedLiquidVolume *
    input.influentIonConcentration *
    roundedCharge

  const removedEquivalentLoad =
    totalEquivalentLoad *
    input.targetRemovalFraction

  const residualEquivalentLoad =
    totalEquivalentLoad - removedEquivalentLoad

  const usableResinCapacity =
    input.resinCapacity *
    input.capacityUtilizationFraction

  const requiredResinVolumeLiters =
    removedEquivalentLoad / usableResinCapacity

  const requiredResinVolumeCubicMeters =
    requiredResinVolumeLiters / 1000

  const outletIonConcentration =
    input.influentIonConcentration *
    (1 - input.targetRemovalFraction)

  const emptyBedContactTimeMinutes =
    (requiredResinVolumeCubicMeters /
      input.liquidVolumetricFlowRate) *
    60

  const processedBedVolumes =
    treatedLiquidVolume /
    requiredResinVolumeCubicMeters

  const result: IonExchangeBedSizingResult = {
    ionChargeMagnitude: roundedCharge,
    treatedLiquidVolume,
    totalEquivalentLoad,
    removedEquivalentLoad,
    residualEquivalentLoad,
    usableResinCapacity,
    requiredResinVolumeLiters,
    requiredResinVolumeCubicMeters,
    outletIonConcentration,
    emptyBedContactTimeMinutes,
    processedBedVolumes,
    modelName:
      'Stoichiometric ion-exchange capacity sizing on an equivalent basis',
    limitationDescription:
      'This is a capacity balance, not a breakthrough-curve model. Selectivity, film resistance, intraparticle diffusion, pressure drop and regeneration inefficiency require separate design data.',
  }

  const numericResults = [
    result.treatedLiquidVolume,
    result.totalEquivalentLoad,
    result.removedEquivalentLoad,
    result.residualEquivalentLoad,
    result.usableResinCapacity,
    result.requiredResinVolumeLiters,
    result.requiredResinVolumeCubicMeters,
    result.outletIonConcentration,
    result.emptyBedContactTimeMinutes,
    result.processedBedVolumes,
  ]

  if (
    !numericResults.every(Number.isFinite) ||
    result.treatedLiquidVolume <= 0 ||
    result.totalEquivalentLoad <= 0 ||
    result.removedEquivalentLoad <= 0 ||
    result.residualEquivalentLoad < 0 ||
    result.usableResinCapacity <= 0 ||
    result.requiredResinVolumeLiters <= 0 ||
    result.requiredResinVolumeCubicMeters <= 0 ||
    result.outletIonConcentration < 0 ||
    result.emptyBedContactTimeMinutes <= 0 ||
    result.processedBedVolumes <= 0
  ) {
    throw new IonExchangeBedSizingCalculationError(
      'numericalFailure',
    )
  }

  return result
}
