import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import {
  buildConstraintGrid,
  classifyConstraintValue,
  createConstraintWindowCsv,
  parseConstraintAssignments,
  summarizeConstraintWindow,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import type {
  ConstraintAssignment,
  ConstraintCsvPoint,
  ConstraintGridPoint,
  ConstraintStatus,
  ConstraintWindowSummary,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  requestProblemSolverMatches,
} from '../features/problem-solver/problemSolverWorkerClient'

import '../styles/constraint-operating-window-panel.css'

interface ConstraintOperatingWindowPanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface EvaluatedConstraintPoint
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
  boundaryDistance:
    number | null
}

interface ConstraintWindowAnalysis {
  points:
    EvaluatedConstraintPoint[]
  summary:
    ConstraintWindowSummary
  xSteps: number
  ySteps: number
  lowerBound:
    number | null
  upperBound:
    number | null
  outputLabel: string
  outputUnit: string
}

interface SuggestedRange {
  minimum: string
  maximum: string
}

const GRID_OPTIONS = [
  3,
  5,
  7,
] as const

const EVALUATION_BATCH_SIZE =
  4

function formatInputNumber(
  value: number,
): string {
  return Number(
    value.toPrecision(
      10,
    ),
  ).toString()
}

function suggestRange(
  value: number,
): SuggestedRange {
  const scale =
    Math.abs(
      value,
    ) ||
    1

  return {
    minimum:
      formatInputNumber(
        value -
        scale *
        0.2,
      ),
    maximum:
      formatInputNumber(
        value +
        scale *
        0.2,
      ),
  }
}

function formatEngineeringNumber(
  value:
    number | null,
): string {
  if (
    value ===
      null ||
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
    return value.toExponential(
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

function optionalNumber(
  value: string,
): number | null {
  if (
    value.trim().length ===
    0
  ) {
    return null
  }

  const parsed =
    Number(
      value,
    )

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null
}

function findAssignment(
  assignments:
    ConstraintAssignment[],
  symbol: string,
): ConstraintAssignment | undefined {
  return assignments.find(
    (
      assignment,
    ) =>
      assignment.symbol ===
      symbol,
  )
}

export function ConstraintOperatingWindowPanel({
  baseQuery,
  onApplyProblem,
}: ConstraintOperatingWindowPanelProps) {
  const assignments =
    useMemo(
      () =>
        parseConstraintAssignments(
          baseQuery,
        ),
      [
        baseQuery,
      ],
    )

  const firstAssignment =
    assignments[0]

  const secondAssignment =
    assignments[1]

  const firstSuggestedRange =
    suggestRange(
      firstAssignment
        ?.value ??
      0,
    )

  const secondSuggestedRange =
    suggestRange(
      secondAssignment
        ?.value ??
      0,
    )

  const [
    xSymbol,
    setXSymbol,
  ] = useState(
    firstAssignment
      ?.symbol ??
      '',
  )

  const [
    ySymbol,
    setYSymbol,
  ] = useState('')

  const [
    xMinimum,
    setXMinimum,
  ] = useState(
    firstSuggestedRange
      .minimum,
  )

  const [
    xMaximum,
    setXMaximum,
  ] = useState(
    firstSuggestedRange
      .maximum,
  )

  const [
    yMinimum,
    setYMinimum,
  ] = useState(
    secondSuggestedRange
      .minimum,
  )

  const [
    yMaximum,
    setYMaximum,
  ] = useState(
    secondSuggestedRange
      .maximum,
  )

  const [
    xSteps,
    setXSteps,
  ] = useState(5)

  const [
    ySteps,
    setYSteps,
  ] = useState(5)

  const [
    lowerBound,
    setLowerBound,
  ] = useState('')

  const [
    upperBound,
    setUpperBound,
  ] = useState('')

  const [
    analysis,
    setAnalysis,
  ] = useState<
    ConstraintWindowAnalysis | null
  >(null)

  const [
    selectedPointId,
    setSelectedPointId,
  ] = useState('')

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const [
    isRunning,
    setIsRunning,
  ] = useState(false)

  const [
    completedPointCount,
    setCompletedPointCount,
  ] = useState(0)

  const [
    totalPointCount,
    setTotalPointCount,
  ] = useState(0)

  const runIdRef =
    useRef(0)

  useEffect(
    () => {
      const first =
        assignments[0]

      const second =
        assignments[1]

      setXSymbol(
        first
          ?.symbol ??
          '',
      )

      setYSymbol('')

      if (first) {
        const range =
          suggestRange(
            first.value,
          )

        setXMinimum(
          range.minimum,
        )

        setXMaximum(
          range.maximum,
        )
      }

      if (second) {
        const range =
          suggestRange(
            second.value,
          )

        setYMinimum(
          range.minimum,
        )

        setYMaximum(
          range.maximum,
        )
      }

      setAnalysis(
        null,
      )

      setSelectedPointId('')
      setFeedbackMessage('')
      setCompletedPointCount(0)
      setTotalPointCount(0)
    },
    [
      assignments,
    ],
  )

  useEffect(
    () =>
      () => {
        runIdRef.current +=
          1
      },
    [],
  )

  const selectedPoint =
    analysis
      ?.points
      .find(
        (
          point,
        ) =>
          point.id ===
          selectedPointId,
      ) ??
    null

  const bestPoint =
    analysis
      ?.points
      .find(
        (
          point,
        ) =>
          point.id ===
          analysis
            .summary
            .bestPointId,
      ) ??
    null

  const closestBoundaryPoint =
    analysis
      ?.points
      .find(
        (
          point,
        ) =>
          point.id ===
          analysis
            .summary
            .closestBoundaryPointId,
      ) ??
    null

  const maximumMarginMagnitude =
    analysis
      ? Math.max(
          1e-12,
          ...analysis
            .points
            .map(
              (
                point,
              ) =>
                Math.abs(
                  point
                    .signedMargin ??
                  0,
                ),
            ),
        )
      : 1

  function updatePrimaryVariable(
    symbol: string,
  ) {
    setXSymbol(
      symbol,
    )

    const assignment =
      findAssignment(
        assignments,
        symbol,
      )

    if (assignment) {
      const range =
        suggestRange(
          assignment.value,
        )

      setXMinimum(
        range.minimum,
      )

      setXMaximum(
        range.maximum,
      )
    }

    if (
      ySymbol ===
      symbol
    ) {
      setYSymbol('')
    }

    setAnalysis(
      null,
    )
  }

  function updateSecondaryVariable(
    symbol: string,
  ) {
    setYSymbol(
      symbol,
    )

    const assignment =
      findAssignment(
        assignments,
        symbol,
      )

    if (assignment) {
      const range =
        suggestRange(
          assignment.value,
        )

      setYMinimum(
        range.minimum,
      )

      setYMaximum(
        range.maximum,
      )
    }

    setAnalysis(
      null,
    )
  }

  async function evaluateOperatingWindow() {
    const xAssignment =
      findAssignment(
        assignments,
        xSymbol,
      )

    const yAssignment =
      ySymbol
        ? findAssignment(
            assignments,
            ySymbol,
          )
        : undefined

    if (!xAssignment) {
      setFeedbackMessage(
        'Choose a numeric primary input before evaluating the operating window.',
      )

      return
    }

    if (
      yAssignment &&
      yAssignment.symbol ===
        xAssignment.symbol
    ) {
      setFeedbackMessage(
        'Primary and secondary variables must be different.',
      )

      return
    }

    const parsedXMinimum =
      Number(
        xMinimum,
      )

    const parsedXMaximum =
      Number(
        xMaximum,
      )

    const parsedYMinimum =
      Number(
        yMinimum,
      )

    const parsedYMaximum =
      Number(
        yMaximum,
      )

    if (
      !Number.isFinite(
        parsedXMinimum,
      ) ||
      !Number.isFinite(
        parsedXMaximum,
      ) ||
      parsedXMaximum <=
        parsedXMinimum
    ) {
      setFeedbackMessage(
        'Primary variable maximum must be greater than its minimum.',
      )

      return
    }

    if (
      yAssignment &&
      (
        !Number.isFinite(
          parsedYMinimum,
        ) ||
        !Number.isFinite(
          parsedYMaximum,
        ) ||
        parsedYMaximum <=
          parsedYMinimum
      )
    ) {
      setFeedbackMessage(
        'Secondary variable maximum must be greater than its minimum.',
      )

      return
    }

    const parsedLowerBound =
      optionalNumber(
        lowerBound,
      )

    const parsedUpperBound =
      optionalNumber(
        upperBound,
      )

    if (
      lowerBound
        .trim()
        .length >
        0 &&
      parsedLowerBound ===
        null
    ) {
      setFeedbackMessage(
        'Minimum acceptable output must be a valid number.',
      )

      return
    }

    if (
      upperBound
        .trim()
        .length >
        0 &&
      parsedUpperBound ===
        null
    ) {
      setFeedbackMessage(
        'Maximum acceptable output must be a valid number.',
      )

      return
    }

    if (
      parsedLowerBound ===
        null &&
      parsedUpperBound ===
        null
    ) {
      setFeedbackMessage(
        'Enter at least one acceptable output constraint.',
      )

      return
    }

    if (
      parsedLowerBound !==
        null &&
      parsedUpperBound !==
        null &&
      parsedLowerBound >
        parsedUpperBound
    ) {
      setFeedbackMessage(
        'Minimum acceptable output cannot exceed the maximum.',
      )

      return
    }

    const grid =
      buildConstraintGrid(
        baseQuery,
        {
          symbol:
            xAssignment.symbol,
          minimum:
            parsedXMinimum,
          maximum:
            parsedXMaximum,
          steps:
            xSteps,
        },
        yAssignment
          ? {
              symbol:
                yAssignment.symbol,
              minimum:
                parsedYMinimum,
              maximum:
                parsedYMaximum,
              steps:
                ySteps,
            }
          : null,
      )

    if (
      grid.length ===
      0
    ) {
      setFeedbackMessage(
        'The selected operating ranges could not produce an evaluation grid.',
      )

      return
    }

    const currentRunId =
      runIdRef.current +
      1

    runIdRef.current =
      currentRunId

    setIsRunning(
      true,
    )

    setAnalysis(
      null,
    )

    setSelectedPointId('')
    setCompletedPointCount(0)
    setTotalPointCount(
      grid.length,
    )

    setFeedbackMessage(
      `Evaluating ${grid.length} operating points in the background Solver worker.`,
    )

    const evaluatedPoints:
      EvaluatedConstraintPoint[] = []

    try {
      for (
        let startIndex =
          0;
        startIndex <
        grid.length;
        startIndex +=
          EVALUATION_BATCH_SIZE
      ) {
        const batch =
          grid.slice(
            startIndex,
            startIndex +
              EVALUATION_BATCH_SIZE,
          )

        const evaluatedBatch =
          await Promise.all(
            batch.map(
              async (
                point,
              ):
                Promise<EvaluatedConstraintPoint> => {
                try {
                  const result =
                    await requestProblemSolverMatches(
                      point.problem,
                      1,
                    )

                  const match =
                    result.matches[0]

                  const quickSolution =
                    match
                      ?.quickSolution

                  const numericValue =
                    quickSolution &&
                    Number.isFinite(
                      quickSolution
                        .numericValue,
                    )
                      ? quickSolution
                          .numericValue
                      : null

                  const classification =
                    classifyConstraintValue(
                      numericValue,
                      parsedLowerBound,
                      parsedUpperBound,
                    )

                  return {
                    ...point,
                    calculatorTitle:
                      match
                        ?.title ??
                      'Unresolved',
                    outputValue:
                      numericValue,
                    outputLabel:
                      quickSolution
                        ?.resultLabel ??
                      'Output',
                    outputUnit:
                      quickSolution
                        ?.unit ??
                      '',
                    ...classification,
                  }
                } catch {
                  const classification =
                    classifyConstraintValue(
                      null,
                      parsedLowerBound,
                      parsedUpperBound,
                    )

                  return {
                    ...point,
                    calculatorTitle:
                      'Unresolved',
                    outputValue:
                      null,
                    outputLabel:
                      'Output',
                    outputUnit:
                      '',
                    ...classification,
                  }
                }
              },
            ),
          )

        if (
          runIdRef.current !==
          currentRunId
        ) {
          return
        }

        evaluatedPoints.push(
          ...evaluatedBatch,
        )

        setCompletedPointCount(
          evaluatedPoints.length,
        )
      }

      const summary =
        summarizeConstraintWindow(
          evaluatedPoints,
        )

      const firstResolved =
        evaluatedPoints.find(
          (
            point,
          ) =>
            point.outputValue !==
            null,
        )

      const nextSelectedPointId =
        summary.bestPointId ??
        evaluatedPoints.find(
          (
            point,
          ) =>
            point.feasible,
        )
          ?.id ??
        evaluatedPoints[0]
          ?.id ??
        ''

      setAnalysis({
        points:
          evaluatedPoints,
        summary,
        xSteps,
        ySteps:
          yAssignment
            ? ySteps
            : 1,
        lowerBound:
          parsedLowerBound,
        upperBound:
          parsedUpperBound,
        outputLabel:
          firstResolved
            ?.outputLabel ??
          'Output',
        outputUnit:
          firstResolved
            ?.outputUnit ??
          '',
      })

      setSelectedPointId(
        nextSelectedPointId,
      )

      setFeedbackMessage(
        `${summary.feasiblePointCount} of ${summary.totalPointCount} evaluated points satisfy the operating constraints.`,
      )
    } finally {
      if (
        runIdRef.current ===
        currentRunId
      ) {
        setIsRunning(
          false,
        )
      }
    }
  }

  function downloadCsv() {
    if (!analysis) {
      return
    }

    const csv =
      createConstraintWindowCsv(
        analysis
          .points as
          ConstraintCsvPoint[],
      )

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

    const url =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href =
      url

    link.download =
      'constraint-operating-window.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedbackMessage(
      'Constraint operating window CSV exported.',
    )
  }

  function transferSelectedPoint() {
    if (
      !selectedPoint ||
      !selectedPoint.feasible
    ) {
      return
    }

    onApplyProblem(
      selectedPoint.problem,
    )
  }

  return (
    <section
      className="constraint-window-panel"
      aria-labelledby="constraint-window-title"
    >
      <header className="constraint-window-header">
        <div>
          <span>
            Feasibility and operating limits
          </span>

          <h3 id="constraint-window-title">
            Constraint operating window
          </h3>

          <p>
            Evaluate one or two input ranges against an
            acceptable output band and transfer a feasible
            operating point back to the Solver.
          </p>
        </div>

        <strong>
          Background worker analysis
        </strong>
      </header>

      {assignments.length ===
      0 ? (
        <div className="constraint-window-empty">
          <strong>
            Numeric assignments are required
          </strong>

          <p>
            Add values such as P=101325 Pa, T=300 K or
            Q=0.01 m³/s to the engineering problem.
          </p>
        </div>
      ) : (
        <>
          <div className="constraint-window-controls">
            <article>
              <span>
                Primary variable
              </span>

              <label>
                Variable

                <select
                  value={
                    xSymbol
                  }
                  onChange={(
                    event,
                  ) =>
                    updatePrimaryVariable(
                      event
                        .target
                        .value,
                    )
                  }
                >
                  {assignments.map(
                    (
                      assignment,
                    ) => (
                      <option
                        key={
                          assignment
                            .symbol
                        }
                        value={
                          assignment
                            .symbol
                        }
                      >
                        {
                          assignment
                            .symbol
                        } = {
                          formatEngineeringNumber(
                            assignment
                              .value,
                          )
                        } {
                          assignment.unit
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div className="constraint-window-range-row">
                <label>
                  Minimum

                  <input
                    type="number"
                    value={
                      xMinimum
                    }
                    onChange={(
                      event,
                    ) =>
                      setXMinimum(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  Maximum

                  <input
                    type="number"
                    value={
                      xMaximum
                    }
                    onChange={(
                      event,
                    ) =>
                      setXMaximum(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>
              </div>

              <label>
                Grid points

                <select
                  value={
                    xSteps
                  }
                  onChange={(
                    event,
                  ) =>
                    setXSteps(
                      Number(
                        event
                          .target
                          .value,
                      ),
                    )
                  }
                >
                  {GRID_OPTIONS.map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {option}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </article>

            <article>
              <span>
                Secondary variable
              </span>

              <label>
                Variable

                <select
                  value={
                    ySymbol
                  }
                  onChange={(
                    event,
                  ) =>
                    updateSecondaryVariable(
                      event
                        .target
                        .value,
                    )
                  }
                >
                  <option value="">
                    Single-variable window
                  </option>

                  {assignments
                    .filter(
                      (
                        assignment,
                      ) =>
                        assignment
                          .symbol !==
                        xSymbol,
                    )
                    .map(
                      (
                        assignment,
                      ) => (
                        <option
                          key={
                            assignment
                              .symbol
                          }
                          value={
                            assignment
                              .symbol
                          }
                        >
                          {
                            assignment
                              .symbol
                          } = {
                            formatEngineeringNumber(
                              assignment
                                .value,
                            )
                          } {
                            assignment.unit
                          }
                        </option>
                      ),
                    )}
                </select>
              </label>

              <div className="constraint-window-range-row">
                <label>
                  Minimum

                  <input
                    type="number"
                    value={
                      yMinimum
                    }
                    disabled={
                      !ySymbol
                    }
                    onChange={(
                      event,
                    ) =>
                      setYMinimum(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  Maximum

                  <input
                    type="number"
                    value={
                      yMaximum
                    }
                    disabled={
                      !ySymbol
                    }
                    onChange={(
                      event,
                    ) =>
                      setYMaximum(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>
              </div>

              <label>
                Grid points

                <select
                  value={
                    ySteps
                  }
                  disabled={
                    !ySymbol
                  }
                  onChange={(
                    event,
                  ) =>
                    setYSteps(
                      Number(
                        event
                          .target
                          .value,
                      ),
                    )
                  }
                >
                  {GRID_OPTIONS.map(
                    (
                      option,
                    ) => (
                      <option
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {option}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </article>

            <article>
              <span>
                Output constraints
              </span>

              <label>
                Minimum acceptable output

                <input
                  type="number"
                  value={
                    lowerBound
                  }
                  placeholder="Optional"
                  onChange={(
                    event,
                  ) =>
                    setLowerBound(
                      event
                        .target
                        .value,
                    )
                  }
                />
              </label>

              <label>
                Maximum acceptable output

                <input
                  type="number"
                  value={
                    upperBound
                  }
                  placeholder="Optional"
                  onChange={(
                    event,
                  ) =>
                    setUpperBound(
                      event
                        .target
                        .value,
                    )
                  }
                />
              </label>

              <p>
                Constraints use the Quick Solve result's
                native output unit.
              </p>
            </article>
          </div>

          <div className="constraint-window-actions">
            <button
              type="button"
              disabled={
                isRunning
              }
              onClick={
                evaluateOperatingWindow
              }
            >
              {
                isRunning
                  ? 'Evaluating operating window…'
                  : 'Evaluate feasible window'
              }
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  downloadCsv
                }
              >
                Export CSV
              </button>
            ) : null}

            <span>
              Up to {
                xSteps *
                (
                  ySymbol
                    ? ySteps
                    : 1
                )
              } worker-evaluated points
            </span>
          </div>

          {isRunning ? (
            <div
              className="constraint-window-progress"
              role="status"
            >
              <div>
                <strong>
                  Background evaluation
                </strong>

                <span>
                  {completedPointCount} / {totalPointCount}
                </span>
              </div>

              <progress
                value={
                  completedPointCount
                }
                max={
                  totalPointCount ||
                  1
                }
              />
            </div>
          ) : null}

          {feedbackMessage ? (
            <p
              className="constraint-window-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="constraint-window-summary">
                <article>
                  <span>
                    Feasible points
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .feasiblePointCount
                    } / {
                      analysis
                        .summary
                        .totalPointCount
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Feasible coverage
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .feasiblePercentage
                        .toFixed(
                          1,
                        )
                    }%
                  </strong>
                </article>

                <article>
                  <span>
                    Out of specification
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .outOfSpecPointCount
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Unresolved points
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .unresolvedPointCount
                    }
                  </strong>
                </article>
              </div>

              <div className="constraint-window-insights">
                <article>
                  <span>
                    Best constraint margin
                  </span>

                  <strong>
                    {
                      bestPoint
                        ? formatEngineeringNumber(
                            bestPoint
                              .signedMargin,
                          )
                        : 'No feasible point'
                    } {
                      analysis
                        .outputUnit
                    }
                  </strong>

                  <p>
                    {
                      bestPoint
                        ? `${bestPoint.xSymbol}=${formatEngineeringNumber(bestPoint.xValue)}${bestPoint.ySymbol ? `, ${bestPoint.ySymbol}=${formatEngineeringNumber(bestPoint.yValue)}` : ''}`
                        : 'Expand the input ranges or revise the constraints.'
                    }
                  </p>
                </article>

                <article>
                  <span>
                    Closest constraint boundary
                  </span>

                  <strong>
                    {
                      closestBoundaryPoint
                        ? formatEngineeringNumber(
                            closestBoundaryPoint
                              .boundaryDistance,
                          )
                        : '—'
                    } {
                      analysis
                        .outputUnit
                    }
                  </strong>

                  <p>
                    {
                      closestBoundaryPoint
                        ? `${closestBoundaryPoint.outputLabel}: ${formatEngineeringNumber(closestBoundaryPoint.outputValue)} ${closestBoundaryPoint.outputUnit}`
                        : 'No resolved output is available.'
                    }
                  </p>
                </article>
              </div>

              <div className="constraint-window-map-section">
                <header>
                  <div>
                    <span>
                      Feasible operating-point heat map
                    </span>

                    <h4>
                      {
                        analysis
                          .outputLabel
                      } {
                        analysis
                          .outputUnit
                          ? `(${analysis.outputUnit})`
                          : ''
                      }
                    </h4>
                  </div>

                  <div className="constraint-window-legend">
                    <span data-status="feasible">
                      Feasible
                    </span>

                    <span data-status="below">
                      Below minimum
                    </span>

                    <span data-status="above">
                      Above maximum
                    </span>

                    <span data-status="unresolved">
                      Unresolved
                    </span>
                  </div>
                </header>

                <div className="constraint-window-map-scroll">
                  <div
                    className="constraint-window-map"
                    style={{
                      gridTemplateColumns:
                        `repeat(${analysis.xSteps}, minmax(72px, 1fr))`,
                    }}
                  >
                    {analysis.points.map(
                      (
                        point,
                      ) => {
                        const intensity =
                          Math.min(
                            1,
                            Math.abs(
                              point
                                .signedMargin ??
                              0,
                            ) /
                            maximumMarginMagnitude,
                          )

                        const cellStyle = {
                          '--constraint-intensity':
                            intensity.toFixed(
                              3,
                            ),
                        } as CSSProperties

                        return (
                          <button
                            key={
                              point.id
                            }
                            type="button"
                            data-status={
                              point.status
                            }
                            data-selected={
                              selectedPointId ===
                              point.id
                                ? 'true'
                                : 'false'
                            }
                            style={
                              cellStyle
                            }
                            aria-pressed={
                              selectedPointId ===
                              point.id
                            }
                            title={[
                              `${point.xSymbol}=${formatEngineeringNumber(point.xValue)}`,
                              point.ySymbol
                                ? `${point.ySymbol}=${formatEngineeringNumber(point.yValue)}`
                                : '',
                              `${point.outputLabel}=${formatEngineeringNumber(point.outputValue)} ${point.outputUnit}`,
                              point.status,
                            ]
                              .filter(
                                Boolean,
                              )
                              .join(' · ')}
                            onClick={() =>
                              setSelectedPointId(
                                point.id,
                              )
                            }
                          >
                            <span>
                              {
                                formatEngineeringNumber(
                                  point
                                    .outputValue,
                                )
                              }
                            </span>

                            <small>
                              {
                                point
                                  .status
                              }
                            </small>
                          </button>
                        )
                      },
                    )}
                  </div>
                </div>
              </div>

              {selectedPoint ? (
                <div className="constraint-window-selected">
                  <div>
                    <span>
                      Selected operating point
                    </span>

                    <strong>
                      {
                        selectedPoint
                          .xSymbol
                      } = {
                        formatEngineeringNumber(
                          selectedPoint
                            .xValue,
                        )
                      }

                      {
                        selectedPoint
                          .ySymbol
                          ? ` · ${selectedPoint.ySymbol} = ${formatEngineeringNumber(selectedPoint.yValue)}`
                          : ''
                      }
                    </strong>

                    <p>
                      {
                        selectedPoint
                          .calculatorTitle
                      } · {
                        selectedPoint
                          .outputLabel
                      } = {
                        formatEngineeringNumber(
                          selectedPoint
                            .outputValue,
                        )
                      } {
                        selectedPoint
                          .outputUnit
                      } · {
                        selectedPoint
                          .status
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      !selectedPoint
                        .feasible
                    }
                    onClick={
                      transferSelectedPoint
                    }
                  >
                    Transfer selected feasible point
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
