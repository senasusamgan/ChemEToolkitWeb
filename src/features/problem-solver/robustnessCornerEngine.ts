import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  ROBUSTNESS_CORNER_ENGINE_VERSION =
    'robustness-corner-analysis-v1' as const

export type RobustnessLevel =
  | 'low'
  | 'nominal'
  | 'high'

export type RobustnessStatus =
  | 'within'
  | 'below'
  | 'above'
  | 'unresolved'

export interface RobustnessVariable {
  symbol: string
  nominalValue: number
  tolerancePercent: number
}

export interface RobustnessCornerCase {
  id: string
  label: string
  problem: string
  isNominal: boolean
  levels:
    Record<
      string,
      RobustnessLevel
    >
  values:
    Record<
      string,
      number
    >
}

export interface RobustnessClassification {
  status:
    RobustnessStatus
  withinLimits: boolean
  signedMargin:
    number | null
  boundaryDistance:
    number | null
}

export interface RobustnessEvaluatedCase
  extends RobustnessCornerCase,
    RobustnessClassification {
  outputValue:
    number | null
}

export interface RobustnessVariableEffect {
  symbol: string
  lowMean:
    number | null
  highMean:
    number | null
  absoluteEffect:
    number | null
}

export interface RobustnessSummary {
  totalCaseCount: number
  resolvedCaseCount: number
  withinLimitCaseCount: number
  unresolvedCaseCount: number
  coveragePercentage: number
  robustPass: boolean
  nominalOutput:
    number | null
  minimumOutput:
    number | null
  maximumOutput:
    number | null
  outputSpan:
    number | null
  maximumAbsoluteDeviation:
    number | null
  minimumCaseId:
    string | null
  maximumCaseId:
    string | null
  worstCaseId:
    string | null
  criticalVariableSymbol:
    string | null
  criticalVariableEffect:
    number | null
  variableEffects:
    RobustnessVariableEffect[]
}

export interface RobustnessCsvCase
  extends RobustnessEvaluatedCase {
  calculatorTitle: string
  outputLabel: string
  outputUnit: string
}

function normalizeTolerance(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0
  }

  return Math.min(
    100,
    Math.max(
      0,
      value,
    ),
  )
}

function createVariableBounds(
  variable:
    RobustnessVariable,
): {
  low: number
  high: number
} {
  const tolerance =
    normalizeTolerance(
      variable
        .tolerancePercent,
    )

  const delta =
    Math.abs(
      variable
        .nominalValue,
    ) *
    tolerance /
    100

  return {
    low:
      variable.nominalValue -
      delta,
    high:
      variable.nominalValue +
      delta,
  }
}

export function createRobustnessCornerCases(
  baseQuery: string,
  variables:
    RobustnessVariable[],
): RobustnessCornerCase[] {
  const uniqueVariables:
    RobustnessVariable[] = []

  const seenSymbols =
    new Set<string>()

  for (
    const variable
    of variables
  ) {
    if (
      uniqueVariables.length >=
        4 ||
      seenSymbols.has(
        variable.symbol,
      ) ||
      !Number.isFinite(
        variable.nominalValue,
      ) ||
      !Number.isFinite(
        variable.tolerancePercent,
      ) ||
      variable.tolerancePercent <
        0
    ) {
      continue
    }

    uniqueVariables.push({
      ...variable,
      tolerancePercent:
        normalizeTolerance(
          variable
            .tolerancePercent,
        ),
    })

    seenSymbols.add(
      variable.symbol,
    )
  }

  if (
    uniqueVariables.length ===
    0
  ) {
    return []
  }

  const nominalLevels:
    Record<
      string,
      RobustnessLevel
    > = {}

  const nominalValues:
    Record<
      string,
      number
    > = {}

  for (
    const variable
    of uniqueVariables
  ) {
    nominalLevels[
      variable.symbol
    ] =
      'nominal'

    nominalValues[
      variable.symbol
    ] =
      variable.nominalValue
  }

  const cases:
    RobustnessCornerCase[] = [
      {
        id:
          'nominal',
        label:
          'Nominal case',
        problem:
          baseQuery,
        isNominal:
          true,
        levels:
          nominalLevels,
        values:
          nominalValues,
      },
    ]

  const cornerCount =
    2 **
    uniqueVariables.length

  for (
    let mask =
      0;
    mask <
      cornerCount;
    mask +=
      1
  ) {
    let problem =
      baseQuery

    const levels:
      Record<
        string,
        RobustnessLevel
      > = {}

    const values:
      Record<
        string,
        number
      > = {}

    const labels:
      string[] = []

    for (
      let index =
        0;
      index <
        uniqueVariables.length;
      index +=
        1
    ) {
      const variable =
        uniqueVariables[
          index
        ]

      const bounds =
        createVariableBounds(
          variable,
        )

      const isHigh =
        (
          mask &
          (
            1 <<
            index
          )
        ) !==
        0

      const level:
        RobustnessLevel =
          isHigh
            ? 'high'
            : 'low'

      const value =
        isHigh
          ? bounds.high
          : bounds.low

      levels[
        variable.symbol
      ] =
        level

      values[
        variable.symbol
      ] =
        value

      labels.push(
        `${variable.symbol} ${level}`,
      )

      problem =
        replaceConstraintAssignment(
          problem,
          variable.symbol,
          value,
        )
    }

    cases.push({
      id:
        `corner-${mask}`,
      label:
        labels.join(
          ' · ',
        ),
      problem,
      isNominal:
        false,
      levels,
      values,
    })
  }

  return cases
}

export function classifyRobustnessOutput(
  value:
    number | null,
  lowerBound:
    number | null,
  upperBound:
    number | null,
): RobustnessClassification {
  const resolvedValue =
    value !==
      null &&
    Number.isFinite(
      value,
    )
      ? value
      : null

  const lower =
    lowerBound !==
      null &&
    Number.isFinite(
      lowerBound,
    )
      ? lowerBound
      : null

  const upper =
    upperBound !==
      null &&
    Number.isFinite(
      upperBound,
    )
      ? upperBound
      : null

  if (
    resolvedValue ===
    null
  ) {
    return {
      status:
        'unresolved',
      withinLimits:
        false,
      signedMargin:
        null,
      boundaryDistance:
        null,
    }
  }

  if (
    lower !==
      null &&
    resolvedValue <
      lower
  ) {
    const margin =
      resolvedValue -
      lower

    return {
      status:
        'below',
      withinLimits:
        false,
      signedMargin:
        margin,
      boundaryDistance:
        Math.abs(
          margin,
        ),
    }
  }

  if (
    upper !==
      null &&
    resolvedValue >
      upper
  ) {
    const margin =
      upper -
      resolvedValue

    return {
      status:
        'above',
      withinLimits:
        false,
      signedMargin:
        margin,
      boundaryDistance:
        Math.abs(
          margin,
        ),
    }
  }

  const margins:
    number[] = []

  if (
    lower !==
    null
  ) {
    margins.push(
      resolvedValue -
      lower,
    )
  }

  if (
    upper !==
    null
  ) {
    margins.push(
      upper -
      resolvedValue,
    )
  }

  const margin =
    margins.length >
      0
      ? Math.min(
          ...margins,
        )
      : null

  return {
    status:
      'within',
    withinLimits:
      true,
    signedMargin:
      margin,
    boundaryDistance:
      margin ===
        null
        ? null
        : Math.abs(
            margin,
          ),
  }
}

function average(
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
      sum,
      value,
    ) =>
      sum +
      value,
    0,
  ) /
    values.length
}

export function summarizeRobustnessCases(
  cases:
    RobustnessEvaluatedCase[],
  variables:
    RobustnessVariable[],
): RobustnessSummary {
  const resolvedCases =
    cases.filter(
      (
        item,
      ) =>
        item.outputValue !==
          null &&
        Number.isFinite(
          item.outputValue,
        ),
    )

  const withinCases =
    resolvedCases.filter(
      (
        item,
      ) =>
        item.withinLimits,
    )

  const nominalCase =
    resolvedCases.find(
      (
        item,
      ) =>
        item.isNominal,
    )

  const sortedCases = [
    ...resolvedCases,
  ].sort(
    (
      first,
      second,
    ) =>
      (
        first.outputValue ??
        0
      ) -
      (
        second.outputValue ??
        0
      ),
  )

  const minimumCase =
    sortedCases[0] ??
    null

  const maximumCase =
    sortedCases[
      sortedCases.length -
      1
    ] ??
    null

  const nominalOutput =
    nominalCase
      ?.outputValue ??
    null

  let maximumAbsoluteDeviation:
    number | null =
      null

  let worstCaseId:
    string | null =
      null

  if (
    nominalOutput !==
    null
  ) {
    for (
      const item
      of resolvedCases
    ) {
      if (
        item.outputValue ===
        null
      ) {
        continue
      }

      const deviation =
        Math.abs(
          item.outputValue -
          nominalOutput,
        )

      if (
        maximumAbsoluteDeviation ===
          null ||
        deviation >
          maximumAbsoluteDeviation
      ) {
        maximumAbsoluteDeviation =
          deviation

        worstCaseId =
          item.id
      }
    }
  }

  const variableEffects:
    RobustnessVariableEffect[] =
      variables.map(
        (
          variable,
        ) => {
          const lowOutputs =
            resolvedCases
              .filter(
                (
                  item,
                ) =>
                  item.levels[
                    variable
                      .symbol
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

          const highOutputs =
            resolvedCases
              .filter(
                (
                  item,
                ) =>
                  item.levels[
                    variable
                      .symbol
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
            average(
              lowOutputs,
            )

          const highMean =
            average(
              highOutputs,
            )

          return {
            symbol:
              variable.symbol,
            lowMean,
            highMean,
            absoluteEffect:
              lowMean !==
                null &&
              highMean !==
                null
                ? Math.abs(
                    highMean -
                    lowMean,
                  )
                : null,
          }
        },
      )

  const criticalEffect =
    variableEffects.reduce<
      RobustnessVariableEffect | null
    >(
      (
        current,
        effect,
      ) => {
        if (
          effect.absoluteEffect ===
          null
        ) {
          return current
        }

        if (
          current ===
            null ||
          current
            .absoluteEffect ===
            null ||
          effect.absoluteEffect >
            current
              .absoluteEffect
        ) {
          return effect
        }

        return current
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
    withinLimitCaseCount:
      withinCases.length,
    unresolvedCaseCount:
      cases.length -
      resolvedCases.length,
    coveragePercentage:
      cases.length >
        0
        ? withinCases.length /
          cases.length *
          100
        : 0,
    robustPass:
      cases.length >
        0 &&
      resolvedCases.length ===
        cases.length &&
      withinCases.length ===
        cases.length,
    nominalOutput,
    minimumOutput,
    maximumOutput,
    outputSpan:
      minimumOutput !==
        null &&
      maximumOutput !==
        null
        ? maximumOutput -
          minimumOutput
        : null,
    maximumAbsoluteDeviation,
    minimumCaseId:
      minimumCase
        ?.id ??
      null,
    maximumCaseId:
      maximumCase
        ?.id ??
      null,
    worstCaseId,
    criticalVariableSymbol:
      criticalEffect
        ?.symbol ??
      null,
    criticalVariableEffect:
      criticalEffect
        ?.absoluteEffect ??
      null,
    variableEffects,
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

export function createRobustnessCsv(
  cases:
    RobustnessCsvCase[],
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
    'Case',
    'Label',
    'Nominal',
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
    'Status',
    'Within limits',
    'Signed margin',
    'Problem',
  ]

  const rows =
    cases.map(
      (
        item,
      ) => [
        item.id,
        item.label,
        item.isNominal,
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
        item.status,
        item.withinLimits,
        item.signedMargin,
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
