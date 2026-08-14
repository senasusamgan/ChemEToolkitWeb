import {
  useState,
} from 'react'

import {
  TrapezoidalChannelUpstreamStandardStepProfileError,
  calculateTrapezoidalChannelUpstreamStandardStepProfile,
  createTrapezoidalChannelUpstreamStandardStepProfileCsv,
} from './engine'

import type {
  TrapezoidalChannelUpstreamStandardStepProfileInput,
  TrapezoidalChannelUpstreamStandardStepProfileResult,
} from './types'

import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

const exampleForm = {
  bottomWidth:
    '3',

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  manningRoughness:
    '0.03',

  channelSlope:
    '0.001',

  downstreamControlDepth:
    '1.5513281356840372',

  upstreamReachLength:
    '100',

  numberOfSteps:
    '10',

  fluidDensity:
    '998',
}

type FormField =
  keyof typeof exampleForm

const fields: Array<{
  key: FormField
  label: string
  symbol: string
  unit: string
}> = [
  {
    key:
      'bottomWidth',

    label:
      'Bottom Width',

    symbol:
      'b',

    unit:
      'm',
  },
  {
    key:
      'sideSlopeHorizontalPerVertical',

    label:
      'Side Slope Horizontal : Vertical',

    symbol:
      'z',

    unit:
      'H:V',
  },
  {
    key:
      'volumetricFlowRate',

    label:
      'Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
  },
  {
    key:
      'manningRoughness',

    label:
      'Manning Roughness',

    symbol:
      'n',

    unit:
      '-',
  },
  {
    key:
      'channelSlope',

    label:
      'Channel Bed Slope',

    symbol:
      'S₀',

    unit:
      '-',
  },
  {
    key:
      'downstreamControlDepth',

    label:
      'Downstream Control Depth',

    symbol:
      'y_d',

    unit:
      'm',
  },
  {
    key:
      'upstreamReachLength',

    label:
      'Upstream Reach Length',

    symbol:
      'L',

    unit:
      'm',
  },
  {
    key:
      'numberOfSteps',

    label:
      'Number of Standard Steps',

    symbol:
      'N',

    unit:
      '-',
  },
  {
    key:
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]

export function TrapezoidalChannelUpstreamStandardStepProfileCalculator() {
  const [
    form,
    setForm,
  ] =
    useState(
      exampleForm,
    )

  const [
    result,
    setResult,
  ] =
    useState<
      TrapezoidalChannelUpstreamStandardStepProfileResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelUpstreamStandardStepProfileInput | null
    >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

  function updateField(
    field: FormField,
  ) {
    return (
      value: string,
    ) => {
      setForm(
        current => ({
          ...current,

          [field]:
            value,
        }),
      )
    }
  }

  function currentInput():
    TrapezoidalChannelUpstreamStandardStepProfileInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      manningRoughness:
        Number(
          form.manningRoughness,
        ),

      channelSlope:
        Number(
          form.channelSlope,
        ),

      downstreamControlDepth:
        Number(
          form.downstreamControlDepth,
        ),

      upstreamReachLength:
        Number(
          form.upstreamReachLength,
        ),

      numberOfSteps:
        Number(
          form.numberOfSteps,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateTrapezoidalChannelUpstreamStandardStepProfile(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage('')
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          TrapezoidalChannelUpstreamStandardStepProfileError
          ? error.message
          : 'The upstream standard-step profile could not be completed.',
      )
    }
  }

  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage('')
  }

  function clearInputs() {
    setForm(
      Object.fromEntries(
        Object.keys(
          exampleForm,
        ).map(
          key => [
            key,
            '',
          ],
        ),
      ) as typeof exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage('')
  }

  function exportCsv() {
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createTrapezoidalChannelUpstreamStandardStepProfileCsv(
        calculatedInput,
        result,
      )

    const blob =
      new Blob(
        [csv],
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
      'trapezoidal-upstream-standard-step-gvf-profile.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–70"
        icon="≈"
        title="Upstream Standard-Step GVF Profile from Downstream Boundary"
        subtitle="March upstream from a known downstream control depth to calculate a trapezoidal-channel backwater or drawdown profile"
      />

      <ReferenceBasis>
        Calculator 453 solves the reverse
        standard-step problem. A known
        downstream hydraulic boundary is
        divided into equal upstream reaches,
        and the unknown upstream depth is
        solved at every station.
      </ReferenceBasis>

      <div className="native-formula">
        E
        <sub>d</sub>
        − E
        <sub>u</sub>
        =
        [S₀ −
        (S
        <sub>fu</sub>
        + S
        <sub>fd</sub>
        )/2] Δx
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={form[field.key]}
              unit={field.unit}
              onChange={updateField(
                field.key,
              )}
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate upstream profile"
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <>
          <ResultPanel
            headlineLabel="Required upstream boundary depth"
            headlineValue={`${formatEngineeringNumber(
              result.upstreamBoundaryDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="GVF Profile"
              value={
                result.profileClassification
              }
              unit=""
            />

            <ResultItem
              label="Channel Slope Class"
              value={
                result.channelSlopeClass
              }
              unit=""
            />

            <ResultItem
              label="Profile Trend Downstream"
              value={
                result.profileTrendDownstream
              }
              unit=""
            />

            <ResultItem
              label="Downstream Control Depth"
              value={formatEngineeringNumber(
                result.downstreamControlDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Downstream Depth Change"
              value={formatEngineeringNumber(
                result.downstreamDepthChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Normal Depth"
              value={formatEngineeringNumber(
                result.normalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Profile Depth"
              value={formatEngineeringNumber(
                result.minimumFlowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Profile Depth"
              value={formatEngineeringNumber(
                result.maximumFlowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Step Length"
              value={formatEngineeringNumber(
                result.stepLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Downstream Froude Number"
              value={formatEngineeringNumber(
                result.downstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Downstream Specific Energy"
              value={formatEngineeringNumber(
                result.downstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Friction Head Loss"
              value={formatEngineeringNumber(
                result.totalFrictionHeadLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Average Friction Slope"
              value={formatEngineeringNumber(
                result.averageFrictionSlope,
              )}
              unit="-"
            />

            <ResultItem
              label="Bed Elevation Change Downstream"
              value={formatEngineeringNumber(
                result.bedElevationChangeDownstream,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Elevation Change"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChangeDownstream,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum |dy/dx|"
              value={formatEngineeringNumber(
                result.maximumAbsoluteDepthGradient,
              )}
              unit="-"
            />

            <ResultItem
              label="Total Energy Closure Residual"
              value={formatEngineeringNumber(
                result.totalEnergyClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Power Dissipated"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipated,
              )}
              unit="W"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Cumulative Solver Iterations"
              value={String(
                result.cumulativeDepthSolverIterations,
              )}
              unit=""
            />
          </ResultPanel>

          <h3>
            Upstream-to-Downstream GVF Stations
          </h3>

          <div
            style={{
              overflowX:
                'auto',
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>Station</th>
                  <th>x from upstream (m)</th>
                  <th>x from downstream (m)</th>
                  <th>y (m)</th>
                  <th>V (m/s)</th>
                  <th>Fr</th>
                  <th>Sf</th>
                  <th>dy/dx</th>
                  <th>Σhf (m)</th>
                </tr>
              </thead>

              <tbody>
                {result.profilePoints.map(
                  point => (
                    <tr
                      key={
                        point.stationIndex
                      }
                    >
                      <td>
                        {point.stationIndex}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.distanceFromUpstream,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.distanceFromDownstream,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.flowDepth,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.velocity,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.froudeNumber,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.frictionSlope,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.localDepthGradient,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.cumulativeFrictionHeadLoss,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="native-actions">
            <button
              type="button"
              onClick={exportCsv}
            >
              Export upstream profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
