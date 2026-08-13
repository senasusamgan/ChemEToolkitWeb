import {
  useState,
} from 'react'

import {
  TrapezoidalChannelAdaptiveStandardStepProfileError,
  calculateTrapezoidalChannelAdaptiveStandardStepProfile,
  createTrapezoidalChannelAdaptiveStandardStepProfileCsv,
} from './engine'

import type {
  TrapezoidalChannelAdaptiveStandardStepProfileInput,
  TrapezoidalChannelAdaptiveStandardStepProfileResult,
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

  initialFlowDepth:
    '1.5',

  totalReachLength:
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
      'initialFlowDepth',

    label:
      'Initial Flow Depth',

    symbol:
      'y₀',

    unit:
      'm',
  },
  {
    key:
      'totalReachLength',

    label:
      'Total Reach Length',

    symbol:
      'L',

    unit:
      'm',
  },
  {
    key:
      'maximumStepLength',

    label:
      'Maximum Step Length',

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

export function TrapezoidalChannelAdaptiveStandardStepProfileCalculator() {
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
      TrapezoidalChannelAdaptiveStandardStepProfileResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelAdaptiveStandardStepProfileInput | null
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
    TrapezoidalChannelAdaptiveStandardStepProfileInput {
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

      initialFlowDepth:
        Number(
          form.initialFlowDepth,
        ),

      totalReachLength:
        Number(
          form.totalReachLength,
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
        calculateTrapezoidalChannelAdaptiveStandardStepProfile(
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
          TrapezoidalChannelAdaptiveStandardStepProfileError
          ? error.message
          : 'The adaptive standard-step GVF profile could not be completed.',
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
      createTrapezoidalChannelAdaptiveStandardStepProfileCsv(
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
      'trapezoidal-adaptive-standard-step-gvf-profile.csv'

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
        code="FM–69"
        icon="≈"
        title="Adaptive Standard-Step GVF Profile"
        subtitle="Automatically refine trapezoidal-channel standard-step reach lengths to limit the hydraulic depth change in every accepted segment"
      />

      <ReferenceBasis>
        Calculator 452 automatically
        subdivides the channel whenever a
        proposed standard step changes the
        flow depth too much or cannot remain
        safely inside the current GVF
        profile zone.
      </ReferenceBasis>

      <div className="native-formula">
        |Δyᵢ| ≤ |Δy|
        <sub>max</sub>
        {'  '}→{'  '}
        Δxᵢ = Δxᵢ / 2
        {' when refinement is required'}
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
        calculateLabel="Generate adaptive profile"
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
            headlineLabel="Final flow depth"
            headlineValue={`${formatEngineeringNumber(
              result.finalFlowDepth,
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
                result.startProfileClassification
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
              label="Profile Trend"
              value={
                result.profileTrend
              }
              unit=""
            />

            <ResultItem
              label="Total Depth Change"
              value={formatEngineeringNumber(
                result.totalDepthChange,
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
              label="Accepted Steps"
              value={String(
                result.acceptedStepCount,
              )}
              unit=""
            />

            <ResultItem
              label="Attempted Steps"
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
              label="Average Accepted Step"
              value={formatEngineeringNumber(
                result.averageAcceptedStepLength,
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
              label="Starting Froude Number"
              value={formatEngineeringNumber(
                result.startFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Final Froude Number"
              value={formatEngineeringNumber(
                result.finalFroudeNumber,
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
                result.waterSurfaceElevationChange,
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
            Adaptive GVF Stations
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
                  <th>Step</th>
                  <th>x (m)</th>
                  <th>Δx (m)</th>
                  <th>y (m)</th>
                  <th>Δy (m)</th>
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
                        point.stepIndex
                      }
                    >
                      <td>
                        {point.stepIndex}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.distance,
                        )}
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.acceptedStepLength,
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
              Export adaptive profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
