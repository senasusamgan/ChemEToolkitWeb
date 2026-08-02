import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  calculateAgitatedVesselScaleUp,
  createAgitatedVesselScaleUpCsv,
  createAgitatedVesselScaleUpProblem,
} from '../features/problem-solver/agitatedVesselScaleUpEngine'
import type {
  AgitatedVesselScaleUpResult,
  AgitatorScaleUpCriterion,
} from '../features/problem-solver/agitatedVesselScaleUpEngine'

import '../styles/agitated-vessel-scale-up-panel.css'

interface AgitatedVesselScaleUpPanelProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
}

interface AgitatedVesselAnalysis {
  result:
    AgitatedVesselScaleUpResult
  scaledProblem: string
}

const CRITERIA: {
  value:
    AgitatorScaleUpCriterion
  label: string
  equation: string
  description: string
}[] = [
  {
    value:
      'tipSpeed',
    label:
      'Constant tip speed',
    equation:
      'N₂ = N₁(D₁/D₂)',
    description:
      'Controls maximum peripheral velocity and often shear exposure.',
  },
  {
    value:
      'powerPerVolume',
    label:
      'Constant power per volume',
    equation:
      'N₂ = N₁(D₁/D₂)²ᐟ³',
    description:
      'Maintains the specific mechanical-energy input under geometric similarity.',
  },
  {
    value:
      'reynolds',
    label:
      'Constant impeller Reynolds number',
    equation:
      'N₂ = N₁(D₁/D₂)²',
    description:
      'Maintains the inertial-to-viscous-force ratio.',
  },
  {
    value:
      'froude',
    label:
      'Constant impeller Froude number',
    equation:
      'N₂ = N₁√(D₁/D₂)',
    description:
      'Maintains the inertial-to-gravitational-force ratio.',
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

export function AgitatedVesselScaleUpPanel({
  baseQuery,
  onApplyProblem,
}: AgitatedVesselScaleUpPanelProps) {
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

  const [
    diameterSymbol,
    setDiameterSymbol,
  ] = useState(
    firstAssignment
      ?.symbol ??
      '',
  )

  const [
    speedSymbol,
    setSpeedSymbol,
  ] = useState(
    secondAssignment
      ?.symbol ??
      '',
  )

  const [
    criterion,
    setCriterion,
  ] = useState<
    AgitatorScaleUpCriterion
  >(
    'powerPerVolume',
  )

  const [
    prototypeDiameter,
    setPrototypeDiameter,
  ] = useState(
    String(
      firstAssignment
        ?.value ??
      0.2,
    ),
  )

  const [
    scaleDiameter,
    setScaleDiameter,
  ] = useState(
    String(
      (
        firstAssignment
          ?.value ??
        0.2
      ) *
      4,
    ),
  )

  const [
    prototypeSpeedRpm,
    setPrototypeSpeedRpm,
  ] = useState(
    String(
      secondAssignment
        ?.value ??
      600,
    ),
  )

  const [
    prototypeVolume,
    setPrototypeVolume,
  ] = useState(
    '0.05',
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
    powerNumber,
    setPowerNumber,
  ] = useState(
    '5',
  )

  const [
    gravity,
    setGravity,
  ] = useState(
    '9.80665',
  )

  const [
    analysis,
    setAnalysis,
  ] = useState<
    AgitatedVesselAnalysis | null
  >(null)

  const [
    feedback,
    setFeedback,
  ] = useState('')

  useEffect(
    () => {
      const nextDiameter =
        assignments[0]

      const nextSpeed =
        assignments[1]

      const diameterValue =
        nextDiameter
          ?.value ??
        0.2

      setDiameterSymbol(
        nextDiameter
          ?.symbol ??
        '',
      )

      setSpeedSymbol(
        nextSpeed
          ?.symbol ??
        '',
      )

      setPrototypeDiameter(
        String(
          diameterValue,
        ),
      )

      setScaleDiameter(
        String(
          diameterValue *
          4,
        ),
      )

      setPrototypeSpeedRpm(
        String(
          nextSpeed
            ?.value ??
          600,
        ),
      )

      setAnalysis(null)
      setFeedback('')
    },
    [
      assignments,
    ],
  )

  function selectDiameterSymbol(
    symbol: string,
  ) {
    setDiameterSymbol(
      symbol,
    )

    const assignment =
      assignments.find(
        (
          item,
        ) =>
          item.symbol ===
          symbol,
      )

    if (assignment) {
      setPrototypeDiameter(
        String(
          assignment.value,
        ),
      )

      setScaleDiameter(
        String(
          assignment.value *
          4,
        ),
      )
    }

    if (
      speedSymbol ===
      symbol
    ) {
      setSpeedSymbol('')
    }

    setAnalysis(null)
  }

  function selectSpeedSymbol(
    symbol: string,
  ) {
    setSpeedSymbol(
      symbol,
    )

    const assignment =
      assignments.find(
        (
          item,
        ) =>
          item.symbol ===
          symbol,
      )

    if (assignment) {
      setPrototypeSpeedRpm(
        String(
          assignment.value,
        ),
      )
    }

    setAnalysis(null)
  }

  function calculateScaleUp() {
    if (
      !diameterSymbol ||
      !speedSymbol
    ) {
      setFeedback(
        'Select separate impeller-diameter and rotational-speed variables.',
      )

      return
    }

    if (
      diameterSymbol ===
      speedSymbol
    ) {
      setFeedback(
        'Impeller diameter and rotational speed must use different problem variables.',
      )

      return
    }

    const input = {
      criterion,
      prototypeImpellerDiameter:
        Number(
          prototypeDiameter,
        ),
      scaleImpellerDiameter:
        Number(
          scaleDiameter,
        ),
      prototypeSpeedRpm:
        Number(
          prototypeSpeedRpm,
        ),
      prototypeVesselVolume:
        Number(
          prototypeVolume,
        ),
      density:
        Number(
          density,
        ),
      dynamicViscosity:
        Number(
          dynamicViscosity,
        ),
      powerNumber:
        Number(
          powerNumber,
        ),
      gravity:
        Number(
          gravity,
        ),
    }

    const result =
      calculateAgitatedVesselScaleUp(
        input,
      )

    if (!result) {
      setFeedback(
        'All vessel, impeller and fluid-property inputs must be positive finite numbers.',
      )

      return
    }

    const scaledProblem =
      createAgitatedVesselScaleUpProblem(
        baseQuery,
        diameterSymbol,
        speedSymbol,
        input.scaleImpellerDiameter,
        result.recommendedSpeedRpm,
      )

    setAnalysis({
      result,
      scaledProblem,
    })

    setFeedback(
      `${result.preservedMetricLabel} preserved at ${formatNumber(result.recommendedSpeedRpm)} rpm.`,
    )
  }

  function exportCsv() {
    if (!analysis) {
      return
    }

    const blob =
      new Blob(
        [
          createAgitatedVesselScaleUpCsv(
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
      'agitated-vessel-scale-up.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Agitated-vessel scale-up report exported as CSV.',
    )
  }

  const selectedCriterion =
    CRITERIA.find(
      (
        option,
      ) =>
        option.value ===
        criterion,
    )

  return (
    <section
      className="agitated-vessel-panel"
      aria-labelledby="agitated-vessel-title"
    >
      <header className="agitated-vessel-header">
        <div>
          <span>
            Mixing and agitation scale-up
          </span>

          <h3 id="agitated-vessel-title">
            Agitated vessel scale-up
          </h3>

          <p>
            Determine the rotational speed required after
            geometric scale-up and compare tip speed,
            power density, Reynolds number and Froude
            number between prototype and production scale.
          </p>
        </div>

        <strong>
          Np · Re · Fr · P/V
        </strong>
      </header>

      {assignments.length <
      2 ? (
        <div className="agitated-vessel-empty">
          Add at least two numeric assignments so an
          impeller-diameter variable and rotational-speed
          variable can be selected.
        </div>
      ) : (
        <>
          <div className="agitated-vessel-symbols">
            <label>
              Impeller-diameter variable

              <select
                value={
                  diameterSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectDiameterSymbol(
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
              Rotational-speed variable

              <select
                value={
                  speedSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectSpeedSymbol(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select rotational-speed variable
                </option>

                {assignments
                  .filter(
                    (
                      assignment,
                    ) =>
                      assignment.symbol !==
                      diameterSymbol,
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

          <div className="agitated-vessel-criteria">
            {CRITERIA.map(
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

                    setAnalysis(null)
                  }}
                >
                  <strong>
                    {option.label}
                  </strong>

                  <code>
                    {option.equation}
                  </code>

                  <span>
                    {option.description}
                  </span>
                </button>
              ),
            )}
          </div>

          <div className="agitated-vessel-input-grid">
            <article>
              <span>
                Prototype and scale geometry
              </span>

              <label>
                Prototype impeller diameter, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    prototypeDiameter
                  }
                  onChange={(
                    event,
                  ) => {
                    setPrototypeDiameter(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Scale impeller diameter, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    scaleDiameter
                  }
                  onChange={(
                    event,
                  ) => {
                    setScaleDiameter(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Prototype vessel volume, m³

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    prototypeVolume
                  }
                  onChange={(
                    event,
                  ) => {
                    setPrototypeVolume(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>
            </article>

            <article>
              <span>
                Agitator operation
              </span>

              <label>
                Prototype rotational speed, rpm

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    prototypeSpeedRpm
                  }
                  onChange={(
                    event,
                  ) => {
                    setPrototypeSpeedRpm(
                      event.target.value,
                    )

                    setAnalysis(null)
                  }}
                />
              </label>

              <label>
                Impeller power number, Np

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    powerNumber
                  }
                  onChange={(
                    event,
                  ) => {
                    setPowerNumber(
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

              <code>
                {
                  selectedCriterion
                    ?.equation
                }
              </code>
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
            </article>
          </div>

          <p className="agitated-vessel-assumption">
            Geometric similarity is assumed. Vessel volume
            therefore scales with the cube of the selected
            impeller-diameter ratio, and the power number is
            treated as constant.
          </p>

          <div className="agitated-vessel-actions">
            <button
              type="button"
              onClick={
                calculateScaleUp
              }
            >
              Calculate agitator scale-up
            </button>

            {analysis ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export scale-up CSV
              </button>
            ) : null}

            <span>
              Deterministic mixing-scale analysis
            </span>
          </div>

          {feedback ? (
            <p
              className="agitated-vessel-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {analysis ? (
            <>
              <div className="agitated-vessel-summary">
                <article>
                  <span>
                    Recommended scale speed
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .recommendedSpeedRpm,
                      )
                    } rpm
                  </strong>
                </article>

                <article>
                  <span>
                    Scale vessel volume
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .scale
                          .vesselVolume,
                      )
                    } m³
                  </strong>
                </article>

                <article>
                  <span>
                    Scale agitator power
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .scale
                          .power,
                      )
                    } W
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

              <div className="agitated-vessel-comparison-scroll">
                <table className="agitated-vessel-comparison">
                  <thead>
                    <tr>
                      <th>
                        Scale-up quantity
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
                              <div className="agitated-vessel-score">
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

              <div className="agitated-vessel-mechanical">
                <article>
                  <span>
                    Power increase
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .powerIncreaseRatio,
                      )
                    }×
                  </strong>

                  <p>
                    Prototype: {
                      formatNumber(
                        analysis
                          .result
                          .prototype
                          .power,
                      )
                    } W
                  </p>
                </article>

                <article>
                  <span>
                    Torque increase
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .torqueIncreaseRatio,
                      )
                    }×
                  </strong>

                  <p>
                    Scale torque: {
                      formatNumber(
                        analysis
                          .result
                          .scale
                          .torque,
                      )
                    } N·m
                  </p>
                </article>

                <article>
                  <span>
                    Diameter ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        analysis
                          .result
                          .diameterScaleRatio,
                      )
                    }×
                  </strong>

                  <p>
                    Volume ratio: {
                      formatNumber(
                        analysis
                          .result
                          .volumeScaleRatio,
                      )
                    }×
                  </p>
                </article>
              </div>

              <div className="agitated-vessel-transfer">
                <div>
                  <span>
                    Scaled mixing case
                  </span>

                  <strong>
                    {
                      diameterSymbol
                    } = {
                      formatNumber(
                        Number(
                          scaleDiameter,
                        ),
                      )
                    } · {
                      speedSymbol
                    } = {
                      formatNumber(
                        analysis
                          .result
                          .recommendedSpeedRpm,
                      )
                    } rpm
                  </strong>

                  <p>
                    The scaled impeller diameter and
                    calculated rotational speed will
                    replace their current assignments.
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
                  Transfer scaled agitator case to Solver
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
