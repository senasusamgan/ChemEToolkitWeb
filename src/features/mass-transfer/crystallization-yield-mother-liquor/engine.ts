import type {
  CrystallizationPhaseState,
  CrystallizationYieldMotherLiquorInput,
  CrystallizationYieldMotherLiquorResult,
} from './types.ts'

export type CrystallizationYieldMotherLiquorErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveFeedMass'
  | 'feedCompositionOutOfRange'
  | 'negativeEvaporation'
  | 'evaporationRemovesAllSolvent'
  | 'nonPositiveSolubility'
  | 'crystalCompositionOutOfRange'
  | 'incompatibleCrystalComposition'
  | 'numericalFailure'

const messages: Record<
  CrystallizationYieldMotherLiquorErrorCode,
  string
> = {
  nonFiniteInput: 'All crystallization inputs must be finite.',
  nonPositiveFeedMass: 'Feed solution mass must be greater than zero.',
  feedCompositionOutOfRange:
    'Feed solute mass fraction must lie strictly between zero and one.',
  negativeEvaporation: 'Evaporated solvent mass cannot be negative.',
  evaporationRemovesAllSolvent:
    'Evaporated solvent must be lower than the solvent initially present in the feed solution.',
  nonPositiveSolubility: 'Final solubility ratio must be greater than zero.',
  crystalCompositionOutOfRange:
    'Crystal solute mass fraction must satisfy 0 < p ≤ 1.',
  incompatibleCrystalComposition:
    'The selected crystal composition and mother-liquor solubility do not permit a positive crystallization balance.',
  numericalFailure:
    'The crystallization balance did not produce finite physical results.',
}

export class CrystallizationYieldMotherLiquorCalculationError extends Error {
  readonly code: CrystallizationYieldMotherLiquorErrorCode

  constructor(code: CrystallizationYieldMotherLiquorErrorCode) {
    super(messages[code])
    this.name = 'CrystallizationYieldMotherLiquorCalculationError'
    this.code = code
  }
}

const STATE_TOLERANCE = 1e-10

interface WorkingState {
  phaseState: CrystallizationPhaseState
  crystalMass: number
  crystalSoluteMass: number
  crystalSolventMass: number
  motherLiquorSolventMass: number
  motherLiquorSoluteMass: number
  motherLiquorSoluteRatio: number
  stateDescription: string
}

export function calculateCrystallizationYieldMotherLiquor(
  input: CrystallizationYieldMotherLiquorInput,
): CrystallizationYieldMotherLiquorResult {
  const values = [
    input.feedSolutionMass,
    input.feedSoluteMassFraction,
    input.evaporatedSolventMass,
    input.finalSolubilityRatio,
    input.crystalSoluteMassFraction,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'nonFiniteInput',
    )
  }
  if (input.feedSolutionMass <= 0) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'nonPositiveFeedMass',
    )
  }
  if (
    input.feedSoluteMassFraction <= 0 ||
    input.feedSoluteMassFraction >= 1
  ) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'feedCompositionOutOfRange',
    )
  }
  if (input.evaporatedSolventMass < 0) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'negativeEvaporation',
    )
  }
  if (input.finalSolubilityRatio <= 0) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'nonPositiveSolubility',
    )
  }
  if (
    input.crystalSoluteMassFraction <= 0 ||
    input.crystalSoluteMassFraction > 1
  ) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'crystalCompositionOutOfRange',
    )
  }

  const initialSoluteMass =
    input.feedSolutionMass * input.feedSoluteMassFraction
  const initialSolventMass =
    input.feedSolutionMass * (1 - input.feedSoluteMassFraction)

  if (input.evaporatedSolventMass >= initialSolventMass) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'evaporationRemovesAllSolvent',
    )
  }

  const remainingSolventAfterEvaporation =
    initialSolventMass - input.evaporatedSolventMass
  const dissolvedRatioBeforeCrystallization =
    initialSoluteMass / remainingSolventAfterEvaporation
  const supersaturationRatio =
    dissolvedRatioBeforeCrystallization / input.finalSolubilityRatio

  let state: WorkingState

  if (supersaturationRatio < 1 - STATE_TOLERANCE) {
    state = {
      phaseState: 'undersaturated',
      crystalMass: 0,
      crystalSoluteMass: 0,
      crystalSolventMass: 0,
      motherLiquorSolventMass: remainingSolventAfterEvaporation,
      motherLiquorSoluteMass: initialSoluteMass,
      motherLiquorSoluteRatio: dissolvedRatioBeforeCrystallization,
      stateDescription:
        'The concentrated solution remains below the final solubility limit; no crystals form.',
    }
  } else if (
    Math.abs(supersaturationRatio - 1) <= STATE_TOLERANCE
  ) {
    state = {
      phaseState: 'saturated',
      crystalMass: 0,
      crystalSoluteMass: 0,
      crystalSolventMass: 0,
      motherLiquorSolventMass: remainingSolventAfterEvaporation,
      motherLiquorSoluteMass: initialSoluteMass,
      motherLiquorSoluteRatio: input.finalSolubilityRatio,
      stateDescription:
        'The solution reaches saturation without a positive crystal yield.',
    }
  } else {
    const denominator =
      input.crystalSoluteMassFraction -
      input.finalSolubilityRatio *
        (1 - input.crystalSoluteMassFraction)

    if (denominator <= 0) {
      throw new CrystallizationYieldMotherLiquorCalculationError(
        'incompatibleCrystalComposition',
      )
    }

    const crystalMass =
      (initialSoluteMass -
        input.finalSolubilityRatio *
          remainingSolventAfterEvaporation) /
      denominator
    const crystalSoluteMass =
      input.crystalSoluteMassFraction * crystalMass
    const crystalSolventMass =
      (1 - input.crystalSoluteMassFraction) * crystalMass
    const motherLiquorSolventMass =
      remainingSolventAfterEvaporation - crystalSolventMass
    const motherLiquorSoluteMass =
      input.finalSolubilityRatio * motherLiquorSolventMass

    state = {
      phaseState: 'crystalsFormed',
      crystalMass,
      crystalSoluteMass,
      crystalSolventMass,
      motherLiquorSolventMass,
      motherLiquorSoluteMass,
      motherLiquorSoluteRatio: input.finalSolubilityRatio,
      stateDescription:
        'The final solution is supersaturated, so crystals and saturated mother liquor are formed.',
    }
  }

  const motherLiquorTotalMass =
    state.motherLiquorSolventMass + state.motherLiquorSoluteMass
  const soluteRecoveryFraction =
    state.crystalSoluteMass / initialSoluteMass
  const crystalYieldOnFeed =
    state.crystalMass / input.feedSolutionMass
  const totalMassBalanceResidual =
    input.feedSolutionMass -
    (state.crystalMass +
      motherLiquorTotalMass +
      input.evaporatedSolventMass)

  const results = [
    initialSoluteMass,
    initialSolventMass,
    remainingSolventAfterEvaporation,
    supersaturationRatio,
    state.crystalMass,
    state.crystalSoluteMass,
    state.crystalSolventMass,
    state.motherLiquorSolventMass,
    state.motherLiquorSoluteMass,
    motherLiquorTotalMass,
    state.motherLiquorSoluteRatio,
    soluteRecoveryFraction,
    crystalYieldOnFeed,
    totalMassBalanceResidual,
  ]

  if (
    !results.every(Number.isFinite) ||
    state.crystalMass < 0 ||
    state.crystalSoluteMass < 0 ||
    state.crystalSolventMass < 0 ||
    state.motherLiquorSolventMass < 0 ||
    state.motherLiquorSoluteMass < 0 ||
    motherLiquorTotalMass <= 0 ||
    soluteRecoveryFraction < 0 ||
    soluteRecoveryFraction > 1 ||
    crystalYieldOnFeed < 0
  ) {
    throw new CrystallizationYieldMotherLiquorCalculationError(
      'numericalFailure',
    )
  }

  return {
    phaseState: state.phaseState,
    initialSoluteMass,
    initialSolventMass,
    remainingSolventAfterEvaporation,
    supersaturationRatio,
    crystalMass: state.crystalMass,
    crystalSoluteMass: state.crystalSoluteMass,
    crystalSolventMass: state.crystalSolventMass,
    motherLiquorSolventMass: state.motherLiquorSolventMass,
    motherLiquorSoluteMass: state.motherLiquorSoluteMass,
    motherLiquorTotalMass,
    motherLiquorSoluteRatio: state.motherLiquorSoluteRatio,
    soluteRecoveryFraction,
    crystalYieldOnFeed,
    totalMassBalanceResidual,
    stateDescription: state.stateDescription,
    modelName:
      'Equilibrium evaporative/cooling crystallization mass balance',
  }
}
