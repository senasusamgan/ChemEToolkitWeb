import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelStandardStepProfileError,
  calculatePartiallyFullCircularChannelStandardStepProfile,
  createPartiallyFullCircularChannelStandardStepProfileCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelStandardStepProfileInput,
  PartiallyFullCircularChannelStandardStepProfileResult,
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
  pipeDiameter:
    '1.2',

  volumetricFlowRate:
    '0.6',

  manningRoughness:
    '0.013',

  channelSlope:
    '0.001',

  initialFlowDepth:
    '0.6',

  signedProfileLength:
    '100',

  maximumReachLength:
    '20',
}


type FormField =
  keyof typeof exampleForm


const fields = [
  [
    'pipeDiameter',
    'Circular Channel Diameter',
    'D',
    'm',
  ],
  [
    'volumetricFlowRate',
    'Volumetric Flow Rate',
    'Q',
    'm³/s',
  ],
  [
    'manningRoughness',
    'Manning Roughness',
    'n',
    '-',
  ],
  [
    'channelSlope',
    'Channel Bed Slope',
    'S₀',
    'm/m',
  ],
  [
    'initialFlowDepth',
    'Initial Flow Depth',
    'y₀',
    'm',
  ],
  [
    'signedProfileLength',
    'Signed Profile Length',
    'L',
    'm',
  ],
  [
    'maximumReachLength',
    'Maximum Standard-Step Reach',
    'Δxmax',
    'm',
  ],
] as const


export function PartiallyFullCircularChannelStandardStepProfileCalculator() {
  const [
    form,
    setForm,
  ] = useState(
    exampleForm,
  )

  const [
    result,
    setResult,
  ] = useState<
    PartiallyFullCircularChannelStandardStepProfileResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelStandardStepProfileInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelStandardStepProfileInput = {
        pipeDiameter:
          Number(
            form.pipeDiameter,
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

        signedProfileLength:
          Number(
            form.signedProfileLength,
          ),

        maximumReachLength:
          Number(
            form.maximumReachLength,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelStandardStepProfile(
          input,
        )

      setResult(next)
      setCalculatedInput(input)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          PartiallyFullCircularChannelStandardStepProfileError
          ? error.message
          : 'Circular-channel multi-reach standard-step profile could not be solved.',
      )
    }
  }


  function loadExample() {
    setForm(exampleForm)
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }


  function clearInputs() {
    setForm({
      pipeDiameter: '',
      volumetricFlowRate: '',
      manningRoughness: '',
      channelSlope: '',
      initialFlowDepth: '',
      signedProfileLength: '',
      maximumReachLength: '',
    })

    setResult(null)
    setCalculatedInput(null)
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
      createPartiallyFullCircularChannelStandardStepProfileCsv(
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

    link.href = url

    link.download =
      'partially-full-circular-channel-standard-step-profile.csv'

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
        code="FM–83"
        icon="∿"
        title="Partially Full Circular Channel Multi-Reach Standard-Step GVF Profile"
        subtitle="Build a longitudinal circular-channel GVF profile by chaining standard-step reach solutions"
      />

      <ReferenceBasis>
        Calculator 466 repeatedly applies
        Calculator 465 across equal signed
        reaches. A smaller maximum reach length
        creates more profile points and generally
        improves agreement with the continuous
        GVF differential-equation solution.
      </ReferenceBasis>

      <div className="native-formula">
        Eᵢ₊₁ − Eᵢ +
        (S̄f − S₀)Δx = 0
        {'   '}
        repeated over
        {'   '}
        N = ceil(|L| / Δxmax)
      </div>

      <div className="native-input-grid">
        {fields.map(
          (
            [
              key,
              label,
              symbol,
              unit,
            ],
          ) => (
            <NumericInput
              key={key}
              label={label}
              symbol={symbol}
              value={
                form[
                  key as FormField
                ]
              }
              unit={unit}
              onChange={
                value =>
                  setForm(
                    current => ({
                      ...current,
                      [key]:
                        value,
                    }),
                  )
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
        calculateLabel="Solve multi-reach profile"
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
              result.finalState.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Profile Direction"
              value={
                result.profileDirection
              }
              unit=""
            />

            <ResultItem
              label="Flow Regime"
              value={
                result.flowRegime
              }
              unit=""
            />

            <ResultItem
              label="Number of Reaches"
              value={formatEngineeringNumber(
                result.numberOfReaches,
              )}
              unit="-"
            />

            <ResultItem
              label="Actual Reach Length"
              value={formatEngineeringNumber(
                result.actualReachLength,
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
              label="Initial Depth"
              value={formatEngineeringNumber(
                result.initialState.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Final Depth"
              value={formatEngineeringNumber(
                result.finalState.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Depth Change"
              value={formatEngineeringNumber(
                result.totalDepthChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Depth"
              value={formatEngineeringNumber(
                result.minimumDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Depth"
              value={formatEngineeringNumber(
                result.maximumDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Initial Froude Number"
              value={formatEngineeringNumber(
                result.initialState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Final Froude Number"
              value={formatEngineeringNumber(
                result.finalState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Friction Head Loss"
              value={formatEngineeringNumber(
                result.frictionHeadLossMagnitude,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Head Change"
              value={formatEngineeringNumber(
                result.totalHeadChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Global Energy Residual"
              value={formatEngineeringNumber(
                result.cumulativeEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Max Segment Energy Residual"
              value={formatEngineeringNumber(
                result.maximumSegmentEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Root Iterations"
              value={formatEngineeringNumber(
                result.totalRootIterations,
              )}
              unit="-"
            />

            <ResultItem
              label="Profile Points"
              value={formatEngineeringNumber(
                result.profilePoints.length,
              )}
              unit="-"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
