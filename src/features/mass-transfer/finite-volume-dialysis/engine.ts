import type {
  FiniteVolumeDialysisInput,
  FiniteVolumeDialysisResult,
} from './types.ts'

export type FiniteVolumeDialysisErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeContactTime'
  | 'negativeConcentration'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  FiniteVolumeDialysisErrorCode,
  string
> = {
  nonFiniteInput:
    'All dialysis inputs must be finite.',
  nonPositiveProperty:
    'Donor volume, receiver volume, membrane area and overall mass-transfer coefficient must be greater than zero.',
  negativeContactTime:
    'Contact time cannot be negative.',
  negativeConcentration:
    'Initial concentrations cannot be negative.',
  numericalFailure:
    'The finite-volume dialysis calculation did not produce finite physical results.',
}

export class FiniteVolumeDialysisCalculationError extends Error {
  readonly code: FiniteVolumeDialysisErrorCode

  constructor(code: FiniteVolumeDialysisErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'FiniteVolumeDialysisCalculationError'
    this.code = code
  }
}

const ZERO_TOLERANCE = 1e-12

export function calculateFiniteVolumeDialysis(
  input: FiniteVolumeDialysisInput,
): FiniteVolumeDialysisResult {
  const values = [
    input.donorVolume,
    input.receiverVolume,
    input.membraneArea,
    input.overallMassTransferCoefficient,
    input.contactTime,
    input.donorInitialConcentration,
    input.receiverInitialConcentration,
  ]

  if (!values.every(Number.isFinite)) {
    throw new FiniteVolumeDialysisCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.donorVolume <= 0 ||
    input.receiverVolume <= 0 ||
    input.membraneArea <= 0 ||
    input.overallMassTransferCoefficient <= 0
  ) {
    throw new FiniteVolumeDialysisCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.contactTime < 0) {
    throw new FiniteVolumeDialysisCalculationError(
      'negativeContactTime',
    )
  }

  if (
    input.donorInitialConcentration < 0 ||
    input.receiverInitialConcentration < 0
  ) {
    throw new FiniteVolumeDialysisCalculationError(
      'negativeConcentration',
    )
  }

  const totalVolume =
    input.donorVolume + input.receiverVolume

  const equilibriumConcentration =
    (
      input.donorVolume *
        input.donorInitialConcentration +
      input.receiverVolume *
        input.receiverInitialConcentration
    ) / totalVolume

  const initialDifference =
    input.donorInitialConcentration -
    input.receiverInitialConcentration

  const systemRateConstant =
    input.overallMassTransferCoefficient *
    input.membraneArea *
    (
      1 / input.donorVolume +
      1 / input.receiverVolume
    )

  const concentrationDifferenceDecayFactor =
    Math.exp(
      -systemRateConstant * input.contactTime,
    )

  const finalDifference =
    initialDifference *
    concentrationDifferenceDecayFactor

  const donorFinalConcentration =
    equilibriumConcentration +
    (
      input.receiverVolume /
      totalVolume
    ) *
    finalDifference

  const receiverFinalConcentration =
    equilibriumConcentration -
    (
      input.donorVolume /
      totalVolume
    ) *
    finalDifference

  const signedTransferredAmountToReceiver =
    input.donorVolume *
    (
      input.donorInitialConcentration -
      donorFinalConcentration
    )

  const initialSignedFlux =
    input.overallMassTransferCoefficient *
    initialDifference

  const finalSignedFlux =
    input.overallMassTransferCoefficient *
    finalDifference

  const fractionOfEquilibriumApproach =
    1 - concentrationDifferenceDecayFactor

  const concentrationDifferenceHalfTime =
    Math.log(2) / systemRateConstant

  const initialTotalAmount =
    input.donorVolume *
      input.donorInitialConcentration +
    input.receiverVolume *
      input.receiverInitialConcentration

  const finalTotalAmount =
    input.donorVolume *
      donorFinalConcentration +
    input.receiverVolume *
      receiverFinalConcentration

  const totalAmountBalanceResidual =
    initialTotalAmount - finalTotalAmount

  const resultValues = [
    equilibriumConcentration,
    concentrationDifferenceDecayFactor,
    fractionOfEquilibriumApproach,
    donorFinalConcentration,
    receiverFinalConcentration,
    signedTransferredAmountToReceiver,
    initialSignedFlux,
    finalSignedFlux,
    systemRateConstant,
    concentrationDifferenceHalfTime,
    totalAmountBalanceResidual,
  ]

  if (
    !resultValues.every(Number.isFinite) ||
    equilibriumConcentration < 0 ||
    concentrationDifferenceDecayFactor < 0 ||
    concentrationDifferenceDecayFactor > 1 ||
    fractionOfEquilibriumApproach < 0 ||
    fractionOfEquilibriumApproach > 1 ||
    donorFinalConcentration < 0 ||
    receiverFinalConcentration < 0 ||
    systemRateConstant <= 0 ||
    concentrationDifferenceHalfTime <= 0
  ) {
    throw new FiniteVolumeDialysisCalculationError(
      'numericalFailure',
    )
  }

  let directionDescription: string

  if (Math.abs(initialDifference) <= ZERO_TOLERANCE) {
    directionDescription =
      'Both compartments begin at the same concentration, so no net transfer occurs.'
  } else if (initialDifference > 0) {
    directionDescription =
      'Net solute transfer proceeds from the donor compartment to the receiver compartment.'
  } else {
    directionDescription =
      'The concentration gradient is reversed; net solute transfer proceeds from receiver to donor.'
  }

  return {
    equilibriumConcentration,
    concentrationDifferenceDecayFactor,
    fractionOfEquilibriumApproach,
    donorFinalConcentration,
    receiverFinalConcentration,
    signedTransferredAmountToReceiver,
    transferMagnitude:
      Math.abs(signedTransferredAmountToReceiver),
    initialSignedFlux,
    finalSignedFlux,
    systemRateConstant,
    concentrationDifferenceHalfTime,
    totalAmountBalanceResidual,
    directionDescription,
    modelName:
      'Two well-mixed finite compartments with constant overall membrane mass-transfer coefficient',
  }
}
