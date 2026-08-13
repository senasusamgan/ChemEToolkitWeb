import {
  useState,
} from 'react'

import {
  TrapezoidalChannelStandardStepProfileError,
  calculateTrapezoidalChannelStandardStepProfile,
  createTrapezoidalChannelStandardStepProfileCsv,
} from './engine'

import type {
  TrapezoidalChannelStandardStepProfileInput,
  TrapezoidalChannelStandardStepProfileResult,
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

export function TrapezoidalChannelStandardStepProfileCalculator() {
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
      TrapezoidalChannelStandardStepProfileResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelStandardStepProfileInput | null
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
    TrapezoidalChannelStandardStepProfileInput {
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
        calculateTrapezoidalChannelStandardStepProfile(
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
          TrapezoidalChannelStandardStepProfileError
          ? error.message
          : 'The multi-reach standard-step profile could not be completed.',
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
      createTrapezoidalChannelStandardStepProfileCsv(
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
      'trapezoidal-standard-step-gvf-profile.csv'

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
        code="FM–68"
        icon="≈"
        title="Trapezoidal Multi-Reach Standard-Step GVF Profile"
        subtitle="Generate a station-by-station gradually varied flow profile by dividing a trapezoidal channel reach into multiple standard-step segments"
      />

      <ReferenceBasis>
        Calculator 451 repeatedly applies
        the standard-step energy equation
        over equal reach segments. Increasing
        the number of steps improves the
        spatial resolution and convergence
        of the gradually varied flow profile.
      </ReferenceBasis>

      <div className="native-formula">
        E
        <sub>i+1</sub>
        − E
        <sub>i</sub>
        =
        [S₀ −
        (S
        <sub>fi</sub>
        + S
        <sub>f,i+1</sub>
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
        calculateLabel="Generate GVF profile"
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
              label="Initial Flow Depth"
              value={formatEngineeringNumber(
                result.initialFlowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Depth Change"
              value={formatEngineeringNumber(
                result.depthChange,
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
              label="Total Reach Length"
              value={formatEngineeringNumber(
                result.totalReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Standard Steps"
              value={String(
                result.numberOfSteps,
              )}
              unit=""
            />

            <ResultItem
              label="Step Length"
              value={formatEngineeringNumber(
                result.stepLength,
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
              label="Bed Elevation Change"
              value={formatEngineeringNumber(
                result.bedElevationChange,
              )}
              unit="m"
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
            Standard-Step Profile Stations
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
                  <th>
                    Step
                  </th>

                  <th>
                    x (m)
                  </th>

                  <th>
                    y (m)
                  </th>

                  <th>
                    V (m/s)
                  </th>

                  <th>
                    Fr
                  </th>

                  <th>
                    Sf
                  </th>

                  <th>
                    dy/dx
                  </th>

                  <th>
                    Σhf (m)
                  </th>
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
                        {
                          point.stepIndex
                        }
                      </td>

                      <td>
                        {formatEngineeringNumber(
                          point.distance,
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
              Export profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
