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

import '../styles/design-envelope-panel.css'

interface DesignEnvelopePanelProps {
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

interface EnvelopePoint {
  id: string
  row: number
  column: number
  xValue: number
  yValue: number
  problem: string
  calculatorTitle: string
  readinessPercent: number
  resultValue:
    number | null
  resultText: string
  resultLabel: string
  resultUnit: string
}

interface ComparableEnvelopePoint
  extends EnvelopePoint {
  resultValue: number
  intensity: number
}

interface EnvelopeAnalysis {
  gridSize: number
  points: EnvelopePoint[]
  comparablePoints:
    ComparableEnvelopePoint[]
  minimumPoint:
    ComparableEnvelopePoint | null
  maximumPoint:
    ComparableEnvelopePoint | null
  minimumResult:
    number | null
  maximumResult:
    number | null
  outputLabel: string
  outputUnit: string
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

function createRange(
  nominalValue: number,
  percentage:
    number,
  count: number,
): number[] {
  const scale =
    Math.abs(
      nominalValue,
    ) ||
    1

  const halfRange =
    scale *
    percentage /
    100

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

      return nominalValue -
        halfRange +
        2 *
          halfRange *
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

export function DesignEnvelopePanel({
  baseQuery,
  initiallyOpen = false,
  onApplyProblem,
}: DesignEnvelopePanelProps) {
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

  const [
    xSymbol,
    setXSymbol,
  ] = useState(
    assignments[0]
      ?.symbol ??
      '',
  )

  const [
    ySymbol,
    setYSymbol,
  ] = useState(
    assignments[1]
      ?.symbol ??
      '',
  )

  const [
    xRangePercent,
    setXRangePercent,
  ] = useState('20')

  const [
    yRangePercent,
    setYRangePercent,
  ] = useState('20')

  const [
    gridSize,
    setGridSize,
  ] = useState(5)

  const [
    selectedPointId,
    setSelectedPointId,
  ] = useState('')

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  useEffect(
    () => {
      if (
        assignments.length <
        2
      ) {
        setXSymbol(
          assignments[0]
            ?.symbol ??
            '',
        )

        setYSymbol('')

        return
      }

      const validX =
        assignments.some(
          (assignment) =>
            assignment.symbol ===
            xSymbol,
        )

      const nextX =
        validX
          ? xSymbol
          : assignments[0]
              .symbol

      const validY =
        assignments.some(
          (assignment) =>
            assignment.symbol ===
              ySymbol &&
            assignment.symbol !==
              nextX,
        )

      const nextY =
        validY
          ? ySymbol
          : assignments.find(
              (assignment) =>
                assignment.symbol !==
                nextX,
            )
              ?.symbol ??
            ''

      if (
        nextX !==
        xSymbol
      ) {
        setXSymbol(
          nextX,
        )
      }

      if (
        nextY !==
        ySymbol
      ) {
        setYSymbol(
          nextY,
        )
      }
    },
    [
      assignments,
      xSymbol,
      ySymbol,
    ],
  )

  const xAssignment =
    assignments.find(
      (assignment) =>
        assignment.symbol ===
        xSymbol,
    )

  const yAssignment =
    assignments.find(
      (assignment) =>
        assignment.symbol ===
        ySymbol,
    )

  const analysis =
    useMemo<
      EnvelopeAnalysis | null
    >(
      () => {
        if (
          !isOpen ||
          !xAssignment ||
          !yAssignment ||
          xAssignment.symbol ===
            yAssignment.symbol
        ) {
          return null
        }

        const parsedXRange =
          Number(
            xRangePercent,
          )

        const parsedYRange =
          Number(
            yRangePercent,
          )

        if (
          !Number.isFinite(
            parsedXRange,
          ) ||
          !Number.isFinite(
            parsedYRange,
          ) ||
          parsedXRange <=
            0 ||
          parsedYRange <=
            0
        ) {
          return null
        }

        const safeGridSize =
          Math.max(
            3,
            Math.min(
              9,
              Math.round(
                gridSize,
              ),
            ),
          )

        const xValues =
          createRange(
            xAssignment.value,
            Math.min(
              100,
              parsedXRange,
            ),
            safeGridSize,
          )

        const yValues =
          createRange(
            yAssignment.value,
            Math.min(
              100,
              parsedYRange,
            ),
            safeGridSize,
          ).reverse()

        const points:
          EnvelopePoint[] = []

        for (
          let row =
            0;
          row <
          yValues.length;
          row +=
            1
        ) {
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

            const yValue =
              yValues[
                row
              ]

            const firstProblem =
              replaceNumericAssignment(
                baseQuery,
                xAssignment.symbol,
                xValue,
              )

            const problem =
              replaceNumericAssignment(
                firstProblem,
                yAssignment.symbol,
                yValue,
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

            const numericValue =
              quickSolution
                ?.numericValue

            points.push({
              id:
                `${row}-${column}`,
              row,
              column,
              xValue,
              yValue,
              problem,
              calculatorTitle:
                match
                  ?.title ??
                'No calculator match',
              readinessPercent:
                match
                  ?.equationContext
                  .readinessPercent ??
                0,
              resultValue:
                typeof numericValue ===
                  'number' &&
                Number.isFinite(
                  numericValue,
                )
                  ? numericValue
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
            })
          }
        }

        const firstSolvedPoint =
          points.find(
            (point) =>
              point.resultValue !==
              null,
          )

        if (!firstSolvedPoint) {
          return {
            gridSize:
              safeGridSize,
            points,
            comparablePoints:
              [],
            minimumPoint:
              null,
            maximumPoint:
              null,
            minimumResult:
              null,
            maximumResult:
              null,
            outputLabel:
              'Result',
            outputUnit:
              '',
          }
        }

        const comparableBase =
          points.filter(
            (
              point,
            ): point is
              EnvelopePoint & {
                resultValue: number
              } =>
              point.resultValue !==
                null &&
              point.resultLabel ===
                firstSolvedPoint
                  .resultLabel &&
              point.resultUnit ===
                firstSolvedPoint
                  .resultUnit,
          )

        const resultValues =
          comparableBase.map(
            (point) =>
              point.resultValue,
          )

        const minimumResult =
          Math.min(
            ...resultValues,
          )

        const maximumResult =
          Math.max(
            ...resultValues,
          )

        const resultRange =
          maximumResult -
            minimumResult ||
          1

        const comparablePoints:
          ComparableEnvelopePoint[] =
            comparableBase.map(
              (point) => ({
                ...point,
                intensity:
                  (
                    point.resultValue -
                    minimumResult
                  ) /
                  resultRange,
              }),
            )

        const minimumPoint =
          comparablePoints.reduce(
            (
              currentMinimum,
              point,
            ) =>
              point.resultValue <
              currentMinimum.resultValue
                ? point
                : currentMinimum,
          )

        const maximumPoint =
          comparablePoints.reduce(
            (
              currentMaximum,
              point,
            ) =>
              point.resultValue >
              currentMaximum.resultValue
                ? point
                : currentMaximum,
          )

        return {
          gridSize:
            safeGridSize,
          points,
          comparablePoints,
          minimumPoint,
          maximumPoint,
          minimumResult,
          maximumResult,
          outputLabel:
            firstSolvedPoint
              .resultLabel,
          outputUnit:
            firstSolvedPoint
              .resultUnit,
        }
      },
      [
        baseQuery,
        gridSize,
        isOpen,
        xAssignment,
        xRangePercent,
        yAssignment,
        yRangePercent,
      ],
    )

  const comparablePointMap =
    useMemo(
      () =>
        new Map(
          (
            analysis
              ?.comparablePoints ??
            []
          ).map(
            (point) => [
              point.id,
              point,
            ],
          ),
        ),
      [
        analysis,
      ],
    )

  const selectedPoint =
    selectedPointId
      ? comparablePointMap.get(
          selectedPointId,
        ) ??
        null
      : null

  const solvedPointCount =
    analysis
      ?.comparablePoints
      .length ??
    0

  const totalPointCount =
    analysis
      ?.points
      .length ??
    0

  const resultSpread =
    analysis
      ?.minimumResult !==
        null &&
    analysis
      ?.minimumResult !==
        undefined &&
    analysis
      ?.maximumResult !==
        null &&
    analysis
      ?.maximumResult !==
        undefined
      ? analysis.maximumResult -
        analysis.minimumResult
      : null

  function applyEnvelopePoint(
    point:
      ComparableEnvelopePoint | null,
    label: string,
  ) {
    if (!point) {
      return
    }

    onApplyProblem(
      point.problem,
    )

    setFeedbackMessage(
      `${label} loaded into the main Solver.`,
    )
  }

  async function copyEnvelopeSummary() {
    if (
      !analysis ||
      analysis.comparablePoints.length ===
        0
    ) {
      setFeedbackMessage(
        'No solved design-envelope points are available.',
      )
      return
    }

    const summary = [
      'ChemE Toolkit Design Envelope',
      '',
      `X variable: ${xAssignment?.symbol ?? ''}`,
      `Y variable: ${yAssignment?.symbol ?? ''}`,
      `Grid: ${analysis.gridSize} x ${analysis.gridSize}`,
      `Solved points: ${solvedPointCount}/${totalPointCount}`,
      `Output: ${analysis.outputLabel}`,
      '',
      `Minimum: ${formatEngineeringNumber(analysis.minimumResult ?? Number.NaN)} ${analysis.outputUnit}`,
      `Maximum: ${formatEngineeringNumber(analysis.maximumResult ?? Number.NaN)} ${analysis.outputUnit}`,
      `Spread: ${formatEngineeringNumber(resultSpread ?? Number.NaN)} ${analysis.outputUnit}`,
      '',
      analysis.minimumPoint
        ? `Minimum case: ${analysis.minimumPoint.problem}`
        : '',
      analysis.maximumPoint
        ? `Maximum case: ${analysis.maximumPoint.problem}`
        : '',
    ]
      .filter(
        Boolean,
      )
      .join(
        '\n',
      )

    try {
      await copyText(
        summary,
      )

      setFeedbackMessage(
        'Design-envelope summary copied.',
      )
    } catch {
      setFeedbackMessage(
        'Design-envelope summary could not be copied.',
      )
    }
  }

  function exportEnvelopeCsv() {
    if (
      !analysis ||
      analysis.points.length ===
        0
    ) {
      setFeedbackMessage(
        'No design-envelope data is available.',
      )
      return
    }

    const rows = [
      [
        'Row',
        'Column',
        'X variable',
        'X value',
        'X unit',
        'Y variable',
        'Y value',
        'Y unit',
        'Calculator',
        'Readiness percent',
        'Result label',
        'Result value',
        'Result unit',
        'Generated problem',
      ],
      ...analysis.points.map(
        (point) => [
          String(
            point.row +
            1,
          ),
          String(
            point.column +
            1,
          ),
          xAssignment
            ?.symbol ??
            '',
          String(
            point.xValue,
          ),
          xAssignment
            ?.unit ??
            '',
          yAssignment
            ?.symbol ??
            '',
          String(
            point.yValue,
          ),
          yAssignment
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
      `cheme-toolkit-${xSymbol}-${ySymbol}-design-envelope.csv`
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
      'Design-envelope data exported as CSV.',
    )
  }

  return (
    <section
      className="design-envelope-panel"
      data-open={
        isOpen
          ? 'true'
          : 'false'
      }
      aria-labelledby="design-envelope-title"
    >
      <header className="design-envelope-launcher">
        <div>
          <span>
            Two-variable operating study
          </span>

          <h3 id="design-envelope-title">
            Design envelope explorer
          </h3>

          <p>
            Change two known inputs simultaneously and
            map the calculated operating window.
          </p>
        </div>

        <div className="design-envelope-launcher-actions">
          <strong>
            {
              assignments.length >=
              2
                ? `${assignments.length} numeric inputs detected`
                : 'Two numeric inputs required'
            }
          </strong>

          <button
            type="button"
            disabled={
              assignments.length <
              2
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
                ? 'Close design envelope'
                : 'Open design envelope'
            }
          </button>
        </div>
      </header>

      {isOpen ? (
        assignments.length >=
        2 ? (
          <div className="design-envelope-content">
            <div className="design-envelope-controls">
              <label>
                <span>
                  Horizontal variable
                </span>

                <select
                  value={
                    xSymbol
                  }
                  onChange={(event) => {
                    const nextSymbol =
                      event.target.value

                    setXSymbol(
                      nextSymbol,
                    )

                    if (
                      nextSymbol ===
                      ySymbol
                    ) {
                      setYSymbol(
                        assignments.find(
                          (assignment) =>
                            assignment.symbol !==
                            nextSymbol,
                        )
                          ?.symbol ??
                          '',
                      )
                    }

                    setSelectedPointId(
                      '',
                    )
                  }}
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
                  Horizontal range
                </span>

                <div className="design-envelope-percent-input">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={
                      xRangePercent
                    }
                    onChange={(event) => {
                      setXRangePercent(
                        event.target.value,
                      )

                      setSelectedPointId(
                        '',
                      )
                    }}
                  />

                  <span>
                    ±%
                  </span>
                </div>
              </label>

              <label>
                <span>
                  Vertical variable
                </span>

                <select
                  value={
                    ySymbol
                  }
                  onChange={(event) => {
                    const nextSymbol =
                      event.target.value

                    setYSymbol(
                      nextSymbol,
                    )

                    if (
                      nextSymbol ===
                      xSymbol
                    ) {
                      setXSymbol(
                        assignments.find(
                          (assignment) =>
                            assignment.symbol !==
                            nextSymbol,
                        )
                          ?.symbol ??
                          '',
                      )
                    }

                    setSelectedPointId(
                      '',
                    )
                  }}
                >
                  {assignments
                    .filter(
                      (assignment) =>
                        assignment.symbol !==
                        xSymbol,
                    )
                    .map(
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
                  Vertical range
                </span>

                <div className="design-envelope-percent-input">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={
                      yRangePercent
                    }
                    onChange={(event) => {
                      setYRangePercent(
                        event.target.value,
                      )

                      setSelectedPointId(
                        '',
                      )
                    }}
                  />

                  <span>
                    ±%
                  </span>
                </div>
              </label>

              <label>
                <span>
                  Grid resolution
                </span>

                <select
                  value={
                    gridSize
                  }
                  onChange={(event) => {
                    setGridSize(
                      Number(
                        event.target.value,
                      ),
                    )

                    setSelectedPointId(
                      '',
                    )
                  }}
                >
                  <option value="5">
                    5 × 5
                  </option>

                  <option value="7">
                    7 × 7
                  </option>

                  <option value="9">
                    9 × 9
                  </option>
                </select>
              </label>
            </div>

            <div className="design-envelope-summary">
              <article>
                <span>
                  Evaluated points
                </span>

                <strong>
                  {totalPointCount}
                </strong>
              </article>

              <article>
                <span>
                  Solved points
                </span>

                <strong>
                  {solvedPointCount}
                </strong>
              </article>

              <article>
                <span>
                  Minimum output
                </span>

                <strong>
                  {
                    analysis
                      ?.minimumResult ===
                      null ||
                    analysis
                      ?.minimumResult ===
                      undefined
                      ? 'Not available'
                      : `${formatEngineeringNumber(analysis.minimumResult)} ${analysis.outputUnit}`.trim()
                  }
                </strong>
              </article>

              <article>
                <span>
                  Maximum output
                </span>

                <strong>
                  {
                    analysis
                      ?.maximumResult ===
                      null ||
                    analysis
                      ?.maximumResult ===
                      undefined
                      ? 'Not available'
                      : `${formatEngineeringNumber(analysis.maximumResult)} ${analysis.outputUnit}`.trim()
                  }
                </strong>
              </article>

              <article>
                <span>
                  Output spread
                </span>

                <strong>
                  {
                    resultSpread ===
                    null
                      ? 'Not available'
                      : `${formatEngineeringNumber(resultSpread)} ${analysis?.outputUnit ?? ''}`.trim()
                  }
                </strong>
              </article>
            </div>

            {analysis &&
            analysis.points.length >
              0 ? (
              <div className="design-envelope-map-section">
                <header>
                  <div>
                    <span>
                      Operating-window heat map
                    </span>

                    <h4>
                      {
                        analysis.outputLabel
                      }
                      {
                        analysis.outputUnit
                          ? ` (${analysis.outputUnit})`
                          : ''
                      }
                    </h4>
                  </div>

                  <div className="design-envelope-legend">
                    <span>
                      Minimum
                    </span>

                    <div />

                    <span>
                      Maximum
                    </span>
                  </div>
                </header>

                <div className="design-envelope-axis-layout">
                  <div className="design-envelope-y-axis">
                    <strong>
                      {
                        yAssignment
                          ?.symbol
                      }
                    </strong>

                    <span>
                      {
                        yAssignment
                          ?.unit ||
                        'dimensionless'
                      }
                    </span>
                  </div>

                  <div>
                    <div
                      className="design-envelope-grid"
                      style={{
                        gridTemplateColumns:
                          `repeat(${analysis.gridSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {analysis.points.map(
                        (point) => {
                          const comparablePoint =
                            comparablePointMap.get(
                              point.id,
                            )

                          const isSelected =
                            point.id ===
                            selectedPointId

                          const background =
                            comparablePoint
                              ? `rgba(7, 156, 153, ${0.12 + comparablePoint.intensity * 0.72})`
                              : 'rgba(187, 82, 65, 0.07)'

                          return (
                            <button
                              key={
                                point.id
                              }
                              type="button"
                              className={
                                isSelected
                                  ? 'is-selected'
                                  : undefined
                              }
                              disabled={
                                !comparablePoint
                              }
                              style={{
                                background,
                              }}
                              title={
                                comparablePoint
                                  ? `${xAssignment?.symbol}=${formatEngineeringNumber(point.xValue)}, ${yAssignment?.symbol}=${formatEngineeringNumber(point.yValue)}, ${point.resultLabel}=${point.resultText}`
                                  : 'This operating point was not solved.'
                              }
                              onClick={() =>
                                setSelectedPointId(
                                  point.id,
                                )
                              }
                            >
                              <strong>
                                {
                                  comparablePoint
                                    ? formatEngineeringNumber(
                                        comparablePoint.resultValue,
                                      )
                                    : '—'
                                }
                              </strong>

                              <small>
                                {
                                  point.readinessPercent
                                }%
                              </small>
                            </button>
                          )
                        },
                      )}
                    </div>

                    <div className="design-envelope-x-axis">
                      <strong>
                        {
                          xAssignment
                            ?.symbol
                        }
                      </strong>

                      <span>
                        {
                          xAssignment
                            ?.unit ||
                          'dimensionless'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="design-envelope-empty">
                <strong>
                  Design envelope could not be generated
                </strong>

                <p>
                  Check the selected inputs, ranges and
                  Quick Solve compatibility.
                </p>
              </div>
            )}

            <div className="design-envelope-point-details">
              <article>
                <span>
                  Minimum-result condition
                </span>

                <strong>
                  {
                    analysis
                      ?.minimumPoint
                      ? `${analysis.minimumPoint.resultLabel} = ${analysis.minimumPoint.resultText}`
                      : 'Not available'
                  }
                </strong>

                <small>
                  {
                    analysis
                      ?.minimumPoint
                      ? `${xAssignment?.symbol}=${formatEngineeringNumber(analysis.minimumPoint.xValue)}; ${yAssignment?.symbol}=${formatEngineeringNumber(analysis.minimumPoint.yValue)}`
                      : 'No solved point'
                  }
                </small>
              </article>

              <article>
                <span>
                  Selected condition
                </span>

                <strong>
                  {
                    selectedPoint
                      ? `${selectedPoint.resultLabel} = ${selectedPoint.resultText}`
                      : 'Select a heat-map cell'
                  }
                </strong>

                <small>
                  {
                    selectedPoint
                      ? `${xAssignment?.symbol}=${formatEngineeringNumber(selectedPoint.xValue)}; ${yAssignment?.symbol}=${formatEngineeringNumber(selectedPoint.yValue)}`
                      : 'Click any solved operating point'
                  }
                </small>
              </article>

              <article>
                <span>
                  Maximum-result condition
                </span>

                <strong>
                  {
                    analysis
                      ?.maximumPoint
                      ? `${analysis.maximumPoint.resultLabel} = ${analysis.maximumPoint.resultText}`
                      : 'Not available'
                  }
                </strong>

                <small>
                  {
                    analysis
                      ?.maximumPoint
                      ? `${xAssignment?.symbol}=${formatEngineeringNumber(analysis.maximumPoint.xValue)}; ${yAssignment?.symbol}=${formatEngineeringNumber(analysis.maximumPoint.yValue)}`
                      : 'No solved point'
                  }
                </small>
              </article>
            </div>

            {feedbackMessage ? (
              <p
                className="design-envelope-feedback"
                role="status"
              >
                {feedbackMessage}
              </p>
            ) : null}

            <footer className="design-envelope-actions">
              <div>
                <button
                  type="button"
                  disabled={
                    !analysis
                      ?.minimumPoint
                  }
                  onClick={() =>
                    applyEnvelopePoint(
                      analysis
                        ?.minimumPoint ??
                        null,
                      'Minimum-result condition',
                    )
                  }
                >
                  Use minimum case
                </button>

                <button
                  type="button"
                  disabled={
                    !selectedPoint
                  }
                  onClick={() =>
                    applyEnvelopePoint(
                      selectedPoint,
                      'Selected operating point',
                    )
                  }
                >
                  Use selected case
                </button>

                <button
                  type="button"
                  disabled={
                    !analysis
                      ?.maximumPoint
                  }
                  onClick={() =>
                    applyEnvelopePoint(
                      analysis
                        ?.maximumPoint ??
                        null,
                      'Maximum-result condition',
                    )
                  }
                >
                  Use maximum case
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={
                    copyEnvelopeSummary
                  }
                >
                  Copy envelope summary
                </button>

                <button
                  type="button"
                  className="is-primary"
                  onClick={
                    exportEnvelopeCsv
                  }
                >
                  Export envelope CSV
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="design-envelope-empty">
            <strong>
              Two numeric inputs are required
            </strong>

            <p>
              Add assignments such as P=101325 Pa,
              T=300 K and n=1 mol.
            </p>
          </div>
        )
      ) : null}
    </section>
  )
}
