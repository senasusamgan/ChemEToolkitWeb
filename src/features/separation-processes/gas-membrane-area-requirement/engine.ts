import type {
  GasMembraneAreaRequirementInput,
  GasMembraneAreaRequirementResult,
} from './types.ts'

export type GasMembraneAreaRequirementErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'fractionOutOfRange'
  | 'numericalFailure'

const messages: Record<
  GasMembraneAreaRequirementErrorCode,
  string
> = {
  nonFiniteInput:
    'All gas-membrane area inputs must be finite.',
  nonPositiveProperty:
    'Feed flow, permeance and partial-pressure driving force must be greater than zero.',
  fractionOutOfRange:
    'Stage cut and permeate solute fraction must satisfy 0 < value < 1.',
  numericalFailure:
    'The membrane-area calculation did not produce finite physical results.',
}

export class GasMembraneAreaRequirementCalculationError extends Error {
  readonly code: GasMembraneAreaRequirementErrorCode

  constructor(code: GasMembraneAreaRequirementErrorCode) {
    super(messages[code])
    this.name =
      'GasMembraneAreaRequirementCalculationError'
    this.code = code
  }
}

export function calculateGasMembraneAreaRequirement(
  input: GasMembraneAreaRequirementInput,
): GasMembraneAreaRequirementResult {
  const values = [
    input.feedMolarFlowRate,
    input.stageCut,
    input.permeateSoluteFraction,
    input.solutePermeance,
    input.partialPressureDrivingForce,
  ]

  if (!values.every(Number.isFinite)) {
    throw new GasMembraneAreaRequirementCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.feedMolarFlowRate <= 0 ||
    input.solutePermeance <= 0 ||
    input.partialPressureDrivingForce <= 0
  ) {
    throw new GasMembraneAreaRequirementCalculationError(
      'nonPositiveProperty',
    )
  }

  if (
    input.stageCut <= 0 ||
    input.stageCut >= 1 ||
    input.permeateSoluteFraction <= 0 ||
    input.permeateSoluteFraction >= 1
  ) {
    throw new GasMembraneAreaRequirementCalculationError(
      'fractionOutOfRange',
    )
  }

  const permeateMolarFlowRate =
    input.feedMolarFlowRate *
    input.stageCut

  const retentateMolarFlowRate =
    input.feedMolarFlowRate -
    permeateMolarFlowRate

  const solutePermeateRate =
    permeateMolarFlowRate *
    input.permeateSoluteFraction

  const soluteFlux =
    input.solutePermeance *
    input.partialPressureDrivingForce

  const solutePermeateRateMolPerSecond =
    solutePermeateRate *
    1000 /
    3600

  const requiredMembraneArea =
    solutePermeateRateMolPerSecond /
    soluteFlux

  const areaPerFeedCapacity =
    requiredMembraneArea /
    input.feedMolarFlowRate

  const results = [
    permeateMolarFlowRate,
    retentateMolarFlowRate,
    solutePermeateRate,
    soluteFlux,
    requiredMembraneArea,
    areaPerFeedCapacity,
  ]

  if (
    !results.every(Number.isFinite) ||
    results.some((value) => value <= 0)
  ) {
    throw new GasMembraneAreaRequirementCalculationError(
      'numericalFailure',
    )
  }

  return {
    permeateMolarFlowRate,
    retentateMolarFlowRate,
    solutePermeateRate,
    soluteFlux,
    requiredMembraneArea,
    areaPerFeedCapacity,
    modelName:
      'Single-solute permeance and average partial-pressure driving-force estimate',
    limitationDescription:
      'Uses one average driving force and constant permeance. Concentration polarization, pressure variation, module recovery distribution and multicomponent coupling are not resolved.',
  }
}
