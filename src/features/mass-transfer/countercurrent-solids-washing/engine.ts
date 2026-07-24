import type {
  CountercurrentSolidsWashingInput,
  CountercurrentSolidsWashingResult,
} from './types.ts'

export type CountercurrentSolidsWashingErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeSoluteRatio'
  | 'invalidStageCount'
  | 'noInitialWashingDrivingForce'
  | 'singularStageSystem'
  | 'numericalFailure'

const messages: Record<CountercurrentSolidsWashingErrorCode, string> = {
  nonFiniteInput: 'All countercurrent-washing inputs must be finite.',
  nonPositiveProperty:
    'Insoluble-solid flow, retained-solvent ratio and fresh-wash-solvent flow must be greater than zero.',
  negativeSoluteRatio: 'Feed and fresh-wash solute ratios cannot be negative.',
  invalidStageCount:
    'Number of ideal stages must be a whole number from 1 through 100.',
  noInitialWashingDrivingForce:
    'Fresh wash liquid must have a lower solute ratio than the solution entering with the solids.',
  singularStageSystem:
    'The ideal-stage material-balance system could not be solved.',
  numericalFailure:
    'The countercurrent-washing calculation did not produce finite physical results.',
}

export class CountercurrentSolidsWashingCalculationError extends Error {
  readonly code: CountercurrentSolidsWashingErrorCode

  constructor(code: CountercurrentSolidsWashingErrorCode) {
    super(messages[code])
    this.name = 'CountercurrentSolidsWashingCalculationError'
    this.code = code
  }
}

const INTEGER_TOLERANCE = 1e-9
const PIVOT_TOLERANCE = 1e-14

function solveStageRatios(
  stageCount: number,
  retainedSolvent: number,
  overflowSolvent: number,
  feedRatio: number,
  freshWashRatio: number,
): number[] {
  const diagonal = Array(stageCount).fill(retainedSolvent + overflowSolvent) as number[]
  const lower = Array(Math.max(0, stageCount - 1)).fill(-retainedSolvent) as number[]
  const upper = Array(Math.max(0, stageCount - 1)).fill(-overflowSolvent) as number[]
  const rightHandSide = Array(stageCount).fill(0) as number[]

  rightHandSide[0] = retainedSolvent * feedRatio
  rightHandSide[stageCount - 1] += overflowSolvent * freshWashRatio

  if (stageCount === 1) {
    if (Math.abs(diagonal[0]) <= PIVOT_TOLERANCE) {
      throw new CountercurrentSolidsWashingCalculationError('singularStageSystem')
    }
    return [rightHandSide[0] / diagonal[0]]
  }

  for (let index = 1; index < stageCount; index += 1) {
    if (Math.abs(diagonal[index - 1]) <= PIVOT_TOLERANCE) {
      throw new CountercurrentSolidsWashingCalculationError('singularStageSystem')
    }
    const multiplier = lower[index - 1] / diagonal[index - 1]
    diagonal[index] -= multiplier * upper[index - 1]
    rightHandSide[index] -= multiplier * rightHandSide[index - 1]
  }

  if (Math.abs(diagonal[stageCount - 1]) <= PIVOT_TOLERANCE) {
    throw new CountercurrentSolidsWashingCalculationError('singularStageSystem')
  }

  const solution = Array(stageCount).fill(0) as number[]
  solution[stageCount - 1] =
    rightHandSide[stageCount - 1] / diagonal[stageCount - 1]

  for (let index = stageCount - 2; index >= 0; index -= 1) {
    if (Math.abs(diagonal[index]) <= PIVOT_TOLERANCE) {
      throw new CountercurrentSolidsWashingCalculationError('singularStageSystem')
    }
    solution[index] =
      (rightHandSide[index] - upper[index] * solution[index + 1]) /
      diagonal[index]
  }

  return solution
}

export function calculateCountercurrentSolidsWashing(
  input: CountercurrentSolidsWashingInput,
): CountercurrentSolidsWashingResult {
  const values = [
    input.insolubleSolidFlowRate,
    input.retainedSolventPerInsolubleSolid,
    input.freshWashSolventFlowRate,
    input.feedUnderflowSoluteRatio,
    input.freshWashSoluteRatio,
    input.numberOfIdealStages,
  ]

  if (!values.every(Number.isFinite)) {
    throw new CountercurrentSolidsWashingCalculationError('nonFiniteInput')
  }
  if (
    input.insolubleSolidFlowRate <= 0 ||
    input.retainedSolventPerInsolubleSolid <= 0 ||
    input.freshWashSolventFlowRate <= 0
  ) {
    throw new CountercurrentSolidsWashingCalculationError('nonPositiveProperty')
  }
  if (
    input.feedUnderflowSoluteRatio < 0 ||
    input.freshWashSoluteRatio < 0
  ) {
    throw new CountercurrentSolidsWashingCalculationError('negativeSoluteRatio')
  }

  const roundedStages = Math.round(input.numberOfIdealStages)
  if (
    Math.abs(input.numberOfIdealStages - roundedStages) > INTEGER_TOLERANCE ||
    roundedStages < 1 ||
    roundedStages > 100
  ) {
    throw new CountercurrentSolidsWashingCalculationError('invalidStageCount')
  }
  if (input.feedUnderflowSoluteRatio <= input.freshWashSoluteRatio) {
    throw new CountercurrentSolidsWashingCalculationError(
      'noInitialWashingDrivingForce',
    )
  }

  const retainedSolventFlowRate =
    input.insolubleSolidFlowRate * input.retainedSolventPerInsolubleSolid
  const overflowSolventFlowRate = input.freshWashSolventFlowRate
  const stageSoluteRatios = solveStageRatios(
    roundedStages,
    retainedSolventFlowRate,
    overflowSolventFlowRate,
    input.feedUnderflowSoluteRatio,
    input.freshWashSoluteRatio,
  )
  const productOverflowSoluteRatio = stageSoluteRatios[0]
  const finalUnderflowSoluteRatio = stageSoluteRatios.at(-1) ?? Number.NaN
  const initialSoluteWithUnderflow =
    retainedSolventFlowRate * input.feedUnderflowSoluteRatio
  const recoveredSoluteInOverflow =
    overflowSolventFlowRate *
    (productOverflowSoluteRatio - input.freshWashSoluteRatio)
  const residualSoluteWithWashedSolids =
    retainedSolventFlowRate * finalUnderflowSoluteRatio
  const soluteRemovalFraction =
    (initialSoluteWithUnderflow - residualSoluteWithWashedSolids) /
    initialSoluteWithUnderflow
  const soluteBalanceResidual =
    initialSoluteWithUnderflow +
    overflowSolventFlowRate * input.freshWashSoluteRatio -
    overflowSolventFlowRate * productOverflowSoluteRatio -
    residualSoluteWithWashedSolids
  const washingFactor =
    overflowSolventFlowRate / retainedSolventFlowRate

  const results = [
    retainedSolventFlowRate,
    overflowSolventFlowRate,
    washingFactor,
    productOverflowSoluteRatio,
    finalUnderflowSoluteRatio,
    initialSoluteWithUnderflow,
    recoveredSoluteInOverflow,
    residualSoluteWithWashedSolids,
    soluteRemovalFraction,
    soluteBalanceResidual,
    ...stageSoluteRatios,
  ]

  if (
    !results.every(Number.isFinite) ||
    stageSoluteRatios.some((value) => value < 0) ||
    soluteRemovalFraction < 0 ||
    soluteRemovalFraction > 1 + 1e-10
  ) {
    throw new CountercurrentSolidsWashingCalculationError('numericalFailure')
  }

  return {
    numberOfIdealStages: roundedStages,
    retainedSolventFlowRate,
    overflowSolventFlowRate,
    washingFactor,
    productOverflowSoluteRatio,
    finalUnderflowSoluteRatio,
    initialSoluteWithUnderflow,
    recoveredSoluteInOverflow,
    residualSoluteWithWashedSolids,
    soluteRemovalFraction,
    soluteBalanceResidual,
    stageSoluteRatios,
    modelName: 'Ideal countercurrent mixing–settling stage balance',
    limitationDescription:
      'Assumes ideal mixing in each stage, constant retained solvent with the insoluble solids, constant solute-free overflow and equilibrium between each underflow and overflow pair.',
  }
}
