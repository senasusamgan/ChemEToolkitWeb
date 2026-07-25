import type {
  TemperatureProcessDynamicsInput,
  TemperatureProcessDynamicsResult,
  TransferFunctionBuilderInput,
  TransferFunctionBuilderResult,
  ValveCharacteristicsInput,
  ValveCharacteristicsResult,
  ZieglerNicholsUltimateGainInput,
  ZieglerNicholsUltimateGainResult,
} from './types.ts'

export type ProcessControlBatch06ErrorCode =
  | 'nonFiniteInput'
  | 'invalidTemperatureProcessSettings'
  | 'invalidTransferFunctionSettings'
  | 'invalidValveSettings'
  | 'invalidUltimateGainSettings'
  | 'numericalFailure'

const messages: Record<
  ProcessControlBatch06ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidTemperatureProcessSettings:
    'Thermal capacitance, heat-transfer conductance and maximum allowable temperature must be positive; evaluation time cannot be negative.',
  invalidTransferFunctionSettings:
    'Gain and time constants must be positive, dead time and angular frequency cannot be negative, and integrator order must be 0 or 1.',
  invalidValveSettings:
    'Characteristic mode must be 1, 2 or 3; rated Cv, pressure drop and specific gravity must be positive; travel must be from 0 through 100 percent.',
  invalidUltimateGainSettings:
    'Controller mode must be 1, 2 or 3, and ultimate gain and period must be greater than zero.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessControlBatch06CalculationError
  extends Error {
  readonly code: ProcessControlBatch06ErrorCode

  constructor(code: ProcessControlBatch06ErrorCode) {
    super(messages[code])
    this.name =
      'ProcessControlBatch06CalculationError'
    this.code = code
  }
}

function validateFinite(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ProcessControlBatch06CalculationError(
      'nonFiniteInput',
    )
  }
}

function validateResults(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ProcessControlBatch06CalculationError(
      'numericalFailure',
    )
  }
}

export function calculateTemperatureProcessDynamics(
  input: TemperatureProcessDynamicsInput,
): TemperatureProcessDynamicsResult {
  validateFinite(Object.values(input))

  if (
    input.thermalCapacitance <= 0 ||
    input.heatTransferConductance <= 0 ||
    input.evaluationTime < 0 ||
    input.maximumAllowableTemperature <= 0
  ) {
    throw new ProcessControlBatch06CalculationError(
      'invalidTemperatureProcessSettings',
    )
  }

  const processTimeConstant =
    input.thermalCapacitance /
    input.heatTransferConductance

  const steadyStateTemperature =
    input.ambientTemperature +
    input.heatInputRate /
    input.heatTransferConductance

  const exponentialFactor =
    Math.exp(
      -input.evaluationTime /
      processTimeConstant,
    )

  const temperatureAtEvaluationTime =
    steadyStateTemperature +
    (
      input.initialTemperature -
      steadyStateTemperature
    ) *
    exponentialFactor

  const responseFraction =
    1 - exponentialFactor

  const initialHeatingRate =
    (
      input.heatInputRate -
      input.heatTransferConductance *
      (
        input.initialTemperature -
        input.ambientTemperature
      )
    ) /
    input.thermalCapacitance

  const heatLossAtEvaluationTime =
    input.heatTransferConductance *
    (
      temperatureAtEvaluationTime -
      input.ambientTemperature
    )

  const temperatureMargin =
    input.maximumAllowableTemperature -
    temperatureAtEvaluationTime

  const overtemperatureRisk =
    temperatureAtEvaluationTime >
      input.maximumAllowableTemperature ||
    steadyStateTemperature >
      input.maximumAllowableTemperature

  validateResults([
    processTimeConstant,
    steadyStateTemperature,
    temperatureAtEvaluationTime,
    responseFraction,
    initialHeatingRate,
    heatLossAtEvaluationTime,
    temperatureMargin,
  ])

  return {
    processTimeConstant,
    steadyStateTemperature,
    temperatureAtEvaluationTime,
    responseFraction,
    initialHeatingRate,
    heatLossAtEvaluationTime,
    temperatureMargin,
    overtemperatureRisk,
  }
}

interface Complex {
  real: number
  imaginary: number
}

function multiply(
  left: Complex,
  right: Complex,
): Complex {
  return {
    real:
      left.real * right.real -
      left.imaginary * right.imaginary,
    imaginary:
      left.real * right.imaginary +
      left.imaginary * right.real,
  }
}

function divide(
  numerator: Complex,
  denominator: Complex,
): Complex {
  const scale =
    denominator.real ** 2 +
    denominator.imaginary ** 2

  if (scale < 1e-24) {
    throw new ProcessControlBatch06CalculationError(
      'invalidTransferFunctionSettings',
    )
  }

  return {
    real:
      (
        numerator.real * denominator.real +
        numerator.imaginary *
        denominator.imaginary
      ) /
      scale,
    imaginary:
      (
        numerator.imaginary *
        denominator.real -
        numerator.real *
        denominator.imaginary
      ) /
      scale,
  }
}

export function calculateTransferFunctionBuilder(
  input: TransferFunctionBuilderInput,
): TransferFunctionBuilderResult {
  validateFinite(Object.values(input))

  if (
    input.processGain <= 0 ||
    input.firstTimeConstant <= 0 ||
    input.secondTimeConstant <= 0 ||
    input.deadTime < 0 ||
    input.angularFrequency < 0 ||
    !Number.isInteger(input.integratorOrder) ||
    (
      input.integratorOrder !== 0 &&
      input.integratorOrder !== 1
    )
  ) {
    throw new ProcessControlBatch06CalculationError(
      'invalidTransferFunctionSettings',
    )
  }

  const omega =
    input.angularFrequency

  const firstFactor: Complex = {
    real: 1,
    imaginary:
      omega *
      input.firstTimeConstant,
  }

  const secondFactor: Complex = {
    real: 1,
    imaginary:
      omega *
      input.secondTimeConstant,
  }

  let denominator =
    multiply(
      firstFactor,
      secondFactor,
    )

  if (input.integratorOrder === 1) {
    if (omega === 0) {
      throw new ProcessControlBatch06CalculationError(
        'invalidTransferFunctionSettings',
      )
    }

    denominator =
      multiply(
        denominator,
        {
          real: 0,
          imaginary: omega,
        },
      )
  }

  const delayAngle =
    -omega *
    input.deadTime

  const numerator: Complex = {
    real:
      input.processGain *
      Math.cos(delayAngle),
    imaginary:
      input.processGain *
      Math.sin(delayAngle),
  }

  const response =
    divide(
      numerator,
      denominator,
    )

  const realPart =
    Math.abs(response.real) < 1e-15
      ? 0
      : response.real

  const imaginaryPart =
    Math.abs(response.imaginary) < 1e-15
      ? 0
      : response.imaginary

  const magnitudeRatio =
    Math.hypot(
      realPart,
      imaginaryPart,
    )

  const magnitudeDecibels =
    20 *
    Math.log10(magnitudeRatio)

  const rawPhaseDegrees =
    Math.atan2(
      imaginaryPart,
      realPart,
    ) *
    180 /
    Math.PI

  const phaseDegrees =
    Math.abs(rawPhaseDegrees) < 1e-15
      ? 0
      : rawPhaseDegrees

  const poleOne =
    -1 /
    input.firstTimeConstant

  const poleTwo =
    -1 /
    input.secondTimeConstant

  const integratorText =
    input.integratorOrder === 1
      ? 's'
      : '1'

  const transferFunctionExpression =
    input.integratorOrder === 1
      ? `G(s) = ${input.processGain} exp(−${input.deadTime}s) / [s(${input.firstTimeConstant}s + 1)(${input.secondTimeConstant}s + 1)]`
      : `G(s) = ${input.processGain} exp(−${input.deadTime}s) / [(${input.firstTimeConstant}s + 1)(${input.secondTimeConstant}s + 1)]`

  const frequencyDomainExpression =
    `G(jω) evaluated at ω = ${omega}; integrator factor = ${integratorText}`

  validateResults([
    realPart,
    imaginaryPart,
    magnitudeRatio,
    magnitudeDecibels,
    phaseDegrees,
    poleOne,
    poleTwo,
  ])

  return {
    transferFunctionExpression,
    frequencyDomainExpression,
    realPart,
    imaginaryPart,
    magnitudeRatio,
    magnitudeDecibels,
    phaseDegrees,
    poleOne,
    poleTwo,
  }
}

export function calculateValveCharacteristics(
  input: ValveCharacteristicsInput,
): ValveCharacteristicsResult {
  validateFinite(Object.values(input))

  if (
    ![1, 2, 3].includes(
      input.characteristicMode,
    ) ||
    input.ratedFlowCoefficient <= 0 ||
    input.valveTravelPercent < 0 ||
    input.valveTravelPercent > 100 ||
    input.rangeability <= 1 ||
    input.pressureDrop <= 0 ||
    input.liquidSpecificGravity <= 0
  ) {
    throw new ProcessControlBatch06CalculationError(
      'invalidValveSettings',
    )
  }

  const normalizedTravel =
    input.valveTravelPercent /
    100

  let characteristicName = ''
  let normalizedFlowCoefficient = 0
  let normalizedCharacteristicSlope = 0

  if (input.characteristicMode === 1) {
    characteristicName =
      'Linear'
    normalizedFlowCoefficient =
      normalizedTravel
    normalizedCharacteristicSlope =
      1
  } else if (
    input.characteristicMode === 2
  ) {
    characteristicName =
      'Equal percentage'
    normalizedFlowCoefficient =
      input.rangeability **
      (
        normalizedTravel -
        1
      )
    normalizedCharacteristicSlope =
      Math.log(
        input.rangeability,
      ) *
      normalizedFlowCoefficient
  } else {
    characteristicName =
      'Quick opening'
    normalizedFlowCoefficient =
      Math.sqrt(
        normalizedTravel,
      )
    normalizedCharacteristicSlope =
      normalizedTravel > 0
        ? 1 /
          (
            2 *
            Math.sqrt(
              normalizedTravel,
            )
          )
        : 0
  }

  const effectiveFlowCoefficient =
    input.ratedFlowCoefficient *
    normalizedFlowCoefficient

  const estimatedLiquidFlowRate =
    effectiveFlowCoefficient *
    Math.sqrt(
      input.pressureDrop /
      input.liquidSpecificGravity,
    )

  const effectiveCvSlopePerPercentTravel =
    input.ratedFlowCoefficient *
    normalizedCharacteristicSlope /
    100

  const turndownFromRated =
    normalizedFlowCoefficient > 0
      ? 1 /
        normalizedFlowCoefficient
      : Number.POSITIVE_INFINITY

  const finiteTurndown =
    Number.isFinite(turndownFromRated)
      ? turndownFromRated
      : 0

  validateResults([
    normalizedTravel,
    normalizedFlowCoefficient,
    effectiveFlowCoefficient,
    estimatedLiquidFlowRate,
    normalizedCharacteristicSlope,
    effectiveCvSlopePerPercentTravel,
    finiteTurndown,
  ])

  return {
    characteristicName,
    normalizedTravel,
    normalizedFlowCoefficient,
    effectiveFlowCoefficient,
    estimatedLiquidFlowRate,
    normalizedCharacteristicSlope,
    effectiveCvSlopePerPercentTravel,
    turndownFromRated,
  }
}

export function calculateZieglerNicholsUltimateGain(
  input: ZieglerNicholsUltimateGainInput,
): ZieglerNicholsUltimateGainResult {
  validateFinite(Object.values(input))

  if (
    ![1, 2, 3].includes(
      input.controllerMode,
    ) ||
    input.ultimateGain <= 0 ||
    input.ultimatePeriod <= 0
  ) {
    throw new ProcessControlBatch06CalculationError(
      'invalidUltimateGainSettings',
    )
  }

  let controllerModeName = ''
  let controllerGain = 0
  let integralTime = 0
  let derivativeTime = 0

  if (input.controllerMode === 1) {
    controllerModeName =
      'P'
    controllerGain =
      0.5 *
      input.ultimateGain
  } else if (
    input.controllerMode === 2
  ) {
    controllerModeName =
      'PI'
    controllerGain =
      0.45 *
      input.ultimateGain
    integralTime =
      input.ultimatePeriod /
      1.2
  } else {
    controllerModeName =
      'PID'
    controllerGain =
      0.6 *
      input.ultimateGain
    integralTime =
      input.ultimatePeriod /
      2
    derivativeTime =
      input.ultimatePeriod /
      8
  }

  const integralGain =
    integralTime > 0
      ? controllerGain /
        integralTime
      : 0

  const derivativeGain =
    controllerGain *
    derivativeTime

  const recommendedSampleTime =
    input.ultimatePeriod /
    20

  const proportionalBandPercent =
    100 /
    controllerGain

  validateResults([
    controllerGain,
    integralTime,
    derivativeTime,
    integralGain,
    derivativeGain,
    recommendedSampleTime,
    proportionalBandPercent,
  ])

  return {
    controllerModeName,
    controllerGain,
    integralTime,
    derivativeTime,
    integralGain,
    derivativeGain,
    recommendedSampleTime,
    proportionalBandPercent,
  }
}
