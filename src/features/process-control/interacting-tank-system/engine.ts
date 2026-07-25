import type {
  InteractingTankSystemInput,
  InteractingTankSystemResult,
} from './types.ts'

export type InteractingTankSystemErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveGeometry'
  | 'negativeEvaluationTime'
  | 'invalidIntegrationSteps'
  | 'numericalFailure'

const messages: Record<
  InteractingTankSystemErrorCode,
  string
> = {
  nonFiniteInput:
    'All interacting-tank inputs must be finite.',
  nonPositiveGeometry:
    'Tank areas and hydraulic resistances must be greater than zero.',
  negativeEvaluationTime:
    'Evaluation time cannot be negative.',
  invalidIntegrationSteps:
    'Integration steps must be an integer from 10 through 100,000.',
  numericalFailure:
    'The interacting-tank calculation produced a non-finite result.',
}

export class InteractingTankSystemCalculationError extends Error {
  readonly code: InteractingTankSystemErrorCode

  constructor(code: InteractingTankSystemErrorCode) {
    super(messages[code])
    this.name =
      'InteractingTankSystemCalculationError'
    this.code = code
  }
}

interface State {
  level1: number
  level2: number
  cumulativeOutlet: number
}

function derivatives(
  state: State,
  input: InteractingTankSystemInput,
): State {
  const interTankFlow =
    (
      state.level1 -
      state.level2
    ) /
    input.interTankResistance

  const outletFlow =
    state.level2 /
    input.outletResistance

  return {
    level1:
      (
        input.inletFlowStep -
        interTankFlow
      ) /
      input.firstTankArea,
    level2:
      (
        interTankFlow -
        outletFlow
      ) /
      input.secondTankArea,
    cumulativeOutlet: outletFlow,
  }
}

function addScaled(
  state: State,
  derivative: State,
  scale: number,
): State {
  return {
    level1:
      state.level1 +
      derivative.level1 * scale,
    level2:
      state.level2 +
      derivative.level2 * scale,
    cumulativeOutlet:
      state.cumulativeOutlet +
      derivative.cumulativeOutlet * scale,
  }
}

export function calculateInteractingTankSystem(
  input: InteractingTankSystemInput,
): InteractingTankSystemResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new InteractingTankSystemCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.firstTankArea <= 0 ||
    input.secondTankArea <= 0 ||
    input.interTankResistance <= 0 ||
    input.outletResistance <= 0
  ) {
    throw new InteractingTankSystemCalculationError(
      'nonPositiveGeometry',
    )
  }

  if (input.evaluationTime < 0) {
    throw new InteractingTankSystemCalculationError(
      'negativeEvaluationTime',
    )
  }

  if (
    !Number.isInteger(input.integrationSteps) ||
    input.integrationSteps < 10 ||
    input.integrationSteps > 100_000
  ) {
    throw new InteractingTankSystemCalculationError(
      'invalidIntegrationSteps',
    )
  }

  let state: State = {
    level1: 0,
    level2: 0,
    cumulativeOutlet: 0,
  }

  if (input.evaluationTime > 0) {
    const step =
      input.evaluationTime /
      input.integrationSteps

    for (
      let index = 0;
      index < input.integrationSteps;
      index += 1
    ) {
      const k1 = derivatives(state, input)
      const k2 = derivatives(
        addScaled(state, k1, 0.5 * step),
        input,
      )
      const k3 = derivatives(
        addScaled(state, k2, 0.5 * step),
        input,
      )
      const k4 = derivatives(
        addScaled(state, k3, step),
        input,
      )

      state = {
        level1:
          state.level1 +
          step *
          (
            k1.level1 +
            2 * k2.level1 +
            2 * k3.level1 +
            k4.level1
          ) /
          6,
        level2:
          state.level2 +
          step *
          (
            k1.level2 +
            2 * k2.level2 +
            2 * k3.level2 +
            k4.level2
          ) /
          6,
        cumulativeOutlet:
          state.cumulativeOutlet +
          step *
          (
            k1.cumulativeOutlet +
            2 * k2.cumulativeOutlet +
            2 * k3.cumulativeOutlet +
            k4.cumulativeOutlet
          ) /
          6,
      }
    }
  }

  const interTankFlow =
    (
      state.level1 -
      state.level2
    ) /
    input.interTankResistance

  const outletFlow =
    state.level2 /
    input.outletResistance

  const totalStoredVolume =
    input.firstTankArea * state.level1 +
    input.secondTankArea * state.level2

  const cumulativeInletVolume =
    input.inletFlowStep *
    input.evaluationTime

  const cumulativeOutletVolume =
    state.cumulativeOutlet

  const volumeBalanceResidual =
    cumulativeInletVolume -
    cumulativeOutletVolume -
    totalStoredVolume

  const secondSteadyStateLevel =
    input.inletFlowStep *
    input.outletResistance

  const firstSteadyStateLevel =
    secondSteadyStateLevel +
    input.inletFlowStep *
    input.interTankResistance

  const results = [
    state.level1,
    state.level2,
    interTankFlow,
    outletFlow,
    totalStoredVolume,
    cumulativeInletVolume,
    cumulativeOutletVolume,
    volumeBalanceResidual,
    firstSteadyStateLevel,
    secondSteadyStateLevel,
  ]

  if (!results.every(Number.isFinite)) {
    throw new InteractingTankSystemCalculationError(
      'numericalFailure',
    )
  }

  return {
    firstTankLevel: state.level1,
    secondTankLevel: state.level2,
    interTankFlow,
    outletFlow,
    totalStoredVolume,
    cumulativeInletVolume,
    cumulativeOutletVolume,
    volumeBalanceResidual,
    firstSteadyStateLevel,
    secondSteadyStateLevel,
    modelName:
      'Two interacting linear tanks integrated with fourth-order Runge–Kutta',
    limitationDescription:
      'The model assumes constant cross-sectional areas, linear hydraulic resistances, zero initial levels and no overflow or valve saturation.',
  }
}
