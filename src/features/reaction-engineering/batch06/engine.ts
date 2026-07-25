import type {
  NonIsothermalCSTRSteadyStatesInput,
  NonIsothermalCSTRSteadyStatesResult,
  PBRPressureDropEffectsInput,
  PBRPressureDropEffectsResult,
  PackedBedPressureDropInput,
  PackedBedPressureDropResult,
  PackedBedReactorDesignInput,
  PackedBedReactorDesignResult,
  ParallelReactionsInput,
  ParallelReactionsResult,
  RateConstantCalculationInput,
  RateConstantCalculationResult,
} from './types.ts'

export type ReactionEngineeringBatch06ErrorCode =
  | 'nonFiniteInput'
  | 'invalidNonIsothermalCSTRInputs'
  | 'noSteadyStateFound'
  | 'invalidPackedBedPressureDropInputs'
  | 'invalidPackedBedDesignInputs'
  | 'invalidParallelReactionInputs'
  | 'invalidPBRPressureDropInputs'
  | 'pressureDropLimitExceeded'
  | 'invalidRateConstantInputs'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch06ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidNonIsothermalCSTRInputs:
    'Space time, pre-exponential factor, activation energy and absolute temperatures must be positive. Adiabatic rise and heat-removal number cannot be negative, and maximum search temperature must exceed minimum search temperature.',
  noSteadyStateFound:
    'No steady state was found inside the selected temperature interval.',
  invalidPackedBedPressureDropInputs:
    'Bed length, particle diameter, density, viscosity and superficial velocity must be positive. Bed void fraction must lie above zero and below one.',
  invalidPackedBedDesignInputs:
    'Inlet concentration, inlet volumetric flow and mass-specific first-order rate constant must be positive. Target conversion must lie above zero and below one.',
  invalidParallelReactionInputs:
    'Reactant concentration and both rate constants must be positive. Reaction orders cannot be negative.',
  invalidPBRPressureDropInputs:
    'Molar feed, inlet concentration, catalyst weight, mass-specific rate constant and inlet pressure must be positive. Pressure-drop coefficient cannot be negative.',
  pressureDropLimitExceeded:
    'The selected pressure-drop coefficient and catalyst weight reach or exceed the zero-pressure model limit.',
  invalidRateConstantInputs:
    'Observed rate and both concentrations must be positive. Reaction orders cannot be negative.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch06CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch06ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch06ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch06CalculationError'
    this.code = code
  }
}

const gasConstant = 8.314462618

function validateFinite(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch06CalculationError(
      'nonFiniteInput',
    )
  }
}

function validateResults(values: number[]): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch06CalculationError(
      'numericalFailure',
    )
  }
}

function arrhenius(
  preExponentialFactor: number,
  activationEnergy: number,
  temperature: number,
): number {
  return (
    preExponentialFactor *
    Math.exp(
      -activationEnergy /
      (
        gasConstant *
        temperature
      ),
    )
  )
}

export function calculateNonIsothermalCSTRSteadyStates(
  input: NonIsothermalCSTRSteadyStatesInput,
): NonIsothermalCSTRSteadyStatesResult {
  validateFinite(Object.values(input))

  if (
    input.spaceTime <= 0 ||
    input.preExponentialFactor <= 0 ||
    input.activationEnergy <= 0 ||
    input.inletTemperature <= 0 ||
    input.coolantTemperature <= 0 ||
    input.adiabaticTemperatureRise < 0 ||
    input.heatRemovalNumber < 0 ||
    input.minimumSearchTemperature <= 0 ||
    input.maximumSearchTemperature <=
      input.minimumSearchTemperature
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'invalidNonIsothermalCSTRInputs',
    )
  }

  const conversionAt = (temperature: number): number => {
    const rateConstant =
      arrhenius(
        input.preExponentialFactor,
        input.activationEnergy,
        temperature,
      )

    return (
      rateConstant *
      input.spaceTime /
      (
        1 +
        rateConstant *
        input.spaceTime
      )
    )
  }

  const energyPredictedTemperature =
    (temperature: number): number =>
      (
        input.inletTemperature +
        input.adiabaticTemperatureRise *
        conversionAt(temperature) +
        input.heatRemovalNumber *
        input.coolantTemperature
      ) /
      (
        1 +
        input.heatRemovalNumber
      )

  const residual = (temperature: number): number =>
    temperature -
    energyPredictedTemperature(temperature)

  const searchIntervals = 6000
  const step =
    (
      input.maximumSearchTemperature -
      input.minimumSearchTemperature
    ) /
    searchIntervals

  const roots: number[] = []

  const addRoot = (root: number): void => {
    if (
      roots.every(
        (existing) =>
          Math.abs(
            existing -
            root,
          ) >
          1e-5,
      )
    ) {
      roots.push(root)
    }
  }

  let previousTemperature =
    input.minimumSearchTemperature

  let previousResidual =
    residual(previousTemperature)

  if (
    Math.abs(previousResidual) <
    1e-10
  ) {
    addRoot(previousTemperature)
  }

  for (
    let index = 1;
    index <= searchIntervals;
    index += 1
  ) {
    const currentTemperature =
      input.minimumSearchTemperature +
      index *
      step

    const currentResidual =
      residual(currentTemperature)

    if (
      Math.abs(currentResidual) <
      1e-10
    ) {
      addRoot(currentTemperature)
    } else if (
      previousResidual *
      currentResidual <
      0
    ) {
      let low =
        previousTemperature
      let high =
        currentTemperature
      let lowResidual =
        previousResidual

      for (
        let iteration = 0;
        iteration < 100;
        iteration += 1
      ) {
        const midpoint =
          (
            low +
            high
          ) /
          2

        const midpointResidual =
          residual(midpoint)

        if (
          Math.abs(midpointResidual) <
          1e-12
        ) {
          low = midpoint
          high = midpoint
          break
        }

        if (
          lowResidual *
          midpointResidual <=
          0
        ) {
          high = midpoint
        } else {
          low = midpoint
          lowResidual =
            midpointResidual
        }
      }

      addRoot(
        (
          low +
          high
        ) /
        2,
      )
    }

    previousTemperature =
      currentTemperature
    previousResidual =
      currentResidual
  }

  roots.sort(
    (
      first,
      second,
    ) =>
      first -
      second,
  )

  if (
    roots.length === 0
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'noSteadyStateFound',
    )
  }

  const conversions =
    roots.map(conversionAt)

  const derivativeStep =
    Math.max(
      1e-4,
      (
        input.maximumSearchTemperature -
        input.minimumSearchTemperature
      ) /
      1_000_000,
    )

  const stabilityDescriptions =
    roots.map(
      (temperature) => {
        const derivative =
          (
            energyPredictedTemperature(
              temperature +
              derivativeStep,
            ) -
            energyPredictedTemperature(
              temperature -
              derivativeStep,
            )
          ) /
          (
            2 *
            derivativeStep
          )

        return derivative < 1
          ? 'Locally stable screening state'
          : 'Locally unstable screening state'
      },
    )

  const lowestTemperatureState =
    roots[0] ??
    null

  const highestTemperatureState =
    roots[
      roots.length -
      1
    ] ??
    null

  const temperatureSpan =
    highestTemperatureState !== null &&
    lowestTemperatureState !== null
      ? highestTemperatureState -
        lowestTemperatureState
      : 0

  const maximumConversion =
    Math.max(...conversions)

  const minimumConversion =
    Math.min(...conversions)

  validateResults([
    ...roots,
    ...conversions,
    temperatureSpan,
    maximumConversion,
    minimumConversion,
    searchIntervals,
  ])

  return {
    steadyStateCount:
      roots.length,
    steadyStateTemperatures:
      roots,
    steadyStateConversions:
      conversions,
    stabilityDescriptions,
    lowestTemperatureState,
    highestTemperatureState,
    temperatureSpan,
    maximumConversion,
    minimumConversion,
    searchIntervals,
  }
}

export function calculatePackedBedPressureDrop(
  input: PackedBedPressureDropInput,
): PackedBedPressureDropResult {
  validateFinite(Object.values(input))

  if (
    input.bedLength <= 0 ||
    input.particleDiameter <= 0 ||
    input.bedVoidFraction <= 0 ||
    input.bedVoidFraction >= 1 ||
    input.fluidDensity <= 0 ||
    input.fluidViscosity <= 0 ||
    input.superficialVelocity <= 0
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'invalidPackedBedPressureDropInputs',
    )
  }

  const solidsFraction =
    1 -
    input.bedVoidFraction

  const voidFractionCubed =
    input.bedVoidFraction **
    3

  const viscousPressureGradient =
    150 *
    input.fluidViscosity *
    solidsFraction **
    2 *
    input.superficialVelocity /
    (
      voidFractionCubed *
      input.particleDiameter **
      2
    )

  const inertialPressureGradient =
    1.75 *
    input.fluidDensity *
    solidsFraction *
    input.superficialVelocity **
    2 /
    (
      voidFractionCubed *
      input.particleDiameter
    )

  const totalPressureGradient =
    viscousPressureGradient +
    inertialPressureGradient

  const totalPressureDrop =
    totalPressureGradient *
    input.bedLength

  const viscousContributionFraction =
    viscousPressureGradient /
    totalPressureGradient

  const inertialContributionFraction =
    inertialPressureGradient /
    totalPressureGradient

  const particleReynoldsNumber =
    input.fluidDensity *
    input.superficialVelocity *
    input.particleDiameter /
    input.fluidViscosity

  const ergunRegimeDescription =
    inertialContributionFraction <
      0.2
      ? 'Viscous contribution dominates'
      : inertialContributionFraction <
          0.8
        ? 'Mixed viscous–inertial regime'
        : 'Inertial contribution dominates'

  validateResults([
    viscousPressureGradient,
    inertialPressureGradient,
    totalPressureGradient,
    totalPressureDrop,
    viscousContributionFraction,
    inertialContributionFraction,
    particleReynoldsNumber,
  ])

  return {
    viscousPressureGradient,
    inertialPressureGradient,
    totalPressureGradient,
    totalPressureDrop,
    viscousContributionFraction,
    inertialContributionFraction,
    particleReynoldsNumber,
    ergunRegimeDescription,
  }
}

export function calculatePackedBedReactorDesign(
  input: PackedBedReactorDesignInput,
): PackedBedReactorDesignResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentrationA <= 0 ||
    input.inletVolumetricFlowRate <= 0 ||
    input.massSpecificFirstOrderRateConstant <= 0 ||
    input.targetConversion <= 0 ||
    input.targetConversion >= 1
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'invalidPackedBedDesignInputs',
    )
  }

  const logarithmicConversionFactor =
    -Math.log(
      1 -
      input.targetConversion,
    )

  const requiredCatalystWeight =
    input.inletVolumetricFlowRate /
    input.massSpecificFirstOrderRateConstant *
    logarithmicConversionFactor

  const inletMolarFlowRateA =
    input.inletConcentrationA *
    input.inletVolumetricFlowRate

  const outletConcentrationA =
    input.inletConcentrationA *
    (
      1 -
      input.targetConversion
    )

  const outletMolarFlowRateA =
    inletMolarFlowRateA *
    (
      1 -
      input.targetConversion
    )

  const catalystWeightPerVolumetricFlow =
    requiredCatalystWeight /
    input.inletVolumetricFlowRate

  const catalystWeightPerMolarFeed =
    requiredCatalystWeight /
    inletMolarFlowRateA

  const apparentCatalystSpaceVelocity =
    input.inletVolumetricFlowRate /
    requiredCatalystWeight

  validateResults([
    requiredCatalystWeight,
    inletMolarFlowRateA,
    outletConcentrationA,
    outletMolarFlowRateA,
    catalystWeightPerVolumetricFlow,
    catalystWeightPerMolarFeed,
    logarithmicConversionFactor,
    apparentCatalystSpaceVelocity,
  ])

  return {
    requiredCatalystWeight,
    inletMolarFlowRateA,
    outletConcentrationA,
    outletMolarFlowRateA,
    catalystWeightPerVolumetricFlow,
    catalystWeightPerMolarFeed,
    logarithmicConversionFactor,
    apparentCatalystSpaceVelocity,
  }
}

export function calculateParallelReactions(
  input: ParallelReactionsInput,
): ParallelReactionsResult {
  validateFinite(Object.values(input))

  if (
    input.reactantConcentration <= 0 ||
    input.desiredRateConstant <= 0 ||
    input.desiredReactionOrder < 0 ||
    input.undesiredRateConstant <= 0 ||
    input.undesiredReactionOrder < 0
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'invalidParallelReactionInputs',
    )
  }

  const desiredReactionRate =
    input.desiredRateConstant *
    input.reactantConcentration **
    input.desiredReactionOrder

  const undesiredReactionRate =
    input.undesiredRateConstant *
    input.reactantConcentration **
    input.undesiredReactionOrder

  const totalDisappearanceRate =
    desiredReactionRate +
    undesiredReactionRate

  const instantaneousSelectivity =
    desiredReactionRate /
    undesiredReactionRate

  const desiredProductFraction =
    desiredReactionRate /
    totalDisappearanceRate

  const undesiredProductFraction =
    undesiredReactionRate /
    totalDisappearanceRate

  const overallReactionOrderAtState =
    (
      input.desiredReactionOrder *
      desiredReactionRate +
      input.undesiredReactionOrder *
      undesiredReactionRate
    ) /
    totalDisappearanceRate

  const orderDifference =
    input.desiredReactionOrder -
    input.undesiredReactionOrder

  const concentrationSensitivityDescription =
    Math.abs(orderDifference) <
      1e-12
      ? 'Selectivity is concentration-independent'
      : orderDifference > 0
        ? 'Higher reactant concentration favors the desired reaction'
        : 'Lower reactant concentration favors the desired reaction'

  validateResults([
    desiredReactionRate,
    undesiredReactionRate,
    totalDisappearanceRate,
    instantaneousSelectivity,
    desiredProductFraction,
    undesiredProductFraction,
    overallReactionOrderAtState,
  ])

  return {
    desiredReactionRate,
    undesiredReactionRate,
    totalDisappearanceRate,
    instantaneousSelectivity,
    desiredProductFraction,
    undesiredProductFraction,
    overallReactionOrderAtState,
    concentrationSensitivityDescription,
  }
}

export function calculatePBRPressureDropEffects(
  input: PBRPressureDropEffectsInput,
): PBRPressureDropEffectsResult {
  validateFinite(Object.values(input))

  if (
    input.inletMolarFlowRateA <= 0 ||
    input.inletConcentrationA <= 0 ||
    input.catalystWeight <= 0 ||
    input.massSpecificFirstOrderRateConstant <= 0 ||
    input.pressureDropCoefficient < 0 ||
    input.inletPressure <= 0
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'invalidPBRPressureDropInputs',
    )
  }

  const pressureDropProduct =
    input.pressureDropCoefficient *
    input.catalystWeight

  if (
    pressureDropProduct >= 1
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'pressureDropLimitExceeded',
    )
  }

  const outletPressureRatio =
    Math.sqrt(
      1 -
      pressureDropProduct,
    )

  const outletPressure =
    input.inletPressure *
    outletPressureRatio

  const baseKineticFactor =
    input.massSpecificFirstOrderRateConstant *
    input.inletConcentrationA /
    input.inletMolarFlowRateA

  const effectiveCatalystExposureIntegral =
    input.pressureDropCoefficient >
      0
      ? (
          2 /
          (
            3 *
            input.pressureDropCoefficient
          ) *
          (
            1 -
            (
              1 -
              pressureDropProduct
            ) **
            1.5
          )
        )
      : input.catalystWeight

  const conversionWithPressureDrop =
    1 -
    Math.exp(
      -baseKineticFactor *
      effectiveCatalystExposureIntegral,
    )

  const conversionWithoutPressureDrop =
    1 -
    Math.exp(
      -baseKineticFactor *
      input.catalystWeight,
    )

  const conversionPenalty =
    conversionWithoutPressureDrop -
    conversionWithPressureDrop

  const pressureDropFraction =
    1 -
    outletPressureRatio

  const outletConcentrationA =
    input.inletConcentrationA *
    (
      1 -
      conversionWithPressureDrop
    )

  const pressureDropSeverityDescription =
    pressureDropFraction <
      0.05
      ? 'Low pressure-drop effect'
      : pressureDropFraction <
          0.2
        ? 'Moderate pressure-drop effect'
        : 'High pressure-drop effect'

  validateResults([
    outletPressure,
    outletPressureRatio,
    conversionWithPressureDrop,
    conversionWithoutPressureDrop,
    conversionPenalty,
    pressureDropFraction,
    effectiveCatalystExposureIntegral,
    outletConcentrationA,
  ])

  return {
    outletPressure,
    outletPressureRatio,
    conversionWithPressureDrop,
    conversionWithoutPressureDrop,
    conversionPenalty,
    pressureDropFraction,
    effectiveCatalystExposureIntegral,
    outletConcentrationA,
    pressureDropSeverityDescription,
  }
}

export function calculateRateConstant(
  input: RateConstantCalculationInput,
): RateConstantCalculationResult {
  validateFinite(Object.values(input))

  if (
    input.observedReactionRate <= 0 ||
    input.concentrationA <= 0 ||
    input.reactionOrderA < 0 ||
    input.concentrationB <= 0 ||
    input.reactionOrderB < 0
  ) {
    throw new ReactionEngineeringBatch06CalculationError(
      'invalidRateConstantInputs',
    )
  }

  const concentrationFactorA =
    input.concentrationA **
    input.reactionOrderA

  const concentrationFactorB =
    input.concentrationB **
    input.reactionOrderB

  const combinedConcentrationFactor =
    concentrationFactorA *
    concentrationFactorB

  const rateConstant =
    input.observedReactionRate /
    combinedConcentrationFactor

  const overallReactionOrder =
    input.reactionOrderA +
    input.reactionOrderB

  const reconstructedReactionRate =
    rateConstant *
    combinedConcentrationFactor

  const relativeReconstructionError =
    Math.abs(
      reconstructedReactionRate -
      input.observedReactionRate,
    ) /
    input.observedReactionRate

  const dimensionalBasisDescription =
    `Rate basis divided by concentration^${overallReactionOrder}`

  validateResults([
    concentrationFactorA,
    concentrationFactorB,
    combinedConcentrationFactor,
    rateConstant,
    overallReactionOrder,
    reconstructedReactionRate,
    relativeReconstructionError,
  ])

  return {
    rateConstant,
    overallReactionOrder,
    concentrationFactorA,
    concentrationFactorB,
    combinedConcentrationFactor,
    reconstructedReactionRate,
    relativeReconstructionError,
    dimensionalBasisDescription,
  }
}
