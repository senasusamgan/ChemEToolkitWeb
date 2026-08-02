import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  calculateHeatExchangerPerformance,
  createHeatExchangerOutletProblem,
  createHeatExchangerPerformanceCsv,
} from '../features/problem-solver/heatExchangerPerformanceEngine'
import type {
  HeatExchangerArrangement,
  HeatExchangerPerformanceAnalysis,
} from '../features/problem-solver/heatExchangerPerformanceEngine'

import '../styles/heat-exchanger-performance-panel.css'

type HeatExchangerPerformancePanelProps = {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
};

type HeatExchangerAnalysisState = {
  analysis:
    HeatExchangerPerformanceAnalysis
  outletProblem: string
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

function percentState(
  value: number,
): string {
  if (
    value <=
    5
  ) {
    return 'good'
  }

  if (
    value <=
    15
  ) {
    return 'review'
  }

  return 'large'
}

export function HeatExchangerPerformancePanel({
  baseQuery,
  onApplyProblem,
}: HeatExchangerPerformancePanelProps) {
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
    hotOutletSymbol,
    setHotOutletSymbol,
  ] = useState(
    assignments[0]
      ?.symbol ??
    '',
  )

  const [
    coldOutletSymbol,
    setColdOutletSymbol,
  ] = useState(
    assignments[1]
      ?.symbol ??
    '',
  )

  const [
    arrangement,
    setArrangement,
  ] = useState<
    HeatExchangerArrangement
  >(
    'counterflow',
  )

  const [
    hotInletTemperature,
    setHotInletTemperature,
  ] = useState(
    '420',
  )

  const [
    coldInletTemperature,
    setColdInletTemperature,
  ] = useState(
    '300',
  )

  const [
    hotMassFlowRate,
    setHotMassFlowRate,
  ] = useState(
    '2',
  )

  const [
    coldMassFlowRate,
    setColdMassFlowRate,
  ] = useState(
    '1.5',
  )

  const [
    hotSpecificHeat,
    setHotSpecificHeat,
  ] = useState(
    '2200',
  )

  const [
    coldSpecificHeat,
    setColdSpecificHeat,
  ] = useState(
    '4180',
  )

  const [
    operatingOverallHeatTransferCoefficient,
    setOperatingOverallHeatTransferCoefficient,
  ] = useState(
    '350',
  )

  const [
    cleanOverallHeatTransferCoefficient,
    setCleanOverallHeatTransferCoefficient,
  ] = useState(
    '500',
  )

  const [
    heatTransferArea,
    setHeatTransferArea,
  ] = useState(
    '20',
  )

  const [
    targetColdOutletTemperature,
    setTargetColdOutletTemperature,
  ] = useState(
    '350',
  )

  const [
    result,
    setResult,
  ] = useState<
    HeatExchangerAnalysisState | null
  >(null)

  const [
    feedback,
    setFeedback,
  ] = useState('')

  useEffect(
    () => {
      setHotOutletSymbol(
        assignments[0]
          ?.symbol ??
        '',
      )

      setColdOutletSymbol(
        assignments[1]
          ?.symbol ??
        '',
      )

      setResult(null)
      setFeedback('')
    },
    [
      assignments,
    ],
  )

  function selectHotOutletSymbol(
    symbol: string,
  ) {
    setHotOutletSymbol(
      symbol,
    )

    if (
      coldOutletSymbol ===
      symbol
    ) {
      setColdOutletSymbol('')
    }

    setResult(null)
  }

  function selectColdOutletSymbol(
    symbol: string,
  ) {
    setColdOutletSymbol(
      symbol,
    )

    setResult(null)
  }

  function runAnalysis() {
    if (
      !hotOutletSymbol ||
      !coldOutletSymbol ||
      hotOutletSymbol ===
        coldOutletSymbol
    ) {
      setFeedback(
        'Select different Solver variables for the hot and cold outlet temperatures.',
      )

      return
    }

    const input = {
      arrangement,
      hotInletTemperature:
        Number(
          hotInletTemperature,
        ),
      coldInletTemperature:
        Number(
          coldInletTemperature,
        ),
      hotMassFlowRate:
        Number(
          hotMassFlowRate,
        ),
      coldMassFlowRate:
        Number(
          coldMassFlowRate,
        ),
      hotSpecificHeat:
        Number(
          hotSpecificHeat,
        ),
      coldSpecificHeat:
        Number(
          coldSpecificHeat,
        ),
      operatingOverallHeatTransferCoefficient:
        Number(
          operatingOverallHeatTransferCoefficient,
        ),
      cleanOverallHeatTransferCoefficient:
        Number(
          cleanOverallHeatTransferCoefficient,
        ),
      heatTransferArea:
        Number(
          heatTransferArea,
        ),
      targetColdOutletTemperature:
        Number(
          targetColdOutletTemperature,
        ),
    }

    const analysis =
      calculateHeatExchangerPerformance(
        input,
      )

    if (!analysis) {
      setFeedback(
        'Check the temperatures, flow rates, heat capacities, U values and area. The hot inlet must exceed the cold inlet, and clean U must be greater than or equal to operating U.',
      )

      return
    }

    const outletProblem =
      createHeatExchangerOutletProblem(
        baseQuery,
        hotOutletSymbol,
        coldOutletSymbol,
        analysis
          .operating
          .hotOutletTemperature,
        analysis
          .operating
          .coldOutletTemperature,
      )

    setResult({
      analysis,
      outletProblem,
    })

    const targetMessage =
      analysis.designTarget
        ? ` Required area for the selected cold-outlet target is ${formatNumber(analysis.designTarget.requiredArea)} m².`
        : ' The selected target outlet temperature is not feasible for this stream combination and flow arrangement.'

    setFeedback(
      `${arrangement === 'counterflow' ? 'Counterflow' : 'Parallel-flow'} duty is ${formatNumber(analysis.operating.heatDuty)} W.${targetMessage}`,
    )
  }

  function exportCsv() {
    if (!result) {
      return
    }

    const blob =
      new Blob(
        [
          createHeatExchangerPerformanceCsv(
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
      'heat-exchanger-performance.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Heat-exchanger rating, fouling and target-design report exported as CSV.',
    )
  }

  return (
    <section
      className="heat-exchanger-performance-panel"
      aria-labelledby="heat-exchanger-performance-title"
    >
      <header className="heat-exchanger-performance-header">
        <div>
          <span>
            Thermal equipment rating and design
          </span>

          <h3 id="heat-exchanger-performance-title">
            Heat exchanger effectiveness–NTU and fouling
          </h3>

          <p>
            Rate a parallel-flow or counterflow exchanger,
            calculate outlet temperatures and LMTD, compare
            clean and fouled operation, and determine the
            area required for a target cold-stream outlet.
          </p>
        </div>

        <strong>
          ε–NTU · UA · LMTD
        </strong>
      </header>

      {assignments.length <
      2 ? (
        <div className="heat-exchanger-performance-empty">
          Add at least two numeric assignments so the hot
          and cold outlet-temperature variables can be
          selected from the Solver problem.
        </div>
      ) : (
        <>
          <div className="heat-exchanger-output-symbols">
            <label>
              Hot-outlet temperature variable

              <select
                value={
                  hotOutletSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectHotOutletSymbol(
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
              Cold-outlet temperature variable

              <select
                value={
                  coldOutletSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectColdOutletSymbol(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select cold-outlet variable
                </option>

                {assignments
                  .filter(
                    (
                      assignment,
                    ) =>
                      assignment.symbol !==
                      hotOutletSymbol,
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

          <div className="heat-exchanger-arrangements">
            <button
              type="button"
              data-selected={
                arrangement ===
                  'counterflow'
                  ? 'true'
                  : 'false'
              }
              onClick={() => {
                setArrangement(
                  'counterflow',
                )

                setResult(null)
              }}
            >
              <strong>
                Counterflow
              </strong>

              <code>
                ε = f(NTU, Cr)
              </code>

              <span>
                Streams move in opposite directions and
                generally achieve the higher effectiveness.
              </span>
            </button>

            <button
              type="button"
              data-selected={
                arrangement ===
                  'parallel'
                  ? 'true'
                  : 'false'
              }
              onClick={() => {
                setArrangement(
                  'parallel',
                )

                setResult(null)
              }}
            >
              <strong>
                Parallel flow
              </strong>

              <code>
                ε = [1 − e⁻ᴺᵀᵁ⁽¹⁺ᶜʳ⁾] / (1 + Cr)
              </code>

              <span>
                Both streams enter from the same end and
                move in the same direction.
              </span>
            </button>
          </div>

          <div className="heat-exchanger-input-grid">
            <article>
              <span>
                Inlet temperatures
              </span>

              <label>
                Hot inlet temperature, K

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    hotInletTemperature
                  }
                  onChange={(
                    event,
                  ) => {
                    setHotInletTemperature(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Cold inlet temperature, K

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    coldInletTemperature
                  }
                  onChange={(
                    event,
                  ) => {
                    setColdInletTemperature(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Target cold outlet temperature, K

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    targetColdOutletTemperature
                  }
                  onChange={(
                    event,
                  ) => {
                    setTargetColdOutletTemperature(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>
            </article>

            <article>
              <span>
                Hot-stream capacity rate
              </span>

              <label>
                Hot-stream mass flow, kg/s

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    hotMassFlowRate
                  }
                  onChange={(
                    event,
                  ) => {
                    setHotMassFlowRate(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Hot-stream specific heat, J/(kg·K)

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    hotSpecificHeat
                  }
                  onChange={(
                    event,
                  ) => {
                    setHotSpecificHeat(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <code>
                Ch = ṁh · cph
              </code>
            </article>

            <article>
              <span>
                Cold-stream capacity rate
              </span>

              <label>
                Cold-stream mass flow, kg/s

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    coldMassFlowRate
                  }
                  onChange={(
                    event,
                  ) => {
                    setColdMassFlowRate(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Cold-stream specific heat, J/(kg·K)

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    coldSpecificHeat
                  }
                  onChange={(
                    event,
                  ) => {
                    setColdSpecificHeat(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <code>
                Cc = ṁc · cpc
              </code>
            </article>

            <article>
              <span>
                Exchanger surface and fouling
              </span>

              <label>
                Operating overall U, W/(m²·K)

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    operatingOverallHeatTransferCoefficient
                  }
                  onChange={(
                    event,
                  ) => {
                    setOperatingOverallHeatTransferCoefficient(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Clean overall U, W/(m²·K)

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    cleanOverallHeatTransferCoefficient
                  }
                  onChange={(
                    event,
                  ) => {
                    setCleanOverallHeatTransferCoefficient(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Heat-transfer area, m²

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    heatTransferArea
                  }
                  onChange={(
                    event,
                  ) => {
                    setHeatTransferArea(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>
            </article>
          </div>

          <p className="heat-exchanger-performance-assumption">
            Both fluids are treated as single-phase streams
            with constant mass flow and constant specific
            heat. Heat loss to the surroundings and axial
            conduction are neglected.
          </p>

          <div className="heat-exchanger-performance-actions">
            <button
              type="button"
              onClick={
                runAnalysis
              }
            >
              Calculate exchanger performance
            </button>

            {result ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export exchanger CSV
              </button>
            ) : null}

            <span>
              Rating, fouling and target-area design
            </span>
          </div>

          {feedback ? (
            <p
              className="heat-exchanger-performance-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {result ? (
            <>
              <div className="heat-exchanger-performance-summary">
                <article>
                  <span>
                    Operating heat duty
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .heatDuty,
                      )
                    } W
                  </strong>
                </article>

                <article>
                  <span>
                    Hot outlet temperature
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .hotOutletTemperature,
                      )
                    } K
                  </strong>
                </article>

                <article>
                  <span>
                    Cold outlet temperature
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .coldOutletTemperature,
                      )
                    } K
                  </strong>
                </article>

                <article>
                  <span>
                    Exchanger effectiveness
                  </span>

                  <strong>
                    {
                      (
                        result
                          .analysis
                          .operating
                          .effectiveness *
                        100
                      ).toFixed(
                        1,
                      )
                    }%
                  </strong>
                </article>
              </div>

              <div className="heat-exchanger-thermal-metrics">
                <article>
                  <span>
                    Number of transfer units
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .numberOfTransferUnits,
                      )
                    }
                  </strong>

                  <p>
                    UA = {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .conductance,
                      )
                    } W/K
                  </p>
                </article>

                <article>
                  <span>
                    Capacity-rate ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .capacityRatio,
                      )
                    }
                  </strong>

                  <p>
                    Cmin = {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .minimumCapacityRate,
                      )
                    } W/K
                  </p>
                </article>

                <article>
                  <span>
                    Log-mean temperature difference
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .logarithmicMeanTemperatureDifference,
                      )
                    } K
                  </strong>

                  <p>
                    ΔT terminals: {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .terminalTemperatureDifferenceOne,
                      )
                    } / {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .terminalTemperatureDifferenceTwo,
                      )
                    } K
                  </p>
                </article>

                <article>
                  <span>
                    Energy-balance residual
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .energyBalanceError,
                      )
                    } W
                  </strong>

                  <p>
                    Hot-side and cold-side duties are
                    independently reconstructed.
                  </p>
                </article>
              </div>

              <div className="heat-exchanger-fouling-comparison">
                <article>
                  <span>
                    Operating U
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .overallHeatTransferCoefficient,
                      )
                    } W/(m²·K)
                  </strong>

                  <p>
                    Duty: {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .heatDuty,
                      )
                    } W
                  </p>
                </article>

                <article>
                  <span>
                    Clean U
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .clean
                          .overallHeatTransferCoefficient,
                      )
                    } W/(m²·K)
                  </strong>

                  <p>
                    Clean duty: {
                      formatNumber(
                        result
                          .analysis
                          .clean
                          .heatDuty,
                      )
                    } W
                  </p>
                </article>

                <article
                  data-state={
                    percentState(
                      result
                        .analysis
                        .heatDutyLossPercent,
                    )
                  }
                >
                  <span>
                    Fouling duty loss
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .heatDutyLossPercent,
                      )
                    }%
                  </strong>

                  <p>
                    {
                      formatNumber(
                        result
                          .analysis
                          .heatDutyLoss,
                      )
                    } W below clean performance
                  </p>
                </article>

                <article>
                  <span>
                    Implied fouling resistance
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .foulingResistance,
                      )
                    } m²·K/W
                  </strong>

                  <p>
                    Rf = 1/Uoperating − 1/Uclean
                  </p>
                </article>
              </div>

              {result
                .analysis
                .designTarget ? (
                <div className="heat-exchanger-target-design">
                  <header>
                    <div>
                      <span>
                        Target cold-outlet design
                      </span>

                      <strong>
                        Required area: {
                          formatNumber(
                            result
                              .analysis
                              .designTarget
                              .requiredArea,
                          )
                        } m²
                      </strong>
                    </div>

                    <p>
                      Target Tc,out = {
                        formatNumber(
                          result
                            .analysis
                            .designTarget
                            .targetColdOutletTemperature,
                        )
                      } K
                    </p>
                  </header>

                  <div>
                    <article>
                      <span>
                        Required duty
                      </span>

                      <strong>
                        {
                          formatNumber(
                            result
                              .analysis
                              .designTarget
                              .requiredHeatDuty,
                          )
                        } W
                      </strong>
                    </article>

                    <article>
                      <span>
                        Required effectiveness
                      </span>

                      <strong>
                        {
                          (
                            result
                              .analysis
                              .designTarget
                              .requiredEffectiveness *
                            100
                          ).toFixed(
                            1,
                          )
                        }%
                      </strong>
                    </article>

                    <article>
                      <span>
                        Required NTU
                      </span>

                      <strong>
                        {
                          formatNumber(
                            result
                              .analysis
                              .designTarget
                              .requiredNumberOfTransferUnits,
                          )
                        }
                      </strong>
                    </article>

                    <article>
                      <span>
                        Required UA
                      </span>

                      <strong>
                        {
                          formatNumber(
                            result
                              .analysis
                              .designTarget
                              .requiredConductance,
                          )
                        } W/K
                      </strong>
                    </article>

                    <article>
                      <span>
                        Predicted hot outlet
                      </span>

                      <strong>
                        {
                          formatNumber(
                            result
                              .analysis
                              .designTarget
                              .predictedHotOutletTemperature,
                          )
                        } K
                      </strong>
                    </article>
                  </div>
                </div>
              ) : (
                <div className="heat-exchanger-target-unavailable">
                  The selected target cold-outlet
                  temperature cannot be reached with this
                  stream combination and flow arrangement.
                </div>
              )}

              <div className="heat-exchanger-performance-transfer">
                <div>
                  <span>
                    Calculated exchanger outlet state
                  </span>

                  <strong>
                    {
                      hotOutletSymbol
                    } = {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .hotOutletTemperature,
                      )
                    } K · {
                      coldOutletSymbol
                    } = {
                      formatNumber(
                        result
                          .analysis
                          .operating
                          .coldOutletTemperature,
                      )
                    } K
                  </strong>

                  <p>
                    The calculated hot and cold outlet
                    temperatures will replace their current
                    assignments in the Solver problem.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onApplyProblem(
                      result
                        .outletProblem,
                    )
                  }
                >
                  Transfer outlet state to Solver
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
