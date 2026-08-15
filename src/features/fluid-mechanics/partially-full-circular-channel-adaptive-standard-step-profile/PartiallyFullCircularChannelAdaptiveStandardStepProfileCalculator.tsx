import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelAdaptiveStandardStepProfileError,
  calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile,
  createPartiallyFullCircularChannelAdaptiveStandardStepProfileCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelAdaptiveStandardStepProfileInput,
  PartiallyFullCircularChannelAdaptiveStandardStepProfileResult,
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

  initialReachLength:
    '40',

  minimumReachLength:
    '1',

  maximumReachLength:
    '50',

  absoluteTolerance:
    '1e-6',

  relativeTolerance:
    '1e-6',
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
    'initialReachLength',
    'Initial Reach Length',
    'Δx₀',
    'm',
  ],
  [
    'minimumReachLength',
    'Minimum Reach Length',
    'Δxmin',
    'm',
  ],
  [
    'maximumReachLength',
    'Maximum Reach Length',
    'Δxmax',
    'm',
  ],
  [
    'absoluteTolerance',
    'Absolute Depth Tolerance',
    'ATOL',
    'm',
  ],
  [
    'relativeTolerance',
    'Relative Depth Tolerance',
    'RTOL',
    '-',
  ],
] as const


export function PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator() {
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
    PartiallyFullCircularChannelAdaptiveStandardStepProfileResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelAdaptiveStandardStepProfileInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelAdaptiveStandardStepProfileInput = {
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

        initialReachLength:
          Number(
            form.initialReachLength,
          ),

        minimumReachLength:
          Number(
            form.minimumReachLength,
          ),

        maximumReachLength:
          Number(
            form.maximumReachLength,
          ),

        absoluteTolerance:
          Number(
            form.absoluteTolerance,
          ),

        relativeTolerance:
          Number(
            form.relativeTolerance,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
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
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          PartiallyFullCircularChannelAdaptiveStandardStepProfileError
          ? error.message
          : 'Adaptive circular-channel standard-step profile could not be solved.',
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
      initialReachLength: '',
      minimumReachLength: '',
      maximumReachLength: '',
      absoluteTolerance: '',
      relativeTolerance: '',
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
      createPartiallyFullCircularChannelAdaptiveStandardStepProfileCsv(
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
      'partially-full-circular-channel-adaptive-standard-step-profile.csv'

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
        code="FM–84"
        icon="∿"
        title="Partially Full Circular Channel Adaptive Standard-Step GVF Profile"
        subtitle="Build a circular-channel GVF profile with automatic standard-step reach-size control"
      />

      <ReferenceBasis>
        Calculator 467 extends the standard-step
        profile by comparing one full reach with
        two half reaches. Their endpoint-depth
        difference estimates local truncation
        error, allowing the reach length to grow
        or shrink automatically.
      </ReferenceBasis>

      <div className="native-formula">
        error ≈
        |y₂×Δx/2 − yΔx| / 3
        {'   '}
        with
        {'   '}
        tolerance =
        ATOL +
        RTOL · max(|yᵢ|, |yᵢ₊₁|)
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
        calculateLabel="Solve adaptive standard-step profile"
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
              label="Accepted Reaches"
              value={formatEngineeringNumber(
                result.acceptedReaches,
              )}
              unit="-"
            />

            <ResultItem
              label="Rejected Trials"
              value={formatEngineeringNumber(
                result.rejectedTrials,
              )}
              unit="-"
            />

            <ResultItem
              label="Attempted Trials"
              value={formatEngineeringNumber(
                result.attemptedTrials,
              )}
              unit="-"
            />

            <ResultItem
              label="Completed Standard-Step Solves"
              value={formatEngineeringNumber(
                result.completedStandardStepSolves,
              )}
              unit="-"
            />

            <ResultItem
              label="Minimum Accepted Reach"
              value={formatEngineeringNumber(
                result.minimumAcceptedReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Accepted Reach"
              value={formatEngineeringNumber(
                result.maximumAcceptedReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Mean Accepted Reach"
              value={formatEngineeringNumber(
                result.meanAcceptedReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Error Ratio"
              value={formatEngineeringNumber(
                result.maximumAcceptedErrorRatio,
              )}
              unit="-"
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
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.energyClosureResidual,
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
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export adaptive profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
