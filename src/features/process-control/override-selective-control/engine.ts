import type {
  OverrideSelectiveControlInput,
  OverrideSelectiveControlResult,
} from './types.ts'

export type OverrideSelectiveControlErrorCode =
  | 'nonFiniteInput'
  | 'invalidSelectorMode'
  | 'invalidOutputLimits'
  | 'numericalFailure'

const messages: Record<
  OverrideSelectiveControlErrorCode,
  string
> = {
  nonFiniteInput:
    'All override-control inputs must be finite.',
  invalidSelectorMode:
    'Selector mode must be +1 for high selection or −1 for low selection.',
  invalidOutputLimits:
    'Maximum output must be greater than minimum output.',
  numericalFailure:
    'The override-control calculation produced a non-finite result.',
}

export class OverrideSelectiveControlCalculationError
  extends Error {
  readonly code: OverrideSelectiveControlErrorCode

  constructor(code: OverrideSelectiveControlErrorCode) {
    super(messages[code])
    this.name = 'OverrideSelectiveControlCalculationError'
    this.code = code
  }
}

export function calculateOverrideSelectiveControl(
  input: OverrideSelectiveControlInput,
): OverrideSelectiveControlResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new OverrideSelectiveControlCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.selectorMode !== 1 && input.selectorMode !== -1) {
    throw new OverrideSelectiveControlCalculationError(
      'invalidSelectorMode',
    )
  }

  if (input.maximumOutput <= input.minimumOutput) {
    throw new OverrideSelectiveControlCalculationError(
      'invalidOutputLimits',
    )
  }

  const demands = [
    {
      source: 'Normal controller',
      value: input.normalControllerDemand,
    },
    {
      source: 'Constraint controller 1',
      value: input.firstConstraintDemand,
    },
    {
      source: 'Constraint controller 2',
      value: input.secondConstraintDemand,
    },
  ]

  const selected = demands.reduce((current, candidate) => {
    if (input.selectorMode === 1) {
      return candidate.value > current.value
        ? candidate
        : current
    }

    return candidate.value < current.value
      ? candidate
      : current
  })

  const constrainedOutput = Math.min(
    input.maximumOutput,
    Math.max(input.minimumOutput, selected.value),
  )

  const outputWasClamped =
    constrainedOutput !== selected.value

  const overrideActive =
    selected.source !== 'Normal controller'

  const normalDemandDeviation =
    constrainedOutput - input.normalControllerDemand

  const selectorDescription =
    input.selectorMode === 1
      ? 'High selector'
      : 'Low selector'

  if (
    ![
      selected.value,
      constrainedOutput,
      normalDemandDeviation,
    ].every(Number.isFinite)
  ) {
    throw new OverrideSelectiveControlCalculationError(
      'numericalFailure',
    )
  }

  return {
    selectedDemand: selected.value,
    selectedSource: selected.source,
    constrainedOutput,
    overrideActive,
    outputWasClamped,
    normalDemandDeviation,
    selectorDescription,
    modelName:
      'High- or low-select override control with final output clamping',
    limitationDescription:
      'Selector mode is encoded as +1 for high selection and −1 for low selection. Dynamic tracking, anti-reset windup and bumpless transfer are not represented.',
  }
}
