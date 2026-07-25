import type {
  RateConstantTemperatureShiftInput,
  RateConstantTemperatureShiftResult,
  RateLawBuilderInput,
  RateLawBuilderResult,
  ReactionOrderDeterminationInput,
  ReactionOrderDeterminationResult,
  ReactiveDistillationBasicsInput,
  ReactiveDistillationBasicsResult,
  ReactorOptimizationInput,
  ReactorOptimizationResult,
  RecyclePFRInput,
  RecyclePFRResult,
} from './types.ts'

export type ReactionEngineeringBatch07ErrorCode =
  | 'nonFiniteInput'
  | 'invalidTemperatureShiftInputs'
  | 'invalidRateLawInputs'
  | 'invalidOrderInputs'
  | 'indeterminateReactionOrder'
  | 'invalidReactiveDistillationInputs'
  | 'invalidOptimizationInputs'
  | 'invalidRecyclePFRInputs'
  | 'numericalFailure'

const messages: Record<
  ReactionEngineeringBatch07ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidTemperatureShiftInputs:
    'Reference rate constant, activation energy and both absolute temperatures must be positive.',
  invalidRateLawInputs:
    'Stoichiometric coefficients must be positive and reaction orders cannot be negative.',
  invalidOrderInputs:
    'Both concentrations and both observed rates must be positive.',
  indeterminateReactionOrder:
    'The two experiments must use different concentrations to determine reaction order.',
  invalidReactiveDistillationInputs:
    'Initial reactant concentrations and equilibrium constant must be positive. Product-removal fraction must lie from zero through one, and stage count must be a positive integer.',
  invalidOptimizationInputs:
    'Concentration, flow, rate constant, operating hours, product value and annualized reactor cost must be positive. Conversion bounds must lie above zero and below one, with maximum conversion greater than minimum conversion.',
  invalidRecyclePFRInputs:
    'Fresh-feed concentration, flow, rate constant and reactor volume must be positive. Recycle ratio cannot be negative.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ReactionEngineeringBatch07CalculationError
  extends Error {
  readonly code:
    ReactionEngineeringBatch07ErrorCode

  constructor(
    code:
      ReactionEngineeringBatch07ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ReactionEngineeringBatch07CalculationError'
    this.code = code
  }
}

const gasConstant = 8.314462618
const secondsPerHour = 3600

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch07CalculationError(
      'nonFiniteInput',
    )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new ReactionEngineeringBatch07CalculationError(
      'numericalFailure',
    )
  }
}

function formatExponent(
  value: number,
): string {
  if (Math.abs(value - Math.round(value)) < 1e-12) {
    return String(Math.round(value))
  }

  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

export function calculateRateConstantTemperatureShift(
  input: RateConstantTemperatureShiftInput,
): RateConstantTemperatureShiftResult {
  validateFinite(Object.values(input))

  if (
    input.referenceRateConstant <= 0 ||
    input.activationEnergy <= 0 ||
    input.referenceTemperature <= 0 ||
    input.targetTemperature <= 0
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'invalidTemperatureShiftInputs',
    )
  }

  const inverseTemperatureDifference =
    1 /
    input.targetTemperature -
    1 /
    input.referenceTemperature

  const activationExponent =
    -input.activationEnergy /
    gasConstant *
    inverseTemperatureDifference

  const rateConstantRatio =
    Math.exp(activationExponent)

  const shiftedRateConstant =
    input.referenceRateConstant *
    rateConstantRatio

  const logarithmicRateConstantRatio =
    Math.log(rateConstantRatio)

  const temperatureDifference =
    input.targetTemperature -
    input.referenceTemperature

  const rateDirectionDescription =
    temperatureDifference > 0
      ? 'Rate constant increases at the target temperature'
      : temperatureDifference < 0
        ? 'Rate constant decreases at the target temperature'
        : 'Reference and target rate constants are equal'

  validateResults([
    inverseTemperatureDifference,
    activationExponent,
    rateConstantRatio,
    shiftedRateConstant,
    logarithmicRateConstantRatio,
    temperatureDifference,
  ])

  return {
    shiftedRateConstant,
    rateConstantRatio,
    logarithmicRateConstantRatio,
    temperatureDifference,
    inverseTemperatureDifference,
    activationExponent,
    rateDirectionDescription,
  }
}

export function calculateRateLawBuilder(
  input: RateLawBuilderInput,
): RateLawBuilderResult {
  validateFinite(Object.values(input))

  if (
    input.stoichiometricCoefficientA <= 0 ||
    input.stoichiometricCoefficientB <= 0 ||
    input.reactionOrderA < 0 ||
    input.reactionOrderB < 0
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'invalidRateLawInputs',
    )
  }

  const overallReactionOrder =
    input.reactionOrderA +
    input.reactionOrderB

  const rateConstantConcentrationExponent =
    1 -
    overallReactionOrder

  const orderA =
    formatExponent(
      input.reactionOrderA,
    )

  const orderB =
    formatExponent(
      input.reactionOrderB,
    )

  const powerLawExpression =
    `r = k C_A^${orderA} C_B^${orderB}`

  const disappearanceRateExpressionA =
    `-dC_A/dt = ${input.stoichiometricCoefficientA} r`

  const disappearanceRateExpressionB =
    `-dC_B/dt = ${input.stoichiometricCoefficientB} r`

  const stoichiometricRateRelationship =
    `(-1/${input.stoichiometricCoefficientA}) dC_A/dt = ` +
    `(-1/${input.stoichiometricCoefficientB}) dC_B/dt = r`

  const rateConstantUnitsDescription =
    `concentration^${formatExponent(
      rateConstantConcentrationExponent,
    )} / time`

  const consistencyDescription =
    Math.abs(
      input.reactionOrderA -
      input.stoichiometricCoefficientA,
    ) <
      1e-12 &&
    Math.abs(
      input.reactionOrderB -
      input.stoichiometricCoefficientB,
    ) <
      1e-12
      ? 'Reaction orders match the entered stoichiometric coefficients, consistent with an elementary-step screening interpretation.'
      : 'Reaction orders differ from stoichiometric coefficients; treat the expression as an empirical power-law model.'

  validateResults([
    overallReactionOrder,
    rateConstantConcentrationExponent,
  ])

  return {
    overallReactionOrder,
    rateConstantConcentrationExponent,
    powerLawExpression,
    disappearanceRateExpressionA,
    disappearanceRateExpressionB,
    stoichiometricRateRelationship,
    rateConstantUnitsDescription,
    consistencyDescription,
  }
}

export function calculateReactionOrderDetermination(
  input: ReactionOrderDeterminationInput,
): ReactionOrderDeterminationResult {
  validateFinite(Object.values(input))

  if (
    input.concentrationExperimentOne <= 0 ||
    input.rateExperimentOne <= 0 ||
    input.concentrationExperimentTwo <= 0 ||
    input.rateExperimentTwo <= 0
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'invalidOrderInputs',
    )
  }

  const concentrationRatio =
    input.concentrationExperimentTwo /
    input.concentrationExperimentOne

  if (
    Math.abs(
      concentrationRatio -
      1,
    ) <
    1e-12
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'indeterminateReactionOrder',
    )
  }

  const rateRatio =
    input.rateExperimentTwo /
    input.rateExperimentOne

  const reactionOrder =
    Math.log(rateRatio) /
    Math.log(concentrationRatio)

  const rateConstantExperimentOne =
    input.rateExperimentOne /
    input.concentrationExperimentOne **
    reactionOrder

  const rateConstantExperimentTwo =
    input.rateExperimentTwo /
    input.concentrationExperimentTwo **
    reactionOrder

  const representativeRateConstant =
    Math.sqrt(
      rateConstantExperimentOne *
      rateConstantExperimentTwo,
    )

  const rateConstantRelativeDifference =
    Math.abs(
      rateConstantExperimentTwo -
      rateConstantExperimentOne,
    ) /
    representativeRateConstant

  const orderClassification =
    Math.abs(reactionOrder) < 0.05
      ? 'Approximately zero order'
      : Math.abs(reactionOrder - 1) < 0.05
        ? 'Approximately first order'
        : Math.abs(reactionOrder - 2) < 0.05
          ? 'Approximately second order'
          : `Fractional or non-integer order: ${formatExponent(
              reactionOrder,
            )}`

  const powerLawExpression =
    `r = k C^${formatExponent(
      reactionOrder,
    )}`

  validateResults([
    concentrationRatio,
    rateRatio,
    reactionOrder,
    rateConstantExperimentOne,
    rateConstantExperimentTwo,
    representativeRateConstant,
    rateConstantRelativeDifference,
  ])

  return {
    reactionOrder,
    rateConstantExperimentOne,
    rateConstantExperimentTwo,
    representativeRateConstant,
    concentrationRatio,
    rateRatio,
    rateConstantRelativeDifference,
    orderClassification,
    powerLawExpression,
  }
}

function solveStageEquilibriumExtent(
  concentrationA: number,
  concentrationB: number,
  retainedProduct: number,
  equilibriumConstant: number,
): number {
  const upper =
    Math.min(
      concentrationA,
      concentrationB,
    ) *
    (
      1 -
      1e-12
    )

  const residual =
    (
      extent: number,
    ): number =>
      (
        retainedProduct +
        extent
      ) /
      (
        (
          concentrationA -
          extent
        ) *
        (
          concentrationB -
          extent
        )
      ) -
      equilibriumConstant

  if (
    residual(0) >= 0
  ) {
    return 0
  }

  let low = 0
  let high = upper

  for (
    let iteration = 0;
    iteration < 160;
    iteration += 1
  ) {
    const midpoint =
      (
        low +
        high
      ) /
      2

    if (
      residual(midpoint) > 0
    ) {
      high = midpoint
    } else {
      low = midpoint
    }
  }

  return (
    low +
    high
  ) /
  2
}

export function calculateReactiveDistillationBasics(
  input: ReactiveDistillationBasicsInput,
): ReactiveDistillationBasicsResult {
  validateFinite(Object.values(input))

  if (
    input.initialConcentrationA <= 0 ||
    input.initialConcentrationB <= 0 ||
    input.equilibriumConstant <= 0 ||
    input.stageProductRemovalFraction < 0 ||
    input.stageProductRemovalFraction > 1 ||
    input.equilibriumStages <= 0 ||
    !Number.isInteger(
      input.equilibriumStages,
    )
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'invalidReactiveDistillationInputs',
    )
  }

  let concentrationA =
    input.initialConcentrationA

  let concentrationB =
    input.initialConcentrationB

  let retainedProduct = 0
  let removedProduct = 0

  const stageConversionsA: number[] = []

  for (
    let stage = 0;
    stage < input.equilibriumStages;
    stage += 1
  ) {
    const extent =
      solveStageEquilibriumExtent(
        concentrationA,
        concentrationB,
        retainedProduct,
        input.equilibriumConstant,
      )

    concentrationA -= extent
    concentrationB -= extent
    retainedProduct += extent

    const removedThisStage =
      retainedProduct *
      input.stageProductRemovalFraction

    retainedProduct -= removedThisStage
    removedProduct += removedThisStage

    stageConversionsA.push(
      (
        input.initialConcentrationA -
        concentrationA
      ) /
      input.initialConcentrationA,
    )
  }

  const totalProductFormed =
    retainedProduct +
    removedProduct

  const overallConversionA =
    (
      input.initialConcentrationA -
      concentrationA
    ) /
    input.initialConcentrationA

  const overallConversionB =
    (
      input.initialConcentrationB -
      concentrationB
    ) /
    input.initialConcentrationB

  const productRecoveryFraction =
    totalProductFormed > 0
      ? removedProduct /
        totalProductFormed
      : 0

  const singleStageExtent =
    solveStageEquilibriumExtent(
      input.initialConcentrationA,
      input.initialConcentrationB,
      0,
      input.equilibriumConstant,
    )

  const singleStageConversionA =
    singleStageExtent /
    input.initialConcentrationA

  const conversionEnhancementOverSingleStage =
    overallConversionA -
    singleStageConversionA

  validateResults([
    overallConversionA,
    overallConversionB,
    concentrationA,
    concentrationB,
    retainedProduct,
    removedProduct,
    totalProductFormed,
    productRecoveryFraction,
    ...stageConversionsA,
    conversionEnhancementOverSingleStage,
  ])

  return {
    overallConversionA,
    overallConversionB,
    remainingConcentrationA:
      concentrationA,
    remainingConcentrationB:
      concentrationB,
    retainedProductConcentration:
      retainedProduct,
    removedProductConcentration:
      removedProduct,
    totalProductFormed,
    productRecoveryFraction,
    stageConversionsA,
    conversionEnhancementOverSingleStage,
  }
}

export function calculateReactorOptimization(
  input: ReactorOptimizationInput,
): ReactorOptimizationResult {
  validateFinite(Object.values(input))

  if (
    input.inletConcentrationA <= 0 ||
    input.volumetricFlowRate <= 0 ||
    input.firstOrderRateConstant <= 0 ||
    input.annualOperatingHours <= 0 ||
    input.productValuePerMole <= 0 ||
    input.annualizedReactorCostPerVolume <= 0 ||
    input.minimumConversion <= 0 ||
    input.maximumConversion >= 1 ||
    input.maximumConversion <=
      input.minimumConversion
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'invalidOptimizationInputs',
    )
  }

  const optimizationGridPoints =
    5001

  const annualFreshFeedMoles =
    input.inletConcentrationA *
    input.volumetricFlowRate *
    input.annualOperatingHours *
    secondsPerHour

  const evaluate =
    (
      conversion: number,
    ) => {
      const reactorVolume =
        input.volumetricFlowRate /
        input.firstOrderRateConstant *
        -Math.log(
          1 -
          conversion,
        )

      const annualProductMoles =
        annualFreshFeedMoles *
        conversion

      const annualProductValue =
        annualProductMoles *
        input.productValuePerMole

      const annualizedReactorCost =
        reactorVolume *
        input.annualizedReactorCostPerVolume

      const annualMargin =
        annualProductValue -
        annualizedReactorCost

      return {
        reactorVolume,
        annualProductMoles,
        annualProductValue,
        annualizedReactorCost,
        annualMargin,
      }
    }

  let optimumConversion =
    input.minimumConversion

  let optimum =
    evaluate(
      optimumConversion,
    )

  for (
    let index = 1;
    index < optimizationGridPoints;
    index += 1
  ) {
    const fraction =
      index /
      (
        optimizationGridPoints -
        1
      )

    const conversion =
      input.minimumConversion +
      fraction *
      (
        input.maximumConversion -
        input.minimumConversion
      )

    const candidate =
      evaluate(conversion)

    if (
      candidate.annualMargin >
      optimum.annualMargin
    ) {
      optimumConversion =
        conversion
      optimum =
        candidate
    }
  }

  const lowerBoundAnnualMargin =
    evaluate(
      input.minimumConversion,
    ).annualMargin

  const upperBoundAnnualMargin =
    evaluate(
      input.maximumConversion,
    ).annualMargin

  const tolerance =
    (
      input.maximumConversion -
      input.minimumConversion
    ) /
    (
      optimizationGridPoints -
      1
    ) *
    1.5

  const optimumAtBoundary =
    Math.abs(
      optimumConversion -
      input.minimumConversion,
    ) <=
      tolerance ||
    Math.abs(
      optimumConversion -
      input.maximumConversion,
    ) <=
      tolerance

  validateResults([
    optimumConversion,
    optimum.reactorVolume,
    optimum.annualProductMoles,
    optimum.annualProductValue,
    optimum.annualizedReactorCost,
    optimum.annualMargin,
    lowerBoundAnnualMargin,
    upperBoundAnnualMargin,
    optimizationGridPoints,
  ])

  return {
    optimumConversion,
    optimumReactorVolume:
      optimum.reactorVolume,
    annualProductMoles:
      optimum.annualProductMoles,
    annualProductValue:
      optimum.annualProductValue,
    annualizedReactorCost:
      optimum.annualizedReactorCost,
    optimumAnnualMargin:
      optimum.annualMargin,
    lowerBoundAnnualMargin,
    upperBoundAnnualMargin,
    optimizationGridPoints,
    optimumAtBoundary,
  }
}

export function calculateRecyclePFR(
  input: RecyclePFRInput,
): RecyclePFRResult {
  validateFinite(Object.values(input))

  if (
    input.freshFeedConcentrationA <= 0 ||
    input.freshVolumetricFlowRate <= 0 ||
    input.firstOrderRateConstant <= 0 ||
    input.reactorVolume <= 0 ||
    input.recycleRatio < 0
  ) {
    throw new ReactionEngineeringBatch07CalculationError(
      'invalidRecyclePFRInputs',
    )
  }

  const totalReactorFlowRate =
    input.freshVolumetricFlowRate *
    (
      1 +
      input.recycleRatio
    )

  const reactorSpaceTime =
    input.reactorVolume /
    totalReactorFlowRate

  const singlePassDecayFactor =
    Math.exp(
      -input.firstOrderRateConstant *
      reactorSpaceTime,
    )

  const denominator =
    1 +
    input.recycleRatio -
    input.recycleRatio *
    singlePassDecayFactor

  const mixedInletConcentrationA =
    input.freshFeedConcentrationA /
    denominator

  const reactorOutletConcentrationA =
    singlePassDecayFactor *
    mixedInletConcentrationA

  const overallConversionA =
    1 -
    reactorOutletConcentrationA /
    input.freshFeedConcentrationA

  const singlePassConversion =
    1 -
    singlePassDecayFactor

  const recycleFlowRate =
    input.recycleRatio *
    input.freshVolumetricFlowRate

  const freshFeedMolarRateA =
    input.freshFeedConcentrationA *
    input.freshVolumetricFlowRate

  const outletMolarRateA =
    reactorOutletConcentrationA *
    input.freshVolumetricFlowRate

  validateResults([
    totalReactorFlowRate,
    reactorSpaceTime,
    singlePassDecayFactor,
    mixedInletConcentrationA,
    reactorOutletConcentrationA,
    overallConversionA,
    singlePassConversion,
    recycleFlowRate,
    freshFeedMolarRateA,
    outletMolarRateA,
  ])

  return {
    totalReactorFlowRate,
    reactorSpaceTime,
    singlePassDecayFactor,
    mixedInletConcentrationA,
    reactorOutletConcentrationA,
    overallConversionA,
    singlePassConversion,
    recycleFlowRate,
    freshFeedMolarRateA,
    outletMolarRateA,
  }
}
