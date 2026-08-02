export const
  CONSTRAINT_OPERATING_WINDOW_ENGINE_VERSION =
    'constraint-operating-window-v1' as const

export interface ConstraintAssignment {
  symbol: string
  value: number
  unit: string
}

export interface ConstraintRangeDefinition {
  symbol: string
  minimum: number
  maximum: number
  steps: number
}

export interface ConstraintGridPoint {
  id: string
  row: number
  column: number
  xSymbol: string
  xValue: number
  ySymbol:
    string | null
  yValue:
    number | null
  problem: string
}

export type ConstraintStatus =
  | 'feasible'
  | 'below'
  | 'above'
  | 'unresolved'

export interface ConstraintClassification {
  status:
    ConstraintStatus
  feasible: boolean
  signedMargin:
    number | null
  boundaryDistance:
    number | null
}

export interface ConstraintSummaryPoint {
  id: string
  status:
    ConstraintStatus
  signedMargin:
    number | null
  boundaryDistance:
    number | null
}

export interface ConstraintWindowSummary {
  totalPointCount: number
  resolvedPointCount: number
  feasiblePointCount: number
  outOfSpecPointCount: number
  unresolvedPointCount: number
  feasiblePercentage: number
  bestPointId:
    string | null
  closestBoundaryPointId:
    string | null
}

export interface ConstraintCsvPoint
  extends ConstraintGridPoint {
  calculatorTitle: string
  outputValue:
    number | null
  outputLabel: string
  outputUnit: string
  status:
    ConstraintStatus
  feasible: boolean
  signedMargin:
    number | null
}

const NUMBER_PATTERN_SOURCE =
  '[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[-+]?\\d+)?'

export function parseConstraintAssignments(
  query: string,
): ConstraintAssignment[] {
  const assignments:
    ConstraintAssignment[] = []

  const seenSymbols =
    new Set<string>()

  for (
    const rawSegment
    of query.split(
      /[;\n]+/,
    )
  ) {
    const segment =
      rawSegment.trim()

    const match =
      segment.match(
        new RegExp(
          `^([A-Za-zΑ-Ωα-ωΔρμνταβγ][A-Za-z0-9_Α-Ωα-ωΔρμνταβγ]*)\\s*=\\s*(${NUMBER_PATTERN_SOURCE})\\s*(.*)$`,
          'i',
        ),
      )

    if (!match) {
      continue
    }

    const symbol =
      match[1]

    const value =
      Number(
        match[2],
      )

    if (
      !Number.isFinite(
        value,
      ) ||
      seenSymbols.has(
        symbol,
      )
    ) {
      continue
    }

    assignments.push({
      symbol,
      value,
      unit:
        match[3]
          .trim()
          .replace(
            /\s+/g,
            ' ',
          ),
    })

    seenSymbols.add(
      symbol,
    )
  }

  return assignments
}

function escapeRegExp(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function formatAssignmentValue(
  value: number,
): string {
  return Number(
    value.toPrecision(
      12,
    ),
  ).toString()
}

export function replaceConstraintAssignment(
  query: string,
  symbol: string,
  nextValue: number,
): string {
  if (
    !Number.isFinite(
      nextValue,
    )
  ) {
    return query
  }

  const escapedSymbol =
    escapeRegExp(
      symbol,
    )

  const assignmentPattern =
    new RegExp(
      `^(\\s*)${escapedSymbol}(\\s*=\\s*)${NUMBER_PATTERN_SOURCE}`,
      'i',
    )

  const formattedValue =
    formatAssignmentValue(
      nextValue,
    )

  return query
    .split(
      /([;\n]+)/,
    )
    .map(
      (
        segment,
      ) => {
        if (
          !assignmentPattern.test(
            segment,
          )
        ) {
          return segment
        }

        return segment.replace(
          assignmentPattern,
          `$1${symbol}$2${formattedValue}`,
        )
      },
    )
    .join('')
}

export function createConstraintRange(
  minimum: number,
  maximum: number,
  steps: number,
): number[] {
  if (
    !Number.isFinite(
      minimum,
    ) ||
    !Number.isFinite(
      maximum,
    ) ||
    maximum <=
      minimum
  ) {
    return []
  }

  const safeSteps =
    Math.min(
      9,
      Math.max(
        2,
        Math.trunc(
          steps,
        ),
      ),
    )

  return Array.from(
    {
      length:
        safeSteps,
    },
    (
      _,
      index,
    ) => {
      const fraction =
        index /
        (
          safeSteps -
          1
        )

      return minimum +
        (
          maximum -
          minimum
        ) *
        fraction
    },
  )
}

export function buildConstraintGrid(
  baseQuery: string,
  primaryRange:
    ConstraintRangeDefinition,
  secondaryRange?:
    ConstraintRangeDefinition | null,
): ConstraintGridPoint[] {
  const xValues =
    createConstraintRange(
      primaryRange.minimum,
      primaryRange.maximum,
      primaryRange.steps,
    )

  if (
    xValues.length ===
    0
  ) {
    return []
  }

  const yValues =
    secondaryRange
      ? createConstraintRange(
          secondaryRange.minimum,
          secondaryRange.maximum,
          secondaryRange.steps,
        )
      : [
          null,
        ]

  if (
    yValues.length ===
    0
  ) {
    return []
  }

  const points:
    ConstraintGridPoint[] = []

  for (
    let row =
      0;
    row <
    yValues.length;
    row +=
      1
  ) {
    const yValue =
      yValues[
        row
      ]

    for (
      let column =
        0;
      column <
      xValues.length;
      column +=
        1
    ) {
      const xValue =
        xValues[
          column
        ]

      let problem =
        replaceConstraintAssignment(
          baseQuery,
          primaryRange.symbol,
          xValue,
        )

      if (
        secondaryRange &&
        yValue !==
          null
      ) {
        problem =
          replaceConstraintAssignment(
            problem,
            secondaryRange.symbol,
            yValue,
          )
      }

      points.push({
        id:
          `${row}-${column}`,
        row,
        column,
        xSymbol:
          primaryRange.symbol,
        xValue,
        ySymbol:
          secondaryRange
            ?.symbol ??
          null,
        yValue,
        problem,
      })
    }
  }

  return points
}

export function classifyConstraintValue(
  value:
    number | null,
  lowerBound:
    number | null,
  upperBound:
    number | null,
): ConstraintClassification {
  const normalizedValue =
    value !==
      null &&
    Number.isFinite(
      value,
    )
      ? value
      : null

  const normalizedLower =
    lowerBound !==
      null &&
    Number.isFinite(
      lowerBound,
    )
      ? lowerBound
      : null

  const normalizedUpper =
    upperBound !==
      null &&
    Number.isFinite(
      upperBound,
    )
      ? upperBound
      : null

  if (
    normalizedValue ===
      null ||
    (
      normalizedLower ===
        null &&
      normalizedUpper ===
        null
    )
  ) {
    return {
      status:
        'unresolved',
      feasible:
        false,
      signedMargin:
        null,
      boundaryDistance:
        null,
    }
  }

  if (
    normalizedLower !==
      null &&
    normalizedValue <
      normalizedLower
  ) {
    const signedMargin =
      normalizedValue -
      normalizedLower

    return {
      status:
        'below',
      feasible:
        false,
      signedMargin,
      boundaryDistance:
        Math.abs(
          signedMargin,
        ),
    }
  }

  if (
    normalizedUpper !==
      null &&
    normalizedValue >
      normalizedUpper
  ) {
    const signedMargin =
      normalizedUpper -
      normalizedValue

    return {
      status:
        'above',
      feasible:
        false,
      signedMargin,
      boundaryDistance:
        Math.abs(
          signedMargin,
        ),
    }
  }

  const distances:
    number[] = []

  if (
    normalizedLower !==
    null
  ) {
    distances.push(
      normalizedValue -
      normalizedLower,
    )
  }

  if (
    normalizedUpper !==
    null
  ) {
    distances.push(
      normalizedUpper -
      normalizedValue,
    )
  }

  const signedMargin =
    Math.min(
      ...distances,
    )

  return {
    status:
      'feasible',
    feasible:
      true,
    signedMargin,
    boundaryDistance:
      Math.abs(
        signedMargin,
      ),
  }
}

export function summarizeConstraintWindow(
  points:
    ConstraintSummaryPoint[],
): ConstraintWindowSummary {
  const resolvedPoints =
    points.filter(
      (
        point,
      ) =>
        point.status !==
        'unresolved',
    )

  const feasiblePoints =
    resolvedPoints.filter(
      (
        point,
      ) =>
        point.status ===
        'feasible',
    )

  const outOfSpecPoints =
    resolvedPoints.filter(
      (
        point,
      ) =>
        point.status ===
          'below' ||
        point.status ===
          'above',
    )

  const bestPoint =
    feasiblePoints.reduce<
      ConstraintSummaryPoint | null
    >(
      (
        currentBest,
        point,
      ) => {
        if (
          point.signedMargin ===
          null
        ) {
          return currentBest
        }

        if (
          currentBest ===
            null ||
          currentBest
            .signedMargin ===
            null ||
          point.signedMargin >
            currentBest
              .signedMargin
        ) {
          return point
        }

        return currentBest
      },
      null,
    )

  const closestBoundaryPoint =
    resolvedPoints.reduce<
      ConstraintSummaryPoint | null
    >(
      (
        currentClosest,
        point,
      ) => {
        if (
          point.boundaryDistance ===
          null
        ) {
          return currentClosest
        }

        if (
          currentClosest ===
            null ||
          currentClosest
            .boundaryDistance ===
            null ||
          point.boundaryDistance <
            currentClosest
              .boundaryDistance
        ) {
          return point
        }

        return currentClosest
      },
      null,
    )

  return {
    totalPointCount:
      points.length,
    resolvedPointCount:
      resolvedPoints.length,
    feasiblePointCount:
      feasiblePoints.length,
    outOfSpecPointCount:
      outOfSpecPoints.length,
    unresolvedPointCount:
      points.length -
      resolvedPoints.length,
    feasiblePercentage:
      points.length >
        0
        ? feasiblePoints.length /
          points.length *
          100
        : 0,
    bestPointId:
      bestPoint
        ?.id ??
      null,
    closestBoundaryPointId:
      closestBoundaryPoint
        ?.id ??
      null,
  }
}

function csvCell(
  value:
    string | number | null,
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

export function createConstraintWindowCsv(
  points:
    ConstraintCsvPoint[],
): string {
  const header = [
    'Point',
    'Row',
    'Column',
    'Primary variable',
    'Primary value',
    'Secondary variable',
    'Secondary value',
    'Calculator',
    'Output label',
    'Output value',
    'Output unit',
    'Status',
    'Feasible',
    'Signed margin',
    'Problem',
  ]

  const rows =
    points.map(
      (
        point,
      ) => [
        point.id,
        point.row,
        point.column,
        point.xSymbol,
        point.xValue,
        point.ySymbol,
        point.yValue,
        point.calculatorTitle,
        point.outputLabel,
        point.outputValue,
        point.outputUnit,
        point.status,
        point.feasible
          ? 'yes'
          : 'no',
        point.signedMargin,
        point.problem,
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
