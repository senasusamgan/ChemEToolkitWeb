import type {
  ChemicalProcessRiskMatrixInput,
  ChemicalProcessRiskMatrixResult,
  HAZOPGuideWordAssistantInput,
  HAZOPGuideWordAssistantResult,
  InherentlySaferDesignChecklistInput,
  InherentlySaferDesignChecklistResult,
  LayerOfProtectionAnalysisInput,
  LayerOfProtectionAnalysisResult,
  PoolFireRadiationScreeningInput,
  PoolFireRadiationScreeningResult,
  SafetyIntegrityLevelTargetInput,
  SafetyIntegrityLevelTargetResult,
} from './types.ts'

export type ProcessSafetyEconomicsBatch04ErrorCode =
  | 'nonFiniteInput'
  | 'invalidRiskMatrixInputs'
  | 'invalidHAZOPInputs'
  | 'invalidInherentlySaferInputs'
  | 'invalidLOPAInputs'
  | 'invalidSILInputs'
  | 'invalidPoolFireInputs'
  | 'numericalFailure'

const messages: Record<
  ProcessSafetyEconomicsBatch04ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidRiskMatrixInputs:
    'Likelihood and severity ratings must be whole numbers from 1 through 5. Safeguard credit must be from zero through four.',
  invalidHAZOPInputs:
    'Guide-word code must be 1–7, parameter code must be 1–6, and both ratings must be whole numbers from 1 through 5.',
  invalidInherentlySaferInputs:
    'All inherently safer design ratings and implementation confidence must be from zero through five.',
  invalidLOPAInputs:
    'Initiating frequency and tolerable frequency must be positive. Enabling, conditional and IPL probabilities must be greater than zero and no greater than one.',
  invalidSILInputs:
    'Unmitigated and tolerable frequencies and non-SIF risk-reduction factor must be greater than zero.',
  invalidPoolFireInputs:
    'Burning mass rate, heat of combustion and receptor distance must be positive. Radiant fraction and atmospheric transmissivity must be greater than zero and no greater than one.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessSafetyEconomicsBatch04CalculationError
  extends Error {
  readonly code:
    ProcessSafetyEconomicsBatch04ErrorCode

  constructor(
    code:
      ProcessSafetyEconomicsBatch04ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ProcessSafetyEconomicsBatch04CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'numericalFailure',
      )
  }
}

function wholeNumberInRange(
  value: number,
  minimum: number,
  maximum: number,
): boolean {
  return (
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
  )
}

export function calculateChemicalProcessRiskMatrix(
  input: ChemicalProcessRiskMatrixInput,
): ChemicalProcessRiskMatrixResult {
  validateFinite(Object.values(input))

  if (
    !wholeNumberInRange(
      input.likelihoodRating,
      1,
      5,
    ) ||
    !wholeNumberInRange(
      input.severityRating,
      1,
      5,
    ) ||
    input.existingSafeguardCredit < 0 ||
    input.existingSafeguardCredit > 4
  ) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'invalidRiskMatrixInputs',
      )
  }

  const grossRiskScore =
    input.likelihoodRating *
    input.severityRating

  const adjustedRiskScore =
    Math.max(
      1,
      grossRiskScore -
      input.existingSafeguardCredit,
    )

  const riskReductionPercent =
    (
      1 -
      adjustedRiskScore /
      grossRiskScore
    ) *
    100

  const likelihoodBand = [
    '',
    'Rare',
    'Unlikely',
    'Possible',
    'Likely',
    'Frequent',
  ][input.likelihoodRating]

  const severityBand = [
    '',
    'Minor',
    'Moderate',
    'Serious',
    'Major',
    'Catastrophic',
  ][input.severityRating]

  const riskBand =
    adjustedRiskScore <= 4
      ? 'Low'
      : adjustedRiskScore <= 9
        ? 'Moderate'
        : adjustedRiskScore <= 16
          ? 'High'
          : 'Extreme'

  const recommendedAction =
    riskBand === 'Low'
      ? 'Maintain controls and monitor.'
      : riskBand === 'Moderate'
        ? 'Review safeguards and assign an action owner.'
        : riskBand === 'High'
          ? 'Implement additional risk reduction before routine operation.'
          : 'Stop or avoid the activity until risk is reduced.'

  validateResults([
    grossRiskScore,
    adjustedRiskScore,
    riskReductionPercent,
  ])

  return {
    grossRiskScore,
    adjustedRiskScore,
    riskReductionPercent,
    likelihoodBand,
    severityBand,
    riskBand,
    recommendedAction,
  }
}

const guideWords = [
  '',
  'No / Not',
  'More',
  'Less',
  'As well as',
  'Part of',
  'Reverse',
  'Other than',
]

const processParameters = [
  '',
  'Flow',
  'Pressure',
  'Temperature',
  'Level',
  'Composition',
  'Reaction rate',
]

export function calculateHAZOPGuideWordAssistant(
  input: HAZOPGuideWordAssistantInput,
): HAZOPGuideWordAssistantResult {
  validateFinite(Object.values(input))

  if (
    !wholeNumberInRange(
      input.guideWordCode,
      1,
      7,
    ) ||
    !wholeNumberInRange(
      input.parameterCode,
      1,
      6,
    ) ||
    !wholeNumberInRange(
      input.safeguardStrengthRating,
      1,
      5,
    ) ||
    !wholeNumberInRange(
      input.consequenceSeverityRating,
      1,
      5,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'invalidHAZOPInputs',
      )
  }

  const guideWord =
    guideWords[
      input.guideWordCode
    ]

  const processParameter =
    processParameters[
      input.parameterCode
    ]

  const deviationPhrase =
    `${guideWord} ${processParameter}`

  const screeningPriority =
    input.consequenceSeverityRating *
    (
      6 -
      input.safeguardStrengthRating
    )

  const priorityBand =
    screeningPriority <= 5
      ? 'Routine review'
      : screeningPriority <= 12
        ? 'Focused review'
        : 'Priority action'

  return {
    guideWord,
    processParameter,
    deviationPhrase,
    likelyCausePrompt:
      `Identify credible causes of ${deviationPhrase.toLowerCase()}.`,
    consequencePrompt:
      `Describe process, personnel and environmental consequences of ${deviationPhrase.toLowerCase()}.`,
    safeguardPrompt:
      'List prevention, detection and mitigation safeguards and confirm independence.',
    recommendationPrompt:
      'Define an action that is specific, owned and traceable to the deviation.',
    screeningPriority,
    priorityBand,
  }
}

export function calculateInherentlySaferDesignChecklist(
  input: InherentlySaferDesignChecklistInput,
): InherentlySaferDesignChecklistResult {
  validateFinite(Object.values(input))

  const ratings = [
    input.minimizeRating,
    input.substituteRating,
    input.moderateRating,
    input.simplifyRating,
    input.implementationConfidence,
  ]

  if (
    ratings.some(
      (value) =>
        value < 0 ||
        value > 5,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'invalidInherentlySaferInputs',
      )
  }

  const principleRatings = [
    ['Minimize', input.minimizeRating],
    ['Substitute', input.substituteRating],
    ['Moderate', input.moderateRating],
    ['Simplify', input.simplifyRating],
  ] as const

  const averagePrincipleRating =
    principleRatings.reduce(
      (
        total,
        item,
      ) =>
        total + item[1],
      0,
    ) /
    principleRatings.length

  const confidenceAdjustedScore =
    averagePrincipleRating *
    (
      input.implementationConfidence /
      5
    )

  const strongestPrinciple =
    principleRatings.reduce(
      (
        best,
        item,
      ) =>
        item[1] > best[1]
          ? item
          : best,
    )[0]

  const weakestPrinciple =
    principleRatings.reduce(
      (
        weakest,
        item,
      ) =>
        item[1] < weakest[1]
          ? item
          : weakest,
    )[0]

  const maturityBand =
    confidenceAdjustedScore < 1.5
      ? 'Early opportunity'
      : confidenceAdjustedScore < 3
        ? 'Developing'
        : confidenceAdjustedScore < 4
          ? 'Strong'
          : 'Leading'

  validateResults([
    averagePrincipleRating,
    confidenceAdjustedScore,
  ])

  return {
    averagePrincipleRating,
    confidenceAdjustedScore,
    minimizeContribution:
      input.minimizeRating / 5,
    substituteContribution:
      input.substituteRating / 5,
    moderateContribution:
      input.moderateRating / 5,
    simplifyContribution:
      input.simplifyRating / 5,
    strongestPrinciple,
    weakestPrinciple,
    maturityBand,
  }
}

export function calculateLayerOfProtectionAnalysis(
  input: LayerOfProtectionAnalysisInput,
): LayerOfProtectionAnalysisResult {
  validateFinite(Object.values(input))

  const probabilities = [
    input.enablingConditionProbability,
    input.conditionalModifierProbability,
    input.firstIPLProbabilityOfFailure,
    input.secondIPLProbabilityOfFailure,
    input.thirdIPLProbabilityOfFailure,
  ]

  if (
    input.initiatingEventFrequency <= 0 ||
    input.tolerableEventFrequency <= 0 ||
    probabilities.some(
      (value) =>
        value <= 0 ||
        value > 1,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'invalidLOPAInputs',
      )
  }

  const unmitigatedScenarioFrequency =
    input.initiatingEventFrequency *
    input.enablingConditionProbability *
    input.conditionalModifierProbability

  const combinedIPLProbabilityOfFailure =
    input.firstIPLProbabilityOfFailure *
    input.secondIPLProbabilityOfFailure *
    input.thirdIPLProbabilityOfFailure

  const mitigatedScenarioFrequency =
    unmitigatedScenarioFrequency *
    combinedIPLProbabilityOfFailure

  const achievedRiskReductionFactor =
    1 /
    combinedIPLProbabilityOfFailure

  const requiredRiskReductionFactor =
    unmitigatedScenarioFrequency /
    input.tolerableEventFrequency

  const frequencyGapFactor =
    mitigatedScenarioFrequency /
    input.tolerableEventFrequency

  const targetMet =
    mitigatedScenarioFrequency <=
    input.tolerableEventFrequency *
    (1 + 1e-12)

  const assessmentBand =
    targetMet
      ? 'Target met'
      : frequencyGapFactor <= 10
        ? 'Additional protection required'
        : 'Major risk-reduction gap'

  validateResults([
    unmitigatedScenarioFrequency,
    combinedIPLProbabilityOfFailure,
    mitigatedScenarioFrequency,
    achievedRiskReductionFactor,
    requiredRiskReductionFactor,
    frequencyGapFactor,
  ])

  return {
    unmitigatedScenarioFrequency,
    combinedIPLProbabilityOfFailure,
    mitigatedScenarioFrequency,
    achievedRiskReductionFactor,
    requiredRiskReductionFactor,
    frequencyGapFactor,
    targetMet,
    assessmentBand,
  }
}

export function calculateSafetyIntegrityLevelTarget(
  input: SafetyIntegrityLevelTargetInput,
): SafetyIntegrityLevelTargetResult {
  validateFinite(Object.values(input))

  if (
    input.unmitigatedEventFrequency <= 0 ||
    input.tolerableEventFrequency <= 0 ||
    input.nonSIFRiskReductionFactor <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'invalidSILInputs',
      )
  }

  const totalRequiredRiskReductionFactor =
    input.unmitigatedEventFrequency /
    input.tolerableEventFrequency

  const requiredSIFRiskReductionFactor =
    Math.max(
      1,
      totalRequiredRiskReductionFactor /
      input.nonSIFRiskReductionFactor,
    )

  const targetAverageProbabilityOfFailure =
    1 /
    requiredSIFRiskReductionFactor

  let targetSIL = 'No additional SIL target'

  if (
    requiredSIFRiskReductionFactor >= 10 &&
    requiredSIFRiskReductionFactor < 100
  ) {
    targetSIL = 'SIL 1'
  } else if (
    requiredSIFRiskReductionFactor >= 100 &&
    requiredSIFRiskReductionFactor < 1000
  ) {
    targetSIL = 'SIL 2'
  } else if (
    requiredSIFRiskReductionFactor >= 1000 &&
    requiredSIFRiskReductionFactor < 10000
  ) {
    targetSIL = 'SIL 3'
  } else if (
    requiredSIFRiskReductionFactor >= 10000
  ) {
    targetSIL = 'Beyond conventional SIL 3 range'
  }

  const designMarginFactor =
    targetSIL === 'SIL 1'
      ? 100 /
        requiredSIFRiskReductionFactor
      : targetSIL === 'SIL 2'
        ? 1000 /
          requiredSIFRiskReductionFactor
        : targetSIL === 'SIL 3'
          ? 10000 /
            requiredSIFRiskReductionFactor
          : 1

  validateResults([
    totalRequiredRiskReductionFactor,
    requiredSIFRiskReductionFactor,
    targetAverageProbabilityOfFailure,
    designMarginFactor,
  ])

  return {
    totalRequiredRiskReductionFactor,
    requiredSIFRiskReductionFactor,
    targetAverageProbabilityOfFailure,
    targetSIL,
    designMarginFactor,
    beyondConventionalSILRange:
      requiredSIFRiskReductionFactor >=
      10000,
  }
}

export function calculatePoolFireRadiationScreening(
  input: PoolFireRadiationScreeningInput,
): PoolFireRadiationScreeningResult {
  validateFinite(Object.values(input))

  if (
    input.burningMassRate <= 0 ||
    input.heatOfCombustion <= 0 ||
    input.radiantFraction <= 0 ||
    input.radiantFraction > 1 ||
    input.atmosphericTransmissivity <= 0 ||
    input.atmosphericTransmissivity > 1 ||
    input.receptorDistance <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch04CalculationError(
        'invalidPoolFireInputs',
      )
  }

  const totalHeatReleaseRate =
    input.burningMassRate *
    input.heatOfCombustion

  const radiatedHeatRate =
    totalHeatReleaseRate *
    input.radiantFraction

  const transmittedRadiatedHeatRate =
    radiatedHeatRate *
    input.atmosphericTransmissivity

  const thermalRadiationFlux =
    transmittedRadiatedHeatRate /
    (
      4 *
      Math.PI *
      input.receptorDistance ** 2
    )

  const fluxKilowattsPerSquareMeter =
    thermalRadiationFlux /
    1000

  const hazardBand =
    fluxKilowattsPerSquareMeter < 1.6
      ? 'Low screening flux'
      : fluxKilowattsPerSquareMeter < 4
        ? 'Personnel exposure concern'
        : fluxKilowattsPerSquareMeter < 12.5
          ? 'Severe exposure / equipment concern'
          : 'High thermal-radiation hazard'

  const screeningDescription =
    `${fluxKilowattsPerSquareMeter.toFixed(3)} kW/m² at the receptor distance.`

  validateResults([
    totalHeatReleaseRate,
    radiatedHeatRate,
    transmittedRadiatedHeatRate,
    thermalRadiationFlux,
  ])

  return {
    totalHeatReleaseRate,
    radiatedHeatRate,
    transmittedRadiatedHeatRate,
    thermalRadiationFlux,
    hazardBand,
    screeningDescription,
  }
}
