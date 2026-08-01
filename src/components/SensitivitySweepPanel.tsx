import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  calculators,
} from '../data/calculators'
import {
  rankProblemSolvers,
} from '../features/problem-solver/problemSolverEngine'

import '../styles/sensitivity-sweep-panel.css'

interface SensitivitySweepPanelProps {
  isOpen: boolean
  baseQuery: string
  onClose: () => void
  onUseProblem: (
    problem: string,
  ) => void
}

interface NumericAssignment {
  symbol: string
  value: number
  unit: string
}

interface SweepPoint {
  inputValue: number
  problem: string
  resultValue:
    number | null
  resultText: string
  resultLabel: string
  resultUnit: string
  calculatorTitle: string
  readinessPercent: number
}

interface ChartData {
  polyline: string
  circles: Array<{
    x: number
    y: number
    point: SweepPoint
  }>
  minimumInput: number
  maximumInput: number
  minimumResult: number
  maximumResult: number
}

const NUMBER_PATTERN =
  '-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?'

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
        4,
      )
  }

  return Number(
    value.toPrecision(
      7,
    ),
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        8,
    },
  )
}

function formatInputValue(
  value: number,
): string {
  return Number(
    value.toPrecision(
      10,
    ),
  ).toString()
}

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

    const unit =
      match[3]
        .trim()
        .replace(
          /\s+/g,
          ' ',
        )

    assignments.push({
      symbol,
      value,
      unit,
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

  const replacementValue =
    formatInputValue(
      nextValue,
    )

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
          `$1${symbol}$2${replacementValue}`,
        )
      },
    )
    .join('')
}

function defaultRange(
  value: number,
): {
  start: number
  end: number
} {
  if (value === 0) {
    return {
      start:
        -1,
      end:
        1,
    }
  }

  const first =
    value *
    0.75

  const second =
    value *
    1.25

  return {
    start:
      Math.min(
        first,
        second,
      ),
    end:
      Math.max(
        first,
        second,
      ),
  }
}

function csvCell(
  value: string,
): string {
  return `"${value.replace(
    /"/g,
    '""',
  )}"`
}

export function SensitivitySweepPanel({
  isOpen,
  baseQuery,
  onClose,
  onUseProblem,
}: SensitivitySweepPanelProps) {
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

  const firstAssignment =
    assignments[0]

  const firstRange =
    defaultRange(
      firstAssignment
        ?.value ??
        1,
    )

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState(
    firstAssignment
      ?.symbol ??
      '',
  )

  const [
    startValue,
    setStartValue,
  ] = useState(
    formatInputValue(
      firstRange.start,
    ),
  )

  const [
    endValue,
    setEndValue,
  ] = useState(
    formatInputValue(
      firstRange.end,
    ),
  )

  const [
    pointCount,
    setPointCount,
  ] = useState(7)

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  useEffect(
    () => {
      if (
        assignments.length ===
        0
      ) {
        setSelectedSymbol(
          '',
        )
        return
      }

      const selectedStillExists =
        assignments.some(
          (assignment) =>
            assignment.symbol ===
            selectedSymbol,
        )

      if (
        selectedStillExists
      ) {
        return
      }

      const nextAssignment =
        assignments[0]

      const range =
        defaultRange(
          nextAssignment.value,
        )

      setSelectedSymbol(
        nextAssignment.symbol,
      )

      setStartValue(
        formatInputValue(
          range.start,
        ),
      )

      setEndValue(
        formatInputValue(
          range.end,
        ),
      )
    },
    [
      assignments,
      selectedSymbol,
    ],
  )

  const selectedAssignment =
    assignments.find(
      (assignment) =>
        assignment.symbol ===
        selectedSymbol,
    )

  const sweepPoints =
    useMemo(
      () => {
        const numericStart =
          Number(
            startValue,
          )

        const numericEnd =
          Number(
            endValue,
          )

        const safeCount =
          Math.max(
            3,
            Math.min(
              15,
              Math.round(
                pointCount,
              ),
            ),
          )

        if (
          !selectedSymbol ||
          !Number.isFinite(
            numericStart,
          ) ||
          !Number.isFinite(
            numericEnd,
          ) ||
          numericStart ===
            numericEnd
        ) {
          return []
        }

        return Array.from(
          {
            length:
              safeCount,
          },
          (
            _,
            index,
          ): SweepPoint => {
            const fraction =
              safeCount ===
              1
                ? 0
                : index /
                  (
                    safeCount -
                    1
                  )

            const inputValue =
              numericStart +
              (
                numericEnd -
                numericStart
              ) *
              fraction

            const problem =
              replaceNumericAssignment(
                baseQuery,
                selectedSymbol,
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

            const hasNumericResult =
              typeof numericResult ===
                'number' &&
              Number.isFinite(
                numericResult,
              )

            return {
              inputValue,
              problem,
              resultValue:
                hasNumericResult
                  ? numericResult
                  : null,
              resultText:
                quickSolution
                  ?.resultValue ??
                'Not solved',
              resultLabel:
                quickSolution
                  ?.resultLabel ??
                'Result',
              resultUnit:
                quickSolution
                  ?.unit ??
                '',
              calculatorTitle:
                match
                  ?.title ??
                'No calculator match',
              readinessPercent:
                match
                  ?.equationContext
                  .readinessPercent ??
                0,
            }
          },
        )
      },
      [
        baseQuery,
        endValue,
        pointCount,
        selectedSymbol,
        startValue,
      ],
    )

  const validPoints =
    sweepPoints.filter(
      (
        point,
      ): point is
        SweepPoint & {
          resultValue: number
        } =>
        point.resultValue !==
        null,
    )

  const minimumPoint =
    validPoints.length >
    0
      ? validPoints.reduce(
          (
            currentMinimum,
            point,
          ) =>
            point.resultValue <
            currentMinimum.resultValue
              ? point
              : currentMinimum,
        )
      : null

  const maximumPoint =
    validPoints.length >
    0
      ? validPoints.reduce(
          (
            currentMaximum,
            point,
          ) =>
            point.resultValue >
            currentMaximum.resultValue
              ? point
              : currentMaximum,
        )
      : null

  const chartData:
    ChartData | null =
      useMemo(
        () => {
          if (
            validPoints.length <
            2
          ) {
            return null
          }

          const width =
            640

          const height =
            260

          const horizontalPadding =
            48

          const verticalPadding =
            32

          const inputValues =
            validPoints.map(
              (point) =>
                point.inputValue,
            )

          const resultValues =
            validPoints.map(
              (point) =>
                point.resultValue,
            )

          const minimumInput =
            Math.min(
              ...inputValues,
            )

          const maximumInput =
            Math.max(
              ...inputValues,
            )

          const minimumResult =
            Math.min(
              ...resultValues,
            )

          const maximumResult =
            Math.max(
              ...resultValues,
            )

          const inputRange =
            maximumInput -
              minimumInput ||
            1

          const resultRange =
            maximumResult -
              minimumResult ||
            1

          const circles =
            validPoints.map(
              (point) => {
                const x =
                  horizontalPadding +
                  (
                    (
                      point.inputValue -
                      minimumInput
                    ) /
                    inputRange
                  ) *
                  (
                    width -
                    2 *
                      horizontalPadding
                  )

                const y =
                  height -
                  verticalPadding -
                  (
                    (
                      point.resultValue -
                      minimumResult
                    ) /
                    resultRange
                  ) *
                  (
                    height -
                    2 *
                      verticalPadding
                  )

                return {
                  x,
                  y,
                  point,
                }
              },
            )

          return {
            polyline:
              circles
                .map(
                  (circle) =>
                    `${circle.x},${circle.y}`,
                )
                .join(' '),
            circles,
            minimumInput,
            maximumInput,
            minimumResult,
            maximumResult,
          }
        },
        [
          validPoints,
        ],
      )

  if (!isOpen) {
    return null
  }

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

    const range =
      defaultRange(
        assignment.value,
      )

    setStartValue(
      formatInputValue(
        range.start,
      ),
    )

    setEndValue(
      formatInputValue(
        range.end,
      ),
    )
  }

  function resetRange() {
    if (!selectedAssignment) {
      return
    }

    const range =
      defaultRange(
        selectedAssignment.value,
      )

    setStartValue(
      formatInputValue(
        range.start,
      ),
    )

    setEndValue(
      formatInputValue(
        range.end,
      ),
    )

    setPointCount(
      7,
    )

    setFeedbackMessage(
      'Default ±25% sweep restored.',
    )
  }

  function downloadCsv() {
    if (
      sweepPoints.length ===
      0
    ) {
      setFeedbackMessage(
        'Create a valid sweep before exporting.',
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
        'Generated problem',
      ],
      ...sweepPoints.map(
        (point) => [
          selectedSymbol,
          formatInputValue(
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
          point.resultText,
          point.resultUnit,
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
                (cell) =>
                  csvCell(
                    cell,
                  ),
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
      `cheme-toolkit-${selectedSymbol || 'variable'}-sensitivity.csv`
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
      'Sensitivity data exported as CSV.',
    )
  }

  function applySweepPoint(
    point:
      SweepPoint | null,
    label: string,
  ) {
    if (!point) {
      return
    }

    onUseProblem(
      point.problem,
    )

    setFeedbackMessage(
      `${label} loaded into the main solver.`,
    )

    onClose()
  }

  return (
    <section
      className="sensitivity-sweep-panel"
      aria-labelledby="sensitivity-sweep-title"
    >
      <header className="sensitivity-sweep-header">
        <div>
          <span>
            Parametric engineering analysis
          </span>

          <h3 id="sensitivity-sweep-title">
            Sensitivity sweep
          </h3>

          <p>
            Vary one known input while ChemE Toolkit
            recalculates every operating point.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          Close sweep
        </button>
      </header>

      {assignments.length > 0 ? (
        <>
          <div className="sensitivity-sweep-controls">
            <label>
              <span>
                Variable
              </span>

              <select
                value={
                  selectedSymbol
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
                Start value
              </span>

              <input
                type="number"
                step="any"
                value={
                  startValue
                }
                onChange={(event) => {
                  setStartValue(
                    event.target.value,
                  )

                  setFeedbackMessage(
                    '',
                  )
                }}
              />
            </label>

            <label>
              <span>
                End value
              </span>

              <input
                type="number"
                step="any"
                value={
                  endValue
                }
                onChange={(event) => {
                  setEndValue(
                    event.target.value,
                  )

                  setFeedbackMessage(
                    '',
                  )
                }}
              />
            </label>

            <label>
              <span>
                Sweep points
              </span>

              <select
                value={
                  pointCount
                }
                onChange={(event) =>
                  setPointCount(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              >
                {[
                  5,
                  7,
                  9,
                  11,
                  15,
                ].map(
                  (count) => (
                    <option
                      key={
                        count
                      }
                      value={
                        count
                      }
                    >
                      {count}
                    </option>
                  ),
                )}
              </select>
            </label>

            <button
              type="button"
              onClick={
                resetRange
              }
            >
              Reset ±25%
            </button>
          </div>

          <div className="sensitivity-sweep-summary">
            <article>
              <span>
                Base variable
              </span>

              <strong>
                {
                  selectedAssignment
                    ? `${selectedAssignment.symbol} = ${formatEngineeringNumber(selectedAssignment.value)}${selectedAssignment.unit ? ` ${selectedAssignment.unit}` : ''}`
                    : 'Not selected'
                }
              </strong>
            </article>

            <article>
              <span>
                Solvable points
              </span>

              <strong>
                {validPoints.length}
                {' / '}
                {sweepPoints.length}
              </strong>
            </article>

            <article>
              <span>
                Minimum result
              </span>

              <strong>
                {
                  minimumPoint
                    ? `${minimumPoint.resultLabel} = ${minimumPoint.resultText}`
                    : 'Not available'
                }
              </strong>
            </article>

            <article>
              <span>
                Maximum result
              </span>

              <strong>
                {
                  maximumPoint
                    ? `${maximumPoint.resultLabel} = ${maximumPoint.resultText}`
                    : 'Not available'
                }
              </strong>
            </article>
          </div>

          <div className="sensitivity-sweep-visual">
            <div className="sensitivity-sweep-chart-header">
              <div>
                <span>
                  Response curve
                </span>

                <h4>
                  {
                    selectedSymbol ||
                    'Input'
                  }
                  {' versus '}
                  {
                    validPoints[0]
                      ?.resultLabel ??
                    'calculated result'
                  }
                </h4>
              </div>

              <span>
                {
                  selectedAssignment
                    ?.unit ||
                  'dimensionless input'
                }
              </span>
            </div>

            {chartData ? (
              <div className="sensitivity-sweep-chart">
                <svg
                  viewBox="0 0 640 260"
                  role="img"
                  aria-label="Sensitivity sweep response chart"
                >
                  <line
                    x1="48"
                    y1="228"
                    x2="610"
                    y2="228"
                    className="sensitivity-axis"
                  />

                  <line
                    x1="48"
                    y1="32"
                    x2="48"
                    y2="228"
                    className="sensitivity-axis"
                  />

                  <polyline
                    points={
                      chartData.polyline
                    }
                    className="sensitivity-line"
                  />

                  {chartData.circles.map(
                    (
                      circle,
                      index,
                    ) => (
                      <g
                        key={
                          circle.point.problem
                        }
                      >
                        <circle
                          cx={
                            circle.x
                          }
                          cy={
                            circle.y
                          }
                          r="5"
                          className="sensitivity-point"
                        />

                        <title>
                          {
                            selectedSymbol
                          }
                          {' = '}
                          {
                            formatEngineeringNumber(
                              circle
                                .point
                                .inputValue,
                            )
                          }
                          {'; '}
                          {
                            circle
                              .point
                              .resultLabel
                          }
                          {' = '}
                          {
                            circle
                              .point
                              .resultText
                          }
                        </title>

                        {(
                          index ===
                            0 ||
                          index ===
                            chartData
                              .circles
                              .length -
                              1
                        ) ? (
                          <text
                            x={
                              circle.x
                            }
                            y="247"
                            textAnchor={
                              index ===
                              0
                                ? 'start'
                                : 'end'
                            }
                          >
                            {
                              formatEngineeringNumber(
                                circle
                                  .point
                                  .inputValue,
                              )
                            }
                          </text>
                        ) : null}
                      </g>
                    ),
                  )}

                  <text
                    x="52"
                    y="24"
                    textAnchor="start"
                  >
                    {
                      formatEngineeringNumber(
                        chartData
                          .maximumResult,
                      )
                    }
                  </text>

                  <text
                    x="52"
                    y="220"
                    textAnchor="start"
                  >
                    {
                      formatEngineeringNumber(
                        chartData
                          .minimumResult,
                      )
                    }
                  </text>
                </svg>
              </div>
            ) : (
              <div className="sensitivity-sweep-chart-empty">
                <strong>
                  A response curve is not available yet
                </strong>

                <p>
                  Use a valid numeric range and a problem
                  supported by Quick Solve.
                </p>
              </div>
            )}
          </div>

          <div className="sensitivity-sweep-table-wrap">
            <table className="sensitivity-sweep-table">
              <thead>
                <tr>
                  <th>
                    Point
                  </th>

                  <th>
                    {
                      selectedSymbol ||
                      'Input'
                    }
                  </th>

                  <th>
                    Calculator
                  </th>

                  <th>
                    Readiness
                  </th>

                  <th>
                    Result
                  </th>
                </tr>
              </thead>

              <tbody>
                {sweepPoints.map(
                  (
                    point,
                    index,
                  ) => (
                    <tr
                      key={
                        point.problem
                      }
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {
                          formatEngineeringNumber(
                            point.inputValue,
                          )
                        }
                        {
                          selectedAssignment
                            ?.unit
                            ? ` ${selectedAssignment.unit}`
                            : ''
                        }
                      </td>

                      <td>
                        {
                          point.calculatorTitle
                        }
                      </td>

                      <td>
                        {
                          point.readinessPercent
                        }%
                      </td>

                      <td>
                        {
                          point.resultValue ===
                          null
                            ? 'Not solved'
                            : `${point.resultLabel} = ${point.resultText}`
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {feedbackMessage ? (
            <p
              className="sensitivity-sweep-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          <footer className="sensitivity-sweep-actions">
            <div>
              <button
                type="button"
                onClick={
                  downloadCsv
                }
              >
                Export CSV
              </button>

              <button
                type="button"
                disabled={
                  !minimumPoint
                }
                onClick={() =>
                  applySweepPoint(
                    minimumPoint,
                    'Minimum-result case',
                  )
                }
              >
                Use minimum case
              </button>

              <button
                type="button"
                disabled={
                  !maximumPoint
                }
                onClick={() =>
                  applySweepPoint(
                    maximumPoint,
                    'Maximum-result case',
                  )
                }
              >
                Use maximum case
              </button>
            </div>

            <span>
              Every point is solved locally in this browser.
            </span>
          </footer>
        </>
      ) : (
        <div className="sensitivity-sweep-empty">
          <strong>
            No numeric input assignments detected
          </strong>

          <p>
            Add values such as P=101325 Pa, T=300 K or
            v=2 m/s to the main problem first.
          </p>
        </div>
      )}
    </section>
  )
}
