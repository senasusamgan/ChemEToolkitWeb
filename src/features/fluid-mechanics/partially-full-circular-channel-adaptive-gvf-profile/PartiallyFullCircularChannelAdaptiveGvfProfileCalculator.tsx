import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelAdaptiveGvfProfileError,
  calculatePartiallyFullCircularChannelAdaptiveGvfProfile,
  createPartiallyFullCircularChannelAdaptiveGvfProfileCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelAdaptiveGvfProfileInput,
  PartiallyFullCircularChannelAdaptiveGvfProfileResult,
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

  integrationDistance:
    '100',

  initialStepLength:
    '10',

  minimumStepLength:
    '0.05',

  maximumStepLength:
    '20',

  absoluteTolerance:
    '1e-8',

  relativeTolerance:
    '1e-7',
}


type FormField =
  keyof typeof exampleForm


const fields:
  Array<{
    key: FormField
    label: string
    symbol: string
    unit: string
  }> = [
  {
    key:
      'pipeDiameter',

    label:
      'Circular Channel Diameter',

    symbol:
      'D',

    unit:
      'm',
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
      'm/m',
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
      'integrationDistance',

    label:
      'Signed Integration Distance',

    symbol:
      'Δx',

    unit:
      'm',
  },
  {
    key:
      'initialStepLength',

    label:
      'Initial Step Length',

    symbol:
      'h₀',

    unit:
      'm',
  },
  {
    key:
      'minimumStepLength',

    label:
      'Minimum Step Length',

    symbol:
      'hmin',

    unit:
      'm',
  },
  {
    key:
      'maximumStepLength',

    label:
      'Maximum Step Length',

    symbol:
      'hmax',

    unit:
      'm',
  },
  {
    key:
      'absoluteTolerance',

    label:
      'Absolute Depth Tolerance',

    symbol:
      'ATOL',

    unit:
      'm',
  },
  {
    key:
      'relativeTolerance',

    label:
      'Relative Depth Tolerance',

    symbol:
      'RTOL',

    unit:
      '-',
  },
]


export function PartiallyFullCircularChannelAdaptiveGvfProfileCalculator() {
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
      PartiallyFullCircularChannelAdaptiveGvfProfileResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelAdaptiveGvfProfileInput | null
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
    PartiallyFullCircularChannelAdaptiveGvfProfileInput {
    return {
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

      integrationDistance:
        Number(
          form.integrationDistance,
        ),

      initialStepLength:
        Number(
          form.initialStepLength,
        ),

      minimumStepLength:
        Number(
          form.minimumStepLength,
        ),

      maximumStepLength:
        Number(
          form.maximumStepLength,
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
  }


  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
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
          PartiallyFullCircularChannelAdaptiveGvfProfileError
          ? error.message
          : 'Adaptive circular-channel GVF profile could not be integrated.',
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
      createPartiallyFullCircularChannelAdaptiveGvfProfileCsv(
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
      'partially-full-circular-channel-adaptive-gvf-profile.csv'

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
        code="FM–81"
        icon="∿"
        title="Partially Full Circular Channel Adaptive GVF Profile — RK4"
        subtitle="Integrate a circular-channel GVF profile with automatic step-size control and local error estimation"
      />

      <ReferenceBasis>
        Calculator 464 extends Calculator 463
        with adaptive RK4 step control. Each trial
        compares one full RK4 step with two half
        steps. Richardson extrapolation estimates
        local depth error, while ATOL and RTOL
        determine whether the step is accepted.
      </ReferenceBasis>

      <div className="native-formula">
        error ≈
        |y₂×h/2 − yₕ| / 15
        {'   '}
        and
        {'   '}
        tolerance =
        ATOL +
        RTOL · max(|yᵢ|, |yᵢ₊₁|)
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={
                field.key
              }
              label={
                field.label
              }
              symbol={
                field.symbol
              }
              value={
                form[
                  field.key
                ]
              }
              unit={
                field.unit
              }
              onChange={
                updateField(
                  field.key,
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
        calculateLabel="Integrate adaptive profile"
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
              label="Integration Direction"
              value={
                result.integrationDirection
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
              label="Final Distance"
              value={formatEngineeringNumber(
                result.finalState.distance,
              )}
              unit="m"
            />

            <ResultItem
              label="Initial Flow Depth"
              value={formatEngineeringNumber(
                result.initialState.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Final Flow Depth"
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
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Accepted Steps"
              value={formatEngineeringNumber(
                result.acceptedSteps,
              )}
              unit="-"
            />

            <ResultItem
              label="Rejected Steps"
              value={formatEngineeringNumber(
                result.rejectedSteps,
              )}
              unit="-"
            />

            <ResultItem
              label="Function Evaluations"
              value={formatEngineeringNumber(
                result.functionEvaluations,
              )}
              unit="-"
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
              label="Mean Accepted Step"
              value={formatEngineeringNumber(
                result.meanAcceptedStepLength,
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
              label="Initial dy/dx"
              value={formatEngineeringNumber(
                result.initialDepthGradient,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Final dy/dx"
              value={formatEngineeringNumber(
                result.finalDepthGradient,
              )}
              unit="m/m"
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
