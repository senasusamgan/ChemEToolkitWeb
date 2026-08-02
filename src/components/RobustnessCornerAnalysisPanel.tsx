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
  classifyRobustnessOutput,
  createRobustnessCornerCases,
  createRobustnessCsv,
  summarizeRobustnessCases,
} from '../features/problem-solver/robustnessCornerEngine'
import type {
  RobustnessCornerCase,
  RobustnessEvaluatedCase,
  RobustnessStatus,
  RobustnessSummary,
  RobustnessVariable,
} from '../features/problem-solver/robustnessCornerEngine'
import {
  requestProblemSolverMatches,
} from '../features/problem-solver/problemSolverWorkerClient'

import '../styles/robustness-corner-analysis-panel.css'

interface RobustnessCornerAnalysisPanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface EvaluatedRobustnessCase
  extends RobustnessCornerCase {
  calculatorTitle: string
  outputLabel: string
  outputUnit: string
  outputValue:
    number | null
  status:
    RobustnessStatus
  withinLimits: boolean
  signedMargin:
    number | null
  boundaryDistance:
    number | null
}

interface RobustnessAnalysis {
  cases:
    EvaluatedRobustnessCase[]
  summary:
    RobustnessSummary
  variables:
    RobustnessVariable[]
  outputLabel: string
  outputUnit: string
  lowerBound:
    number | null
  upperBound:
    number | null
}

const MAXIMUM_VARIABLE_COUNT =
  4

const EVALUATION_BATCH_SIZE =
  4

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

function initialSelectedSymbols(
  assignments:
    ConstraintAssignment[],
): string[] {
  return assignments
    .slice(
      0,
      Math.min(
        2,
        assignments.length,
      ),
    )
    .map(
      (
        assignment,
      ) =>
        assignment.symbol,
    )
}

function initialToleranceMap(
  assignments:
    ConstraintAssignment[],
): Record<
  string,
  string
> {
  return Object.fromEntries(
    assignments.map(
      (
        assignment,
      ) => [
        assignment.symbol,
        '5',
      ],
    ),
  )
}

export function RobustnessCornerAnalysisPanel({
  baseQuery,
  onApplyProblem,
}: RobustnessCornerAnalysisPanelProps) {
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

  const [
    selectedSymbols,
    setSelectedSymbols,
  ] = useState<
    string[]
  >(
    () =>
      initialSelectedSymbols(
        assignments,
      ),
  )

  const [
    tolerances,
    setTolerances,
  ] = useState<
    Record<
      string,
      string
    >
  >(
    () =>
      initialToleranceMap(
        assignments,
      ),
  )

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
    RobustnessAnalysis | null
  >(null)

  const [
    selectedCaseId,
    setSelectedCaseId,
  ] = useState('')

  const [
    isRunning,
    setIsRunning,
  ] = useState(false)

  const [
    completedCaseCount,
    setCompletedCaseCount,
  ] = useState(0)

  const [
    totalCaseCount,
    setTotalCaseCount,
  ] = useState(0)

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const runIdRef =
    useRef(0)

  useEffect(
    () => {
      setSelectedSymbols(
        initialSelectedSymbols(
          assignments,
        ),
      )

      setTolerances(
        initialToleranceMap(
          assignments,
        ),
      )

      setAnalysis(
        null,
      )

      setSelectedCaseId('')
      setFeedbackMessage('')
      setCompletedCaseCount(0)
      setTotalCaseCount(0)
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

  const selectedVariables =
    useMemo(
      () =>
        selectedSymbols
          .map(
            (
              symbol,
            ) => {
              const assignment =
                assignments.find(
                  (
                    candidate,
                  ) =>
                    candidate.symbol ===
                    symbol,
                )

              const tolerance =
                Number(
                  tolerances[
                    symbol
                  ],
                )

              if (
                !assignment ||
                !Number.isFinite(
                  tolerance,
                )
              ) {
                return null
              }

              return {
                symbol:
                  assignment.symbol,
                nominalValue:
                  assignment.value,
                tolerancePercent:
                  tolerance,
              }
            },
          )
          .filter(
            (
              variable,
            ):
              variable is RobustnessVariable =>
                variable !==
                null,
          ),
      [
        assignments,
        selectedSymbols,
        tolerances,
      ],
    )

  const selectedCase =
    analysis
      ?.cases
      .find(
        (
          item,
        ) =>
          item.id ===
          selectedCaseId,
      ) ??
    null

  const minimumCase =
    analysis
      ?.cases
      .find(
        (
          item,
        ) =>
          item.id ===
          analysis
            .summary
            .minimumCaseId,
      ) ??
    null

  const maximumCase =
    analysis
      ?.cases
      .find(
        (
          item,
        ) =>
          item.id ===
          analysis
            .summary
            .maximumCaseId,
      ) ??
    null

  const worstCase =
    analysis
      ?.cases
      .find(
        (
          item,
        ) =>
          item.id ===
          analysis
            .summary
            .worstCaseId,
      ) ??
    null

  function toggleVariable(
    symbol: string,
  ) {
    setSelectedSymbols(
      (
        current,
      ) => {
        if (
          current.includes(
            symbol,
          )
        ) {
          return current.filter(
            (
              item,
            ) =>
              item !==
              symbol,
          )
        }

        if (
          current.length >=
          MAXIMUM_VARIABLE_COUNT
        ) {
          setFeedbackMessage(
            `Select no more than ${MAXIMUM_VARIABLE_COUNT} variables.`,
          )

          return current
        }

        return [
          ...current,
          symbol,
        ]
      },
    )

    setAnalysis(
      null,
    )
  }

  function updateTolerance(
    symbol: string,
    value: string,
  ) {
    setTolerances(
      (
        current,
      ) => ({
        ...current,
        [
          symbol
        ]:
          value,
      }),
    )

    setAnalysis(
      null,
    )
  }

  async function runRobustnessAnalysis() {
    if (
      selectedVariables.length ===
      0
    ) {
      setFeedbackMessage(
        'Select at least one numeric input for tolerance analysis.',
      )

      return
    }

    for (
      const variable
      of selectedVariables
    ) {
      if (
        variable.tolerancePercent <
          0 ||
        variable.tolerancePercent >
          100
      ) {
        setFeedbackMessage(
          `Tolerance for ${variable.symbol} must be between 0 and 100 percent.`,
        )

        return
      }
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

    const cornerCases =
      createRobustnessCornerCases(
        baseQuery,
        selectedVariables,
      )

    if (
      cornerCases.length ===
      0
    ) {
      setFeedbackMessage(
        'The selected variables could not produce tolerance corner cases.',
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

    setSelectedCaseId('')
    setCompletedCaseCount(0)

    setTotalCaseCount(
      cornerCases.length,
    )

    setFeedbackMessage(
      `Evaluating ${cornerCases.length} deterministic tolerance cases in the Solver worker.`,
    )

    const evaluatedCases:
      EvaluatedRobustnessCase[] = []

    try {
      for (
        let startIndex =
          0;
        startIndex <
          cornerCases.length;
        startIndex +=
          EVALUATION_BATCH_SIZE
      ) {
        const batch =
          cornerCases.slice(
            startIndex,
            startIndex +
              EVALUATION_BATCH_SIZE,
          )

        const evaluatedBatch =
          await Promise.all(
            batch.map(
              async (
                cornerCase,
              ):
                Promise<EvaluatedRobustnessCase> => {
                try {
                  const result =
                    await requestProblemSolverMatches(
                      cornerCase.problem,
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

                  const classification =
                    classifyRobustnessOutput(
                      outputValue,
                      parsedLowerBound,
                      parsedUpperBound,
                    )

                  return {
                    ...cornerCase,
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
                    ...classification,
                  }
                } catch {
                  return {
                    ...cornerCase,
                    calculatorTitle:
                      'Unresolved',
                    outputLabel:
                      'Output',
                    outputUnit:
                      '',
                    outputValue:
                      null,
                    ...classifyRobustnessOutput(
                      null,
                      parsedLowerBound,
                      parsedUpperBound,
                    ),
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

        evaluatedCases.push(
          ...evaluatedBatch,
        )

        setCompletedCaseCount(
          evaluatedCases.length,
        )
      }

      const summary =
        summarizeRobustnessCases(
          evaluatedCases as
            RobustnessEvaluatedCase[],
          selectedVariables,
        )

      const firstResolved =
        evaluatedCases.find(
          (
            item,
          ) =>
            item.outputValue !==
            null,
        )

      const nextSelectedCaseId =
        summary.worstCaseId ??
        summary.minimumCaseId ??
        evaluatedCases[0]
          ?.id ??
        ''

      setAnalysis({
        cases:
          evaluatedCases,
        summary,
        variables:
          selectedVariables,
        outputLabel:
          firstResolved
            ?.outputLabel ??
          'Output',
        outputUnit:
          firstResolved
            ?.outputUnit ??
          '',
        lowerBound:
          parsedLowerBound,
        upperBound:
          parsedUpperBound,
      })

      setSelectedCaseId(
        nextSelectedCaseId,
      )

      setFeedbackMessage(
        summary.robustPass
          ? 'Every deterministic tolerance case satisfies the configured output limits.'
          : `${summary.withinLimitCaseCount} of ${summary.totalCaseCount} tolerance cases are within the configured limits.`,
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

  function exportCsv() {
    if (!analysis) {
      return
    }

    const csv =
      createRobustnessCsv(
        analysis.cases,
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
      'worst-case-tolerance-analysis.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedbackMessage(
      'Worst-case tolerance analysis exported as CSV.',
    )
  }

  function transferSelectedCase() {
    if (
      !selectedCase ||
      selectedCase.outputValue ===
        null
    ) {
      return
    }

    onApplyProblem(
      selectedCase.problem,
    )
  }

  return (
    <section
      className="robustness-corner-panel"
      aria-labelledby="robustness-corner-title"
    >
      <header className="robustness-corner-header">
        <div>
          <span>
            Deterministic tolerance envelope
          </span>

          <h3 id="robustness-corner-title">
            Worst-case tolerance analysis
          </h3>

          <p>
            Evaluate every low–high input combination,
            identify the critical variable and transfer the
            worst operating case back to the Solver.
          </p>
        </div>

        <strong>
          Maximum 4 variables · 17 cases
        </strong>
      </header>

      {assignments.length ===
      0 ? (
        <div className="robustness-corner-empty">
          <strong>
            Numeric engineering inputs are required
          </strong>

          <p>
            Add assignments such as P=101325 Pa,
            T=300 K or Q=0.01 m³/s to the problem.
          </p>
        </div>
      ) : (
        <>
          <div className="robustness-variable-grid">
            {assignments.map(
              (
                assignment,
              ) => {
                const isSelected =
                  selectedSymbols.includes(
                    assignment.symbol,
                  )

                return (
                  <article
                    key={
                      assignment.symbol
                    }
                    data-selected={
                      isSelected
                        ? 'true'
                        : 'false'
                    }
                  >
                    <label className="robustness-variable-toggle">
                      <input
                        type="checkbox"
                        checked={
                          isSelected
                        }
                        onChange={() =>
                          toggleVariable(
                            assignment.symbol,
                          )
                        }
                      />

                      <span>
                        {
                          assignment.symbol
                        }
                      </span>
                    </label>

                    <p>
                      Nominal: {
                        formatEngineeringNumber(
                          assignment.value,
                        )
                      } {
                        assignment.unit
                      }
                    </p>

                    <label>
                      Tolerance, ±%

                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={
                          !isSelected
                        }
                        value={
                          tolerances[
                            assignment.symbol
                          ] ??
                          '5'
                        }
                        onChange={(
                          event,
                        ) =>
                          updateTolerance(
                            assignment.symbol,
                            event
                              .target
                              .value,
                          )
                        }
                      />
                    </label>
                  </article>
                )
              },
            )}
          </div>

          <div className="robustness-limit-controls">
            <article>
              <span>
                Output acceptance limits
              </span>

              <div>
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
              </div>

              <p>
                Without limits, the analysis still reports
                the deterministic minimum, maximum, span
                and critical input.
              </p>
            </article>

            <article>
              <span>
                Planned evaluation
              </span>

              <strong>
                {
                  selectedVariables.length >
                    0
                    ? (
                        2 **
                        selectedVariables.length
                      ) +
                      1
                    : 0
                } cases
              </strong>

              <p>
                One nominal case plus every selected
                low–high tolerance corner.
              </p>
            </article>
          </div>

          <div className="robustness-corner-actions">
            <button
              type="button"
              disabled={
                isRunning
              }
              onClick={
                runRobustnessAnalysis
              }
            >
              {
                isRunning
                  ? 'Evaluating tolerance corners…'
                  : 'Run worst-case analysis'
              }
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export CSV
              </button>
            ) : null}

            <span>
              Background Solver worker · deterministic
            </span>
          </div>

          {isRunning ? (
            <div
              className="robustness-corner-progress"
              role="status"
            >
              <div>
                <strong>
                  Evaluating engineering cases
                </strong>

                <span>
                  {completedCaseCount} / {totalCaseCount}
                </span>
              </div>

              <progress
                value={
                  completedCaseCount
                }
                max={
                  totalCaseCount ||
                  1
                }
              />
            </div>
          ) : null}

          {feedbackMessage ? (
            <p
              className="robustness-corner-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="robustness-summary-grid">
                <article>
                  <span>
                    Robust status
                  </span>

                  <strong
                    data-pass={
                      analysis
                        .summary
                        .robustPass
                        ? 'true'
                        : 'false'
                    }
                  >
                    {
                      analysis
                        .summary
                        .robustPass
                        ? 'PASS'
                        : 'REVIEW'
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Output range
                  </span>

                  <strong>
                    {
                      formatEngineeringNumber(
                        analysis
                          .summary
                          .minimumOutput,
                      )
                    } – {
                      formatEngineeringNumber(
                        analysis
                          .summary
                          .maximumOutput,
                      )
                    } {
                      analysis
                        .outputUnit
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Worst deviation
                  </span>

                  <strong>
                    {
                      formatEngineeringNumber(
                        analysis
                          .summary
                          .maximumAbsoluteDeviation,
                      )
                    } {
                      analysis
                        .outputUnit
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Limit coverage
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .coveragePercentage
                        .toFixed(
                          1,
                        )
                    }%
                  </strong>
                </article>
              </div>

              <div className="robustness-insight-grid">
                <article>
                  <span>
                    Critical input
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .criticalVariableSymbol ??
                      'Not resolved'
                    }
                  </strong>

                  <p>
                    Mean low-to-high output effect: {
                      formatEngineeringNumber(
                        analysis
                          .summary
                          .criticalVariableEffect,
                      )
                    } {
                      analysis
                        .outputUnit
                    }
                  </p>
                </article>

                <article>
                  <span>
                    Deterministic span
                  </span>

                  <strong>
                    {
                      formatEngineeringNumber(
                        analysis
                          .summary
                          .outputSpan,
                      )
                    } {
                      analysis
                        .outputUnit
                    }
                  </strong>

                  <p>
                    {
                      analysis
                        .summary
                        .resolvedCaseCount
                    } of {
                      analysis
                        .summary
                        .totalCaseCount
                    } cases produced a numeric Quick Solve result.
                  </p>
                </article>

                <article>
                  <span>
                    Minimum-output case
                  </span>

                  <strong>
                    {
                      minimumCase
                        ?.label ??
                      '—'
                    }
                  </strong>

                  <p>
                    {
                      formatEngineeringNumber(
                        minimumCase
                          ?.outputValue ??
                        null,
                      )
                    } {
                      analysis
                        .outputUnit
                    }
                  </p>
                </article>

                <article>
                  <span>
                    Maximum-output case
                  </span>

                  <strong>
                    {
                      maximumCase
                        ?.label ??
                      '—'
                    }
                  </strong>

                  <p>
                    {
                      formatEngineeringNumber(
                        maximumCase
                          ?.outputValue ??
                        null,
                      )
                    } {
                      analysis
                        .outputUnit
                    }
                  </p>
                </article>
              </div>

              <div className="robustness-case-table-scroll">
                <table className="robustness-case-table">
                  <thead>
                    <tr>
                      <th>
                        Scenario
                      </th>

                      <th>
                        Input corner
                      </th>

                      <th>
                        {
                          analysis
                            .outputLabel
                        }
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Select
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysis.cases.map(
                      (
                        item,
                      ) => (
                        <tr
                          key={
                            item.id
                          }
                          data-status={
                            item.status
                          }
                          data-selected={
                            selectedCaseId ===
                            item.id
                              ? 'true'
                              : 'false'
                          }
                        >
                          <td>
                            <strong>
                              {
                                item.label
                              }
                            </strong>

                            {item.id ===
                            worstCase
                              ?.id ? (
                              <small>
                                Worst deviation
                              </small>
                            ) : null}
                          </td>

                          <td>
                            {
                              Object.entries(
                                item.values,
                              )
                                .map(
                                  ([
                                    symbol,
                                    value,
                                  ]) =>
                                    `${symbol}=${formatEngineeringNumber(value)}`,
                                )
                                .join(
                                  ' · ',
                                )
                            }
                          </td>

                          <td>
                            {
                              formatEngineeringNumber(
                                item
                                  .outputValue,
                              )
                            } {
                              item
                                .outputUnit
                            }
                          </td>

                          <td>
                            <span>
                              {
                                item.status
                              }
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              aria-pressed={
                                selectedCaseId ===
                                item.id
                              }
                              onClick={() =>
                                setSelectedCaseId(
                                  item.id,
                                )
                              }
                            >
                              {
                                selectedCaseId ===
                                item.id
                                  ? 'Selected'
                                  : 'Select'
                              }
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {selectedCase ? (
                <div className="robustness-selected-case">
                  <div>
                    <span>
                      Selected tolerance case
                    </span>

                    <strong>
                      {
                        selectedCase
                          .label
                      }
                    </strong>

                    <p>
                      {
                        selectedCase
                          .calculatorTitle
                      } · {
                        selectedCase
                          .outputLabel
                      } = {
                        formatEngineeringNumber(
                          selectedCase
                            .outputValue,
                        )
                      } {
                        selectedCase
                          .outputUnit
                      } · {
                        selectedCase
                          .status
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      selectedCase
                        .outputValue ===
                      null
                    }
                    onClick={
                      transferSelectedCase
                    }
                  >
                    Transfer selected case to Solver
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
