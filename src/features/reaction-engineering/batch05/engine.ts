import type {
  LevenspielPlotSizingInput,
  LevenspielPlotSizingResult,
  MembraneReactorInput,
  MembraneReactorResult,
  MichaelisMentenReactorInput,
  MichaelisMentenReactorResult,
  MonodBioreactorDesignInput,
  MonodBioreactorDesignResult,
  MultipleReactionsCSTRInput,
  MultipleReactionsCSTRResult,
  MultipleReactionsPFRInput,
  MultipleReactionsPFRResult,
} from './types.ts'

export type ReactionEngineeringBatch05ErrorCode =
  | 'nonFiniteInput'
  | 'invalidLevenspielInputs'
  | 'invalidMembraneInputs'
  | 'invalidMichaelisMentenInputs'
  | 'invalidMonodInputs'
  | 'noPositiveNetGrowth'
  | 'invalidMultipleCSTRInputs'
  | 'invalidMultiplePFRInputs'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch05ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidLevenspielInputs:
    'Provide at least three equal-length conversion and inverse-rate points. Conversion must start at zero, increase strictly and remain below one. Inverse rates and inlet molar flow must be positive.',
  invalidMembraneInputs:
    'Molar feed, flow, forward rate constant, equilibrium constant, membrane-removal constant and reactor volume must be positive.',
  invalidMichaelisMentenInputs:
    'Flow rate, inlet concentration, maximum rate and Michaelis constant must be positive. Target conversion must lie above zero and below one.',
  invalidMonodInputs:
    'Flow, substrate concentrations, maximum growth rate, half-saturation constant and yield must be positive. Effluent substrate must be below feed substrate, and decay rate cannot be negative.',
  noPositiveNetGrowth:
    'The selected effluent substrate gives no positive net microbial growth after decay.',
  invalidMultipleCSTRInputs:
    'Concentration, flow and both rate constants must be positive. Target conversion must lie above zero and below one.',
  invalidMultiplePFRInputs:
    'Concentration, flow, both rate constants and space time must be positive.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch05CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch05ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch05ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch05CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'numericalFailure',
      )
  }
}

export function calculateLevenspielPlotSizing(
  input: LevenspielPlotSizingInput,
): LevenspielPlotSizingResult {
  validateFinite([
    input.inletMolarFlowRate,
    ...input.conversions,
    ...input.inverseRates,
  ])

  const pointCount =
    input.conversions.length

  if (
    input.inletMolarFlowRate <= 0 ||
    pointCount < 3 ||
    pointCount !==
      input.inverseRates.length ||
    Math.abs(
      input.conversions[0],
    ) >
      1e-12 ||
    input.conversions.some(
      (
        conversion,
        index,
      ) =>
        conversion < 0 ||
        conversion >= 1 ||
        (
          index > 0 &&
          conversion <=
            input.conversions[index - 1]
        ),
    ) ||
    input.inverseRates.some(
      (value) => value <= 0,
    )
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'invalidLevenspielInputs',
      )
  }

  let integratedArea = 0

  for (
    let index = 1;
    index < pointCount;
    index += 1
  ) {
    integratedArea +=
      (
        input.conversions[index] -
        input.conversions[index - 1]
      ) *
      (
        input.inverseRates[index] +
        input.inverseRates[index - 1]
      ) /
      2
  }

  const finalConversion =
    input.conversions[
      pointCount -
      1
    ]

  const endpointInverseRate =
    input.inverseRates[
      pointCount -
      1
    ]

  const pfrVolume =
    input.inletMolarFlowRate *
    integratedArea

  const cstrVolumeToFinalConversion =
    input.inletMolarFlowRate *
    finalConversion *
    endpointInverseRate

  const minimumInverseRate =
    Math.min(
      ...input.inverseRates,
    )

  const maximumInverseRate =
    Math.max(
      ...input.inverseRates,
    )

  const pfrToCSTRVolumeRatio =
    pfrVolume /
    cstrVolumeToFinalConversion

  validateResults([
    pfrVolume,
    cstrVolumeToFinalConversion,
    finalConversion,
    integratedArea,
    endpointInverseRate,
    minimumInverseRate,
    maximumInverseRate,
    pfrToCSTRVolumeRatio,
    pointCount - 1,
  ])

  return {
    pfrVolume,
    cstrVolumeToFinalConversion,
    finalConversion,
    integratedArea,
    endpointInverseRate,
    minimumInverseRate,
    maximumInverseRate,
    pfrToCSTRVolumeRatio,
    integrationSegments:
      pointCount -
      1,
  }
}

interface MembraneState {
  flowA: number
  flowB: number
  permeatedB: number
}

export function calculateMembraneReactor(
  input: MembraneReactorInput,
): MembraneReactorResult {
  validateFinite(Object.values(input))

  if (
    input.inletMolarFlowRateA <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.forwardRateConstant <= 0 ||
    input.equilibriumConstant <= 0 ||
    input.membraneRemovalRateConstant <= 0 ||
    input.reactorVolume <= 0
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'invalidMembraneInputs',
      )
  }

  const integrationSteps =
    4000

  const step =
    input.reactorVolume /
    integrationSteps

  const derivative =
    (
      state: MembraneState,
    ): MembraneState => {
      const concentrationA =
        Math.max(
          state.flowA /
          input.volumetricFlowRate,
          0,
        )

      const concentrationB =
        Math.max(
          state.flowB /
          input.volumetricFlowRate,
          0,
        )

      const netReactionRate =
        input.forwardRateConstant *
        (
          concentrationA -
          concentrationB /
          input.equilibriumConstant
        )

      const membraneRemovalRate =
        input.membraneRemovalRateConstant *
        concentrationB

      return {
        flowA:
          -netReactionRate,
        flowB:
          netReactionRate -
          membraneRemovalRate,
        permeatedB:
          membraneRemovalRate,
      }
    }

  const addState =
    (
      base: MembraneState,
      increment: MembraneState,
      multiplier: number,
    ): MembraneState => ({
      flowA:
        base.flowA +
        multiplier *
        increment.flowA,
      flowB:
        base.flowB +
        multiplier *
        increment.flowB,
      permeatedB:
        base.permeatedB +
        multiplier *
        increment.permeatedB,
    })

  let state: MembraneState = {
    flowA:
      input.inletMolarFlowRateA,
    flowB: 0,
    permeatedB: 0,
  }

  for (
    let index = 0;
    index < integrationSteps;
    index += 1
  ) {
    const k1 =
      derivative(state)

    const k2 =
      derivative(
        addState(
          state,
          k1,
          step /
          2,
        ),
      )

    const k3 =
      derivative(
        addState(
          state,
          k2,
          step /
          2,
        ),
      )

    const k4 =
      derivative(
        addState(
          state,
          k3,
          step,
        ),
      )

    state = {
      flowA:
        state.flowA +
        step *
        (
          k1.flowA +
          2 *
          k2.flowA +
          2 *
          k3.flowA +
          k4.flowA
        ) /
        6,
      flowB:
        state.flowB +
        step *
        (
          k1.flowB +
          2 *
          k2.flowB +
          2 *
          k3.flowB +
          k4.flowB
        ) /
        6,
      permeatedB:
        state.permeatedB +
        step *
        (
          k1.permeatedB +
          2 *
          k2.permeatedB +
          2 *
          k3.permeatedB +
          k4.permeatedB
        ) /
        6,
    }

    state.flowA =
      Math.max(
        state.flowA,
        0,
      )

    state.flowB =
      Math.max(
        state.flowB,
        0,
      )

    state.permeatedB =
      Math.max(
        state.permeatedB,
        0,
      )
  }

  const outletMolarFlowRateA =
    state.flowA

  const outletMolarFlowRateB =
    state.flowB

  const permeatedMolarFlowRateB =
    state.permeatedB

  const conversionA =
    (
      input.inletMolarFlowRateA -
      outletMolarFlowRateA
    ) /
    input.inletMolarFlowRateA

  const totalProduct =
    outletMolarFlowRateB +
    permeatedMolarFlowRateB

  const productRecovery =
    totalProduct > 0
      ? permeatedMolarFlowRateB /
        totalProduct
      : 0

  const outletSelectivityToRetainedProduct =
    outletMolarFlowRateA > 0
      ? outletMolarFlowRateB /
        outletMolarFlowRateA
      : Number.MAX_VALUE

  const outletConcentrationA =
    outletMolarFlowRateA /
    input.volumetricFlowRate

  const outletConcentrationB =
    outletMolarFlowRateB /
    input.volumetricFlowRate

  const netProductionRateAtOutlet =
    input.forwardRateConstant *
    (
      outletConcentrationA -
      outletConcentrationB /
      input.equilibriumConstant
    )

  validateResults([
    outletMolarFlowRateA,
    outletMolarFlowRateB,
    permeatedMolarFlowRateB,
    conversionA,
    productRecovery,
    outletSelectivityToRetainedProduct,
    outletConcentrationA,
    outletConcentrationB,
    netProductionRateAtOutlet,
    integrationSteps,
  ])

  return {
    outletMolarFlowRateA,
    outletMolarFlowRateB,
    permeatedMolarFlowRateB,
    conversionA,
    productRecovery,
    outletSelectivityToRetainedProduct,
    outletConcentrationA,
    outletConcentrationB,
    netProductionRateAtOutlet,
    integrationSteps,
  }
}

export function calculateMichaelisMentenReactor(
  input: MichaelisMentenReactorInput,
): MichaelisMentenReactorResult {
  validateFinite(Object.values(input))

  if (
    input.substrateVolumetricFlowRate <= 0 ||
    input.inletSubstrateConcentration <= 0 ||
    input.maximumVolumetricRate <= 0 ||
    input.michaelisConstant <= 0 ||
    input.targetConversion <= 0 ||
    input.targetConversion >= 1
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'invalidMichaelisMentenInputs',
      )
  }

  const outletSubstrateConcentration =
    input.inletSubstrateConcentration *
    (
      1 -
      input.targetConversion
    )

  const outletReactionRate =
    input.maximumVolumetricRate *
    outletSubstrateConcentration /
    (
      input.michaelisConstant +
      outletSubstrateConcentration
    )

  const substrateConsumptionRate =
    input.substrateVolumetricFlowRate *
    (
      input.inletSubstrateConcentration -
      outletSubstrateConcentration
    )

  const requiredReactorVolume =
    substrateConsumptionRate /
    outletReactionRate

  const spaceTime =
    requiredReactorVolume /
    input.substrateVolumetricFlowRate

  const inletSaturationFraction =
    input.inletSubstrateConcentration /
    (
      input.michaelisConstant +
      input.inletSubstrateConcentration
    )

  const outletSaturationFraction =
    outletSubstrateConcentration /
    (
      input.michaelisConstant +
      outletSubstrateConcentration
    )

  const volumetricProductivity =
    substrateConsumptionRate /
    requiredReactorVolume

  validateResults([
    outletSubstrateConcentration,
    outletReactionRate,
    requiredReactorVolume,
    spaceTime,
    substrateConsumptionRate,
    inletSaturationFraction,
    outletSaturationFraction,
    volumetricProductivity,
  ])

  return {
    outletSubstrateConcentration,
    outletReactionRate,
    requiredReactorVolume,
    spaceTime,
    substrateConsumptionRate,
    inletSaturationFraction,
    outletSaturationFraction,
    volumetricProductivity,
  }
}

export function calculateMonodBioreactorDesign(
  input: MonodBioreactorDesignInput,
): MonodBioreactorDesignResult {
  validateFinite(Object.values(input))

  if (
    input.volumetricFlowRate <= 0 ||
    input.feedSubstrateConcentration <= 0 ||
    input.targetEffluentSubstrateConcentration <= 0 ||
    input.targetEffluentSubstrateConcentration >=
      input.feedSubstrateConcentration ||
    input.maximumSpecificGrowthRate <= 0 ||
    input.monodHalfSaturationConstant <= 0 ||
    input.biomassYieldCoefficient <= 0 ||
    input.biomassDecayRate < 0
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'invalidMonodInputs',
      )
  }

  const grossSpecificGrowthRate =
    input.maximumSpecificGrowthRate *
    input.targetEffluentSubstrateConcentration /
    (
      input.monodHalfSaturationConstant +
      input.targetEffluentSubstrateConcentration
    )

  const netSpecificGrowthRate =
    grossSpecificGrowthRate -
    input.biomassDecayRate

  if (
    netSpecificGrowthRate <= 0
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'noPositiveNetGrowth',
      )
  }

  const dilutionRate =
    netSpecificGrowthRate

  const requiredReactorVolume =
    input.volumetricFlowRate /
    dilutionRate

  const hydraulicResidenceTime =
    1 /
    dilutionRate

  const substrateDifference =
    input.feedSubstrateConcentration -
    input.targetEffluentSubstrateConcentration

  const steadyStateBiomassConcentration =
    input.biomassYieldCoefficient *
    dilutionRate *
    substrateDifference /
    grossSpecificGrowthRate

  const biomassProductionRate =
    input.volumetricFlowRate *
    steadyStateBiomassConcentration

  const substrateRemovalRate =
    input.volumetricFlowRate *
    substrateDifference

  const washoutGrossGrowthRate =
    input.maximumSpecificGrowthRate *
    input.feedSubstrateConcentration /
    (
      input.monodHalfSaturationConstant +
      input.feedSubstrateConcentration
    )

  const washoutDilutionRate =
    Math.max(
      0,
      washoutGrossGrowthRate -
      input.biomassDecayRate,
    )

  const washoutSafetyMargin =
    washoutDilutionRate > 0
      ? (
          washoutDilutionRate -
          dilutionRate
        ) /
        washoutDilutionRate
      : 0

  validateResults([
    grossSpecificGrowthRate,
    netSpecificGrowthRate,
    dilutionRate,
    requiredReactorVolume,
    hydraulicResidenceTime,
    steadyStateBiomassConcentration,
    biomassProductionRate,
    substrateRemovalRate,
    washoutDilutionRate,
    washoutSafetyMargin,
  ])

  return {
    grossSpecificGrowthRate,
    netSpecificGrowthRate,
    dilutionRate,
    requiredReactorVolume,
    hydraulicResidenceTime,
    steadyStateBiomassConcentration,
    biomassProductionRate,
    substrateRemovalRate,
    washoutDilutionRate,
    washoutSafetyMargin,
  }
}

export function calculateMultipleReactionsCSTR(
  input: MultipleReactionsCSTRInput,
): MultipleReactionsCSTRResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentrationA <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.desiredReactionRateConstant <= 0 ||
    input.undesiredReactionRateConstant <= 0 ||
    input.targetConversion <= 0 ||
    input.targetConversion >= 1
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'invalidMultipleCSTRInputs',
      )
  }

  const totalRateConstant =
    input.desiredReactionRateConstant +
    input.undesiredReactionRateConstant

  const requiredSpaceTime =
    input.targetConversion /
    (
      totalRateConstant *
      (
        1 -
        input.targetConversion
      )
    )

  const requiredReactorVolume =
    input.volumetricFlowRate *
    requiredSpaceTime

  const outletConcentrationA =
    input.inletConcentrationA *
    (
      1 -
      input.targetConversion
    )

  const reactedConcentration =
    input.inletConcentrationA *
    input.targetConversion

  const desiredProductFraction =
    input.desiredReactionRateConstant /
    totalRateConstant

  const outletConcentrationDesiredProduct =
    reactedConcentration *
    desiredProductFraction

  const outletConcentrationUndesiredProduct =
    reactedConcentration *
    (
      1 -
      desiredProductFraction
    )

  const desiredProductYield =
    outletConcentrationDesiredProduct /
    input.inletConcentrationA

  const desiredProductSelectivity =
    outletConcentrationDesiredProduct /
    outletConcentrationUndesiredProduct

  validateResults([
    totalRateConstant,
    requiredSpaceTime,
    requiredReactorVolume,
    outletConcentrationA,
    outletConcentrationDesiredProduct,
    outletConcentrationUndesiredProduct,
    desiredProductYield,
    desiredProductSelectivity,
    desiredProductFraction,
  ])

  return {
    totalRateConstant,
    requiredSpaceTime,
    requiredReactorVolume,
    outletConcentrationA,
    outletConcentrationDesiredProduct,
    outletConcentrationUndesiredProduct,
    desiredProductYield,
    desiredProductSelectivity,
    desiredProductFraction,
  }
}

function intermediateConcentration(
  initialConcentration: number,
  firstRateConstant: number,
  secondRateConstant: number,
  spaceTime: number,
): number {
  if (
    Math.abs(
      firstRateConstant -
      secondRateConstant,
    ) <
    1e-12
  ) {
    return (
      initialConcentration *
      firstRateConstant *
      spaceTime *
      Math.exp(
        -firstRateConstant *
        spaceTime,
      )
    )
  }

  return (
    initialConcentration *
    firstRateConstant /
    (
      secondRateConstant -
      firstRateConstant
    ) *
    (
      Math.exp(
        -firstRateConstant *
        spaceTime,
      ) -
      Math.exp(
        -secondRateConstant *
        spaceTime,
      )
    )
  )
}

export function calculateMultipleReactionsPFR(
  input: MultipleReactionsPFRInput,
): MultipleReactionsPFRResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentrationA <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.firstReactionRateConstant <= 0 ||
    input.secondReactionRateConstant <= 0 ||
    input.spaceTime <= 0
  ) {
    throw new
      ReactionEngineeringBatch05CalculationError(
        'invalidMultiplePFRInputs',
      )
  }

  const outletConcentrationA =
    input.inletConcentrationA *
    Math.exp(
      -input.firstReactionRateConstant *
      input.spaceTime,
    )

  const outletConcentrationIntermediate =
    intermediateConcentration(
      input.inletConcentrationA,
      input.firstReactionRateConstant,
      input.secondReactionRateConstant,
      input.spaceTime,
    )

  const outletConcentrationFinalProduct =
    Math.max(
      0,
      input.inletConcentrationA -
      outletConcentrationA -
      outletConcentrationIntermediate,
    )

  const conversionA =
    1 -
    outletConcentrationA /
    input.inletConcentrationA

  const intermediateYield =
    outletConcentrationIntermediate /
    input.inletConcentrationA

  const intermediateSelectivity =
    outletConcentrationFinalProduct >
      0
      ? outletConcentrationIntermediate /
        outletConcentrationFinalProduct
      : Number.MAX_VALUE

  const optimumSpaceTimeForIntermediate =
    Math.abs(
      input.firstReactionRateConstant -
      input.secondReactionRateConstant,
    ) <
    1e-12
      ? 1 /
        input.firstReactionRateConstant
      : Math.log(
          input.secondReactionRateConstant /
          input.firstReactionRateConstant,
        ) /
        (
          input.secondReactionRateConstant -
          input.firstReactionRateConstant
        )

  const maximumIntermediateConcentration =
    intermediateConcentration(
      input.inletConcentrationA,
      input.firstReactionRateConstant,
      input.secondReactionRateConstant,
      optimumSpaceTimeForIntermediate,
    )

  const reactorVolume =
    input.volumetricFlowRate *
    input.spaceTime

  validateResults([
    outletConcentrationA,
    outletConcentrationIntermediate,
    outletConcentrationFinalProduct,
    conversionA,
    intermediateYield,
    intermediateSelectivity,
    optimumSpaceTimeForIntermediate,
    maximumIntermediateConcentration,
    reactorVolume,
  ])

  return {
    outletConcentrationA,
    outletConcentrationIntermediate,
    outletConcentrationFinalProduct,
    conversionA,
    intermediateYield,
    intermediateSelectivity,
    optimumSpaceTimeForIntermediate,
    maximumIntermediateConcentration,
    reactorVolume,
  }
}
