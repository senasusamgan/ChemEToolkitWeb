import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import type {
  ConstraintAssignment,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  createResponseSurfaceCsv,
  createResponseSurfaceDesign,
  findResponseSurfaceOptimum,
  fitResponseSurface,
  formatResponseSurfaceEquation,
  predictResponseSurface,
} from '../features/problem-solver/responseSurfaceEngine'
import type {
  ResponseSurfaceDesignPoint,
  ResponseSurfaceModel,
  ResponseSurfaceObjective,
  ResponseSurfaceOptimum,
  ResponseSurfaceVariable,
} from '../features/problem-solver/responseSurfaceEngine'
import {
  requestProblemSolverMatches,
} from '../features/problem-solver/problemSolverWorkerClient'

import '../styles/response-surface-panel.css'

interface ResponseSurfacePanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface EvaluatedSurfaceSample
  extends ResponseSurfaceDesignPoint {
  calculatorTitle: string
  outputLabel: string
  outputUnit: string
  outputValue:
    number | null
}

interface ResponseSurfaceAnalysis {
  samples:
    EvaluatedSurfaceSample[]
  model:
    ResponseSurfaceModel
  optimum:
    ResponseSurfaceOptimum
  outputLabel: string
  outputUnit: string
  actualMinimum:
    number | null
  actualMaximum:
    number | null
  xSteps: number
}

interface RangeDraft {
  minimum: string
  maximum: string
}

const GRID_OPTIONS = [
  3,
  5,
] as const

const EVALUATION_BATCH_SIZE =
  4

function formatNumber(
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

  const magnitude =
    Math.abs(
      value,
    )

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

function suggestedRange(
  value: number,
): RangeDraft {
  const span =
    Math.abs(
      value,
    ) *
    0.2 ||
    1

  return {
    minimum:
      String(
        Number(
          (
            value -
            span
          ).toPrecision(
            10,
          ),
        ),
      ),
    maximum:
      String(
        Number(
          (
            value +
            span
          ).toPrecision(
            10,
          ),
        ),
      ),
  }
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

function outputBand(
  value:
    number | null,
  minimum:
    number | null,
  maximum:
    number | null,
): string {
  if (
    value ===
      null ||
    minimum ===
      null ||
    maximum ===
      null ||
    maximum <=
      minimum
  ) {
    return '0'
  }

  const fraction =
    Math.min(
      1,
      Math.max(
        0,
        (
          value -
          minimum
        ) /
        (
          maximum -
          minimum
        ),
      ),
    )

  return String(
    Math.min(
      4,
      Math.floor(
        fraction *
        5,
      ),
    ),
  )
}

export function ResponseSurfacePanel({
  baseQuery,
  onApplyProblem,
}: ResponseSurfacePanelProps) {
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

  const firstRange =
    suggestedRange(
      firstAssignment
        ?.value ??
      0,
    )

  const secondRange =
    suggestedRange(
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
    firstRange.minimum,
  )

  const [
    xMaximum,
    setXMaximum,
  ] = useState(
    firstRange.maximum,
  )

  const [
    yMinimum,
    setYMinimum,
  ] = useState(
    secondRange.minimum,
  )

  const [
    yMaximum,
    setYMaximum,
  ] = useState(
    secondRange.maximum,
  )

  const [
    gridPoints,
    setGridPoints,
  ] = useState(5)

  const [
    objective,
    setObjective,
  ] = useState<
    ResponseSurfaceObjective
  >(
    'maximize',
  )

  const [
    analysis,
    setAnalysis,
  ] = useState<
    ResponseSurfaceAnalysis | null
  >(null)

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

  const [
    feedback,
    setFeedback,
  ] = useState('')

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
          suggestedRange(
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
          suggestedRange(
            second.value,
          )

        setYMinimum(
          range.minimum,
        )

        setYMaximum(
          range.maximum,
        )
      }

      setAnalysis(null)
      setFeedback('')
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
        suggestedRange(
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

    setAnalysis(null)
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
        suggestedRange(
          assignment.value,
        )

      setYMinimum(
        range.minimum,
      )

      setYMaximum(
        range.maximum,
      )
    }

    setAnalysis(null)
  }

  async function buildResponseSurface() {
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
      setFeedback(
        'Choose a numeric primary variable.',
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
      setFeedback(
        'Primary-variable maximum must be greater than its minimum.',
      )

      return
    }

    const parsedYMinimum =
      Number(
        yMinimum,
      )

    const parsedYMaximum =
      Number(
        yMaximum,
      )

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
      setFeedback(
        'Secondary-variable maximum must be greater than its minimum.',
      )

      return
    }

    const xVariable:
      ResponseSurfaceVariable = {
        symbol:
          xAssignment.symbol,
        minimum:
          parsedXMinimum,
        maximum:
          parsedXMaximum,
        steps:
          gridPoints,
      }

    const yVariable:
      ResponseSurfaceVariable | null =
        yAssignment
          ? {
              symbol:
                yAssignment.symbol,
              minimum:
                parsedYMinimum,
              maximum:
                parsedYMaximum,
              steps:
                gridPoints,
            }
          : null

    const design =
      createResponseSurfaceDesign(
        baseQuery,
        xVariable,
        yVariable,
      )

    if (
      design.length ===
      0
    ) {
      setFeedback(
        'The selected ranges could not produce a response-surface design.',
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
    setCompletedPointCount(0)
    setTotalPointCount(
      design.length,
    )

    setFeedback(
      `Evaluating ${design.length} response-surface points in the background Solver worker.`,
    )

    const samples:
      EvaluatedSurfaceSample[] = []

    try {
      for (
        let startIndex =
          0;
        startIndex <
          design.length;
        startIndex +=
          EVALUATION_BATCH_SIZE
      ) {
        const batch =
          design.slice(
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
                Promise<EvaluatedSurfaceSample> => {
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

                  const outputValue =
                    quickSolution &&
                    Number.isFinite(
                      quickSolution
                        .numericValue,
                    )
                      ? quickSolution
                          .numericValue
                      : null

                  return {
                    ...point,
                    calculatorTitle:
                      match
                        ?.title ??
                      'Unresolved',
                    outputLabel:
                      quickSolution
                        ?.resultLabel ??
                      'Output',
                    outputUnit:
                      quickSolution
                        ?.unit ??
                      '',
                    outputValue,
                  }
                } catch {
                  return {
                    ...point,
                    calculatorTitle:
                      'Unresolved',
                    outputLabel:
                      'Output',
                    outputUnit:
                      '',
                    outputValue:
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

        samples.push(
          ...evaluatedBatch,
        )

        setCompletedPointCount(
          samples.length,
        )
      }

      const model =
        fitResponseSurface(
          samples,
          xVariable,
          yVariable,
        )

      if (!model) {
        setFeedback(
          'Too few resolved results were available to fit the quadratic response surface.',
        )

        return
      }

      const optimum =
        findResponseSurfaceOptimum(
          model,
          objective,
          baseQuery,
        )

      const resolvedSamples =
        samples.filter(
          (
            sample,
          ):
            sample is
              EvaluatedSurfaceSample & {
                outputValue: number
              } =>
            sample.outputValue !==
              null,
        )

      const outputs =
        resolvedSamples.map(
          (
            sample,
          ) =>
            sample.outputValue,
        )

      const firstResolved =
        resolvedSamples[0]

      setAnalysis({
        samples,
        model,
        optimum,
        outputLabel:
          firstResolved
            ?.outputLabel ??
          'Output',
        outputUnit:
          firstResolved
            ?.outputUnit ??
          '',
        actualMinimum:
          outputs.length >
            0
            ? Math.min(
                ...outputs,
              )
            : null,
        actualMaximum:
          outputs.length >
            0
            ? Math.max(
                ...outputs,
              )
            : null,
        xSteps:
          gridPoints,
      })

      setFeedback(
        `Quadratic model fitted to ${model.resolvedSampleCount} resolved points with RMSE ${formatNumber(model.rmse)}.`,
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

    const csv =
      createResponseSurfaceCsv(
        analysis.samples,
        analysis.model,
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
      'response-surface-model.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Response-surface observations and residuals exported as CSV.',
    )
  }

  return (
    <section
      className="response-surface-panel"
      aria-labelledby="response-surface-title"
    >
      <header className="response-surface-header">
        <div>
          <span>
            Quadratic surrogate modelling
          </span>

          <h3 id="response-surface-title">
            Response surface model
          </h3>

          <p>
            Sample one or two engineering variables,
            fit a second-order response model and predict
            the optimum point inside the selected ranges.
          </p>
        </div>

        <strong>
          Maximum 25 Solver evaluations
        </strong>
      </header>

      {assignments.length ===
      0 ? (
        <div className="response-surface-empty">
          Add numeric assignments such as T=350 K,
          P=200000 Pa or Q=0.02 m³/s to the problem.
        </div>
      ) : (
        <>
          <div className="response-surface-controls">
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

              <div>
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
                        event.target.value,
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
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
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
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    One-variable response curve
                  </option>

                  {assignments
                    .filter(
                      (
                        assignment,
                      ) =>
                        assignment.symbol !==
                        xSymbol,
                    )
                    .map(
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

              <div>
                <label>
                  Minimum

                  <input
                    type="number"
                    disabled={
                      !ySymbol
                    }
                    value={
                      yMinimum
                    }
                    onChange={(
                      event,
                    ) =>
                      setYMinimum(
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Maximum

                  <input
                    type="number"
                    disabled={
                      !ySymbol
                    }
                    value={
                      yMaximum
                    }
                    onChange={(
                      event,
                    ) =>
                      setYMaximum(
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
            </article>

            <article>
              <span>
                Model settings
              </span>

              <label>
                Grid density

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
                        {
                          ySymbol
                            ? `${option} × ${option}`
                            : `${option} points`
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                Optimization objective

                <select
                  value={
                    objective
                  }
                  onChange={(
                    event,
                  ) =>
                    setObjective(
                      event.target.value as
                        ResponseSurfaceObjective,
                    )
                  }
                >
                  <option value="maximize">
                    Maximize predicted output
                  </option>

                  <option value="minimize">
                    Minimize predicted output
                  </option>
                </select>
              </label>

              <p>
                The model uses coded variables X and Y
                between −1 and +1 for numerical stability.
              </p>
            </article>
          </div>

          <div className="response-surface-actions">
            <button
              type="button"
              disabled={
                isRunning
              }
              onClick={
                buildResponseSurface
              }
            >
              {
                isRunning
                  ? 'Building response surface…'
                  : 'Build response surface'
              }
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export surface CSV
              </button>
            ) : null}

            <span>
              {
                gridPoints *
                (
                  ySymbol
                    ? gridPoints
                    : 1
                )
              } planned Solver evaluations
            </span>
          </div>

          {isRunning ? (
            <div
              className="response-surface-progress"
              role="status"
            >
              <div>
                <strong>
                  Evaluating response-surface design
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

          {feedback ? (
            <p
              className="response-surface-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="response-surface-summary">
                <article>
                  <span>
                    Predicted optimum
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .optimum
                          .predictedValue,
                      )
                    } {
                      analysis.outputUnit
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Model R²
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .model
                          .rSquared,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Model RMSE
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .model
                          .rmse,
                      )
                    } {
                      analysis.outputUnit
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Resolved samples
                  </span>

                  <strong>
                    {
                      analysis
                        .model
                        .resolvedSampleCount
                    } / {
                      analysis
                        .model
                        .totalSampleCount
                    }
                  </strong>
                </article>
              </div>

              <div className="response-surface-equation">
                <span>
                  Fitted quadratic model
                </span>

                <strong>
                  {
                    formatResponseSurfaceEquation(
                      analysis.model,
                    )
                  }
                </strong>

                <p>
                  X represents {
                    analysis.model.xSymbol
                  } and {
                    analysis.model.ySymbol
                      ? `Y represents ${analysis.model.ySymbol}.`
                      : 'the selected response curve uses one coded variable.'
                  }
                </p>
              </div>

              <div className="response-surface-optimum">
                <div>
                  <span>
                    Predicted optimum operating point
                  </span>

                  <strong>
                    {
                      analysis
                        .model
                        .xSymbol
                    } = {
                      formatNumber(
                        analysis
                          .optimum
                          .xValue,
                      )
                    }

                    {
                      analysis
                        .model
                        .ySymbol &&
                      analysis
                        .optimum
                        .yValue !==
                        null
                        ? ` · ${analysis.model.ySymbol} = ${formatNumber(analysis.optimum.yValue)}`
                        : ''
                    }
                  </strong>

                  <p>
                    Predicted {
                      analysis.outputLabel
                    }: {
                      formatNumber(
                        analysis
                          .optimum
                          .predictedValue,
                      )
                    } {
                      analysis.outputUnit
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onApplyProblem(
                      analysis
                        .optimum
                        .problem,
                    )
                  }
                >
                  Transfer predicted optimum to Solver
                </button>
              </div>

              <div className="response-surface-map-section">
                <header>
                  <div>
                    <span>
                      Solver sample map
                    </span>

                    <strong>
                      Observed {
                        analysis.outputLabel
                      }
                    </strong>
                  </div>

                  <p>
                    Darker cells represent higher observed outputs.
                  </p>
                </header>

                <div className="response-surface-map-scroll">
                  <div
                    className="response-surface-map"
                    style={{
                      gridTemplateColumns:
                        `repeat(${analysis.xSteps}, minmax(78px, 1fr))`,
                    }}
                  >
                    {analysis.samples.map(
                      (
                        sample,
                      ) => (
                        <div
                          key={
                            sample.id
                          }
                          data-band={
                            outputBand(
                              sample.outputValue,
                              analysis.actualMinimum,
                              analysis.actualMaximum,
                            )
                          }
                          title={
                            `${sample.xSymbol}=${formatNumber(sample.xValue)}${sample.ySymbol ? ` · ${sample.ySymbol}=${formatNumber(sample.yValue)}` : ''}`
                          }
                        >
                          <strong>
                            {
                              formatNumber(
                                sample.outputValue,
                              )
                            }
                          </strong>

                          <span>
                            {
                              sample.outputUnit
                            }
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="response-surface-table-scroll">
                <table className="response-surface-table">
                  <thead>
                    <tr>
                      <th>
                        Point
                      </th>

                      <th>
                        Inputs
                      </th>

                      <th>
                        Observed
                      </th>

                      <th>
                        Fitted
                      </th>

                      <th>
                        Residual
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysis.samples.map(
                      (
                        sample,
                      ) => {
                        const fitted =
                          predictResponseSurface(
                            analysis.model,
                            sample.xValue,
                            sample.yValue,
                          )

                        const residual =
                          sample.outputValue ===
                            null
                            ? null
                            : fitted -
                              sample.outputValue

                        return (
                          <tr
                            key={
                              sample.id
                            }
                          >
                            <td>
                              {
                                sample.id
                              }
                            </td>

                            <td>
                              {
                                sample.xSymbol
                              }={
                                formatNumber(
                                  sample.xValue,
                                )
                              }

                              {
                                sample.ySymbol
                                  ? ` · ${sample.ySymbol}=${formatNumber(sample.yValue)}`
                                  : ''
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  sample.outputValue,
                                )
                              } {
                                sample.outputUnit
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  fitted,
                                )
                              } {
                                sample.outputUnit
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  residual,
                                )
                              }
                            </td>
                          </tr>
                        )
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
