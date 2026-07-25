import type {
  ProportionalControllerInput,
  ProportionalControllerResult,
} from './types.ts'

export type ProportionalControllerErrorCode =
  | 'nonFiniteInput'
  | 'invalidOutputLimits'
  | 'numericalFailure'

const messages: Record<
  ProportionalControllerErrorCode,
  string
> = {
  nonFiniteInput:
    'All proportional-controller inputs must be finite.',
  invalidOutputLimits:
    'Maximum output must be greater than minimum output.',
  numericalFailure:
    'The proportional-controller calculation produced a non-finite result.',
}

export class ProportionalControllerCalculationError
  extends Error {
  readonly code: ProportionalControllerErrorCode

  constructor(code: ProportionalControllerErrorCode) {
    super(messages[code])
    this.name = 'ProportionalControllerCalculationError'
    this.code = code
  }
}

export function calculateProportionalController(
  input: ProportionalControllerInput,
): ProportionalControllerResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new ProportionalControllerCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.maximumOutput <= input.minimumOutput) {
    throw new ProportionalControllerCalculationError(
      'invalidOutputLimits',
    )
  }

  const controlError =
    input.setpoint - input.measuredValue

  const proportionalCorrection =
    input.controllerGain * controlError

  const rawOutput =
    input.controllerBias +
    proportionalCorrection

  const controllerOutput = Math.min(
    input.maximumOutput,
    Math.max(input.minimumOutput, rawOutput),
  )

  const outputWasLimited =
    controllerOutput !== rawOutput

  const outputPositionPercent =
    (
      controllerOutput -
      input.minimumOutput
    ) /
    (
      input.maximumOutput -
      input.minimumOutput
    ) *
    100

  if (
    ![
      controlError,
      proportionalCorrection,
      rawOutput,
      controllerOutput,
      outputPositionPercent,
    ].every(Number.isFinite)
  ) {
    throw new ProportionalControllerCalculationError(
      'numericalFailure',
    )
  }

  return {
    controlError,
    proportionalCorrection,
    rawOutput,
    controllerOutput,
    outputWasLimited,
    outputPositionPercent,
    modelName:
      'Proportional-only controller with bias and output limits',
    limitationDescription:
      'A proportional-only controller generally retains steady-state offset for self-regulating processes. Integral action is required when zero offset is essential.',
  }
}
