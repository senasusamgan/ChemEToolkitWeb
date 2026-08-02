import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  calculatePumpSystemAnalysis,
  createPumpOperatingProblem,
  createPumpSystemCsv,
} from '../features/problem-solver/pumpAffinitySystemEngine'
import type {
  PumpSystemAnalysis,
} from '../features/problem-solver/pumpAffinitySystemEngine'

import '../styles/pump-affinity-system-panel.css'

type PumpAffinitySystemPanelProps = {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
};

type PumpAnalysisState = {
  analysis:
    PumpSystemAnalysis
  operatingProblem: string
};

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

function assignmentValue(
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

function differenceClass(
  value: number,
): string {
  const magnitude =
    Math.abs(
      value,
    )

  if (
    magnitude <=
    5
  ) {
    return 'good'
  }

  if (
    magnitude <=
    20
  ) {
    return 'review'
  }

  return 'large'
}

export function PumpAffinitySystemPanel({
  baseQuery,
  onApplyProblem,
}: PumpAffinitySystemPanelProps) {
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

  const first =
    assignments[0]

  const second =
    assignments[1]

  const third =
    assignments[2]

  const [
    flowSymbol,
    setFlowSymbol,
  ] = useState(
    first
      ?.symbol ??
      '',
  )

  const [
    headSymbol,
    setHeadSymbol,
  ] = useState(
    second
      ?.symbol ??
      '',
  )

  const [
    speedSymbol,
    setSpeedSymbol,
  ] = useState(
    third
      ?.symbol ??
      '',
  )

  const [
    referenceFlowRate,
    setReferenceFlowRate,
  ] = useState(
    String(
      first
        ?.value ??
      0.05,
    ),
  )

  const [
    referenceHead,
    setReferenceHead,
  ] = useState(
    String(
      second
        ?.value ??
      20,
    ),
  )

  const [
    referenceSpeedRpm,
    setReferenceSpeedRpm,
  ] = useState(
    String(
      third
        ?.value ??
      1450,
    ),
  )

  const [
    targetSpeedRpm,
    setTargetSpeedRpm,
  ] = useState(
    String(
      (
        third
          ?.value ??
        1450
      ) *
      1.2,
    ),
  )

  const [
    referenceDiameter,
    setReferenceDiameter,
  ] = useState(
    '0.25',
  )

  const [
    targetDiameter,
    setTargetDiameter,
  ] = useState(
    '0.25',
  )

  const [
    shutoffHead,
    setShutoffHead,
  ] = useState(
    String(
      (
        second
          ?.value ??
        20
      ) *
      1.4,
    ),
  )

  const [
    staticHead,
    setStaticHead,
  ] = useState(
    '5',
  )

  const [
    systemCoefficient,
    setSystemCoefficient,
  ] = useState(
    '5000',
  )

  const [
    density,
    setDensity,
  ] = useState(
    '1000',
  )

  const [
    efficiencyPercent,
    setEfficiencyPercent,
  ] = useState(
    '75',
  )

  const [
    gravity,
    setGravity,
  ] = useState(
    '9.80665',
  )

  const [
    result,
    setResult,
  ] = useState<
    PumpAnalysisState | null
  >(null)

  const [
    feedback,
    setFeedback,
  ] = useState('')

  useEffect(
    () => {
      const nextFlow =
        assignments[0]

      const nextHead =
        assignments[1]

      const nextSpeed =
        assignments[2]

      const flowValue =
        nextFlow
          ?.value ??
        0.05

      const headValue =
        nextHead
          ?.value ??
        20

      const speedValue =
        nextSpeed
          ?.value ??
        1450

      setFlowSymbol(
        nextFlow
          ?.symbol ??
        '',
      )

      setHeadSymbol(
        nextHead
          ?.symbol ??
        '',
      )

      setSpeedSymbol(
        nextSpeed
          ?.symbol ??
        '',
      )

      setReferenceFlowRate(
        String(
          flowValue,
        ),
      )

      setReferenceHead(
        String(
          headValue,
        ),
      )

      setReferenceSpeedRpm(
        String(
          speedValue,
        ),
      )

      setTargetSpeedRpm(
        String(
          speedValue *
          1.2,
        ),
      )

      setShutoffHead(
        String(
          headValue *
          1.4,
        ),
      )

      setResult(null)
      setFeedback('')
    },
    [
      assignments,
    ],
  )

  function selectFlowSymbol(
    symbol: string,
  ) {
    setFlowSymbol(
      symbol,
    )

    setReferenceFlowRate(
      String(
        assignmentValue(
          assignments,
          symbol,
          0.05,
        ),
      ),
    )

    setResult(null)
  }

  function selectHeadSymbol(
    symbol: string,
  ) {
    setHeadSymbol(
      symbol,
    )

    const value =
      assignmentValue(
        assignments,
        symbol,
        20,
      )

    setReferenceHead(
      String(
        value,
      ),
    )

    setShutoffHead(
      String(
        value *
        1.4,
      ),
    )

    setResult(null)
  }

  function selectSpeedSymbol(
    symbol: string,
  ) {
    setSpeedSymbol(
      symbol,
    )

    const value =
      assignmentValue(
        assignments,
        symbol,
        1450,
      )

    setReferenceSpeedRpm(
      String(
        value,
      ),
    )

    setTargetSpeedRpm(
      String(
        value *
        1.2,
      ),
    )

    setResult(null)
  }

  function runAnalysis() {
    const selectedSymbols = [
      flowSymbol,
      headSymbol,
      speedSymbol,
    ]

    if (
      selectedSymbols.some(
        (
          symbol,
        ) =>
          !symbol,
      ) ||
      new Set(
        selectedSymbols,
      ).size !==
        3
    ) {
      setFeedback(
        'Select three different problem variables for flow rate, pump head and rotational speed.',
      )

      return
    }

    const input = {
      referenceFlowRate:
        Number(
          referenceFlowRate,
        ),
      referenceHead:
        Number(
          referenceHead,
        ),
      referenceSpeedRpm:
        Number(
          referenceSpeedRpm,
        ),
      referenceImpellerDiameter:
        Number(
          referenceDiameter,
        ),
      targetSpeedRpm:
        Number(
          targetSpeedRpm,
        ),
      targetImpellerDiameter:
        Number(
          targetDiameter,
        ),
      referenceShutoffHead:
        Number(
          shutoffHead,
        ),
      staticHead:
        Number(
          staticHead,
        ),
      systemResistanceCoefficient:
        Number(
          systemCoefficient,
        ),
      density:
        Number(
          density,
        ),
      efficiency:
        Number(
          efficiencyPercent,
        ) /
        100,
      gravity:
        Number(
          gravity,
        ),
    }

    const analysis =
      calculatePumpSystemAnalysis(
        input,
      )

    if (!analysis) {
      setFeedback(
        'Check all positive inputs. Shutoff head must exceed reference head, efficiency must be between 0 and 100%, and the scaled pump must overcome static head.',
      )

      return
    }

    const operatingProblem =
      createPumpOperatingProblem(
        baseQuery,
        flowSymbol,
        headSymbol,
        speedSymbol,
        analysis
          .operatingPoint
          .flowRate,
        analysis
          .operatingPoint
          .head,
        input.targetSpeedRpm,
      )

    setResult({
      analysis,
      operatingProblem,
    })

    setFeedback(
      `Pump and system curves intersect at ${formatNumber(analysis.operatingPoint.flowRate)} m³/s and ${formatNumber(analysis.operatingPoint.head)} m head.`,
    )
  }

  function exportCsv() {
    if (!result) {
      return
    }

    const blob =
      new Blob(
        [
          createPumpSystemCsv(
            result.analysis,
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
      'pump-affinity-system-curve.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Pump affinity and system-curve report exported as CSV.',
    )
  }

  return (
    <section
      className="pump-affinity-panel"
      aria-labelledby="pump-affinity-title"
    >
      <header className="pump-affinity-header">
        <div>
          <span>
            Hydraulic equipment analysis
          </span>

          <h3 id="pump-affinity-title">
            Pump affinity and system curve
          </h3>

          <p>
            Apply pump affinity laws for rotational-speed
            and impeller-diameter changes, then calculate
            the actual operating point where the scaled
            pump curve intersects the process system curve.
          </p>
        </div>

        <strong>
          Q ∝ ND · H ∝ N²D² · P ∝ N³D⁵
        </strong>
      </header>

      {assignments.length <
      3 ? (
        <div className="pump-affinity-empty">
          Add at least three numeric assignments so flow
          rate, pump head and rotational speed variables
          can be selected from the Solver problem.
        </div>
      ) : (
        <>
          <div className="pump-affinity-symbols">
            <label>
              Flow-rate variable

              <select
                value={
                  flowSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectFlowSymbol(
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
              Pump-head variable

              <select
                value={
                  headSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectHeadSymbol(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select pump-head variable
                </option>

                {assignments
                  .filter(
                    (
                      assignment,
                    ) =>
                      assignment.symbol !==
                      flowSymbol,
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
                  Select speed variable
                </option>

                {assignments
                  .filter(
                    (
                      assignment,
                    ) =>
                      assignment.symbol !==
                        flowSymbol &&
                      assignment.symbol !==
                        headSymbol,
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

          <div className="pump-affinity-input-grid">
            <article>
              <span>
                Reference pump point
              </span>

              <label>
                Reference flow rate, m³/s

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    referenceFlowRate
                  }
                  onChange={(
                    event,
                  ) => {
                    setReferenceFlowRate(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Reference pump head, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    referenceHead
                  }
                  onChange={(
                    event,
                  ) => {
                    setReferenceHead(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Reference shutoff head, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    shutoffHead
                  }
                  onChange={(
                    event,
                  ) => {
                    setShutoffHead(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>
            </article>

            <article>
              <span>
                Speed and impeller scaling
              </span>

              <label>
                Reference speed, rpm

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    referenceSpeedRpm
                  }
                  onChange={(
                    event,
                  ) => {
                    setReferenceSpeedRpm(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Target speed, rpm

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    targetSpeedRpm
                  }
                  onChange={(
                    event,
                  ) => {
                    setTargetSpeedRpm(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <div>
                <label>
                  Reference diameter, m

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      referenceDiameter
                    }
                    onChange={(
                      event,
                    ) => {
                      setReferenceDiameter(
                        event.target.value,
                      )

                      setResult(null)
                    }}
                  />
                </label>

                <label>
                  Target diameter, m

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      targetDiameter
                    }
                    onChange={(
                      event,
                    ) => {
                      setTargetDiameter(
                        event.target.value,
                      )

                      setResult(null)
                    }}
                  />
                </label>
              </div>
            </article>

            <article>
              <span>
                Process system curve
              </span>

              <label>
                Static head, m

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    staticHead
                  }
                  onChange={(
                    event,
                  ) => {
                    setStaticHead(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                System coefficient, s²/m⁵

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    systemCoefficient
                  }
                  onChange={(
                    event,
                  ) => {
                    setSystemCoefficient(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <code>
                Hsystem = Hstatic + KQ²
              </code>
            </article>

            <article>
              <span>
                Fluid and pump properties
              </span>

              <label>
                Fluid density, kg/m³

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

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Pump efficiency, %

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={
                    efficiencyPercent
                  }
                  onChange={(
                    event,
                  ) => {
                    setEfficiencyPercent(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Gravity, m/s²

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

                    setResult(null)
                  }}
                />
              </label>
            </article>
          </div>

          <p className="pump-affinity-assumption">
            The pump curve is represented by a quadratic
            head–flow relation passing through the supplied
            shutoff head and reference operating point.
            Efficiency is treated as constant during scaling.
          </p>

          <div className="pump-affinity-actions">
            <button
              type="button"
              onClick={
                runAnalysis
              }
            >
              Calculate pump operating point
            </button>

            {result ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export pump-system CSV
              </button>
            ) : null}

            <span>
              Deterministic affinity and curve intersection
            </span>
          </div>

          {feedback ? (
            <p
              className="pump-affinity-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {result ? (
            <>
              <div className="pump-affinity-summary">
                <article>
                  <span>
                    System operating flow
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operatingPoint
                          .flowRate,
                      )
                    } m³/s
                  </strong>
                </article>

                <article>
                  <span>
                    System operating head
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operatingPoint
                          .head,
                      )
                    } m
                  </strong>
                </article>

                <article>
                  <span>
                    Required shaft power
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operatingPoint
                          .shaftPower,
                      )
                    } W
                  </strong>
                </article>

                <article>
                  <span>
                    Scaled shutoff head
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operatingPoint
                          .scaledShutoffHead,
                      )
                    } m
                  </strong>
                </article>
              </div>

              <div className="pump-affinity-comparison">
                <article>
                  <span>
                    Affinity-law prediction
                  </span>

                  <strong>
                    Q = {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .predictedFlowRate,
                      )
                    } m³/s
                  </strong>

                  <p>
                    H = {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .predictedHead,
                      )
                    } m · P = {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .predictedShaftPower,
                      )
                    } W
                  </p>
                </article>

                <article
                  data-state={
                    differenceClass(
                      result
                        .analysis
                        .flowDifferencePercent,
                    )
                  }
                >
                  <span>
                    Flow shift from affinity point
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .flowDifferencePercent,
                      )
                    }%
                  </strong>

                  <p>
                    The system curve determines the actual
                    delivered flow.
                  </p>
                </article>

                <article
                  data-state={
                    differenceClass(
                      result
                        .analysis
                        .headDifferencePercent,
                    )
                  }
                >
                  <span>
                    Head shift from affinity point
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .headDifferencePercent,
                      )
                    }%
                  </strong>

                  <p>
                    Positive values indicate a higher
                    operating head than the nominal affinity point.
                  </p>
                </article>

                <article
                  data-state={
                    differenceClass(
                      result
                        .analysis
                        .powerDifferencePercent,
                    )
                  }
                >
                  <span>
                    Shaft-power shift
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .powerDifferencePercent,
                      )
                    }%
                  </strong>

                  <p>
                    Compares actual hydraulic duty with the
                    pure affinity-law power estimate.
                  </p>
                </article>
              </div>

              <div className="pump-affinity-scale-ratios">
                <article>
                  <span>
                    Speed ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .speedRatio,
                      )
                    }×
                  </strong>
                </article>

                <article>
                  <span>
                    Diameter ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .diameterRatio,
                      )
                    }×
                  </strong>
                </article>

                <article>
                  <span>
                    Flow scale ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .flowScaleRatio,
                      )
                    }×
                  </strong>
                </article>

                <article>
                  <span>
                    Head scale ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .headScaleRatio,
                      )
                    }×
                  </strong>
                </article>

                <article>
                  <span>
                    Power scale ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .affinity
                          .powerScaleRatio,
                      )
                    }×
                  </strong>
                </article>
              </div>

              <div className="pump-affinity-table-scroll">
                <table className="pump-affinity-table">
                  <thead>
                    <tr>
                      <th>
                        Point
                      </th>

                      <th>
                        Flow rate
                      </th>

                      <th>
                        Pump head
                      </th>

                      <th>
                        System head
                      </th>

                      <th>
                        Difference
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result
                      .analysis
                      .curvePoints
                      .map(
                        (
                          point,
                        ) => (
                          <tr
                            key={
                              point.index
                            }
                          >
                            <td>
                              {
                                point.index +
                                1
                              }
                            </td>

                            <td>
                              {
                                formatNumber(
                                  point.flowRate,
                                )
                              } m³/s
                            </td>

                            <td>
                              {
                                formatNumber(
                                  point.pumpHead,
                                )
                              } m
                            </td>

                            <td>
                              {
                                formatNumber(
                                  point.systemHead,
                                )
                              } m
                            </td>

                            <td>
                              {
                                formatNumber(
                                  point.headDifference,
                                )
                              } m
                            </td>
                          </tr>
                        ),
                      )}
                  </tbody>
                </table>
              </div>

              <div className="pump-affinity-transfer">
                <div>
                  <span>
                    Calculated pump operating case
                  </span>

                  <strong>
                    {
                      flowSymbol
                    } = {
                      formatNumber(
                        result
                          .analysis
                          .operatingPoint
                          .flowRate,
                      )
                    } · {
                      headSymbol
                    } = {
                      formatNumber(
                        result
                          .analysis
                          .operatingPoint
                          .head,
                      )
                    } · {
                      speedSymbol
                    } = {
                      formatNumber(
                        Number(
                          targetSpeedRpm,
                        ),
                      )
                    }
                  </strong>

                  <p>
                    The calculated system operating flow,
                    head and selected target speed will
                    replace their current Solver assignments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onApplyProblem(
                      result
                        .operatingProblem,
                    )
                  }
                >
                  Transfer operating point to Solver
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
