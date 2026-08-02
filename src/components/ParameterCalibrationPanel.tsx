import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  applyCalibrationParameter,
  createCalibrationCandidates,
  createCalibrationCsv,
  createCalibrationEvaluation,
  selectBestCalibrationEvaluation,
} from '../features/problem-solver/parameterCalibrationEngine'
import type {
  CalibrationEvaluation,
  CalibrationPrediction,
} from '../features/problem-solver/parameterCalibrationEngine'
import {
  requestProblemSolverMatches,
} from '../features/problem-solver/problemSolverWorkerClient'

import '../styles/parameter-calibration-panel.css'

interface ParameterCalibrationPanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface CalibrationCaseDraft {
  id: string
  problem: string
  observedValue: string
}

interface CalibrationAnalysis {
  evaluations:
    CalibrationEvaluation[]
  best:
    CalibrationEvaluation
  parameterSymbol: string
  calibratedProblem: string
  outputLabel: string
  outputUnit: string
}

const GRID_OPTIONS = [
  7,
  11,
  15,
] as const

const MAXIMUM_CASE_COUNT =
  5

function formatNumber(
  value:
    number | null,
): string {
  if (
    value ===
      null ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  const magnitude =
    Math.abs(value)

  if (
    magnitude !==
      0 &&
    (
      magnitude >=
        1e6 ||
      magnitude <
        1e-4
    )
  ) {
    return value.toExponential(4)
  }

  return Number(
    value.toPrecision(7),
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        8,
    },
  )
}

function suggestedBounds(
  value: number,
): {
  minimum: string
  maximum: string
} {
  const span =
    Math.abs(value) *
    0.3 ||
    1

  return {
    minimum:
      String(
        Number(
          (
            value -
            span
          ).toPrecision(10),
        ),
      ),
    maximum:
      String(
        Number(
          (
            value +
            span
          ).toPrecision(10),
        ),
      ),
  }
}

export function ParameterCalibrationPanel({
  baseQuery,
  onApplyProblem,
}: ParameterCalibrationPanelProps) {
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

  const initialBounds =
    suggestedBounds(
      firstAssignment
        ?.value ??
      0,
    )

  const [
    parameterSymbol,
    setParameterSymbol,
  ] = useState(
    firstAssignment
      ?.symbol ??
      '',
  )

  const [
    minimum,
    setMinimum,
  ] = useState(
    initialBounds.minimum,
  )

  const [
    maximum,
    setMaximum,
  ] = useState(
    initialBounds.maximum,
  )

  const [
    gridPoints,
    setGridPoints,
  ] = useState(11)

  const [
    cases,
    setCases,
  ] = useState<
    CalibrationCaseDraft[]
  >([
    {
      id:
        'case-1',
      problem:
        baseQuery,
      observedValue:
        '',
    },
  ])

  const [
    analysis,
    setAnalysis,
  ] = useState<
    CalibrationAnalysis | null
  >(null)

  const [
    isRunning,
    setIsRunning,
  ] = useState(false)

  const [
    completedCandidateCount,
    setCompletedCandidateCount,
  ] = useState(0)

  const [
    totalCandidateCount,
    setTotalCandidateCount,
  ] = useState(0)

  const [
    feedback,
    setFeedback,
  ] = useState('')

  const caseCounterRef =
    useRef(1)

  const runIdRef =
    useRef(0)

  useEffect(
    () => {
      const first =
        assignments[0]

      setParameterSymbol(
        first
          ?.symbol ??
          '',
      )

      if (first) {
        const bounds =
          suggestedBounds(
            first.value,
          )

        setMinimum(
          bounds.minimum,
        )

        setMaximum(
          bounds.maximum,
        )
      }

      setCases([
        {
          id:
            'case-1',
          problem:
            baseQuery,
          observedValue:
            '',
        },
      ])

      caseCounterRef.current =
        1

      setAnalysis(null)
      setFeedback('')
    },
    [
      assignments,
      baseQuery,
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

  function updateParameter(
    symbol: string,
  ) {
    setParameterSymbol(symbol)

    const assignment =
      assignments.find(
        (
          candidate,
        ) =>
          candidate.symbol ===
          symbol,
      )

    if (assignment) {
      const bounds =
        suggestedBounds(
          assignment.value,
        )

      setMinimum(bounds.minimum)
      setMaximum(bounds.maximum)
    }

    setAnalysis(null)
  }

  function updateCase(
    id: string,
    field:
      'problem' |
      'observedValue',
    value: string,
  ) {
    setCases(
      (
        current,
      ) =>
        current.map(
          (
            item,
          ) =>
            item.id ===
            id
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item,
        ),
    )

    setAnalysis(null)
  }

  function addCase() {
    if (
      cases.length >=
      MAXIMUM_CASE_COUNT
    ) {
      return
    }

    caseCounterRef.current +=
      1

    setCases(
      (
        current,
      ) => [
        ...current,
        {
          id:
            `case-${caseCounterRef.current}`,
          problem:
            baseQuery,
          observedValue:
            '',
        },
      ],
    )
  }

  function removeCase(
    id: string,
  ) {
    setCases(
      (
        current,
      ) =>
        current.filter(
          (
            item,
          ) =>
            item.id !==
            id,
        ),
    )

    setAnalysis(null)
  }

  async function runCalibration() {
    const parsedMinimum =
      Number(minimum)

    const parsedMaximum =
      Number(maximum)

    if (!parameterSymbol) {
      setFeedback(
        'Choose a numeric parameter to calibrate.',
      )

      return
    }

    if (
      !Number.isFinite(
        parsedMinimum,
      ) ||
      !Number.isFinite(
        parsedMaximum,
      ) ||
      parsedMaximum <=
        parsedMinimum
    ) {
      setFeedback(
        'Maximum parameter value must be greater than the minimum.',
      )

      return
    }

    const normalizedCases =
      cases.map(
        (
          item,
        ) => ({
          ...item,
          observed:
            Number(
              item.observedValue,
            ),
        }),
      )

    if (
      normalizedCases.length ===
        0 ||
      normalizedCases.some(
        (
          item,
        ) =>
          item.problem
            .trim()
            .length ===
            0 ||
          item.observedValue
            .trim()
            .length ===
            0 ||
          !Number.isFinite(
            item.observed,
          ),
      )
    ) {
      setFeedback(
        'Every calibration case requires a problem and an observed numeric output.',
      )

      return
    }

    const candidates =
      createCalibrationCandidates(
        parsedMinimum,
        parsedMaximum,
        gridPoints,
      )

    if (
      candidates.length ===
      0
    ) {
      setFeedback(
        'The selected calibration range is invalid.',
      )

      return
    }

    const currentRunId =
      runIdRef.current +
      1

    runIdRef.current =
      currentRunId

    setIsRunning(true)
    setAnalysis(null)
    setCompletedCandidateCount(0)

    setTotalCandidateCount(
      candidates.length,
    )

    setFeedback(
      `Evaluating ${candidates.length} candidate values across ${normalizedCases.length} calibration cases.`,
    )

    const evaluations:
      CalibrationEvaluation[] = []

    let outputLabel =
      'Output'

    let outputUnit =
      ''

    try {
      for (
        let index =
          0;
        index <
          candidates.length;
        index +=
          1
      ) {
        const candidateValue =
          candidates[index]

        const predictions =
          await Promise.all(
            normalizedCases.map(
              async (
                item,
              ):
                Promise<CalibrationPrediction> => {
                const problem =
                  applyCalibrationParameter(
                    item.problem,
                    parameterSymbol,
                    candidateValue,
                  )

                try {
                  const result =
                    await requestProblemSolverMatches(
                      problem,
                      1,
                    )

                  const quickSolution =
                    result.matches[0]
                      ?.quickSolution

                  const predictedValue =
                    quickSolution &&
                    Number.isFinite(
                      quickSolution.numericValue,
                    )
                      ? quickSolution.numericValue
                      : null

                  if (quickSolution) {
                    outputLabel =
                      quickSolution.resultLabel

                    outputUnit =
                      quickSolution.unit
                  }

                  return {
                    caseId:
                      item.id,
                    observedValue:
                      item.observed,
                    predictedValue,
                    error:
                      predictedValue ===
                      null
                        ? null
                        : predictedValue -
                          item.observed,
                  }
                } catch {
                  return {
                    caseId:
                      item.id,
                    observedValue:
                      item.observed,
                    predictedValue:
                      null,
                    error:
                      null,
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

        evaluations.push(
          createCalibrationEvaluation(
            candidateValue,
            predictions,
          ),
        )

        setCompletedCandidateCount(
          index +
          1,
        )
      }

      const best =
        selectBestCalibrationEvaluation(
          evaluations,
        )

      if (!best) {
        setFeedback(
          'No candidate value produced a resolved Solver result.',
        )

        return
      }

      const calibratedProblem =
        applyCalibrationParameter(
          baseQuery,
          parameterSymbol,
          best.candidateValue,
        )

      setAnalysis({
        evaluations,
        best,
        parameterSymbol,
        calibratedProblem,
        outputLabel,
        outputUnit,
      })

      setFeedback(
        `Best-fit ${parameterSymbol} = ${formatNumber(best.candidateValue)} with RMSE ${formatNumber(best.metrics.rmse)}.`,
      )
    } finally {
      if (
        runIdRef.current ===
        currentRunId
      ) {
        setIsRunning(false)
      }
    }
  }

  function exportCsv() {
    if (!analysis) {
      return
    }

    const blob =
      new Blob(
        [
          createCalibrationCsv(
            analysis.best,
          ),
        ],
        {
          type:
            'text/csv;charset=utf-8',
        },
      )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href =
      url

    link.download =
      'parameter-calibration.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)

    setFeedback(
      'Best-fit calibration residuals exported as CSV.',
    )
  }

  return (
    <section
      className="parameter-calibration-panel"
      aria-labelledby="parameter-calibration-title"
    >
      <header className="parameter-calibration-header">
        <div>
          <span>
            Experimental parameter estimation
          </span>

          <h3 id="parameter-calibration-title">
            Parameter calibration
          </h3>

          <p>
            Compare Solver predictions with observed data
            and identify the parameter value that minimizes
            the root-mean-square error.
          </p>
        </div>

        <strong>
          Maximum 5 cases · 15 candidates
        </strong>
      </header>

      {assignments.length ===
      0 ? (
        <div className="parameter-calibration-empty">
          Add at least one numeric assignment such as
          k=0.25, U=500 or f=0.02 to the problem.
        </div>
      ) : (
        <>
          <div className="parameter-calibration-controls">
            <label>
              Parameter

              <select
                value={
                  parameterSymbol
                }
                onChange={(
                  event,
                ) =>
                  updateParameter(
                    event.target.value,
                  )
                }
              >
                {assignments.map(
                  (
                    assignment,
                  ) => (
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
                      } = {
                        formatNumber(
                          assignment.value,
                        )
                      } {
                        assignment.unit
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Minimum candidate

              <input
                type="number"
                value={
                  minimum
                }
                onChange={(
                  event,
                ) =>
                  setMinimum(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Maximum candidate

              <input
                type="number"
                value={
                  maximum
                }
                onChange={(
                  event,
                ) =>
                  setMaximum(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Candidate count

              <select
                value={
                  gridPoints
                }
                onChange={(
                  event,
                ) =>
                  setGridPoints(
                    Number(
                      event.target.value,
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
          </div>

          <div className="parameter-calibration-cases">
            <header>
              <div>
                <span>
                  Calibration dataset
                </span>

                <strong>
                  Observed engineering cases
                </strong>
              </div>

              <button
                type="button"
                disabled={
                  cases.length >=
                  MAXIMUM_CASE_COUNT
                }
                onClick={
                  addCase
                }
              >
                Add case
              </button>
            </header>

            {cases.map(
              (
                item,
                index,
              ) => (
                <article
                  key={
                    item.id
                  }
                >
                  <div>
                    <strong>
                      Case {index + 1}
                    </strong>

                    {cases.length >
                    1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          removeCase(
                            item.id,
                          )
                        }
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <label>
                    Engineering problem

                    <textarea
                      rows={3}
                      value={
                        item.problem
                      }
                      onChange={(
                        event,
                      ) =>
                        updateCase(
                          item.id,
                          'problem',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Observed output

                    <input
                      type="number"
                      value={
                        item.observedValue
                      }
                      onChange={(
                        event,
                      ) =>
                        updateCase(
                          item.id,
                          'observedValue',
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </article>
              ),
            )}
          </div>

          <div className="parameter-calibration-actions">
            <button
              type="button"
              disabled={
                isRunning
              }
              onClick={
                runCalibration
              }
            >
              {
                isRunning
                  ? 'Calibrating parameter…'
                  : 'Run parameter calibration'
              }
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export residual CSV
              </button>
            ) : null}

            <span>
              Background Solver worker
            </span>
          </div>

          {isRunning ? (
            <div
              className="parameter-calibration-progress"
              role="status"
            >
              <span>
                {completedCandidateCount} / {totalCandidateCount}
              </span>

              <progress
                value={
                  completedCandidateCount
                }
                max={
                  totalCandidateCount ||
                  1
                }
              />
            </div>
          ) : null}

          {feedback ? (
            <p
              className="parameter-calibration-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="parameter-calibration-summary">
                <article>
                  <span>
                    Best-fit parameter
                  </span>

                  <strong>
                    {
                      analysis.parameterSymbol
                    } = {
                      formatNumber(
                        analysis.best
                          .candidateValue,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    RMSE
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis.best
                          .metrics
                          .rmse,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Mean absolute error
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis.best
                          .metrics
                          .mae,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    R²
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis.best
                          .metrics
                          .rSquared,
                      )
                    }
                  </strong>
                </article>
              </div>

              <div className="parameter-calibration-table-scroll">
                <table className="parameter-calibration-table">
                  <thead>
                    <tr>
                      <th>
                        Case
                      </th>

                      <th>
                        Observed
                      </th>

                      <th>
                        Predicted
                      </th>

                      <th>
                        Residual
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysis.best
                      .predictions
                      .map(
                        (
                          prediction,
                        ) => (
                          <tr
                            key={
                              prediction.caseId
                            }
                          >
                            <td>
                              {
                                prediction.caseId
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  prediction.observedValue,
                                )
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  prediction.predictedValue,
                                )
                              } {
                                analysis.outputUnit
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  prediction.error,
                                )
                              }
                            </td>
                          </tr>
                        ),
                      )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="parameter-calibration-transfer"
                onClick={() =>
                  onApplyProblem(
                    analysis.calibratedProblem,
                  )
                }
              >
                Transfer calibrated parameter to Solver
              </button>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
