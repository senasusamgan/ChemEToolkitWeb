import type {
  EquilibriumConversionInput,
  EquilibriumConversionResult,
  FCurveGeneratorInput,
  FCurveGeneratorResult,
  HeatExchangeBatchReactorInput,
  HeatExchangeBatchReactorResult,
  HeatExchangeCSTRInput,
  HeatExchangeCSTRResult,
  HeatExchangePFRInput,
  HeatExchangePFRResult,
  ImmobilizedEnzymeReactorInput,
  ImmobilizedEnzymeReactorResult,
} from './types.ts'

export type ReactionEngineeringBatch04ErrorCode =
  | 'nonFiniteInput'
  | 'invalidEquilibriumInputs'
  | 'invalidFCurveInputs'
  | 'invalidHeatExchangeBatchInputs'
  | 'targetNotReached'
  | 'invalidHeatExchangeCSTRInputs'
  | 'invalidHeatExchangePFRInputs'
  | 'invalidImmobilizedEnzymeInputs'
  | 'numericalFailure'

const messages: Record<ReactionEngineeringBatch04ErrorCode, string> = {
  nonFiniteInput: 'All calculator inputs must be finite.',
  invalidEquilibriumInputs:
    'Initial reactant concentrations and equilibrium constant must be positive.',
  invalidFCurveInputs:
    'Times and E values must contain the same number of at least three points. Times must be strictly increasing and nonnegative; E values must be nonnegative.',
  invalidHeatExchangeBatchInputs:
    'Concentration, pre-exponential factor, activation energy, absolute temperatures and maximum time must be positive. Heat-removal coefficient and adiabatic rise cannot be negative, and conversion must lie above zero and below one.',
  targetNotReached:
    'Target conversion was not reached within the selected maximum time.',
  invalidHeatExchangeCSTRInputs:
    'Concentration, flow, pre-exponential factor, activation energy and absolute temperatures must be positive. Heat-removal number and adiabatic rise cannot be negative, and conversion must lie above zero and below one.',
  invalidHeatExchangePFRInputs:
    'Concentration, flow, pre-exponential factor, activation energy and absolute temperatures must be positive. Heat-removal number and adiabatic rise cannot be negative, and conversion must lie above zero and below one.',
  invalidImmobilizedEnzymeInputs:
    'Pellet radius, diffusivity, maximum rate, Michaelis constant, substrate concentration and total pellet volume must be positive.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch04CalculationError extends Error {
  readonly code: ReactionEngineeringBatch04ErrorCode
  constructor(code: ReactionEngineeringBatch04ErrorCode) {
    super(messages[code])
    this.name = 'ReactionEngineeringBatch04CalculationError'
    this.code = code
  }
}

const gasConstant = 8.314462618

function finite(values: number[]) {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch04CalculationError('nonFiniteInput')
  }
}
function valid(values: number[]) {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch04CalculationError('numericalFailure')
  }
}
function validConversion(value: number) {
  return value > 0 && value < 1
}
function arrhenius(a: number, ea: number, temperature: number) {
  return a * Math.exp(-ea / (gasConstant * temperature))
}
function simpson(
  fn: (x: number) => number,
  lower: number,
  upper: number,
  intervals = 1200,
) {
  const count = intervals % 2 === 0 ? intervals : intervals + 1
  const h = (upper - lower) / count
  let sum = fn(lower) + fn(upper)
  for (let i = 1; i < count; i += 1) {
    sum += (i % 2 === 0 ? 2 : 4) * fn(lower + i * h)
  }
  return h * sum / 3
}

export function calculateEquilibriumConversion(
  input: EquilibriumConversionInput,
): EquilibriumConversionResult {
  finite(Object.values(input))
  if (
    input.initialConcentrationA <= 0 ||
    input.initialConcentrationB <= 0 ||
    input.equilibriumConstant <= 0
  ) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidEquilibriumInputs',
    )
  }

  const upper = Math.min(
    input.initialConcentrationA,
    input.initialConcentrationB,
  ) * (1 - 1e-12)

  const residual = (extent: number) =>
    extent /
      (
        (input.initialConcentrationA - extent) *
        (input.initialConcentrationB - extent)
      ) -
    input.equilibriumConstant

  let low = 0
  let high = upper
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2
    if (residual(mid) > 0) high = mid
    else low = mid
  }

  const equilibriumExtent = (low + high) / 2
  const equilibriumConcentrationA =
    input.initialConcentrationA - equilibriumExtent
  const equilibriumConcentrationB =
    input.initialConcentrationB - equilibriumExtent
  const equilibriumConcentrationProduct = equilibriumExtent
  const conversionA = equilibriumExtent / input.initialConcentrationA
  const conversionB = equilibriumExtent / input.initialConcentrationB
  const limitingReactant =
    input.initialConcentrationA < input.initialConcentrationB
      ? 'Reactant A'
      : input.initialConcentrationB < input.initialConcentrationA
        ? 'Reactant B'
        : 'Equal initial reactant basis'
  const equilibriumResidual = Math.abs(residual(equilibriumExtent))

  valid([
    equilibriumExtent,
    equilibriumConcentrationA,
    equilibriumConcentrationB,
    equilibriumConcentrationProduct,
    conversionA,
    conversionB,
    equilibriumResidual,
  ])

  return {
    equilibriumExtent,
    equilibriumConcentrationA,
    equilibriumConcentrationB,
    equilibriumConcentrationProduct,
    conversionA,
    conversionB,
    limitingReactant,
    equilibriumResidual,
  }
}

function trapezoidArea(times: number[], values: number[]) {
  let area = 0
  for (let i = 1; i < times.length; i += 1) {
    area +=
      (times[i] - times[i - 1]) *
      (values[i] + values[i - 1]) /
      2
  }
  return area
}

function interpolateThreshold(
  times: number[],
  cumulative: number[],
  target: number,
) {
  if (target <= cumulative[0]) return times[0]
  for (let i = 1; i < cumulative.length; i += 1) {
    if (cumulative[i] >= target) {
      const span = cumulative[i] - cumulative[i - 1]
      const fraction = span > 0
        ? (target - cumulative[i - 1]) / span
        : 0
      return times[i - 1] + fraction * (times[i] - times[i - 1])
    }
  }
  return times[times.length - 1]
}

export function calculateFCurveGenerator(
  input: FCurveGeneratorInput,
): FCurveGeneratorResult {
  finite([...input.times, ...input.eValues, input.evaluationTime])
  if (
    input.times.length < 3 ||
    input.times.length !== input.eValues.length ||
    input.times.some((value) => value < 0) ||
    input.eValues.some((value) => value < 0) ||
    input.evaluationTime < input.times[0] ||
    input.evaluationTime > input.times[input.times.length - 1] ||
    input.times.some(
      (value, index) => index > 0 && value <= input.times[index - 1],
    )
  ) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidFCurveInputs',
    )
  }

  const rawEArea = trapezoidArea(input.times, input.eValues)
  if (rawEArea <= 0) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidFCurveInputs',
    )
  }

  const normalizedEValues = input.eValues.map((value) => value / rawEArea)
  const cumulativeFValues = new Array<number>(input.times.length).fill(0)

  for (let i = 1; i < input.times.length; i += 1) {
    cumulativeFValues[i] =
      cumulativeFValues[i - 1] +
      (input.times[i] - input.times[i - 1]) *
      (normalizedEValues[i] + normalizedEValues[i - 1]) /
      2
  }

  const last = cumulativeFValues[cumulativeFValues.length - 1]
  for (let i = 0; i < cumulativeFValues.length; i += 1) {
    cumulativeFValues[i] /= last
  }


  let index = 1
  while (
    index < input.times.length &&
    input.times[index] < input.evaluationTime
  ) index += 1

  let evaluatedF = 0
  if (index >= input.times.length) {
    evaluatedF = 1
  } else if (index === 0) {
    evaluatedF = 0
  } else {
    const fraction =
      (input.evaluationTime - input.times[index - 1]) /
      (input.times[index] - input.times[index - 1])
    evaluatedF =
      cumulativeFValues[index - 1] +
      fraction *
      (cumulativeFValues[index] - cumulativeFValues[index - 1])
  }

  let meanNumerator = 0
  for (let i = 1; i < input.times.length; i += 1) {
    meanNumerator +=
      (input.times[i] - input.times[i - 1]) *
      (
        input.times[i] * normalizedEValues[i] +
        input.times[i - 1] * normalizedEValues[i - 1]
      ) /
      2
  }

  const meanResidenceTime = meanNumerator
  const timeAtTenPercent = interpolateThreshold(
    input.times,
    cumulativeFValues,
    0.1,
  )
  const medianResidenceTime = interpolateThreshold(
    input.times,
    cumulativeFValues,
    0.5,
  )
  const timeAtNinetyPercent = interpolateThreshold(
    input.times,
    cumulativeFValues,
    0.9,
  )
  const centralEightyPercentSpan =
    timeAtNinetyPercent - timeAtTenPercent

  valid([
    rawEArea,
    ...normalizedEValues,
    ...cumulativeFValues,
    evaluatedF,
    meanResidenceTime,
    medianResidenceTime,
    timeAtTenPercent,
    timeAtNinetyPercent,
    centralEightyPercentSpan,
  ])

  return {
    rawEArea,
    normalizedEValues,
    cumulativeFValues,
    fAtEvaluationTime: evaluatedF,
    meanResidenceTime,
    medianResidenceTime,
    timeAtTenPercent,
    timeAtNinetyPercent,
    centralEightyPercentSpan,
  }
}

export function calculateHeatExchangeBatchReactor(
  input: HeatExchangeBatchReactorInput,
): HeatExchangeBatchReactorResult {
  finite(Object.values(input))
  if (
    input.initialConcentrationA <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.initialTemperature <= 0 ||
    input.coolantTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    input.heatRemovalCoefficient < 0 ||
    !validConversion(input.targetConversion) ||
    input.maximumTime <= 0
  ) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidHeatExchangeBatchInputs',
    )
  }

  const steps = 20000
  const dt = input.maximumTime / steps
  let conversion = 0
  let temperature = input.initialTemperature
  let time = 0
  let maximumTemperature = temperature
  let totalHeatRemovedIndex = 0

  const derivatives = (x: number, t: number) => {
    const k = arrhenius(
      input.preExponentialFactor,
      input.activationEnergy,
      t,
    )
    const dxdt = k * (1 - x)
    const dtdt =
      input.adiabaticTemperatureRise * dxdt -
      input.heatRemovalCoefficient * (t - input.coolantTemperature)
    return [dxdt, dtdt] as const
  }

  for (let i = 0; i < steps && conversion < input.targetConversion; i += 1) {
    const [k1x, k1t] = derivatives(conversion, temperature)
    const [k2x, k2t] = derivatives(
      conversion + k1x * dt / 2,
      temperature + k1t * dt / 2,
    )
    const [k3x, k3t] = derivatives(
      conversion + k2x * dt / 2,
      temperature + k2t * dt / 2,
    )
    const [k4x, k4t] = derivatives(
      conversion + k3x * dt,
      temperature + k3t * dt,
    )

    const previousConversion = conversion
    const previousTemperature = temperature
    conversion += dt * (k1x + 2 * k2x + 2 * k3x + k4x) / 6
    temperature += dt * (k1t + 2 * k2t + 2 * k3t + k4t) / 6
    totalHeatRemovedIndex +=
      input.heatRemovalCoefficient *
      Math.max(previousTemperature - input.coolantTemperature, 0) *
      dt
    time += dt
    maximumTemperature = Math.max(maximumTemperature, temperature)

    if (conversion >= input.targetConversion) {
      const fraction =
        (input.targetConversion - previousConversion) /
        (conversion - previousConversion)
      time -= dt * (1 - fraction)
      temperature =
        previousTemperature +
        fraction * (temperature - previousTemperature)
      conversion = input.targetConversion
      break
    }
  }

  if (conversion < input.targetConversion * (1 - 1e-9)) {
    throw new ReactionEngineeringBatch04CalculationError('targetNotReached')
  }

  const finalConcentrationA =
    input.initialConcentrationA * (1 - input.targetConversion)
  const finalRateConstant = arrhenius(
    input.preExponentialFactor,
    input.activationEnergy,
    temperature,
  )
  const finalReactionRate =
    finalRateConstant * finalConcentrationA

  valid([
    time,
    temperature,
    maximumTemperature,
    finalConcentrationA,
    finalRateConstant,
    finalReactionRate,
    totalHeatRemovedIndex,
    steps,
  ])

  return {
    requiredBatchTime: time,
    finalTemperature: temperature,
    maximumTemperature,
    finalConcentrationA,
    finalRateConstant,
    finalReactionRate,
    totalHeatRemovedIndex,
    integrationSteps: steps,
  }
}

export function calculateHeatExchangeCSTR(
  input: HeatExchangeCSTRInput,
): HeatExchangeCSTRResult {
  finite(Object.values(input))
  if (
    input.inletConcentrationA <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.inletTemperature <= 0 ||
    input.coolantTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    input.heatRemovalNumber < 0 ||
    !validConversion(input.targetConversion)
  ) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidHeatExchangeCSTRInputs',
    )
  }

  const outletTemperature =
    (
      input.inletTemperature +
      input.adiabaticTemperatureRise * input.targetConversion +
      input.heatRemovalNumber * input.coolantTemperature
    ) /
    (1 + input.heatRemovalNumber)

  const outletConcentrationA =
    input.inletConcentrationA * (1 - input.targetConversion)
  const outletRateConstant = arrhenius(
    input.preExponentialFactor,
    input.activationEnergy,
    outletTemperature,
  )
  const outletReactionRate =
    outletRateConstant * outletConcentrationA
  const inletMolarFlow =
    input.inletConcentrationA * input.volumetricFlowRate
  const requiredReactorVolume =
    inletMolarFlow * input.targetConversion / outletReactionRate
  const spaceTime = requiredReactorVolume / input.volumetricFlowRate
  const adiabaticOutlet =
    input.inletTemperature +
    input.adiabaticTemperatureRise * input.targetConversion
  const heatRemovedTemperatureEquivalent =
    adiabaticOutlet - outletTemperature
  const heatRemovalFractionOfAdiabaticRise =
    input.adiabaticTemperatureRise * input.targetConversion > 0
      ? heatRemovedTemperatureEquivalent /
        (input.adiabaticTemperatureRise * input.targetConversion)
      : 0

  valid([
    outletTemperature,
    outletConcentrationA,
    outletRateConstant,
    outletReactionRate,
    requiredReactorVolume,
    spaceTime,
    heatRemovedTemperatureEquivalent,
    heatRemovalFractionOfAdiabaticRise,
  ])

  return {
    outletTemperature,
    outletConcentrationA,
    outletRateConstant,
    outletReactionRate,
    requiredReactorVolume,
    spaceTime,
    heatRemovedTemperatureEquivalent,
    heatRemovalFractionOfAdiabaticRise,
  }
}

export function calculateHeatExchangePFR(
  input: HeatExchangePFRInput,
): HeatExchangePFRResult {
  finite(Object.values(input))
  if (
    input.inletConcentrationA <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.inletTemperature <= 0 ||
    input.coolantTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    input.heatRemovalNumberPerConversion < 0 ||
    !validConversion(input.targetConversion)
  ) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidHeatExchangePFRInputs',
    )
  }

  const h = input.heatRemovalNumberPerConversion
  const temperatureAt = (conversion: number) => {
    if (h < 1e-12) {
      return input.inletTemperature +
        input.adiabaticTemperatureRise * conversion
    }
    const steadyOffset = input.adiabaticTemperatureRise / h
    return (
      input.coolantTemperature +
      steadyOffset +
      (
        input.inletTemperature -
        input.coolantTemperature -
        steadyOffset
      ) *
      Math.exp(-h * conversion)
    )
  }

  const integrationIntervals = 1200
  const requiredReactorVolume = simpson(
    (conversion) => {
      const temperature = temperatureAt(conversion)
      const k = arrhenius(
        input.preExponentialFactor,
        input.activationEnergy,
        temperature,
      )
      return input.volumetricFlowRate / (k * (1 - conversion))
    },
    0,
    input.targetConversion,
    integrationIntervals,
  )

  const outletTemperature = temperatureAt(input.targetConversion)
  let maximumTemperature = input.inletTemperature
  for (let i = 0; i <= 500; i += 1) {
    maximumTemperature = Math.max(
      maximumTemperature,
      temperatureAt(input.targetConversion * i / 500),
    )
  }

  const outletConcentrationA =
    input.inletConcentrationA * (1 - input.targetConversion)
  const outletRateConstant = arrhenius(
    input.preExponentialFactor,
    input.activationEnergy,
    outletTemperature,
  )
  const spaceTime = requiredReactorVolume / input.volumetricFlowRate
  const averageRateConstant =
    input.volumetricFlowRate *
    -Math.log(1 - input.targetConversion) /
    requiredReactorVolume

  valid([
    outletTemperature,
    maximumTemperature,
    outletConcentrationA,
    outletRateConstant,
    requiredReactorVolume,
    spaceTime,
    averageRateConstant,
    integrationIntervals,
  ])

  return {
    outletTemperature,
    maximumTemperature,
    outletConcentrationA,
    outletRateConstant,
    requiredReactorVolume,
    spaceTime,
    averageRateConstant,
    integrationIntervals,
  }
}

export function calculateImmobilizedEnzymeReactor(
  input: ImmobilizedEnzymeReactorInput,
): ImmobilizedEnzymeReactorResult {
  finite(Object.values(input))
  if (
    input.sphericalPelletRadius <= 0 ||
    input.effectiveDiffusivity <= 0 ||
    input.maximumVolumetricRate <= 0 ||
    input.michaelisConstant <= 0 ||
    input.bulkSubstrateConcentration <= 0 ||
    input.totalPelletVolume <= 0
  ) {
    throw new ReactionEngineeringBatch04CalculationError(
      'invalidImmobilizedEnzymeInputs',
    )
  }

  const firstOrderRateConstant =
    input.maximumVolumetricRate /
    (input.michaelisConstant + input.bulkSubstrateConcentration)

  const thieleModulus =
    input.sphericalPelletRadius *
    Math.sqrt(firstOrderRateConstant / input.effectiveDiffusivity)

  const effectivenessFactor =
    thieleModulus < 1e-6
      ? 1
      : 3 / thieleModulus *
        (
          1 / Math.tanh(thieleModulus) -
          1 / thieleModulus
        )

  const intrinsicVolumetricRate =
    input.maximumVolumetricRate *
    input.bulkSubstrateConcentration /
    (input.michaelisConstant + input.bulkSubstrateConcentration)

  const observedVolumetricRate =
    effectivenessFactor * intrinsicVolumetricRate
  const totalObservedMolarRate =
    observedVolumetricRate * input.totalPelletVolume
  const internalDiffusionLossFraction = 1 - effectivenessFactor
  const diffusionRegimeDescription =
    thieleModulus < 0.3
      ? 'Kinetic-control screening range'
      : thieleModulus < 3
        ? 'Mixed kinetic–diffusion range'
        : 'Strong internal-diffusion limitation'

  valid([
    firstOrderRateConstant,
    thieleModulus,
    effectivenessFactor,
    intrinsicVolumetricRate,
    observedVolumetricRate,
    totalObservedMolarRate,
    internalDiffusionLossFraction,
  ])

  return {
    firstOrderRateConstant,
    thieleModulus,
    effectivenessFactor,
    intrinsicVolumetricRate,
    observedVolumetricRate,
    totalObservedMolarRate,
    internalDiffusionLossFraction,
    diffusionRegimeDescription,
  }
}
