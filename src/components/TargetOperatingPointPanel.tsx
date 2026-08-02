import {
  useMemo,
  useState,
} from 'react'

import {
  calculators,
} from '../data/calculators'
import {
  rankProblemSolvers,
} from '../features/problem-solver/problemSolverEngine'

import '../styles/target-operating-point-panel.css'

interface TargetOperatingPointPanelProps {
  initiallyOpen?: boolean
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface NumericAssignment {
  symbol: string
  value: number
  unit: string
}

interface SearchPoint {
  inputValue: number
  resultValue: number
  resultText: string
  resultLabel: string
  resultUnit: string
  readinessPercent: number
  calculatorTitle: string
  problem: string
  absoluteError: number
  relativeError:
    number | null
}

interface TargetSearchAnalysis {
  targetValue: number
  points: SearchPoint[]
  candidates: SearchPoint[]
  bestPoint:
    SearchPoint | null
  minimumResult:
    number | null
  maximumResult:
    number | null
  targetBracketed: boolean
  trend:
    'increasing'
    | 'decreasing'
    | 'mixed'
    | 'unknown'
  resultLabel: string
  resultUnit: string
}

const NUMBER_PATTERN =
  '[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[-+]?\\d+)?'

function parseNumericAssignments(
  query: string,
): NumericAssignment[] {
  const assignments:
    NumericAssignment[] = []

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
          `^([A-Za-zΑ-Ωα-ωΔρμνταβγ][A-Za-z0-9_Α-Ωα-ωΔρμνταβγ]*)\\s*=\\s*(${NUMBER_PATTERN})\\s*(.*)$`,
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

function replaceNumericAssignment(
  query: string,
  symbol: string,
  nextValue: number,
): string {
  const escapedSymbol =
    escapeRegExp(
      symbol,
    )

  const pattern =
    new RegExp(
      `^(\\s*)${escapedSymbol}(\\s*=\\s*)${NUMBER_PATTERN}`,
      'i',
    )

  const formattedValue =
    Number(
      nextValue.toPrecision(
        12,
      ),
    ).toString()

  return query
    .split(
      /([;\n]+)/,
    )
    .map(
      (segment) => {
        if (
          !pattern.test(
            segment,
          )
        ) {
          return segment
        }

        return segment.replace(
          pattern,
          `$1${symbol}$2${formattedValue}`,
        )
      },
    )
    .join('')
}

function createLinearRange(
  minimum: number,
  maximum: number,
  count: number,
): number[] {
  return Array.from(
    {
      length:
        count,
    },
    (
      _,
      index,
    ) => {
      const fraction =
        count ===
        1
          ? 0
          : index /
            (
              count -
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

function formatEngineeringNumber(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return '—'
  }

  const absoluteValue =
    Math.abs(
      value,
    )

  if (
    absoluteValue !==
      0 &&
    (
      absoluteValue >=
        1e6 ||
      absoluteValue <
        1e-4
    )
  ) {
    return value
      .toExponential(
        5,
      )
  }

  return Number(
    value.toPrecision(
      8,
    ),
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        9,
    },
  )
}

function determineTrend(
  points: SearchPoint[],
): TargetSearchAnalysis[
  'trend'
] {
  if (
    points.length <
    3
  ) {
    return 'unknown'
  }

  let increasingSteps =
    0

  let decreasingSteps =
    0

  for (
    let index =
      1;
    index <
    points.length;
    index +=
      1
  ) {
    const difference =
      points[index]
        .resultValue -
      points[
        index -
        1
      ].resultValue

    if (
      difference >
      0
    ) {
      increasingSteps +=
        1
    } else if (
      difference <
      0
    ) {
      decreasingSteps +=
        1
    }
  }

  const totalSteps =
    increasingSteps +
    decreasingSteps

  if (
    totalSteps ===
    0
  ) {
    return 'unknown'
  }

  if (
    increasingSteps /
      totalSteps >=
    0.9
  ) {
    return 'increasing'
  }

  if (
    decreasingSteps /
      totalSteps >=
    0.9
  ) {
    return 'decreasing'
  }

  return 'mixed'
}

function trendLabel(
  trend:
    TargetSearchAnalysis[
      'trend'
    ],
): string {
  if (
    trend ===
    'increasing'
  ) {
    return 'Output rises with the selected input'
  }

  if (
    trend ===
    'decreasing'
  ) {
    return 'Output falls with the selected input'
  }

  if (
    trend ===
    'mixed'
  ) {
    return 'Non-monotonic response detected'
  }

  return 'Trend not established'
}

function csvCell(
  value: string,
): string {
  return `"${value.replace(
    /"/g,
    '""',
  )}"`
}

async function copyText(
  value: string,
): Promise<void> {
  if (
    navigator.clipboard &&
    typeof navigator
      .clipboard
      .writeText ===
      'function'
  ) {
    await navigator
      .clipboard
      .writeText(
        value,
      )

    return
  }

  const textArea =
    document.createElement(
      'textarea',
    )

  textArea.value =
    value

  textArea.setAttribute(
    'readonly',
    '',
  )

  textArea.style.position =
    'fixed'

  textArea.style.opacity =
    '0'

  document.body.appendChild(
    textArea,
  )

  textArea.select()

  const copied =
    document.execCommand(
      'copy',
    )

  textArea.remove()

  if (!copied) {
    throw new Error(
      'Browser copy command failed.',
    )
  }
}

export function TargetOperatingPointPanel({
  baseQuery,
  initiallyOpen = false,
  onApplyProblem,
}: TargetOperatingPointPanelProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(initiallyOpen)

  const assignments =
    useMemo(
      () =>
        parseNumericAssignments(
          baseQuery,
        ),
      [
        baseQuery,
      ],
    )

  const nominalMatch =
    useMemo(
      () =>
        baseQuery
          .trim()
          .length >=
        3
          ? rankProblemSolvers(
              baseQuery,
              calculators,
              1,
            )[0]
          : undefined,
      [
        baseQuery,
      ],
    )

  const nominalSolution =
    nominalMatch
      ?.quickSolution

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState(
    assignments[0]
      ?.symbol ??
      '',
  )

  const selectedAssignment =
    assignments.find(
      (assignment) =>
        assignment.symbol ===
        selectedSymbol,
    ) ??
    assignments[0]

  const defaultScale =
    Math.abs(
      selectedAssignment
        ?.value ??
        1,
    ) ||
    1

  const [
    minimumInput,
    setMinimumInput,
  ] = useState(
    String(
      (
        selectedAssignment
          ?.value ??
        1
      ) -
        defaultScale *
          0.5,
    ),
  )

  const [
    maximumInput,
    setMaximumInput,
  ] = useState(
    String(
      (
        selectedAssignment
          ?.value ??
        1
      ) +
        defaultScale *
          0.5,
    ),
  )

  const [
    targetValue,
    setTargetValue,
  ] = useState('')

  const [
    resolution,
    setResolution,
  ] = useState(81)

  const [
    tolerancePercent,
    setTolerancePercent,
  ] = useState('1')

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const analysis =
    useMemo<
      TargetSearchAnalysis | null
    >(
      () => {
        if (
          !isOpen ||
          !selectedAssignment ||
          !nominalSolution
        ) {
          return null
        }

        const parsedMinimum =
          Number(
            minimumInput,
          )

        const parsedMaximum =
          Number(
            maximumInput,
          )

        const parsedTarget =
          Number(
            targetValue,
          )

        if (
          !Number.isFinite(
            parsedMinimum,
          ) ||
          !Number.isFinite(
            parsedMaximum,
          ) ||
          !Number.isFinite(
            parsedTarget,
          ) ||
          parsedMinimum ===
            parsedMaximum
        ) {
          return null
        }

        const lowerInput =
          Math.min(
            parsedMinimum,
            parsedMaximum,
          )

        const upperInput =
          Math.max(
            parsedMinimum,
            parsedMaximum,
          )

        const safeResolution =
          Math.max(
            21,
            Math.min(
              121,
              Math.round(
                resolution,
              ),
            ),
          )

        const inputValues =
          createLinearRange(
            lowerInput,
            upperInput,
            safeResolution,
          )

        const points:
          SearchPoint[] = []

        for (
          const inputValue
          of inputValues
        ) {
          const problem =
            replaceNumericAssignment(
              baseQuery,
              selectedAssignment
                .symbol,
              inputValue,
            )

          const match =
            rankProblemSolvers(
              problem,
              calculators,
              1,
            )[0]

          const quickSolution =
            match
              ?.quickSolution

          const numericResult =
            quickSolution
              ?.numericValue

          if (
            !quickSolution ||
            typeof numericResult !==
              'number' ||
            !Number.isFinite(
              numericResult,
            ) ||
            quickSolution
              .resultLabel !==
              nominalSolution
                .resultLabel ||
            quickSolution.unit !==
              nominalSolution.unit
          ) {
            continue
          }

          const absoluteError =
            Math.abs(
              numericResult -
              parsedTarget,
            )

          const relativeError =
            parsedTarget ===
            0
              ? null
              : absoluteError /
                Math.abs(
                  parsedTarget,
                ) *
                100

          points.push({
            inputValue,
            resultValue:
              numericResult,
            resultText:
              quickSolution
                .resultValue,
            resultLabel:
              quickSolution
                .resultLabel,
            resultUnit:
              quickSolution
                .unit,
            readinessPercent:
              match
                ?.equationContext
                .readinessPercent ??
              0,
            calculatorTitle:
              match
                ?.title ??
              'No calculator match',
            problem,
            absoluteError,
            relativeError,
          })
        }

        const orderedPoints =
          [
            ...points,
          ].sort(
            (
              first,
              second,
            ) =>
              first.inputValue -
              second.inputValue,
          )

        const candidates =
          [
            ...points,
          ]
            .sort(
              (
                first,
                second,
              ) =>
                first.absoluteError -
                second.absoluteError,
            )
            .slice(
              0,
              5,
            )

        const resultValues =
          points.map(
            (point) =>
              point.resultValue,
          )

        const minimumResult =
          resultValues.length >
          0
            ? Math.min(
                ...resultValues,
              )
            : null

        const maximumResult =
          resultValues.length >
          0
            ? Math.max(
                ...resultValues,
              )
            : null

        const targetBracketed =
          minimumResult !==
            null &&
          maximumResult !==
            null &&
          parsedTarget >=
            minimumResult &&
          parsedTarget <=
            maximumResult

        return {
          targetValue:
            parsedTarget,
          points:
            orderedPoints,
          candidates,
          bestPoint:
            candidates[0] ??
            null,
          minimumResult,
          maximumResult,
          targetBracketed,
          trend:
            determineTrend(
              orderedPoints,
            ),
          resultLabel:
            nominalSolution
              .resultLabel,
          resultUnit:
            nominalSolution
              .unit,
        }
      },
      [
        baseQuery,
        isOpen,
        maximumInput,
        minimumInput,
        nominalSolution,
        resolution,
        selectedAssignment,
        targetValue,
      ],
    )

  const parsedTolerance =
    Number(
      tolerancePercent,
    )

  const bestWithinTolerance =
    Boolean(
      analysis
        ?.bestPoint &&
      Number.isFinite(
        parsedTolerance,
      ) &&
      (
        analysis
          .bestPoint
          .relativeError ===
        null
          ? analysis
              .bestPoint
              .absoluteError <=
            parsedTolerance
          : analysis
              .bestPoint
              .relativeError <=
            parsedTolerance
      ),
    )

  function selectVariable(
    symbol: string,
  ) {
    const assignment =
      assignments.find(
        (candidate) =>
          candidate.symbol ===
          symbol,
      )

    setSelectedSymbol(
      symbol,
    )

    setFeedbackMessage(
      '',
    )

    if (!assignment) {
      return
    }

    const scale =
      Math.abs(
        assignment.value,
      ) ||
      1

    setMinimumInput(
      String(
        assignment.value -
          scale *
            0.5,
      ),
    )

    setMaximumInput(
      String(
        assignment.value +
          scale *
            0.5,
      ),
    )
  }

  function useSuggestedTarget() {
    const numericValue =
      nominalSolution
        ?.numericValue

    if (
      typeof numericValue !==
        'number' ||
      !Number.isFinite(
        numericValue,
      )
    ) {
      return
    }

    setTargetValue(
      String(
        numericValue *
        1.1,
      ),
    )

    setFeedbackMessage(
      'Target set to 10% above the nominal result.',
    )
  }

  function resetSearchRange() {
    if (!selectedAssignment) {
      return
    }

    const scale =
      Math.abs(
        selectedAssignment
          .value,
      ) ||
      1

    setMinimumInput(
      String(
        selectedAssignment
          .value -
          scale *
            0.5,
      ),
    )

    setMaximumInput(
      String(
        selectedAssignment
          .value +
          scale *
            0.5,
      ),
    )

    setFeedbackMessage(
      'Search range reset to ±50% of the nominal input.',
    )
  }

  function applyTargetCase() {
    const bestPoint =
      analysis
        ?.bestPoint

    if (!bestPoint) {
      return
    }

    onApplyProblem(
      bestPoint.problem,
    )

    setFeedbackMessage(
      'Closest target operating point loaded into the main Solver.',
    )
  }

  async function copyTargetSummary() {
    const bestPoint =
      analysis
        ?.bestPoint

    if (
      !analysis ||
      !bestPoint
    ) {
      setFeedbackMessage(
        'No target-search result is available.',
      )
      return
    }

    const summary = [
      'ChemE Toolkit Target Operating Point',
      '',
      `Adjusted variable: ${selectedAssignment?.symbol ?? ''}`,
      `Search range: ${minimumInput} to ${maximumInput} ${selectedAssignment?.unit ?? ''}`,
      `Target output: ${formatEngineeringNumber(analysis.targetValue)} ${analysis.resultUnit}`,
      `Closest output: ${bestPoint.resultText}`,
      `Recommended input: ${formatEngineeringNumber(bestPoint.inputValue)} ${selectedAssignment?.unit ?? ''}`,
      `Absolute error: ${formatEngineeringNumber(bestPoint.absoluteError)} ${analysis.resultUnit}`,
      `Relative error: ${
        bestPoint.relativeError ===
        null
          ? 'Not available'
          : `${formatEngineeringNumber(bestPoint.relativeError)}%`
      }`,
      `Target bracketed: ${analysis.targetBracketed ? 'Yes' : 'No'}`,
      `Response trend: ${trendLabel(analysis.trend)}`,
      '',
      `Problem: ${bestPoint.problem}`,
    ].join(
      '\n',
    )

    try {
      await copyText(
        summary,
      )

      setFeedbackMessage(
        'Target operating-point summary copied.',
      )
    } catch {
      setFeedbackMessage(
        'Target summary could not be copied.',
      )
    }
  }

  function exportTargetCsv() {
    if (
      !analysis ||
      analysis.points.length ===
        0
    ) {
      setFeedbackMessage(
        'No target-search data is available.',
      )
      return
    }

    const rows = [
      [
        'Variable',
        'Input value',
        'Input unit',
        'Calculator',
        'Readiness percent',
        'Result label',
        'Result value',
        'Result unit',
        'Target value',
        'Absolute error',
        'Relative error percent',
        'Generated problem',
      ],
      ...analysis.points.map(
        (point) => [
          selectedAssignment
            ?.symbol ??
            '',
          String(
            point.inputValue,
          ),
          selectedAssignment
            ?.unit ??
            '',
          point.calculatorTitle,
          String(
            point.readinessPercent,
          ),
          point.resultLabel,
          String(
            point.resultValue,
          ),
          point.resultUnit,
          String(
            analysis.targetValue,
          ),
          String(
            point.absoluteError,
          ),
          point.relativeError ===
          null
            ? ''
            : String(
                point.relativeError,
              ),
          point.problem,
        ],
      ),
    ]

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                csvCell,
              )
              .join(','),
        )
        .join('\n')

    const blob =
      new Blob(
        [
          csv,
        ],
        {
          type:
            'text/csv;charset=utf-8',
        },
      )

    const objectUrl =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href =
      objectUrl

    link.download =
      `cheme-toolkit-${selectedAssignment?.symbol ?? 'input'}-target-search.csv`
        .replace(
          /[^a-z0-9._-]/gi,
          '-',
        )

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    window.setTimeout(
      () =>
        URL.revokeObjectURL(
          objectUrl,
        ),
      0,
    )

    setFeedbackMessage(
      'Target-search data exported as CSV.',
    )
  }

  return (
    <section
      className="target-operating-point-panel"
      data-open={
        isOpen
          ? 'true'
          : 'false'
      }
      aria-labelledby="target-operating-point-title"
    >
      <header className="target-operating-point-launcher">
        <div>
          <span>
            Inverse engineering search
          </span>

          <h3 id="target-operating-point-title">
            Target operating point finder
          </h3>

          <p>
            Define a desired output and find the known
            input value that produces the closest
            achievable result.
          </p>
        </div>

        <div className="target-operating-point-launcher-actions">
          <strong>
            {
              nominalSolution
                ? `${nominalSolution.resultLabel} = ${nominalSolution.resultValue}`
                : 'A Quick Solve result is required'
            }
          </strong>

          <button
            type="button"
            disabled={
              assignments.length ===
                0 ||
              !nominalSolution
            }
            aria-expanded={
              isOpen
            }
            onClick={() => {
              setIsOpen(
                (current) =>
                  !current,
              )

              setFeedbackMessage(
                '',
              )
            }}
          >
            {
              isOpen
                ? 'Close target finder'
                : 'Open target finder'
            }
          </button>
        </div>
      </header>

      {isOpen ? (
        assignments.length >
          0 &&
        nominalSolution ? (
          <div className="target-operating-point-content">
            <div className="target-operating-point-controls">
              <label>
                <span>
                  Adjust variable
                </span>

                <select
                  value={
                    selectedAssignment
                      ?.symbol ??
                    ''
                  }
                  onChange={(event) =>
                    selectVariable(
                      event.target.value,
                    )
                  }
                >
                  {assignments.map(
                    (assignment) => (
                      <option
                        key={
                          assignment.symbol
                        }
                        value={
                          assignment.symbol
                        }
                      >
                        {
                          assignment.symbol
                        }
                        {' = '}
                        {
                          formatEngineeringNumber(
                            assignment.value,
                          )
                        }
                        {
                          assignment.unit
                            ? ` ${assignment.unit}`
                            : ''
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span>
                  Minimum input
                </span>

                <input
                  type="number"
                  step="any"
                  value={
                    minimumInput
                  }
                  onChange={(event) =>
                    setMinimumInput(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Maximum input
                </span>

                <input
                  type="number"
                  step="any"
                  value={
                    maximumInput
                  }
                  onChange={(event) =>
                    setMaximumInput(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Desired output
                </span>

                <input
                  type="number"
                  step="any"
                  value={
                    targetValue
                  }
                  placeholder={
                    nominalSolution
                      .numericValue
                      .toString()
                  }
                  onChange={(event) =>
                    setTargetValue(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Search points
                </span>

                <select
                  value={
                    resolution
                  }
                  onChange={(event) =>
                    setResolution(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                >
                  <option value="41">
                    41
                  </option>

                  <option value="81">
                    81
                  </option>

                  <option value="121">
                    121
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Target tolerance
                </span>

                <div className="target-operating-point-percent">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      tolerancePercent
                    }
                    onChange={(event) =>
                      setTolerancePercent(
                        event.target.value,
                      )
                    }
                  />

                  <span>
                    %
                  </span>
                </div>
              </label>
            </div>

            <div className="target-operating-point-tools">
              <button
                type="button"
                onClick={
                  useSuggestedTarget
                }
              >
                Target nominal +10%
              </button>

              <button
                type="button"
                onClick={
                  resetSearchRange
                }
              >
                Reset range ±50%
              </button>
            </div>

            <div className="target-operating-point-summary">
              <article>
                <span>
                  Evaluated points
                </span>

                <strong>
                  {
                    analysis
                      ?.points
                      .length ??
                    0
                  }
                </strong>
              </article>

              <article>
                <span>
                  Target bracketed
                </span>

                <strong>
                  {
                    analysis
                      ?.targetBracketed
                      ? 'Yes'
                      : 'No'
                  }
                </strong>
              </article>

              <article>
                <span>
                  Closest output
                </span>

                <strong>
                  {
                    analysis
                      ?.bestPoint
                      ? `${analysis.bestPoint.resultText}`
                      : 'Not available'
                  }
                </strong>
              </article>

              <article>
                <span>
                  Recommended input
                </span>

                <strong>
                  {
                    analysis
                      ?.bestPoint
                      ? `${formatEngineeringNumber(analysis.bestPoint.inputValue)} ${selectedAssignment?.unit ?? ''}`.trim()
                      : 'Not available'
                  }
                </strong>
              </article>

              <article>
                <span>
                  Relative error
                </span>

                <strong>
                  {
                    analysis
                      ?.bestPoint
                      ?.relativeError ===
                    null ||
                    analysis
                      ?.bestPoint
                      ?.relativeError ===
                    undefined
                      ? 'Not available'
                      : `${formatEngineeringNumber(analysis.bestPoint.relativeError)}%`
                  }
                </strong>
              </article>
            </div>

            {analysis
              ?.bestPoint ? (
              <div
                className="target-operating-point-best"
                data-state={
                  bestWithinTolerance
                    ? 'matched'
                    : analysis
                        .targetBracketed
                      ? 'close'
                      : 'outside'
                }
              >
                <div>
                  <span>
                    Best operating point
                  </span>

                  <h4>
                    {
                      selectedAssignment
                        ?.symbol
                    }
                    {' = '}
                    {
                      formatEngineeringNumber(
                        analysis
                          .bestPoint
                          .inputValue,
                      )
                    }
                    {
                      selectedAssignment
                        ?.unit
                        ? ` ${selectedAssignment.unit}`
                        : ''
                    }
                  </h4>

                  <p>
                    {
                      analysis
                        .bestPoint
                        .resultLabel
                    }
                    {' = '}
                    {
                      analysis
                        .bestPoint
                        .resultText
                    }
                    {' · target '}
                    {
                      formatEngineeringNumber(
                        analysis
                          .targetValue,
                      )
                    }
                    {
                      analysis
                        .resultUnit
                        ? ` ${analysis.resultUnit}`
                        : ''
                    }
                  </p>
                </div>

                <div>
                  <strong>
                    {
                      bestWithinTolerance
                        ? 'Within tolerance'
                        : analysis
                            .targetBracketed
                          ? 'Closest sampled point'
                          : 'Target outside range'
                    }
                  </strong>

                  <span>
                    {
                      trendLabel(
                        analysis
                          .trend,
                      )
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div className="target-operating-point-empty">
                <strong>
                  Enter a valid target and search range
                </strong>

                <p>
                  The current calculator must return a
                  numeric Quick Solve result throughout
                  the selected range.
                </p>
              </div>
            )}

            {analysis &&
            analysis.candidates.length >
              0 ? (
              <div className="target-operating-point-candidates">
                <header>
                  <div>
                    <span>
                      Closest operating conditions
                    </span>

                    <h4>
                      Top five candidates
                    </h4>
                  </div>

                  <span>
                    Ordered by absolute target error
                  </span>
                </header>

                <div>
                  {analysis.candidates.map(
                    (
                      candidate,
                      index,
                    ) => {
                      const largestError =
                        Math.max(
                          ...analysis
                            .candidates
                            .map(
                              (point) =>
                                point.absoluteError,
                            ),
                          1e-12,
                        )

                      const quality =
                        Math.max(
                          4,
                          100 -
                            candidate.absoluteError /
                              largestError *
                              96,
                        )

                      return (
                        <article
                          key={
                            candidate.problem
                          }
                        >
                          <div className="target-candidate-rank">
                            <strong>
                              #{index + 1}
                            </strong>

                            <span>
                              {
                                candidate.readinessPercent
                              }%
                            </span>
                          </div>

                          <div className="target-candidate-values">
                            <strong>
                              {
                                selectedAssignment
                                  ?.symbol
                              }
                              {' = '}
                              {
                                formatEngineeringNumber(
                                  candidate.inputValue,
                                )
                              }
                              {
                                selectedAssignment
                                  ?.unit
                                  ? ` ${selectedAssignment.unit}`
                                  : ''
                              }
                            </strong>

                            <span>
                              {
                                candidate.resultLabel
                              }
                              {' = '}
                              {
                                candidate.resultText
                              }
                            </span>
                          </div>

                          <div className="target-candidate-error">
                            <strong>
                              {
                                candidate.relativeError ===
                                null
                                  ? formatEngineeringNumber(
                                      candidate.absoluteError,
                                    )
                                  : `${formatEngineeringNumber(candidate.relativeError)}%`
                              }
                            </strong>

                            <div>
                              <span
                                style={{
                                  width:
                                    `${quality}%`,
                                }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onApplyProblem(
                                candidate.problem,
                              )
                            }
                          >
                            Load case
                          </button>
                        </article>
                      )
                    },
                  )}
                </div>
              </div>
            ) : null}

            {feedbackMessage ? (
              <p
                className="target-operating-point-feedback"
                role="status"
              >
                {feedbackMessage}
              </p>
            ) : null}

            <footer className="target-operating-point-actions">
              <div>
                <button
                  type="button"
                  disabled={
                    !analysis
                      ?.bestPoint
                  }
                  onClick={
                    copyTargetSummary
                  }
                >
                  Copy target summary
                </button>

                <button
                  type="button"
                  disabled={
                    !analysis ||
                    analysis
                      .points
                      .length ===
                      0
                  }
                  onClick={
                    exportTargetCsv
                  }
                >
                  Export search CSV
                </button>
              </div>

              <button
                type="button"
                className="is-primary"
                disabled={
                  !analysis
                    ?.bestPoint
                }
                onClick={
                  applyTargetCase
                }
              >
                Use closest operating point →
              </button>
            </footer>
          </div>
        ) : (
          <div className="target-operating-point-empty">
            <strong>
              A numeric Quick Solve result is required
            </strong>

            <p>
              Complete the main problem before opening
              the inverse operating-point search.
            </p>
          </div>
        )
      ) : null}
    </section>
  )
}
