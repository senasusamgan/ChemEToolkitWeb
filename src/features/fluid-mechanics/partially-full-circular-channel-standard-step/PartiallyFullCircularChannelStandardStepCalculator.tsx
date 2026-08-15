import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelStandardStepError,
  calculatePartiallyFullCircularChannelStandardStep,
  createPartiallyFullCircularChannelStandardStepCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelStandardStepInput,
  PartiallyFullCircularChannelStandardStepResult,
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

  signedReachLength:
    '100',
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
    'y₁',
    'm',
  ],
  [
    'signedReachLength',
    'Signed Reach Length',
    'Δx',
    'm',
  ],
] as const


export function PartiallyFullCircularChannelStandardStepCalculator() {
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
    PartiallyFullCircularChannelStandardStepResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelStandardStepInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelStandardStepInput = {
        pipeDiameter:
          Number(form.pipeDiameter),

        volumetricFlowRate:
          Number(form.volumetricFlowRate),

        manningRoughness:
          Number(form.manningRoughness),

        channelSlope:
          Number(form.channelSlope),

        initialFlowDepth:
          Number(form.initialFlowDepth),

        signedReachLength:
          Number(form.signedReachLength),
      }

      const next =
        calculatePartiallyFullCircularChannelStandardStep(
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
          PartiallyFullCircularChannelStandardStepError
          ? error.message
          : 'Circular-channel standard-step depth could not be solved.',
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
      signedReachLength: '',
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
      createPartiallyFullCircularChannelStandardStepCsv(
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
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url

    link.download =
      'partially-full-circular-channel-standard-step.csv'

    document.body.appendChild(link)

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }


  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–82"
        icon="∿"
        title="Partially Full Circular Channel Standard-Step Method"
        subtitle="Solve the unknown endpoint depth across a specified circular-channel reach"
      />

      <ReferenceBasis>
        Calculator 465 solves the standard-step
        energy equation for an unknown endpoint
        depth. Positive reach length represents
        downstream movement and negative reach
        length represents upstream movement.
        Calculator 462 supplies the local GVF
        predictor used to select the physically
        continuous root.
      </ReferenceBasis>

      <div className="native-formula">
        E₂ − E₁ +
        (S̄f − S₀)Δx = 0
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
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve standard step"
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
            headlineLabel="Solved endpoint depth"
            headlineValue={`${formatEngineeringNumber(
              result.solvedState.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Reach Direction"
              value={
                result.reachDirection
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
              label="Solved Depth"
              value={formatEngineeringNumber(
                result.solvedState.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Depth Change"
              value={formatEngineeringNumber(
                result.solvedDepthChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Local Linear Prediction"
              value={formatEngineeringNumber(
                result.localLinearDepthPrediction,
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
              label="Solved Froude Number"
              value={formatEngineeringNumber(
                result.solvedState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Average Friction Slope"
              value={formatEngineeringNumber(
                result.averageFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Equivalent Direct-Step Distance"
              value={formatEngineeringNumber(
                result.equivalentDirectStepDistance,
              )}
              unit="m"
            />

            <ResultItem
              label="Distance Closure Residual"
              value={formatEngineeringNumber(
                result.distanceClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Friction Head Loss"
              value={formatEngineeringNumber(
                result.frictionHeadLossMagnitude,
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
              label="Energy Residual"
              value={formatEngineeringNumber(
                result.energyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Root Candidates"
              value={formatEngineeringNumber(
                result.rootCandidatesFound,
              )}
              unit="-"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={exportCsv}
            >
              Export standard-step CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
