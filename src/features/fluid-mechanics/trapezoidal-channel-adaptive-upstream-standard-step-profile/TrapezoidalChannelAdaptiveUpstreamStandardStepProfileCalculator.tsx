import {
  useState,
} from 'react'

import {
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError,
  calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile,
  createTrapezoidalChannelAdaptiveUpstreamStandardStepProfileCsv,
} from './engine'

import type {
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput,
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfileResult,
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

  maximumStepLength:
    '25',

  maximumDepthChangePerStep:
    '0.008',

  minimumStepLength:
    '0.1',

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
      'maximumStepLength',
    label:
      'Maximum Reverse Step Length',
    symbol:
      'Δxₘₐₓ',
    unit:
      'm',
  },
  {
    key:
      'maximumDepthChangePerStep',
    label:
      'Maximum Depth Change per Step',
    symbol:
      '|Δy|ₘₐₓ',
    unit:
      'm',
  },
  {
    key:
      'minimumStepLength',
    label:
      'Minimum Adaptive Step Length',
    symbol:
      'Δxₘᵢₙ',
    unit:
      'm',
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

export function TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator() {
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
      TrapezoidalChannelAdaptiveUpstreamStandardStepProfileResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput | null
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
    TrapezoidalChannelAdaptiveUpstreamStandardStepProfileInput {
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

      maximumStepLength:
        Number(
          form.maximumStepLength,
        ),

      maximumDepthChangePerStep:
        Number(
          form.maximumDepthChangePerStep,
        ),

      minimumStepLength:
        Number(
          form.minimumStepLength,
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
        calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
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
          TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError
          ? error.message
          : 'The adaptive upstream standard-step profile could not be completed.',
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
      createTrapezoidalChannelAdaptiveUpstreamStandardStepProfileCsv(
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
      'trapezoidal-adaptive-upstream-standard-step-gvf-profile.csv'

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
        code="FM–71"
        icon="≈"
        title="Adaptive Upstream Standard-Step GVF Profile"
        subtitle="March upstream from a known downstream control while automatically refining reverse standard-step lengths"
      />

      <ReferenceBasis>
        Calculator 454 uses Calculator 453
        as its one-segment reverse solver.
        Each proposed upstream reach is
        halved until the requested maximum
        depth-change criterion is satisfied.
      </ReferenceBasis>

      <div className="native-formula">
        |Δyᵢ| ≤ |Δy|
        <sub>max</sub>
        {'  →  '}
        Δxᵢ = Δxᵢ / 2
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
        calculateLabel="Generate adaptive upstream profile"
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
              label="Accepted Reverse Steps"
              value={String(
                result.acceptedStepCount,
              )}
              unit=""
            />

            <ResultItem
              label="Attempted Reverse Steps"
              value={String(
                result.attemptedStepCount,
              )}
              unit=""
            />

            <ResultItem
              label="Adaptive Reductions"
              value={String(
                result.adaptiveReductionCount,
              )}
              unit=""
            />

            <ResultItem
              label="Minimum Accepted Step"
              value={formatEngineeringNumber(
                result.minimumAcceptedStepLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Accepted Step"
              value={formatEngineeringNumber(
                result.maximumAcceptedStepLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum |Δy| Observed"
              value={formatEngineeringNumber(
                result.maximumDepthChangeObserved,
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
              label="Water-Surface Elevation Change"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChangeDownstream,
              )}
              unit="m"
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
          </ResultPanel>

          <h3>
            Adaptive Upstream-to-Downstream GVF Stations
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
                  <th>x upstream (m)</th>
                  <th>x downstream (m)</th>
                  <th>Δx (m)</th>
                  <th>y (m)</th>
                  <th>Δy (m)</th>
                  <th>V (m/s)</th>
                  <th>Fr</th>
                  <th>Sf</th>
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
                          point.acceptedStepLengthFromPrevious,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.flowDepth,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.depthChangeFromPrevious,
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
              Export adaptive upstream profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
