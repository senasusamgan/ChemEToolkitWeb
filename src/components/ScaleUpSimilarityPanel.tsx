import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  calculateScaleUpSimilarity,
  createScaleUpCsv,
  createScaleUpProblem,
} from '../features/problem-solver/scaleUpSimilarityEngine'
import type {
  ScaleUpCriterion,
  ScaleUpSimilarityResult,
} from '../features/problem-solver/scaleUpSimilarityEngine'

import '../styles/scale-up-similarity-panel.css'

interface ScaleUpSimilarityPanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface ScaleUpAnalysis {
  result:
    ScaleUpSimilarityResult
  scaledProblem: string
}

const CRITERION_OPTIONS: {
  value:
    ScaleUpCriterion
  label: string
  description: string
}[] = [
  {
    value:
      'reynolds',
    label:
      'Constant Reynolds number',
    description:
      'Preserves the inertial-to-viscous force ratio.',
  },
  {
    value:
      'froude',
    label:
      'Constant Froude number',
    description:
      'Preserves the inertial-to-gravitational force ratio.',
  },
  {
    value:
      'weber',
    label:
      'Constant Weber number',
    description:
      'Preserves the inertial-to-surface-tension force ratio.',
  },
]

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

function selectedAssignmentValue(
  assignments:
    ReturnType<
      typeof parseConstraintAssignments
    >,
  symbol: string,
  fallback: number,
): number {
  return assignments.find(
    (
      assignment,
    ) =>
      assignment.symbol ===
      symbol,
  )
    ?.value ??
    fallback
}

export function ScaleUpSimilarityPanel({
  baseQuery,
  onApplyProblem,
}: ScaleUpSimilarityPanelProps) {
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

  const initialLengthSymbol =
    assignments[0]
      ?.symbol ??
    ''

  const initialVelocitySymbol =
    assignments[1]
      ?.symbol ??
    ''

  const [
    lengthSymbol,
    setLengthSymbol,
  ] = useState(
    initialLengthSymbol,
  )

  const [
    velocitySymbol,
    setVelocitySymbol,
  ] = useState(
    initialVelocitySymbol,
  )

  const [
    criterion,
    setCriterion,
  ] = useState<
    ScaleUpCriterion
  >(
    'reynolds',
  )

  const [
    prototypeLength,
    setPrototypeLength,
  ] = useState(
    String(
      assignments[0]
        ?.value ??
      1,
    ),
  )

  const [
    scaleLength,
    setScaleLength,
  ] = useState(
    String(
      (
        assignments[0]
          ?.value ??
        1
      ) *
      5,
    ),
  )

  const [
    prototypeVelocity,
    setPrototypeVelocity,
  ] = useState(
    String(
      assignments[1]
        ?.value ??
      1,
    ),
  )

  const [
    density,
    setDensity,
  ] = useState(
    '1000',
  )

  const [
    dynamicViscosity,
    setDynamicViscosity,
  ] = useState(
    '0.001',
  )

  const [
    gravity,
    setGravity,
  ] = useState(
    '9.80665',
  )

  const [
    surfaceTension,
    setSurfaceTension,
  ] = useState(
    '0.072',
  )

  const [
    analysis,
    setAnalysis,
  ] = useState<
    ScaleUpAnalysis | null
  >(null)

  const [
    feedback,
    setFeedback,
  ] = useState('')

  useEffect(
    () => {
      const nextLength =
        assignments[0]

      const nextVelocity =
        assignments[1]

      setLengthSymbol(
        nextLength
          ?.symbol ??
        '',
      )

      setVelocitySymbol(
        nextVelocity
          ?.symbol ??
        '',
      )

      setPrototypeLength(
        String(
          nextLength
            ?.value ??
          1,
        ),
      )

      setScaleLength(
        String(
          (
            nextLength
              ?.value ??
            1
          ) *
          5,
        ),
      )

      setPrototypeVelocity(
        String(
          nextVelocity
            ?.value ??
          1,
        ),
      )

      setAnalysis(
        null,
      )

      setFeedback('')
    },
    [
      assignments,
    ],
  )

  function updateLengthSymbol(
    symbol: string,
  ) {
    setLengthSymbol(
      symbol,
    )

    const value =
      selectedAssignmentValue(
        assignments,
        symbol,
        1,
      )

    setPrototypeLength(
      String(
        value,
      ),
    )

    setScaleLength(
      String(
        value *
        5,
      ),
    )

    if (
      velocitySymbol ===
      symbol
    ) {
      setVelocitySymbol('')
    }

    setAnalysis(null)
  }

  function updateVelocitySymbol(
    symbol: string,
  ) {
    setVelocitySymbol(
      symbol,
    )

    const value =
      selectedAssignmentValue(
        assignments,
        symbol,
        1,
      )

    setPrototypeVelocity(
      String(
        value,
      ),
    )

    setAnalysis(null)
  }

  function calculateAnalysis() {
    if (
      !lengthSymbol ||
      !velocitySymbol
    ) {
      setFeedback(
        'Select separate length and velocity variables from the problem.',
      )

      return
    }

    if (
      lengthSymbol ===
      velocitySymbol
    ) {
      setFeedback(
        'Length and velocity must use different problem variables.',
      )

      return
    }

    const input = {
      criterion,
      prototypeLength:
        Number(
          prototypeLength,
        ),
      scaleLength:
        Number(
          scaleLength,
        ),
      prototypeVelocity:
        Number(
          prototypeVelocity,
        ),
      density:
        Number(
          density,
        ),
      dynamicViscosity:
        Number(
          dynamicViscosity,
        ),
      gravity:
        Number(
          gravity,
        ),
      surfaceTension:
        Number(
          surfaceTension,
        ),
    }

    const result =
      calculateScaleUpSimilarity(
        input,
      )

    if (!result) {
      setFeedback(
        'All scale-up inputs must be positive finite numbers.',
      )

      return
    }

    const scaledProblem =
      createScaleUpProblem(
        baseQuery,
        lengthSymbol,
        velocitySymbol,
        input.scaleLength,
        result.recommendedVelocity,
      )

    setAnalysis({
      result,
      scaledProblem,
    })

    setFeedback(
      `${result.preservedMetricLabel} preserved with a recommended scale velocity of ${formatNumber(result.recommendedVelocity)}.`,
    )
  }

  function exportCsv() {
    if (!analysis) {
      return
    }

    const blob =
      new Blob(
        [
          createScaleUpCsv(
            analysis.result,
          ),
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
      'scale-up-similarity-analysis.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Scale-up similarity report exported as CSV.',
    )
  }

  const selectedCriterion =
    CRITERION_OPTIONS.find(
      (
        option,
      ) =>
        option.value ===
        criterion,
    )

  return (
    <section
      className="scale-up-similarity-panel"
      aria-labelledby="scale-up-similarity-title"
    >
      <header className="scale-up-similarity-header">
        <div>
          <span>
            Process scale-up engineering
          </span>

          <h3 id="scale-up-similarity-title">
            Scale-up similarity assistant
          </h3>

          <p>
            Calculate the scale velocity required to
            preserve Reynolds, Froude or Weber similarity
            and review the trade-off across all three
            dimensionless groups.
          </p>
        </div>

        <strong>
          Re · Fr · We similarity
        </strong>
      </header>

      {assignments.length <
      2 ? (
        <div className="scale-up-similarity-empty">
          Add at least two numeric assignments to the
          engineering problem so length and velocity
          variables can be selected.
        </div>
      ) : (
        <>
          <div className="scale-up-symbol-controls">
            <label>
              Characteristic-length variable

              <select
                value={
                  lengthSymbol
                }
                onChange={(
                  event,
                ) =>
                  updateLengthSymbol(
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
              Characteristic-velocity variable

              <select
                value={
                  velocitySymbol
                }
                onChange={(
                  event,
                ) =>
                  updateVelocitySymbol(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select velocity variable
                </option>

                {assignments
                  .filter(
                    (
                      assignment,
                    ) =>
                      assignment.symbol !==
                      lengthSymbol,
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
          </div>

          <div className="scale-up-criterion-grid">
            {CRITERION_OPTIONS.map(
              (
                option,
              ) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  data-selected={
                    criterion ===
                    option.value
                      ? 'true'
                      : 'false'
                  }
                  onClick={() => {
                    setCriterion(
                      option.value,
                    )

                    setAnalysis(
                      null,
                    )
                  }}
                >
                  <strong>
                    {option.label}
                  </strong>

                  <span>
                    {option.description}
                  </span>
                </button>
              ),
            )}
          </div>

          <div className="scale-up-input-grid">
            <article>
              <span>
                Geometry and velocity
              </span>

              <label>
                Prototype length, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    prototypeLength
                  }
                  onChange={(
                    event,
                  ) => {
                    setPrototypeLength(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Scale-up length, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    scaleLength
                  }
                  onChange={(
                    event,
                  ) => {
                    setScaleLength(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Prototype velocity, m/s

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    prototypeVelocity
                  }
                  onChange={(
                    event,
                  ) => {
                    setPrototypeVelocity(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>
            </article>

            <article>
              <span>
                Fluid properties
              </span>

              <label>
                Density, kg/m³

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    density
                  }
                  onChange={(
                    event,
                  ) => {
                    setDensity(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Dynamic viscosity, Pa·s

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    dynamicViscosity
                  }
                  onChange={(
                    event,
                  ) => {
                    setDynamicViscosity(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Surface tension, N/m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    surfaceTension
                  }
                  onChange={(
                    event,
                  ) => {
                    setSurfaceTension(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>
            </article>

            <article>
              <span>
                Similarity basis
              </span>

              <label>
                Gravitational acceleration, m/s²

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    gravity
                  }
                  onChange={(
                    event,
                  ) => {
                    setGravity(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <strong>
                {
                  selectedCriterion
                    ?.label
                }
              </strong>

              <p>
                {
                  selectedCriterion
                    ?.description
                }
              </p>

              <small>
                Values should be supplied in SI units.
              </small>
            </article>
          </div>

          <div className="scale-up-actions">
            <button
              type="button"
              onClick={
                calculateAnalysis
              }
            >
              Calculate scale-up similarity
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export similarity CSV
              </button>
            ) : null}

            <span>
              Deterministic dimensionless analysis
            </span>
          </div>

          {feedback ? (
            <p
              className="scale-up-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="scale-up-summary">
                <article>
                  <span>
                    Recommended scale velocity
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .recommendedVelocity,
                      )
                    } m/s
                  </strong>
                </article>

                <article>
                  <span>
                    Geometric scale ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .scaleRatio,
                      )
                    }×
                  </strong>
                </article>

                <article>
                  <span>
                    Preserved criterion
                  </span>

                  <strong>
                    {
                      analysis
                        .result
                        .preservedMetricLabel
                    }
                  </strong>
                </article>

                <article>
                  <span>
                    Overall similarity score
                  </span>

                  <strong>
                    {
                      analysis
                        .result
                        .overallSimilarityScore
                        .toFixed(
                          1,
                        )
                    }%
                  </strong>
                </article>
              </div>

              <div className="scale-up-metric-table-scroll">
                <table className="scale-up-metric-table">
                  <thead>
                    <tr>
                      <th>
                        Dimensionless group
                      </th>

                      <th>
                        Prototype
                      </th>

                      <th>
                        Scale-up
                      </th>

                      <th>
                        Ratio
                      </th>

                      <th>
                        Similarity
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analysis
                      .result
                      .metrics
                      .map(
                        (
                          metric,
                        ) => (
                          <tr
                            key={
                              metric.key
                            }
                            data-preserved={
                              metric.isPreserved
                                ? 'true'
                                : 'false'
                            }
                          >
                            <td>
                              <strong>
                                {
                                  metric.label
                                }
                              </strong>

                              {metric.isPreserved ? (
                                <small>
                                  Preserved criterion
                                </small>
                              ) : null}
                            </td>

                            <td>
                              {
                                formatNumber(
                                  metric.prototypeValue,
                                )
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  metric.scaleValue,
                                )
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  metric.ratio,
                                )
                              }
                            </td>

                            <td>
                              <div className="scale-up-score">
                                <progress
                                  value={
                                    metric.score
                                  }
                                  max="100"
                                />

                                <span>
                                  {
                                    metric.score.toFixed(
                                      1,
                                    )
                                  }%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                  </tbody>
                </table>
              </div>

              <div className="scale-up-transfer">
                <div>
                  <span>
                    Scaled engineering case
                  </span>

                  <strong>
                    {
                      lengthSymbol
                    } = {
                      formatNumber(
                        Number(
                          scaleLength,
                        ),
                      )
                    } · {
                      velocitySymbol
                    } = {
                      formatNumber(
                        analysis
                          .result
                          .recommendedVelocity,
                      )
                    }
                  </strong>

                  <p>
                    The selected characteristic length and
                    calculated scale velocity will replace
                    their current problem assignments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onApplyProblem(
                      analysis
                        .scaledProblem,
                    )
                  }
                >
                  Transfer scaled case to Solver
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
