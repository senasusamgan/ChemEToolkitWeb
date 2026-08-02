import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  parseConstraintAssignments,
} from '../features/problem-solver/constraintOperatingWindowEngine'
import {
  calculateMultistageCompressor,
  createCompressorDischargeProblem,
  createMultistageCompressorCsv,
} from '../features/problem-solver/multistageCompressorEngine'
import type {
  MultistageCompressorAnalysis,
} from '../features/problem-solver/multistageCompressorEngine'

import '../styles/multistage-compressor-panel.css'

type MultistageCompressorPanelProps = {
  baseQuery: string
  onApplyProblem: (
    problem: string,
  ) => void
};

type CompressorAnalysisState = {
  analysis:
    MultistageCompressorAnalysis
  dischargeProblem: string
};

const STAGE_OPTIONS = [
  1,
  2,
  3,
  4,
  5,
  6,
] as const

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

function savingState(
  savingPercent: number,
): string {
  if (
    savingPercent >=
    15
  ) {
    return 'strong'
  }

  if (
    savingPercent >
    0
  ) {
    return 'positive'
  }

  return 'none'
}

export function MultistageCompressorPanel({
  baseQuery,
  onApplyProblem,
}: MultistageCompressorPanelProps) {
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
    pressureSymbol,
    setPressureSymbol,
  ] = useState(
    first
      ?.symbol ??
      '',
  )

  const [
    temperatureSymbol,
    setTemperatureSymbol,
  ] = useState(
    second
      ?.symbol ??
      '',
  )

  const [
    inletPressure,
    setInletPressure,
  ] = useState(
    String(
      first
        ?.value ??
      100000,
    ),
  )

  const [
    outletPressure,
    setOutletPressure,
  ] = useState(
    String(
      (
        first
          ?.value ??
        100000
      ) *
      8,
    ),
  )

  const [
    inletTemperature,
    setInletTemperature,
  ] = useState(
    String(
      second
        ?.value ??
      300,
    ),
  )

  const [
    massFlowRate,
    setMassFlowRate,
  ] = useState(
    String(
      third
        ?.value ??
      1,
    ),
  )

  const [
    heatCapacityRatio,
    setHeatCapacityRatio,
  ] = useState(
    '1.4',
  )

  const [
    specificGasConstant,
    setSpecificGasConstant,
  ] = useState(
    '287',
  )

  const [
    isentropicEfficiencyPercent,
    setIsentropicEfficiencyPercent,
  ] = useState(
    '80',
  )

  const [
    mechanicalEfficiencyPercent,
    setMechanicalEfficiencyPercent,
  ] = useState(
    '95',
  )

  const [
    stageCount,
    setStageCount,
  ] = useState(
    '2',
  )

  const [
    intercoolerOutletTemperature,
    setIntercoolerOutletTemperature,
  ] = useState(
    String(
      second
        ?.value ??
      300,
    ),
  )

  const [
    result,
    setResult,
  ] = useState<
    CompressorAnalysisState | null
  >(null)

  const [
    feedback,
    setFeedback,
  ] = useState('')

  useEffect(
    () => {
      const nextPressure =
        assignments[0]

      const nextTemperature =
        assignments[1]

      const nextMassFlow =
        assignments[2]

      const pressureValue =
        nextPressure
          ?.value ??
        100000

      const temperatureValue =
        nextTemperature
          ?.value ??
        300

      setPressureSymbol(
        nextPressure
          ?.symbol ??
        '',
      )

      setTemperatureSymbol(
        nextTemperature
          ?.symbol ??
        '',
      )

      setInletPressure(
        String(
          pressureValue,
        ),
      )

      setOutletPressure(
        String(
          pressureValue *
          8,
        ),
      )

      setInletTemperature(
        String(
          temperatureValue,
        ),
      )

      setIntercoolerOutletTemperature(
        String(
          temperatureValue,
        ),
      )

      setMassFlowRate(
        String(
          nextMassFlow
            ?.value ??
          1,
        ),
      )

      setResult(null)
      setFeedback('')
    },
    [
      assignments,
    ],
  )

  function selectPressureSymbol(
    symbol: string,
  ) {
    setPressureSymbol(
      symbol,
    )

    const value =
      assignmentValue(
        assignments,
        symbol,
        100000,
      )

    setInletPressure(
      String(
        value,
      ),
    )

    setOutletPressure(
      String(
        value *
        8,
      ),
    )

    if (
      temperatureSymbol ===
      symbol
    ) {
      setTemperatureSymbol('')
    }

    setResult(null)
  }

  function selectTemperatureSymbol(
    symbol: string,
  ) {
    setTemperatureSymbol(
      symbol,
    )

    const value =
      assignmentValue(
        assignments,
        symbol,
        300,
      )

    setInletTemperature(
      String(
        value,
      ),
    )

    setIntercoolerOutletTemperature(
      String(
        value,
      ),
    )

    setResult(null)
  }

  function runAnalysis() {
    if (
      !pressureSymbol ||
      !temperatureSymbol ||
      pressureSymbol ===
        temperatureSymbol
    ) {
      setFeedback(
        'Select different Solver variables for pressure and temperature.',
      )

      return
    }

    const input = {
      inletPressure:
        Number(
          inletPressure,
        ),
      outletPressure:
        Number(
          outletPressure,
        ),
      inletTemperature:
        Number(
          inletTemperature,
        ),
      massFlowRate:
        Number(
          massFlowRate,
        ),
      heatCapacityRatio:
        Number(
          heatCapacityRatio,
        ),
      specificGasConstant:
        Number(
          specificGasConstant,
        ),
      isentropicEfficiency:
        Number(
          isentropicEfficiencyPercent,
        ) /
        100,
      mechanicalEfficiency:
        Number(
          mechanicalEfficiencyPercent,
        ) /
        100,
      stageCount:
        Number(
          stageCount,
        ),
      intercoolerOutletTemperature:
        Number(
          intercoolerOutletTemperature,
        ),
    }

    const analysis =
      calculateMultistageCompressor(
        input,
      )

    if (!analysis) {
      setFeedback(
        'Check the pressures, temperatures, gas properties, stage count and efficiencies. Outlet pressure must exceed inlet pressure, efficiencies must be between 0 and 100%, and the intercooler temperature cannot exceed the preceding stage discharge temperature.',
      )

      return
    }

    const dischargeProblem =
      createCompressorDischargeProblem(
        baseQuery,
        pressureSymbol,
        temperatureSymbol,
        input.outletPressure,
        analysis
          .finalDischargeTemperature,
      )

    setResult({
      analysis,
      dischargeProblem,
    })

    setFeedback(
      `${analysis.stageCount}-stage compression requires ${formatNumber(analysis.totalShaftPower)} W shaft power and produces a final discharge temperature of ${formatNumber(analysis.finalDischargeTemperature)} K.`,
    )
  }

  function exportCsv() {
    if (!result) {
      return
    }

    const blob =
      new Blob(
        [
          createMultistageCompressorCsv(
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
      'multistage-compressor-analysis.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )

    setFeedback(
      'Multistage compressor and intercooler report exported as CSV.',
    )
  }

  return (
    <section
      className="multistage-compressor-panel"
      aria-labelledby="multistage-compressor-title"
    >
      <header className="multistage-compressor-header">
        <div>
          <span>
            Gas compression and energy analysis
          </span>

          <h3 id="multistage-compressor-title">
            Multistage compressor and intercooling
          </h3>

          <p>
            Compare single-stage compression with equal
            pressure-ratio multistage operation. Calculate
            stage temperatures, shaft power, intercooler
            duty and the energy saving produced by
            intercooling.
          </p>
        </div>

        <strong>
          Equal pressure ratio per stage
        </strong>
      </header>

      {assignments.length <
      2 ? (
        <div className="multistage-compressor-empty">
          Add at least two numeric assignments so pressure
          and temperature state variables can be selected
          from the Solver problem.
        </div>
      ) : (
        <>
          <div className="multistage-compressor-symbols">
            <label>
              Pressure state variable

              <select
                value={
                  pressureSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectPressureSymbol(
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
              Temperature state variable

              <select
                value={
                  temperatureSymbol
                }
                onChange={(
                  event,
                ) =>
                  selectTemperatureSymbol(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select temperature variable
                </option>

                {assignments
                  .filter(
                    (
                      assignment,
                    ) =>
                      assignment.symbol !==
                      pressureSymbol,
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

          <div className="multistage-compressor-input-grid">
            <article>
              <span>
                Compressor operating state
              </span>

              <label>
                Inlet pressure, Pa

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    inletPressure
                  }
                  onChange={(
                    event,
                  ) => {
                    setInletPressure(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Outlet pressure, Pa

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    outletPressure
                  }
                  onChange={(
                    event,
                  ) => {
                    setOutletPressure(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Inlet temperature, K

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    inletTemperature
                  }
                  onChange={(
                    event,
                  ) => {
                    setInletTemperature(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Gas mass-flow rate, kg/s

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    massFlowRate
                  }
                  onChange={(
                    event,
                  ) => {
                    setMassFlowRate(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>
            </article>

            <article>
              <span>
                Ideal-gas properties
              </span>

              <label>
                Heat-capacity ratio, γ

                <input
                  type="number"
                  min="1"
                  step="any"
                  value={
                    heatCapacityRatio
                  }
                  onChange={(
                    event,
                  ) => {
                    setHeatCapacityRatio(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Specific gas constant, J/(kg·K)

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    specificGasConstant
                  }
                  onChange={(
                    event,
                  ) => {
                    setSpecificGasConstant(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <code>
                cp = γR / (γ − 1)
              </code>

              <code>
                T₂s/T₁ = (P₂/P₁)^((γ−1)/γ)
              </code>
            </article>

            <article>
              <span>
                Compressor performance
              </span>

              <label>
                Isentropic efficiency, %

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={
                    isentropicEfficiencyPercent
                  }
                  onChange={(
                    event,
                  ) => {
                    setIsentropicEfficiencyPercent(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <label>
                Mechanical efficiency, %

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={
                    mechanicalEfficiencyPercent
                  }
                  onChange={(
                    event,
                  ) => {
                    setMechanicalEfficiencyPercent(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <p>
                Isentropic efficiency corrects the gas
                temperature rise. Mechanical efficiency
                converts gas power to required shaft power.
              </p>
            </article>

            <article>
              <span>
                Staging and intercooling
              </span>

              <label>
                Number of stages

                <select
                  value={
                    stageCount
                  }
                  onChange={(
                    event,
                  ) => {
                    setStageCount(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                >
                  {STAGE_OPTIONS.map(
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
                        {option} {
                          option ===
                            1
                            ? 'stage'
                            : 'stages'
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                Intercooler outlet temperature, K

                <input
                  type="number"
                  min="0"
                  step="any"
                  disabled={
                    Number(
                      stageCount,
                    ) ===
                    1
                  }
                  value={
                    intercoolerOutletTemperature
                  }
                  onChange={(
                    event,
                  ) => {
                    setIntercoolerOutletTemperature(
                      event.target.value,
                    )

                    setResult(null)
                  }}
                />
              </label>

              <p>
                Equal pressure ratios minimize ideal
                compression work when each intermediate
                stage is cooled to the same selected
                temperature.
              </p>
            </article>
          </div>

          <p className="multistage-compressor-assumption">
            The calculation assumes ideal-gas behaviour,
            constant heat capacities, equal stage pressure
            ratios, no interstage pressure loss and the
            same isentropic and mechanical efficiency for
            every compressor stage.
          </p>

          <div className="multistage-compressor-actions">
            <button
              type="button"
              onClick={
                runAnalysis
              }
            >
              Calculate multistage compression
            </button>

            {result ? (
              <button
                type="button"
                onClick={
                  exportCsv
                }
              >
                Export compressor CSV
              </button>
            ) : null}

            <span>
              Maximum six interactive stages
            </span>
          </div>

          {feedback ? (
            <p
              className="multistage-compressor-feedback"
              role="status"
            >
              {feedback}
            </p>
          ) : null}

          {result ? (
            <>
              <div className="multistage-compressor-summary">
                <article>
                  <span>
                    Final discharge temperature
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .finalDischargeTemperature,
                      )
                    } K
                  </strong>
                </article>

                <article>
                  <span>
                    Multistage shaft power
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .totalShaftPower,
                      )
                    } W
                  </strong>
                </article>

                <article>
                  <span>
                    Intercooler duty
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .totalIntercoolerDuty,
                      )
                    } W
                  </strong>
                </article>

                <article
                  data-state={
                    savingState(
                      result
                        .analysis
                        .shaftPowerSavingPercent,
                    )
                  }
                >
                  <span>
                    Shaft-power saving
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .shaftPowerSavingPercent,
                      )
                    }%
                  </strong>
                </article>
              </div>

              <div className="multistage-compressor-comparison">
                <article>
                  <span>
                    Single-stage shaft power
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .singleStage
                          .shaftPower,
                      )
                    } W
                  </strong>

                  <p>
                    Discharge temperature: {
                      formatNumber(
                        result
                          .analysis
                          .singleStage
                          .actualOutletTemperature,
                      )
                    } K
                  </p>
                </article>

                <article>
                  <span>
                    Multistage shaft power
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .totalShaftPower,
                      )
                    } W
                  </strong>

                  <p>
                    Absolute saving: {
                      formatNumber(
                        result
                          .analysis
                          .shaftPowerSaving,
                      )
                    } W
                  </p>
                </article>

                <article>
                  <span>
                    Overall pressure ratio
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .compressionRatio,
                      )
                    }×
                  </strong>

                  <p>
                    Per-stage ratio: {
                      formatNumber(
                        result
                          .analysis
                          .stagePressureRatio,
                      )
                    }×
                  </p>
                </article>

                <article>
                  <span>
                    Actual specific work
                  </span>

                  <strong>
                    {
                      formatNumber(
                        result
                          .analysis
                          .totalActualSpecificWork,
                      )
                    } J/kg
                  </strong>

                  <p>
                    cp = {
                      formatNumber(
                        result
                          .analysis
                          .specificHeatAtConstantPressure,
                      )
                    } J/(kg·K)
                  </p>
                </article>
              </div>

              <div className="multistage-compressor-pressure-train">
                <header>
                  <div>
                    <span>
                      Equal-ratio pressure train
                    </span>

                    <strong>
                      {
                        result
                          .analysis
                          .stageCount
                      } compressor stages
                    </strong>
                  </div>

                  <p>
                    {
                      result
                        .analysis
                        .intermediatePressures
                        .length >
                      0
                        ? result
                            .analysis
                            .intermediatePressures
                            .map(
                              (
                                pressure,
                                index,
                              ) =>
                                `P${index + 2}=${formatNumber(pressure)} Pa`,
                            )
                            .join(' · ')
                        : 'No intermediate pressure is required for a single-stage compressor.'
                    }
                  </p>
                </header>
              </div>

              <div className="multistage-compressor-table-scroll">
                <table className="multistage-compressor-table">
                  <thead>
                    <tr>
                      <th>
                        Stage
                      </th>

                      <th>
                        Pressure range
                      </th>

                      <th>
                        Inlet temperature
                      </th>

                      <th>
                        Isentropic outlet
                      </th>

                      <th>
                        Actual outlet
                      </th>

                      <th>
                        Shaft power
                      </th>

                      <th>
                        Intercooler duty
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result
                      .analysis
                      .stages
                      .map(
                        (
                          stage,
                        ) => (
                          <tr
                            key={
                              stage.stageNumber
                            }
                          >
                            <td>
                              <strong>
                                Stage {
                                  stage.stageNumber
                                }
                              </strong>

                              <small>
                                Ratio {
                                  formatNumber(
                                    stage.pressureRatio,
                                  )
                                }×
                              </small>
                            </td>

                            <td>
                              {
                                formatNumber(
                                  stage.inletPressure,
                                )
                              } → {
                                formatNumber(
                                  stage.outletPressure,
                                )
                              } Pa
                            </td>

                            <td>
                              {
                                formatNumber(
                                  stage.inletTemperature,
                                )
                              } K
                            </td>

                            <td>
                              {
                                formatNumber(
                                  stage.isentropicOutletTemperature,
                                )
                              } K
                            </td>

                            <td>
                              {
                                formatNumber(
                                  stage.actualOutletTemperature,
                                )
                              } K
                            </td>

                            <td>
                              {
                                formatNumber(
                                  stage.shaftPower,
                                )
                              } W
                            </td>

                            <td>
                              {
                                stage.intercoolerHeatRemoved >
                                0
                                  ? `${formatNumber(stage.intercoolerHeatRemoved)} W`
                                  : '—'
                              }
                            </td>
                          </tr>
                        ),
                      )}
                  </tbody>
                </table>
              </div>

              <div className="multistage-compressor-transfer">
                <div>
                  <span>
                    Calculated compressor discharge state
                  </span>

                  <strong>
                    {
                      pressureSymbol
                    } = {
                      formatNumber(
                        Number(
                          outletPressure,
                        ),
                      )
                    } · {
                      temperatureSymbol
                    } = {
                      formatNumber(
                        result
                          .analysis
                          .finalDischargeTemperature,
                      )
                    }
                  </strong>

                  <p>
                    The selected pressure and temperature
                    assignments will be replaced by the
                    calculated final compressor discharge
                    state.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onApplyProblem(
                      result
                        .dischargeProblem,
                    )
                  }
                >
                  Transfer discharge state to Solver
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  )
}
