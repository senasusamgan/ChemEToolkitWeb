import type {
  ShortcutDistillationInput,
  ShortcutDistillationResult,
  ShortcutDistillationScenario,
} from './types.ts'

export const
  FENSKE_UNDERWOOD_GILLILAND_ENGINE_VERSION =
    'fenske-underwood-gilliland-v1' as const

export type ShortcutDistillationErrorCode =
  | 'nonFiniteInput'
  | 'compositionOutOfRange'
  | 'invalidSeparationOrder'
  | 'invalidRelativeVolatility'
  | 'invalidFeedQuality'
  | 'invalidRefluxMultiplier'
  | 'invalidStageEfficiency'
  | 'underwoodRootFailure'
  | 'nonPhysicalMinimumReflux'
  | 'numericalFailure'

const messages: Record<
  ShortcutDistillationErrorCode,
  string
> = {
  nonFiniteInput:
    'All shortcut-distillation inputs must be finite.',
  compositionOutOfRange:
    'Feed, distillate and bottoms light-key mole fractions must satisfy 0 < x < 1.',
  invalidSeparationOrder:
    'The compositions must satisfy xB,LK < zF,LK < xD,LK.',
  invalidRelativeVolatility:
    'Light-key to heavy-key relative volatility must be greater than one.',
  invalidFeedQuality:
    'Feed quality must satisfy 0 ≤ q ≤ 1 for this saturated two-phase feed model.',
  invalidRefluxMultiplier:
    'Operating reflux must be selected above the minimum; use a multiplier greater than one.',
  invalidStageEfficiency:
    'Overall stage efficiency must satisfy 0 < efficiency ≤ 1.',
  underwoodRootFailure:
    'The binary Underwood root could not be bracketed between the heavy and light key volatilities.',
  nonPhysicalMinimumReflux:
    'The Underwood calculation produced a non-positive minimum reflux ratio.',
  numericalFailure:
    'The shortcut distillation calculation did not produce finite physical results.',
}

export class ShortcutDistillationCalculationError
  extends Error {
  readonly code:
    ShortcutDistillationErrorCode

  constructor(
    code:
      ShortcutDistillationErrorCode,
  ) {
    super(
      messages[
        code
      ],
    )

    this.name =
      'ShortcutDistillationCalculationError'

    this.code =
      code
  }
}

function validateInput(
  input:
    ShortcutDistillationInput,
) {
  const values = [
    input.feedLightKeyMoleFraction,
    input.distillateLightKeyMoleFraction,
    input.bottomsLightKeyMoleFraction,
    input.relativeVolatility,
    input.feedQuality,
    input.refluxMultiplier,
    input.overallStageEfficiency,
  ]

  if (
    !values.every(
      Number.isFinite,
    )
  ) {
    throw new ShortcutDistillationCalculationError(
      'nonFiniteInput',
    )
  }

  const compositions = [
    input.feedLightKeyMoleFraction,
    input.distillateLightKeyMoleFraction,
    input.bottomsLightKeyMoleFraction,
  ]

  if (
    compositions.some(
      (
        value,
      ) =>
        value <=
          0 ||
        value >=
          1,
    )
  ) {
    throw new ShortcutDistillationCalculationError(
      'compositionOutOfRange',
    )
  }

  if (
    !(
      input.bottomsLightKeyMoleFraction <
        input.feedLightKeyMoleFraction &&
      input.feedLightKeyMoleFraction <
        input.distillateLightKeyMoleFraction
    )
  ) {
    throw new ShortcutDistillationCalculationError(
      'invalidSeparationOrder',
    )
  }

  if (
    input.relativeVolatility <=
    1
  ) {
    throw new ShortcutDistillationCalculationError(
      'invalidRelativeVolatility',
    )
  }

  if (
    input.feedQuality <
      0 ||
    input.feedQuality >
      1
  ) {
    throw new ShortcutDistillationCalculationError(
      'invalidFeedQuality',
    )
  }

  if (
    input.refluxMultiplier <=
    1
  ) {
    throw new ShortcutDistillationCalculationError(
      'invalidRefluxMultiplier',
    )
  }

  if (
    input.overallStageEfficiency <=
      0 ||
    input.overallStageEfficiency >
      1
  ) {
    throw new ShortcutDistillationCalculationError(
      'invalidStageEfficiency',
    )
  }
}

export function calculateFenskeMinimumStages(
  input:
    Pick<
      ShortcutDistillationInput,
      | 'distillateLightKeyMoleFraction'
      | 'bottomsLightKeyMoleFraction'
      | 'relativeVolatility'
    >,
): number {
  const separationFactor =
    (
      input
        .distillateLightKeyMoleFraction /
      (
        1 -
        input
          .distillateLightKeyMoleFraction
      )
    ) *
    (
      (
        1 -
        input
          .bottomsLightKeyMoleFraction
      ) /
      input
        .bottomsLightKeyMoleFraction
    )

  return (
    Math.log(
      separationFactor,
    ) /
    Math.log(
      input.relativeVolatility,
    )
  )
}

export function calculateUnderwoodResidual(
  theta: number,
  input:
    Pick<
      ShortcutDistillationInput,
      | 'feedLightKeyMoleFraction'
      | 'relativeVolatility'
      | 'feedQuality'
    >,
): number {
  const lightKeyTerm =
    input.relativeVolatility *
    input.feedLightKeyMoleFraction /
    (
      input.relativeVolatility -
      theta
    )

  const heavyKeyTerm =
    (
      1 -
      input.feedLightKeyMoleFraction
    ) /
    (
      1 -
      theta
    )

  return (
    lightKeyTerm +
    heavyKeyTerm -
    (
      1 -
      input.feedQuality
    )
  )
}

export function calculateUnderwoodRoot(
  input:
    Pick<
      ShortcutDistillationInput,
      | 'feedLightKeyMoleFraction'
      | 'relativeVolatility'
      | 'feedQuality'
    >,
): number {
  const separation =
    input.relativeVolatility -
    1

  const epsilon =
    Math.max(
      1e-12,
      separation *
      1e-10,
    )

  let lower =
    1 +
    epsilon

  let upper =
    input.relativeVolatility -
    epsilon

  let lowerResidual =
    calculateUnderwoodResidual(
      lower,
      input,
    )

  let upperResidual =
    calculateUnderwoodResidual(
      upper,
      input,
    )

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual >=
      0 ||
    upperResidual <=
      0
  ) {
    throw new ShortcutDistillationCalculationError(
      'underwoodRootFailure',
    )
  }

  for (
    let iteration =
      0;
    iteration <
      200;
    iteration +=
      1
  ) {
    const midpoint =
      (
        lower +
        upper
      ) /
      2

    const midpointResidual =
      calculateUnderwoodResidual(
        midpoint,
        input,
      )

    if (
      !Number.isFinite(
        midpointResidual,
      )
    ) {
      throw new ShortcutDistillationCalculationError(
        'underwoodRootFailure',
      )
    }

    if (
      Math.abs(
        midpointResidual,
      ) <
      1e-13
    ) {
      return midpoint
    }

    if (
      midpointResidual >
      0
    ) {
      upper =
        midpoint

      upperResidual =
        midpointResidual
    } else {
      lower =
        midpoint

      lowerResidual =
        midpointResidual
    }

    if (
      Math.abs(
        upper -
        lower
      ) <
      1e-13 *
      Math.max(
        1,
        Math.abs(
          midpoint,
        ),
      )
    ) {
      return (
        lower +
        upper
      ) /
        2
    }
  }

  const root =
    (
      lower +
      upper
    ) /
    2

  if (
    !Number.isFinite(
      root,
    ) ||
    lowerResidual >=
      0 ||
    upperResidual <=
      0
  ) {
    throw new ShortcutDistillationCalculationError(
      'underwoodRootFailure',
    )
  }

  return root
}

export function calculateMinimumRefluxRatio(
  input:
    Pick<
      ShortcutDistillationInput,
      | 'distillateLightKeyMoleFraction'
      | 'relativeVolatility'
    >,
  underwoodRoot: number,
): number {
  const lightKeyContribution =
    input.relativeVolatility *
    input.distillateLightKeyMoleFraction /
    (
      input.relativeVolatility -
      underwoodRoot
    )

  const heavyKeyContribution =
    (
      1 -
      input.distillateLightKeyMoleFraction
    ) /
    (
      1 -
      underwoodRoot
    )

  return (
    lightKeyContribution +
    heavyKeyContribution -
    1
  )
}

export function calculateGillilandScenario({
  minimumStages,
  minimumRefluxRatio,
  refluxMultiplier,
  overallStageEfficiency,
}: {
  minimumStages: number
  minimumRefluxRatio: number
  refluxMultiplier: number
  overallStageEfficiency: number
}): ShortcutDistillationScenario {
  const operatingRefluxRatio =
    refluxMultiplier *
    minimumRefluxRatio

  const reducedReflux =
    (
      operatingRefluxRatio -
      minimumRefluxRatio
    ) /
    (
      operatingRefluxRatio +
      1
    )

  const exponent =
    (
      (
        1 +
        54.4 *
        reducedReflux
      ) /
      (
        11 +
        117.2 *
        reducedReflux
      )
    ) *
    (
      (
        reducedReflux -
        1
      ) /
      Math.sqrt(
        reducedReflux,
      )
    )

  const gillilandReducedStages =
    1 -
    Math.exp(
      exponent,
    )

  const theoreticalStageCount =
    (
      minimumStages +
      gillilandReducedStages
    ) /
    (
      1 -
      gillilandReducedStages
    )

  const requiredIntegerTheoreticalStages =
    Math.ceil(
      theoreticalStageCount,
    )

  const actualStageCount =
    theoreticalStageCount /
    overallStageEfficiency

  const requiredIntegerActualStages =
    Math.ceil(
      actualStageCount,
    )

  const values = [
    operatingRefluxRatio,
    reducedReflux,
    gillilandReducedStages,
    theoreticalStageCount,
    requiredIntegerTheoreticalStages,
    actualStageCount,
    requiredIntegerActualStages,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    operatingRefluxRatio <=
      minimumRefluxRatio ||
    reducedReflux <=
      0 ||
    reducedReflux >=
      1 ||
    gillilandReducedStages <=
      0 ||
    gillilandReducedStages >=
      1 ||
    theoreticalStageCount <=
      minimumStages ||
    actualStageCount <
      theoreticalStageCount
  ) {
    throw new ShortcutDistillationCalculationError(
      'numericalFailure',
    )
  }

  return {
    refluxMultiplier,
    operatingRefluxRatio,
    reducedReflux,
    gillilandReducedStages,
    theoreticalStageCount,
    requiredIntegerTheoreticalStages,
    actualStageCount,
    requiredIntegerActualStages,
  }
}

export function calculateShortcutDistillation(
  input:
    ShortcutDistillationInput,
): ShortcutDistillationResult {
  validateInput(
    input,
  )

  const minimumStages =
    calculateFenskeMinimumStages(
      input,
    )

  const underwoodRoot =
    calculateUnderwoodRoot(
      input,
    )

  const underwoodResidual =
    calculateUnderwoodResidual(
      underwoodRoot,
      input,
    )

  const minimumRefluxRatio =
    calculateMinimumRefluxRatio(
      input,
      underwoodRoot,
    )

  if (
    !Number.isFinite(
      minimumRefluxRatio,
    ) ||
    minimumRefluxRatio <=
      0
  ) {
    throw new ShortcutDistillationCalculationError(
      'nonPhysicalMinimumReflux',
    )
  }

  const scenarioMultipliers = [
    1.2,
    input.refluxMultiplier,
    2,
  ]
    .filter(
      (
        value,
      ) =>
        value >
        1,
    )
    .filter(
      (
        value,
        index,
        values,
      ) =>
        values.findIndex(
          (
            candidate,
          ) =>
            Math.abs(
              candidate -
              value
            ) <
            1e-12,
        ) ===
        index,
    )
    .sort(
      (
        first,
        second,
      ) =>
        first -
        second,
    )

  const scenarios =
    scenarioMultipliers.map(
      (
        refluxMultiplier,
      ) =>
        calculateGillilandScenario({
          minimumStages,
          minimumRefluxRatio,
          refluxMultiplier,
          overallStageEfficiency:
            input.overallStageEfficiency,
        }),
    )

  const selectedScenario =
    scenarios.find(
      (
        scenario,
      ) =>
        Math.abs(
          scenario.refluxMultiplier -
          input.refluxMultiplier
        ) <
        1e-12,
    )

  if (
    !selectedScenario ||
    !Number.isFinite(
      minimumStages,
    ) ||
    minimumStages <=
      0 ||
    !Number.isFinite(
      underwoodRoot,
    ) ||
    underwoodRoot <=
      1 ||
    underwoodRoot >=
      input.relativeVolatility ||
    Math.abs(
      underwoodResidual,
    ) >
      1e-8
  ) {
    throw new ShortcutDistillationCalculationError(
      'numericalFailure',
    )
  }

  return {
    minimumStages,
    underwoodRoot,
    underwoodResidual,
    minimumRefluxRatio,
    selectedScenario,
    scenarios,
    modelName:
      'Binary Fenske–Underwood–Gilliland shortcut design',
    limitationDescription:
      'Assumes constant relative volatility, binary light/heavy keys, equilibrium stages, negligible pressure drop and no rigorous enthalpy or hydraulic model. The total reboiler is treated as an equilibrium stage; a total condenser is not.',
  }
}

function csvCell(
  value:
    string | number,
): string {
  const text =
    String(
      value,
    )

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createShortcutDistillationCsv(
  input:
    ShortcutDistillationInput,
  result:
    ShortcutDistillationResult,
): string {
  const rows:
    (
      string |
      number
    )[][] = [
      [
        'Fenske–Underwood–Gilliland Shortcut Distillation',
        '',
      ],
      [],
      [
        'Input',
        'Value',
      ],
      [
        'Feed light-key mole fraction',
        input.feedLightKeyMoleFraction,
      ],
      [
        'Distillate light-key mole fraction',
        input.distillateLightKeyMoleFraction,
      ],
      [
        'Bottoms light-key mole fraction',
        input.bottomsLightKeyMoleFraction,
      ],
      [
        'Relative volatility LK/HK',
        input.relativeVolatility,
      ],
      [
        'Feed quality q',
        input.feedQuality,
      ],
      [
        'Selected reflux multiplier',
        input.refluxMultiplier,
      ],
      [
        'Overall stage efficiency',
        input.overallStageEfficiency,
      ],
      [],
      [
        'Shortcut result',
        'Value',
      ],
      [
        'Fenske minimum stages',
        result.minimumStages,
      ],
      [
        'Underwood root',
        result.underwoodRoot,
      ],
      [
        'Underwood residual',
        result.underwoodResidual,
      ],
      [
        'Minimum reflux ratio',
        result.minimumRefluxRatio,
      ],
      [
        'Selected operating reflux ratio',
        result
          .selectedScenario
          .operatingRefluxRatio,
      ],
      [
        'Selected theoretical stages',
        result
          .selectedScenario
          .theoreticalStageCount,
      ],
      [
        'Selected actual stages',
        result
          .selectedScenario
          .actualStageCount,
      ],
      [],
      [
        'Reflux multiplier',
        'Operating reflux ratio',
        'Reduced reflux X',
        'Reduced stages Y',
        'Theoretical stages',
        'Rounded theoretical stages',
        'Actual stages',
        'Rounded actual stages',
      ],
      ...result.scenarios.map(
        (
          scenario,
        ) => [
          scenario.refluxMultiplier,
          scenario.operatingRefluxRatio,
          scenario.reducedReflux,
          scenario.gillilandReducedStages,
          scenario.theoreticalStageCount,
          scenario.requiredIntegerTheoreticalStages,
          scenario.actualStageCount,
          scenario.requiredIntegerActualStages,
        ],
      ),
    ]

  return rows
    .map(
      (
        row,
      ) =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
