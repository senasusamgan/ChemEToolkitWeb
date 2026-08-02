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
  createFullFactorialCsv,
  createFullFactorialDesign,
  summarizeFullFactorialDesign,
} from '../features/problem-solver/fullFactorialDoeEngine'
import type {
  FactorialDesignCase,
  FactorialDesignSummary,
  FactorialFactor,
  FactorialObjective,
} from '../features/problem-solver/fullFactorialDoeEngine'
import {
  requestProblemSolverMatches,
} from '../features/problem-solver/problemSolverWorkerClient'

import '../styles/full-factorial-doe-panel.css'

interface FullFactorialDoePanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface FactorRangeDraft {
  low: string
  high: string
}

interface EvaluatedDoeCase
  extends FactorialDesignCase {
  calculatorTitle: string
  outputLabel: string
  outputUnit: string
  outputValue:
    number | null
}

interface DoeAnalysis {
  cases:
    EvaluatedDoeCase[]
  summary:
    FactorialDesignSummary
  outputLabel: string
  outputUnit: string
}

const MAXIMUM_FACTOR_COUNT =
  3

const EVALUATION_BATCH_SIZE =
  3

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

function createSuggestedRange(
  value: number,
): FactorRangeDraft {
  const span =
    Math.abs(
      value,
    ) *
    0.2 ||
    1

  return {
    low:
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
    high:
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

function createRangeMap(
  assignments:
    ConstraintAssignment[],
): Record<
  string,
  FactorRangeDraft
> {
  return Object.fromEntries(
    assignments.map(
      (
        assignment,
      ) => [
        assignment.symbol,
        createSuggestedRange(
          assignment.value,
        ),
      ],
    ),
  )
}

function createInitialSymbols(
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

export function FullFactorialDoePanel({
  baseQuery,
  onApplyProblem,
}: FullFactorialDoePanelProps) {
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
      createInitialSymbols(
        assignments,
      ),
  )

  const [
    factorRanges,
    setFactorRanges,
  ] = useState<
    Record<
      string,
      FactorRangeDraft
    >
  >(
    () =>
      createRangeMap(
        assignments,
      ),
  )

  const [
    objective,
    setObjective,
  ] = useState<
    FactorialObjective
  >(
    'maximize',
  )

  const [
    analysis,
    setAnalysis,
  ] = useState<
    DoeAnalysis | null
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
    feedback,
    setFeedback,
  ] = useState('')

  const runIdRef =
    useRef(0)

  useEffect(
    () => {
      setSelectedSymbols(
        createInitialSymbols(
          assignments,
        ),
      )

      setFactorRanges(
        createRangeMap(
          assignments,
        ),
      )

      setAnalysis(
        null,
      )

      setSelectedCaseId('')
      setCompletedCaseCount(0)
      setTotalCaseCount(0)
      setFeedback('')
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

  const bestCase =
    analysis
      ?.cases
      .find(
        (
          item,
        ) =>
          item.id ===
          analysis
            .summary
            .bestCaseId,
      ) ??
    null

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

  function toggleFactor(
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
          MAXIMUM_FACTOR_COUNT
        ) {
          setFeedback(
            `Select no more than ${MAXIMUM_FACTOR_COUNT} factors.`,
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

  function updateRange(
    symbol: string,
    field:
      keyof FactorRangeDraft,
    value: string,
  ) {
    setFactorRanges(
      (
        current,
      ) => ({
        ...current,
        [
          symbol
        ]: {
          ...current[
            symbol
          ],
          [
            field
          ]:
            value,
        },
      }),
    )

    setAnalysis(
      null,
    )
  }

  async function runDesign() {
    if (
      selectedSymbols.length ===
      0
    ) {
      setFeedback(
        'Select at least one numeric factor.',
      )

      return
    }

    const factors:
      FactorialFactor[] = []

    for (
      const symbol
      of selectedSymbols
    ) {
      const assignment =
        assignments.find(
          (
            item,
          ) =>
            item.symbol ===
            symbol,
        )

      const range =
        factorRanges[
          symbol
        ]

      const lowValue =
        Number(
          range
            ?.low,
        )

      const highValue =
        Number(
          range
            ?.high,
        )

      if (
        !assignment ||
        !range ||
        !Number.isFinite(
          lowValue,
        ) ||
        !Number.isFinite(
          highValue,
        ) ||
        highValue <=
          lowValue
      ) {
        setFeedback(
          `Low and high values for ${symbol} must define a valid increasing range.`,
        )

        return
      }

      factors.push({
        symbol,
        nominalValue:
          assignment.value,
        lowValue,
        highValue,
      })
    }

    const design =
      createFullFactorialDesign(
        baseQuery,
        factors,
      )

    if (
      design.length ===
      0
    ) {
      setFeedback(
        'The selected factors could not produce a factorial design.',
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
      design.length,
    )

    setFeedback(
      `Evaluating ${design.length} full-factorial runs in the background Solver worker.`,
    )

    const evaluatedCases:
      EvaluatedDoeCase[] = []

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
                designCase,
              ):
                Promise<EvaluatedDoeCase> => {
                try {
                  const result =
                    await requestProblemSolverMatches(
                      designCase.problem,
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
                    ...designCase,
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
                    ...designCase,
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

        evaluatedCases.push(
          ...evaluatedBatch,
        )

        setCompletedCaseCount(
          evaluatedCases.length,
        )
      }

      const summary =
        summarizeFullFactorialDesign(
          evaluatedCases,
          factors,
          objective,
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
        summary.bestCaseId ??
        evaluatedCases[0]
          ?.id ??
        ''

      setAnalysis({
        cases:
          evaluatedCases,
        summary,
        outputLabel:
          firstResolved
            ?.outputLabel ??
          'Output',
        outputUnit:
          firstResolved
            ?.outputUnit ??
          '',
      })

      setSelectedCaseId(
        nextSelectedCaseId,
      )

      setFeedback(
        `${summary.resolvedCaseCount} of ${summary.totalCaseCount} experimental runs produced numeric results.`,
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
      createFullFactorialCsv(
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
      'full-factorial-design-of-experiments.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Full-factorial experimental design exported as CSV.',
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
      className="factorial-doe-panel"
      aria-labelledby="factorial-doe-title"
    >
      <header className="factorial-doe-header">
        <div>
          <span>
            Structured process experimentation
          </span>

          <h3 id="factorial-doe-title">
            Full-factorial design of experiments
          </h3>

          <p>
            Evaluate every low–high factor combination,
            quantify main and interaction effects and
            transfer the best experimental condition back
            to the Solver.
          </p>
        </div>

        <strong>
          Maximum 3 factors · 9 runs
        </strong>
      </header>

      {assignments.length ===
      0 ? (
        <div className="factorial-doe-empty">
          Add numeric assignments such as T=350 K,
          P=200000 Pa or Q=0.02 m³/s to the problem.
        </div>
      ) : (
        <>
          <div className="factorial-doe-factor-grid">
            {assignments.map(
              (
                assignment,
              ) => {
                const selected =
                  selectedSymbols.includes(
                    assignment.symbol,
                  )

                const range =
                  factorRanges[
                    assignment.symbol
                  ]

                return (
                  <article
                    key={
                      assignment.symbol
                    }
                    data-selected={
                      selected
                        ? 'true'
                        : 'false'
                    }
                  >
                    <label className="factorial-doe-toggle">
                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        onChange={() =>
                          toggleFactor(
                            assignment.symbol,
                          )
                        }
                      />

                      <strong>
                        {
                          assignment.symbol
                        }
                      </strong>
                    </label>

                    <p>
                      Center: {
                        formatNumber(
                          assignment.value,
                        )
                      } {
                        assignment.unit
                      }
                    </p>

                    <div>
                      <label>
                        Low

                        <input
                          type="number"
                          disabled={
                            !selected
                          }
                          value={
                            range
                              ?.low ??
                            ''
                          }
                          onChange={(
                            event,
                          ) =>
                            updateRange(
                              assignment.symbol,
                              'low',
                              event.target.value,
                            )
                          }
                        />
                      </label>

                      <label>
                        High

                        <input
                          type="number"
                          disabled={
                            !selected
                          }
                          value={
                            range
                              ?.high ??
                            ''
                          }
                          onChange={(
                            event,
                          ) =>
                            updateRange(
                              assignment.symbol,
                              'high',
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    </div>
                  </article>
                )
              },
            )}
          </div>

          <div className="factorial-doe-objective">
            <div>
              <span>
                Experimental objective
              </span>

              <strong>
                Select the preferred response direction
              </strong>
            </div>

            <label>
              Objective

              <select
                value={
                  objective
                }
                onChange={(
                  event,
                ) =>
                  setObjective(
                    event.target.value as
                      FactorialObjective,
                  )
                }
              >
                <option value="maximize">
                  Maximize output
                </option>

                <option value="minimize">
                  Minimize output
                </option>
              </select>
            </label>

            <p>
              {
                selectedSymbols.length >
                  0
                  ? (
                      2 **
                      selectedSymbols.length
                    ) +
                    1
                  : 0
              } planned runs including one center point.
            </p>
          </div>

          <div className="factorial-doe-actions">
            <button
              type="button"
              disabled={
                isRunning
              }
              onClick={
                runDesign
              }
            >
              {
                isRunning
                  ? 'Evaluating experimental design…'
                  : 'Run full-factorial DOE'
              }
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export DOE CSV
              </button>
            ) : null}

            <span>
              Background Solver worker
            </span>
          </div>

          {isRunning ? (
            <div
              className="factorial-doe-progress"
              role="status"
            >
              <div>
                <strong>
                  Evaluating design runs
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

          {feedback ? (
            <p
              className="factorial-doe-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="factorial-doe-summary">
                <article>
                  <span>
                    Best experimental output
                  </span>

                  <strong>
                    {
                      formatNumber(
                        bestCase
                          ?.outputValue ??
                        null,
                      )
                    } {
                      analysis.outputUnit
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Response span
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .summary
                          .responseSpan,
                      )
                    } {
                      analysis.outputUnit
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Strongest factor
                  </span>

                  <strong>
                    {
                      analysis
                        .summary
                        .strongestFactorSymbol ??
                      '—'
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Center-point output
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .summary
                          .centerOutput,
                      )
                    } {
                      analysis.outputUnit
                    }
                  </strong>
                </article>
              </div>

              <div className="factorial-doe-effects">
                <article>
                  <header>
                    <span>
                      Main factor effects
                    </span>

                    <strong>
                      High mean − low mean
                    </strong>
                  </header>

                  <div className="factorial-doe-effect-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            Factor
                          </th>

                          <th>
                            Low mean
                          </th>

                          <th>
                            High mean
                          </th>

                          <th>
                            Main effect
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {analysis
                          .summary
                          .mainEffects
                          .map(
                            (
                              effect,
                            ) => (
                              <tr
                                key={
                                  effect.symbol
                                }
                              >
                                <td>
                                  <strong>
                                    {
                                      effect.symbol
                                    }
                                  </strong>
                                </td>

                                <td>
                                  {
                                    formatNumber(
                                      effect.lowMean,
                                    )
                                  }
                                </td>

                                <td>
                                  {
                                    formatNumber(
                                      effect.highMean,
                                    )
                                  }
                                </td>

                                <td>
                                  {
                                    formatNumber(
                                      effect.mainEffect,
                                    )
                                  } {
                                    analysis.outputUnit
                                  }
                                </td>
                              </tr>
                            ),
                          )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article>
                  <header>
                    <span>
                      Two-factor interactions
                    </span>

                    <strong>
                      Same-direction − opposite-direction
                    </strong>
                  </header>

                  {
                    analysis
                      .summary
                      .interactionEffects
                      .length >
                    0
                      ? (
                          <div className="factorial-doe-effect-table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>
                                    Interaction
                                  </th>

                                  <th>
                                    Same
                                  </th>

                                  <th>
                                    Opposite
                                  </th>

                                  <th>
                                    Effect
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {analysis
                                  .summary
                                  .interactionEffects
                                  .map(
                                    (
                                      effect,
                                    ) => (
                                      <tr
                                        key={
                                          `${effect.firstSymbol}-${effect.secondSymbol}`
                                        }
                                      >
                                        <td>
                                          <strong>
                                            {
                                              effect.firstSymbol
                                            } × {
                                              effect.secondSymbol
                                            }
                                          </strong>
                                        </td>

                                        <td>
                                          {
                                            formatNumber(
                                              effect
                                                .sameDirectionMean,
                                            )
                                          }
                                        </td>

                                        <td>
                                          {
                                            formatNumber(
                                              effect
                                                .oppositeDirectionMean,
                                            )
                                          }
                                        </td>

                                        <td>
                                          {
                                            formatNumber(
                                              effect
                                                .interactionEffect,
                                            )
                                          } {
                                            analysis.outputUnit
                                          }
                                        </td>
                                      </tr>
                                    ),
                                  )}
                              </tbody>
                            </table>
                          </div>
                        )
                      : (
                          <p>
                            Select two or three factors to calculate
                            interaction effects.
                          </p>
                        )
                  }
                </article>
              </div>

              <div className="factorial-doe-run-table-scroll">
                <table className="factorial-doe-run-table">
                  <thead>
                    <tr>
                      <th>
                        Run
                      </th>

                      <th>
                        Factor levels
                      </th>

                      <th>
                        {
                          analysis.outputLabel
                        }
                      </th>

                      <th>
                        Calculator
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
                          data-best={
                            item.id ===
                            analysis
                              .summary
                              .bestCaseId
                              ? 'true'
                              : 'false'
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

                            {item.isCenter ? (
                              <small>
                                Center point
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
                                    `${symbol}=${formatNumber(value)}`,
                                )
                                .join(
                                  ' · ',
                                )
                            }
                          </td>

                          <td>
                            {
                              formatNumber(
                                item.outputValue,
                              )
                            } {
                              item.outputUnit
                            }
                          </td>

                          <td>
                            {
                              item.calculatorTitle
                            }
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
                <div className="factorial-doe-selected">
                  <div>
                    <span>
                      Selected experimental condition
                    </span>

                    <strong>
                      {
                        selectedCase.label
                      }
                    </strong>

                    <p>
                      {
                        selectedCase.outputLabel
                      } = {
                        formatNumber(
                          selectedCase.outputValue,
                        )
                      } {
                        selectedCase.outputUnit
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      selectedCase.outputValue ===
                      null
                    }
                    onClick={
                      transferSelectedCase
                    }
                  >
                    Transfer selected DOE run to Solver
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
