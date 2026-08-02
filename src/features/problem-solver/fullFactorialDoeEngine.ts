import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  FULL_FACTORIAL_DOE_ENGINE_VERSION =
    'full-factorial-doe-v1' as const

export type FactorialLevel =
  | 'low'
  | 'center'
  | 'high'

export type FactorialObjective =
  | 'maximize'
  | 'minimize'

export interface FactorialFactor {
  symbol: string
  nominalValue: number
  lowValue: number
  highValue: number
}

export interface FactorialDesignCase {
  id: string
  label: string
  problem: string
  isCenter: boolean
  levels:
    Record<
      string,
      FactorialLevel
    >
  values:
    Record<
      string,
      number
    >
}

export interface FactorialEvaluatedCase
  extends FactorialDesignCase {
  outputValue:
    number | null
}

export interface FactorMainEffect {
  symbol: string
  lowMean:
    number | null
  highMean:
    number | null
  mainEffect:
    number | null
}

export interface FactorInteractionEffect {
  firstSymbol: string
  secondSymbol: string
  sameDirectionMean:
    number | null
  oppositeDirectionMean:
    number | null
  interactionEffect:
    number | null
}

export interface FactorialDesignSummary {
  totalCaseCount: number
  resolvedCaseCount: number
  centerOutput:
    number | null
  minimumOutput:
    number | null
  maximumOutput:
    number | null
  responseSpan:
    number | null
  bestCaseId:
    string | null
  strongestFactorSymbol:
    string | null
  strongestFactorEffect:
    number | null
  mainEffects:
    FactorMainEffect[]
  interactionEffects:
    FactorInteractionEffect[]
}

export interface FactorialCsvCase
  extends FactorialEvaluatedCase {
  calculatorTitle: string
  outputLabel: string
  outputUnit: string
}

function mean(
  values:
    number[],
): number | null {
  if (
    values.length ===
    0
  ) {
    return null
  }

  return values.reduce(
    (
      total,
      value,
    ) =>
      total +
      value,
    0,
  ) /
    values.length
}

function normalizeFactors(
  factors:
    FactorialFactor[],
): FactorialFactor[] {
  const normalized:
    FactorialFactor[] = []

  const seenSymbols =
    new Set<string>()

  for (
    const factor
    of factors
  ) {
    if (
      normalized.length >=
        3 ||
      seenSymbols.has(
        factor.symbol,
      ) ||
      !Number.isFinite(
        factor.nominalValue,
      ) ||
      !Number.isFinite(
        factor.lowValue,
      ) ||
      !Number.isFinite(
        factor.highValue,
      ) ||
      factor.highValue <=
        factor.lowValue
    ) {
      continue
    }

    normalized.push(
      factor,
    )

    seenSymbols.add(
      factor.symbol,
    )
  }

  return normalized
}

export function createFullFactorialDesign(
  baseQuery: string,
  factors:
    FactorialFactor[],
): FactorialDesignCase[] {
  const validFactors =
    normalizeFactors(
      factors,
    )

  if (
    validFactors.length ===
    0
  ) {
    return []
  }

  const centerLevels:
    Record<
      string,
      FactorialLevel
    > = {}

  const centerValues:
    Record<
      string,
      number
    > = {}

  let centerProblem =
    baseQuery

  for (
    const factor
    of validFactors
  ) {
    centerLevels[
      factor.symbol
    ] =
      'center'

    centerValues[
      factor.symbol
    ] =
      factor.nominalValue

    centerProblem =
      replaceConstraintAssignment(
        centerProblem,
        factor.symbol,
        factor.nominalValue,
      )
  }

  const cases:
    FactorialDesignCase[] = [
      {
        id:
          'center',
        label:
          'Center point',
        problem:
          centerProblem,
        isCenter:
          true,
        levels:
          centerLevels,
        values:
          centerValues,
      },
    ]

  const cornerCount =
    2 **
    validFactors.length

  for (
    let mask =
      0;
    mask <
      cornerCount;
    mask +=
      1
  ) {
    const levels:
      Record<
        string,
        FactorialLevel
      > = {}

    const values:
      Record<
        string,
        number
      > = {}

    const labels:
      string[] = []

    let problem =
      baseQuery

    for (
      let factorIndex =
        0;
      factorIndex <
        validFactors.length;
      factorIndex +=
        1
    ) {
      const factor =
        validFactors[
          factorIndex
        ]

      const isHigh =
        (
          mask &
          (
            1 <<
            factorIndex
          )
        ) !==
        0

      const level:
        FactorialLevel =
          isHigh
            ? 'high'
            : 'low'

      const value =
        isHigh
          ? factor.highValue
          : factor.lowValue

      levels[
        factor.symbol
      ] =
        level

      values[
        factor.symbol
      ] =
        value

      labels.push(
        `${factor.symbol} ${level}`,
      )

      problem =
        replaceConstraintAssignment(
          problem,
          factor.symbol,
          value,
        )
    }

    cases.push({
      id:
        `run-${mask + 1}`,
      label:
        labels.join(
          ' · ',
        ),
      problem,
      isCenter:
        false,
      levels,
      values,
    })
  }

  return cases
}

export function calculateFactorMainEffects(
  cases:
    FactorialEvaluatedCase[],
  factors:
    FactorialFactor[],
): FactorMainEffect[] {
  const cornerCases =
    cases.filter(
      (
        item,
      ) =>
        !item.isCenter &&
        item.outputValue !==
          null,
    )

  return factors.map(
    (
      factor,
    ) => {
      const lowValues =
        cornerCases
          .filter(
            (
              item,
            ) =>
              item.levels[
                factor.symbol
              ] ===
              'low',
          )
          .map(
            (
              item,
            ) =>
              item.outputValue,
          )
          .filter(
            (
              value,
            ):
              value is number =>
                value !==
                null,
          )

      const highValues =
        cornerCases
          .filter(
            (
              item,
            ) =>
              item.levels[
                factor.symbol
              ] ===
              'high',
          )
          .map(
            (
              item,
            ) =>
              item.outputValue,
          )
          .filter(
            (
              value,
            ):
              value is number =>
                value !==
                null,
          )

      const lowMean =
        mean(
          lowValues,
        )

      const highMean =
        mean(
          highValues,
        )

      return {
        symbol:
          factor.symbol,
        lowMean,
        highMean,
        mainEffect:
          lowMean !==
            null &&
          highMean !==
            null
            ? highMean -
              lowMean
            : null,
      }
    },
  )
}

export function calculateFactorInteractions(
  cases:
    FactorialEvaluatedCase[],
  factors:
    FactorialFactor[],
): FactorInteractionEffect[] {
  const interactions:
    FactorInteractionEffect[] = []

  const cornerCases =
    cases.filter(
      (
        item,
      ) =>
        !item.isCenter &&
        item.outputValue !==
          null,
    )

  for (
    let firstIndex =
      0;
    firstIndex <
      factors.length;
    firstIndex +=
      1
  ) {
    for (
      let secondIndex =
        firstIndex +
        1;
      secondIndex <
        factors.length;
      secondIndex +=
        1
    ) {
      const first =
        factors[
          firstIndex
        ]

      const second =
        factors[
          secondIndex
        ]

      const sameDirection =
        cornerCases
          .filter(
            (
              item,
            ) =>
              item.levels[
                first.symbol
              ] ===
              item.levels[
                second.symbol
              ],
          )
          .map(
            (
              item,
            ) =>
              item.outputValue,
          )
          .filter(
            (
              value,
            ):
              value is number =>
                value !==
                null,
          )

      const oppositeDirection =
        cornerCases
          .filter(
            (
              item,
            ) =>
              item.levels[
                first.symbol
              ] !==
              item.levels[
                second.symbol
              ],
          )
          .map(
            (
              item,
            ) =>
              item.outputValue,
          )
          .filter(
            (
              value,
            ):
              value is number =>
                value !==
                null,
          )

      const sameDirectionMean =
        mean(
          sameDirection,
        )

      const oppositeDirectionMean =
        mean(
          oppositeDirection,
        )

      interactions.push({
        firstSymbol:
          first.symbol,
        secondSymbol:
          second.symbol,
        sameDirectionMean,
        oppositeDirectionMean,
        interactionEffect:
          sameDirectionMean !==
            null &&
          oppositeDirectionMean !==
            null
            ? sameDirectionMean -
              oppositeDirectionMean
            : null,
      })
    }
  }

  return interactions
}

export function summarizeFullFactorialDesign(
  cases:
    FactorialEvaluatedCase[],
  factors:
    FactorialFactor[],
  objective:
    FactorialObjective,
): FactorialDesignSummary {
  const resolvedCases =
    cases.filter(
      (
        item,
      ):
        item is
          FactorialEvaluatedCase & {
            outputValue: number
          } =>
        item.outputValue !==
          null &&
        Number.isFinite(
          item.outputValue,
        ),
    )

  const centerOutput =
    resolvedCases.find(
      (
        item,
      ) =>
        item.isCenter,
    )
      ?.outputValue ??
    null

  const sorted =
    [
      ...resolvedCases,
    ].sort(
      (
        first,
        second,
      ) =>
        first.outputValue -
        second.outputValue,
    )

  const minimumCase =
    sorted[0] ??
    null

  const maximumCase =
    sorted[
      sorted.length -
      1
    ] ??
    null

  const bestCase =
    objective ===
      'maximize'
      ? maximumCase
      : minimumCase

  const mainEffects =
    calculateFactorMainEffects(
      cases,
      factors,
    )

  const interactionEffects =
    calculateFactorInteractions(
      cases,
      factors,
    )

  const strongestFactor =
    mainEffects.reduce<
      FactorMainEffect | null
    >(
      (
        strongest,
        effect,
      ) => {
        if (
          effect.mainEffect ===
          null
        ) {
          return strongest
        }

        if (
          strongest ===
            null ||
          strongest
            .mainEffect ===
            null ||
          Math.abs(
            effect.mainEffect,
          ) >
            Math.abs(
              strongest
                .mainEffect,
            )
        ) {
          return effect
        }

        return strongest
      },
      null,
    )

  const minimumOutput =
    minimumCase
      ?.outputValue ??
    null

  const maximumOutput =
    maximumCase
      ?.outputValue ??
    null

  return {
    totalCaseCount:
      cases.length,
    resolvedCaseCount:
      resolvedCases.length,
    centerOutput,
    minimumOutput,
    maximumOutput,
    responseSpan:
      minimumOutput !==
        null &&
      maximumOutput !==
        null
        ? maximumOutput -
          minimumOutput
        : null,
    bestCaseId:
      bestCase
        ?.id ??
      null,
    strongestFactorSymbol:
      strongestFactor
        ?.symbol ??
      null,
    strongestFactorEffect:
      strongestFactor
        ?.mainEffect ??
      null,
    mainEffects,
    interactionEffects,
  }
}

function csvCell(
  value:
    string | number | boolean | null,
): string {
  const text =
    value ===
      null
      ? ''
      : String(
          value,
        )

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createFullFactorialCsv(
  cases:
    FactorialCsvCase[],
): string {
  const symbols =
    Array.from(
      new Set(
        cases.flatMap(
          (
            item,
          ) =>
            Object.keys(
              item.values,
            ),
        ),
      ),
    )

  const header = [
    'Run',
    'Label',
    'Center point',
    ...symbols.flatMap(
      (
        symbol,
      ) => [
        `${symbol} level`,
        `${symbol} value`,
      ],
    ),
    'Calculator',
    'Output label',
    'Output value',
    'Output unit',
    'Problem',
  ]

  const rows =
    cases.map(
      (
        item,
      ) => [
        item.id,
        item.label,
        item.isCenter,
        ...symbols.flatMap(
          (
            symbol,
          ) => [
            item.levels[
              symbol
            ] ??
              '',
            item.values[
              symbol
            ] ??
              null,
          ],
        ),
        item.calculatorTitle,
        item.outputLabel,
        item.outputValue,
        item.outputUnit,
        item.problem,
      ],
    )

  return [
    header,
    ...rows,
  ]
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
